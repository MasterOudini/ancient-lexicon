import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import {
  createReadStream,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync
} from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { basename, extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const basePath = '/ancient-lexicon/'
const timeoutMs = 45_000
const releases = [
  { name: 'A', character: 'a', releaseNumber: 601 },
  { name: 'B', character: 'b', releaseNumber: 602 },
  { name: 'C', character: 'c', releaseNumber: 603 }
].map((release) => {
  const sha = release.character.repeat(40)
  return {
    ...release,
    sha,
    buildId: sha.slice(0, 18),
    releaseId: `${release.releaseNumber}-${sha.slice(0, 18)}`
  }
})

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
}

function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: process.env,
      ...options,
      stdio: ['ignore', 'pipe', 'pipe']
    })
    let output = ''
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { output += chunk })
    child.once('error', reject)
    child.once('exit', (code) => {
      if (code === 0) resolvePromise(output)
      else reject(new Error(`${basename(command)} exited with ${code}\n${output}`))
    })
  })
}

async function buildRelease(release, outputDirectory) {
  await run(
    process.execPath,
    [
      join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'),
      'build',
      '--outDir',
      outputDirectory,
      '--emptyOutDir'
    ],
    {
      env: {
        ...process.env,
        GITHUB_RUN_NUMBER: String(release.releaseNumber),
        GITHUB_SHA: release.sha,
        VITE_BASE: basePath,
        PWA_UPDATE_CHECK_INTERVAL_MS: '250',
        PWA_UPDATE_CHECK_THROTTLE_MS: '100'
      }
    }
  )

  const marker = JSON.parse(readFileSync(join(outputDirectory, 'release.json'), 'utf8'))
  assert.equal(marker.releaseId, release.releaseId)
  for (const artifact of [marker.worker, marker.shell, `sw-hooks-${release.releaseId}.js`]) {
    assert.ok(existsSync(join(outputDirectory, artifact)), `${release.name} is missing ${artifact}`)
  }
}

function startDeploymentServer(buildDirectories) {
  const requests = []
  const state = { current: releases[0] }

  const server = createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1')
    requests.push(url.pathname)

    if (!url.pathname.startsWith(basePath)) {
      response.writeHead(404).end()
      return
    }

    let relativePath
    try {
      relativePath = decodeURIComponent(url.pathname.slice(basePath.length)) || 'index.html'
    } catch {
      response.writeHead(400).end()
      return
    }

    const buildDirectory = buildDirectories.get(state.current.name)
    const absolutePath = resolve(buildDirectory, relativePath)
    const directoryPrefix = `${resolve(buildDirectory)}${sep}`
    if (!absolutePath.startsWith(directoryPrefix) || !existsSync(absolutePath)) {
      response.writeHead(404).end()
      return
    }

    const status = statSync(absolutePath)
    if (!status.isFile()) {
      response.writeHead(404).end()
      return
    }

    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Length': status.size,
      'Content-Type': contentTypes[extname(absolutePath)] || 'application/octet-stream'
    })
    if (request.method === 'HEAD') response.end()
    else createReadStream(absolutePath).pipe(response)
  })

  return new Promise((resolvePromise, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      resolvePromise({
        requests,
        server,
        state,
        url: `http://127.0.0.1:${address.port}${basePath}`
      })
    })
  })
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.CHROME_BIN,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ].filter(Boolean)
  const executable = candidates.find((candidate) => existsSync(candidate))
  assert.ok(
    executable,
    'Chrome was not found. Set CHROME_PATH to a Chrome/Chromium executable.'
  )
  return executable
}

async function waitUntil(check, description, limit = timeoutMs) {
  const startedAt = Date.now()
  let lastError
  while (Date.now() - startedAt < limit) {
    try {
      const value = await check()
      if (value) return value
    } catch (error) {
      lastError = error
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100))
  }
  throw new Error(
    `Timed out waiting for ${description}${lastError ? `: ${lastError.message}` : ''}`
  )
}

class CdpConnection {
  static async connect(url) {
    const socket = new WebSocket(url)
    await new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => {
        socket.close()
        reject(new Error(`Timed out connecting to ${url}`))
      }, 10_000)
      socket.addEventListener('open', () => {
        clearTimeout(timer)
        resolvePromise()
      }, { once: true })
      socket.addEventListener('error', () => {
        clearTimeout(timer)
        reject(new Error(`Cannot connect to ${url}`))
      }, { once: true })
    })
    return new CdpConnection(socket)
  }

  constructor(socket) {
    this.socket = socket
    this.nextId = 1
    this.pending = new Map()
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data))
      if (!message.id) return
      const pending = this.pending.get(message.id)
      if (!pending) return
      this.pending.delete(message.id)
      clearTimeout(pending.timer)
      if (message.error) pending.reject(new Error(message.error.message))
      else pending.resolve(message.result)
    })
    socket.addEventListener('close', () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timer)
        pending.reject(new Error('Chrome DevTools connection closed'))
      }
      this.pending.clear()
    })
  }

  send(method, params = {}, commandTimeoutMs = 10_000) {
    const id = this.nextId++
    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`Chrome DevTools command timed out: ${method}`))
      }, commandTimeoutMs)
      this.pending.set(id, { reject, resolve: resolvePromise, timer })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }

  close() {
    this.socket.close()
  }
}

async function launchChrome(profileDirectory) {
  const executable = findChrome()
  const child = spawn(executable, [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDirectory}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--remote-allow-origins=*',
    'about:blank'
  ], {
    // A separate POSIX process group lets cleanup terminate every Chromium
    // helper if the browser protocol cannot shut them down normally.
    detached: process.platform !== 'win32',
    stdio: ['ignore', 'ignore', 'pipe']
  })
  let errors = ''
  child.stderr.on('data', (chunk) => { errors += chunk })

  const portFile = join(profileDirectory, 'DevToolsActivePort')
  const lines = await waitUntil(() => {
    if (!existsSync(portFile)) return null
    const values = readFileSync(portFile, 'utf8').trim().split(/\r?\n/)
    return values.length >= 2 ? values : null
  }, `Chrome DevTools port (${errors.trim()})`, 20_000)

  const port = Number(lines[0])
  const browser = await CdpConnection.connect(`ws://127.0.0.1:${port}${lines[1]}`)
  return { browser, child, port }
}

async function connectPage(browser, port) {
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' })
  const target = await waitUntil(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json/list`)
    const targets = await response.json()
    return targets.find((candidate) => candidate.id === targetId)
  }, `page target ${targetId}`)
  const page = await CdpConnection.connect(target.webSocketDebuggerUrl)
  await page.send('Page.enable')
  await page.send('Runtime.enable')
  await page.send('Network.enable')
  return { page, targetId }
}

async function evaluate(page, expression) {
  const result = await page.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  })
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || 'Browser evaluation failed')
  }
  return result.result.value
}

async function waitForRelease(page, release) {
  let lastStatus = null
  try {
    return await waitUntil(async () => {
      const status = await evaluate(page, `(async () => {
        const root = document.documentElement;
        const registration = await navigator.serviceWorker?.getRegistration(${JSON.stringify(basePath)});
        return {
          body: document.body?.innerText || '',
          controller: navigator.serviceWorker?.controller?.scriptURL || '',
          release: root?.dataset?.release || '',
          state: root?.dataset?.updateState || '',
          worker: registration?.active?.scriptURL || ''
        };
      })()`)
      lastStatus = status
      const workerName = `sw-${release.releaseId}.js`
      return status.body.includes('Dictionary') &&
        status.release === release.releaseId &&
        status.worker.endsWith(workerName) &&
        status.controller.endsWith(workerName)
        ? status
        : null
    }, `release ${release.name} (${release.releaseId})`)
  } catch (error) {
    throw new Error(`${error.message}; last browser status: ${JSON.stringify(lastStatus)}`)
  }
}

function assertReleaseRequests(requests, release) {
  for (const artifact of [
    `sw-${release.releaseId}.js`,
    `sw-hooks-${release.releaseId}.js`,
    `shell-${release.releaseId}.html`
  ]) {
    assert.ok(
      requests.includes(`${basePath}${artifact}`),
      `${release.name} did not request ${artifact}`
    )
  }
}

async function assertBottomNavigationShell(page, viewport, label) {
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.mobile ? 3 : 1,
    mobile: viewport.mobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height
  })
  await page.send('Emulation.setSafeAreaInsetsOverride', {
    insets: {
      top: viewport.safeAreaTop || 0,
      topMax: viewport.safeAreaTop || 0,
      left: 0,
      leftMax: 0,
      bottom: viewport.safeAreaBottom || 0,
      bottomMax: viewport.safeAreaBottom || 0,
      right: 0,
      rightMax: 0
    }
  })

  const geometry = await evaluate(page, `(async () => {
    const comparisonButtons = document.querySelectorAll('.comparison-scope button');
    comparisonButtons[1]?.click();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const scrolling = document.scrollingElement;
    const appScroll = document.querySelector('[data-app-scroll]');
    const tabbar = document.querySelector('.tabbar');
    if (!scrolling || !appScroll || !tabbar) return null;

    const before = tabbar.getBoundingClientRect();
    appScroll.scrollTop = appScroll.scrollHeight;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const after = tabbar.getBoundingClientRect();
    const scrollRect = appScroll.getBoundingClientRect();
    const visibleBottom = window.visualViewport
      ? window.visualViewport.offsetTop + window.visualViewport.height
      : window.innerHeight;
    const hit = document.elementFromPoint(
      Math.floor(window.innerWidth / 2),
      Math.max(0, Math.min(window.innerHeight, visibleBottom) - 1)
    );

    return {
      bodyOverflow: getComputedStyle(document.body).overflow,
      documentClientHeight: scrolling.clientHeight,
      documentOverflow: getComputedStyle(document.documentElement).overflow,
      documentScrollHeight: scrolling.scrollHeight,
      documentScrollTop: scrolling.scrollTop,
      hitTabbar: Boolean(hit?.closest('.tabbar')),
      navBottom: after.bottom,
      navPaddingBottom: Number.parseFloat(getComputedStyle(tabbar).paddingBottom),
      navPosition: getComputedStyle(tabbar).position,
      navTop: after.top,
      navTopBeforeScroll: before.top,
      scrollBottom: scrollRect.bottom,
      scrollerClientHeight: appScroll.clientHeight,
      scrollerOverflowY: getComputedStyle(appScroll).overflowY,
      scrollerScrollHeight: appScroll.scrollHeight,
      scrollerScrollTop: appScroll.scrollTop,
      visibleBottom
    };
  })()`)

  assert.ok(geometry, `${label}: app shell was not rendered`)
  assert.equal(geometry.documentOverflow, 'hidden', `${label}: document must not scroll`)
  assert.equal(geometry.bodyOverflow, 'hidden', `${label}: body must not scroll`)
  assert.ok(
    geometry.documentScrollHeight <= geometry.documentClientHeight + 1,
    `${label}: root document exceeds the viewport: ${JSON.stringify(geometry)}`
  )
  assert.equal(geometry.documentScrollTop, 0, `${label}: root document moved`)
  assert.equal(geometry.scrollerOverflowY, 'auto', `${label}: content is not the scroll owner`)
  assert.ok(
    geometry.scrollerScrollHeight > geometry.scrollerClientHeight + 1,
    `${label}: fixture content is not scrollable: ${JSON.stringify(geometry)}`
  )
  assert.ok(geometry.scrollerScrollTop > 0, `${label}: content pane did not scroll`)
  assert.equal(geometry.navPosition, 'relative', `${label}: tab bar became a fixed overlay`)
  assert.ok(
    Math.abs(geometry.navPaddingBottom - Math.max(6, viewport.safeAreaBottom || 0)) <= 1,
    `${label}: tab bar does not fill its safe area: ${JSON.stringify(geometry)}`
  )
  assert.ok(
    Math.abs(geometry.navTopBeforeScroll - geometry.navTop) <= 1,
    `${label}: tab bar moved while content scrolled: ${JSON.stringify(geometry)}`
  )
  assert.ok(
    Math.abs(geometry.scrollBottom - geometry.navTop) <= 1,
    `${label}: content pane does not end flush against the tab bar: ${JSON.stringify(geometry)}`
  )
  assert.ok(
    Math.abs(geometry.navBottom - geometry.visibleBottom) <= 1,
    `${label}: tab bar does not reach the visible bottom edge: ${JSON.stringify(geometry)}`
  )
  assert.ok(geometry.hitTabbar, `${label}: scrolled content is exposed below the tab bar`)
  console.log(`Verified bottom navigation shell at ${viewport.width}x${viewport.height} (${label})`)
}

async function closeServer(server) {
  const closed = new Promise((resolvePromise) => server.close(resolvePromise))
  server.closeAllConnections?.()
  await closed
}

async function stopChrome(chrome) {
  if (!chrome) return

  if (process.platform === 'win32' && chrome.child.exitCode === null) {
    // child.kill() only terminates chrome.exe on Windows. taskkill /T is
    // limited to the exact PID launched above and also stops its renderer,
    // service-worker, and utility children before the temporary profile is
    // removed.
    await new Promise((resolvePromise) => {
      const killer = spawn(
        'taskkill.exe',
        ['/PID', String(chrome.child.pid), '/T', '/F'],
        { stdio: 'ignore' }
      )
      killer.once('error', resolvePromise)
      killer.once('exit', resolvePromise)
    })
  } else {
    const closeRequest = chrome.browser.send('Browser.close').catch(() => null)
    await Promise.race([
      closeRequest,
      new Promise((resolvePromise) => setTimeout(resolvePromise, 2_000))
    ])
  }

  const waitForExit = (limit) => {
    if (chrome.child.exitCode !== null || chrome.child.signalCode !== null) {
      return Promise.resolve(true)
    }
    return new Promise((resolvePromise) => {
      const timer = setTimeout(() => {
        chrome.child.removeListener('exit', exited)
        resolvePromise(false)
      }, limit)
      const exited = () => {
        clearTimeout(timer)
        resolvePromise(true)
      }
      chrome.child.once('exit', exited)
    })
  }

  if (!await waitForExit(3_000)) {
    if (process.platform === 'win32') {
      chrome.child.kill()
    } else {
      try {
        process.kill(-chrome.child.pid, 'SIGKILL')
      } catch {
        chrome.child.kill('SIGKILL')
      }
    }
    await waitForExit(3_000)
  }
  chrome.browser.close()
}

function removeTemporaryDirectory(directory, label) {
  if (!directory || !existsSync(directory)) return
  try {
    rmSync(directory, {
      force: true,
      maxRetries: 20,
      recursive: true,
      retryDelay: 250
    })
  } catch (error) {
    // Cleanup diagnostics must not replace a migration assertion failure.
    console.warn(`PWA e2e ${label} cleanup deferred: ${error.message}`)
  }
}

async function main() {
  const workDirectory = mkdtempSync(join(tmpdir(), 'ancient-lexicon-pwa-e2e-'))
  const buildDirectories = new Map()
  let deployment
  let chrome
  let page
  let offlinePage

  try {
    for (const release of releases) {
      const outputDirectory = join(workDirectory, release.name)
      buildDirectories.set(release.name, outputDirectory)
      process.stdout.write(`Building release ${release.name}... `)
      await buildRelease(release, outputDirectory)
      console.log(release.releaseId)
    }

    deployment = await startDeploymentServer(buildDirectories)
    chrome = await launchChrome(join(workDirectory, 'chrome-profile'))
    const connected = await connectPage(chrome.browser, chrome.port)
    page = connected.page

    await page.send('Page.navigate', { url: deployment.url })
    const aStatus = await waitForRelease(page, releases[0])
    assert.match(aStatus.body, /Dictionary/)
    assertReleaseRequests(deployment.requests, releases[0])
    console.log(`Loaded ${releases[0].releaseId}`)

    // Only the deployment changes here. No Page.reload/Page.navigate command is
    // issued during either transition; the app and service worker must move the
    // same browser target to each newly deployed release themselves.
    deployment.state.current = releases[1]
    const bStatus = await waitForRelease(page, releases[1])
    assert.match(bStatus.body, /Dictionary/)
    assertReleaseRequests(deployment.requests, releases[1])
    console.log(`Automatically migrated A -> ${releases[1].releaseId}`)

    deployment.state.current = releases[2]
    const cStatus = await waitForRelease(page, releases[2])
    assert.match(cStatus.body, /Dictionary/)
    assertReleaseRequests(deployment.requests, releases[2])
    console.log(`Automatically migrated B -> ${releases[2].releaseId}`)
    await assertBottomNavigationShell(
      page,
      {
        width: 390,
        height: 844,
        mobile: true,
        safeAreaTop: 47,
        safeAreaBottom: 34
      },
      'online phone viewport'
    )
    await assertBottomNavigationShell(
      page,
      { width: 1440, height: 900, mobile: false },
      'online desktop viewport'
    )

    page.close()
    await chrome.browser.send('Target.closeTarget', { targetId: connected.targetId })
    page = null
    await closeServer(deployment.server)
    deployment.server = null

    const offline = await connectPage(chrome.browser, chrome.port)
    offlinePage = offline.page
    await offlinePage.send('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0
    })
    await offlinePage.send('Page.navigate', { url: deployment.url })
    const offlineStatus = await waitForRelease(offlinePage, releases[2])
    for (const label of ['Dictionary', 'Roots', 'About', 'Settings']) {
      assert.match(offlineStatus.body, new RegExp(label))
    }
    await assertBottomNavigationShell(
      offlinePage,
      {
        width: 390,
        height: 844,
        mobile: true,
        safeAreaTop: 47,
        safeAreaBottom: 34
      },
      'offline phone viewport'
    )
    console.log(`Offline relaunch rendered ${releases[2].releaseId}`)
    console.log('PWA migration e2e passed: same-tab A -> B -> C, bottom navigation shell, and offline relaunch.')
  } finally {
    page?.close()
    offlinePage?.close()
    if (deployment?.server) await closeServer(deployment.server)
    // Static build output is independent of Chrome's profile locks. Remove it
    // first so even an abnormal browser teardown cannot leak ~400 MB per run.
    for (const outputDirectory of buildDirectories.values()) {
      removeTemporaryDirectory(outputDirectory, 'build artifact')
    }
    await stopChrome(chrome)
    removeTemporaryDirectory(join(workDirectory, 'chrome-profile'), 'Chrome profile')
    removeTemporaryDirectory(workDirectory, 'work directory')
  }
}

await main()
