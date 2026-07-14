const ICONS = {
  dictionary: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="2.25" />
      <path d="M8 7.1l3 .8-3 .8zM13.2 6.7l.8 2.6.8-2.6zM8 11.5l2.4.7-2.4.7zM12.3 11.1l3.7 1.1-3.7 1.1zM8 16l3 .8-3 .8zM13.2 15.6l.8 2.6.8-2.6z" fill="currentColor" stroke="none" />
    </>
  ),
  roots: (
    <>
      <path d="M12 11c-2.8-.4-4.4-2.1-4.6-5 2.7.4 4.2 1.9 4.6 4.6m0 .4c.3-2.5 1.8-4 4.6-4.4-.3 2.5-1.8 3.8-4.6 4.2V20m0-6.5-3.7 2.4m3.7-2.4 3.7 2.4m-7.4 0-2.4 3m2.4-3 .9 3.8m6.5-3.8 2.4 3m-2.4-3-.9 3.8" />
    </>
  ),
  about: (
    <>
      <path d="M7 20V8a5 5 0 0 1 10 0v12H7Z" />
      <circle cx="12" cy="9.25" r="1" fill="currentColor" stroke="none" />
      <path d="M12 12.25v4.25" />
    </>
  ),
  settings: (
    <>
      <path d="M5 7h4m3 0h7M5 12h8m3 0h3M5 17h2m3 0h9" />
      <circle cx="10.5" cy="7" r="1.5" />
      <circle cx="14.5" cy="12" r="1.5" />
      <circle cx="8.5" cy="17" r="1.5" />
    </>
  )
}

export default function TabIcon({ name }) {
  return (
    <svg
      className="tab-icon"
      data-tab-icon={name}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  )
}
