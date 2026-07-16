# Ancient Lexicon project instructions

## Mandatory release invariant

A user-requested Ancient Lexicon change is not complete while it exists only locally, on a branch, or in a pull request. Unless the user explicitly says not to publish:

1. Preserve the automatic installed-iPhone updater introduced by PR #22 (`1b455d0`).
2. Run focused tests, `npm test`, `npm run test:pwa-update`, and a production GitHub Pages build with `VITE_BASE=/ancient-lexicon/`; verify relevant desktop, phone-width, and offline/PWA behavior.
3. Commit and push a branch, open a pull request, wait for checks, and merge it into `main`.
4. Wait for the GitHub Pages deployment to succeed.
5. Verify `https://masteroudini.github.io/ancient-lexicon/` itself: the requested live UI, cache-busted `release.json` matching the merged SHA and workflow run, its immutable worker and shell, representative immutable release assets, offline behavior where applicable, and the installed-app automatic update path.

Do not report completion until every applicable gate has current evidence. If a gate fails, continue fixing within the requested scope. When the user supplies device video, treat the behavior visible in that video as the acceptance target rather than substituting emulator-only evidence.
