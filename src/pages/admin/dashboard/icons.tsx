const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const IconBag = () => (
  <svg {...base}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
)

export const IconTicket = () => (
  <svg {...base}>
    <path d="M4 7h16v4a2 2 0 0 0 0 4v2H4v-2a2 2 0 0 0 0-4V7Z" />
    <path d="M10 7v10" strokeDasharray="2 2" />
  </svg>
)

export const IconClock = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l3 2" />
  </svg>
)

export const IconWallet = () => (
  <svg {...base}>
    <path d="M4 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4V7Z" />
    <path d="M4 7l11-3v3" />
    <circle cx="16" cy="13" r="1" />
  </svg>
)

export const IconArrowIn = () => (
  <svg {...base}>
    <path d="M12 4v12" />
    <path d="M7 11l5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
)

export const IconArrowOut = () => (
  <svg {...base}>
    <path d="M12 16V4" />
    <path d="M7 9l5-5 5 5" />
    <path d="M5 20h14" />
  </svg>
)

export const IconBox = () => (
  <svg {...base}>
    <path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z" />
    <path d="M4 8l8 4 8-4" />
    <path d="M12 12v8" />
  </svg>
)

export const IconCart = () => (
  <svg {...base}>
    <path d="M3 4h2l2 11h11l2-8H7" />
    <circle cx="9" cy="19" r="1.4" />
    <circle cx="17" cy="19" r="1.4" />
  </svg>
)

export const IconAlert = () => (
  <svg {...base}>
    <path d="M12 4l9 16H3l9-16Z" />
    <path d="M12 10v4" />
    <path d="M12 17h.01" />
  </svg>
)
