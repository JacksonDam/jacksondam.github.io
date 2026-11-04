// Line icons on a 24px grid, drawn for this site.
const P = {
  cafe: (
    <>
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
      <path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M3 21h15" />
      <path d="M8 3.5c-.8 1 .8 2 0 3M12 3.5c-.8 1 .8 2 0 3" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M3 12.5h18M10.5 12.5v2h3v-2" />
    </>
  ),
  play: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M10 9.2v5.6l4.8-2.8L10 9.2Z" fill="currentColor" />
    </>
  ),
  flag: (
    <g fill="currentColor" stroke="none">
      <path d="M5 4h4.67v4.67H5zM14.33 4H19v4.67h-4.67zM9.67 8.67h4.66v4.66H9.67zM5 13.33h4.67V18H5zM14.33 13.33H19V18h-4.67z" />
      <path d="M9.67 4h4.66v4.67H9.67zM5 8.67h4.67v4.66H5zM14.33 8.67H19v4.66h-4.67zM9.67 13.33h4.66V18H9.67z" opacity=".22" />
    </g>
  ),
  wrench: (
    <>
      <path d="M14.5 4.2a4.5 4.5 0 0 0-4.8 6.1L4 16a2.1 2.1 0 0 0 3 3l5.7-5.7a4.5 4.5 0 0 0 6.1-4.8l-2.6 2.6-2.6-.7-.7-2.6 2.6-2.6Z" />
    </>
  ),
  heart: (
    <>
      <path d="M12 8.6c-1-2.2-4.6-2.4-5.4.3-.5 1.8.7 3.5 5.4 6.7 4.7-3.2 5.9-4.9 5.4-6.7-.8-2.7-4.4-2.5-5.4-.3Z" />
      <path d="M3 21v-3.5l3-2.5h5.5a1.5 1.5 0 0 1 0 3H9M11.5 18h4l4-3.5a1.4 1.4 0 0 1 2 2L17 21H3" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5" />
      <circle cx="16.8" cy="9" r="2.5" />
      <path d="M17 14.5c2.2.2 3.6 1.7 4 4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  cone: (
    <g fill="currentColor" stroke="none">
      <path d="M10.6 3h2.8l1 3.6H9.6L10.6 3Z" />
      <path d="M9.1 8.6h5.8l1 3.6H8.1l1-3.6Z" />
      <path d="M7.6 14.2h8.8l1.1 3.8H6.5l1.1-3.8Z" />
      <rect x="4" y="19" width="16" height="2.4" rx=".6" />
    </g>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  back: <path d="M15 5l-7 7 7 7" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </>
  ),
  map: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z" />
      <path d="M12 6.5v13" />
    </>
  ),
  download: <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />,
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v4h4M9 12h6M9 15.5h6M9 9h2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.8" r=".6" fill="currentColor" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5c0 3 1.2 4.5 3 4.8M17 6h2.5c0 3-1.2 4.5-3 4.8M12 14v3.5M8.5 20.5h7l-1-3h-5l-1 3Z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  sunset: (
    <>
      <path d="M7 16a5 5 0 0 1 10 0" />
      <path d="M2.5 16h19M5 19.5h14M12 4.5v3M4.6 8.6l1.8 1.8M19.4 8.6l-1.8 1.8" />
    </>
  ),
  moon: <path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1Z" />,
  sound: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5Z" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  soundOff: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5Z" />
      <path d="m16 9.5 5 5M21 9.5l-5 5" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5.5l11-2V16" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="17.5" cy="16" r="2.5" />
    </>
  ),
  linkedin: (
    <g fill="currentColor" stroke="none">
      <rect x="3.5" y="9" width="3.6" height="11" rx=".4" />
      <circle cx="5.3" cy="5.4" r="2" />
      <path d="M9.6 9h3.4v1.6c.7-1.1 1.9-1.9 3.7-1.9 3 0 3.8 2 3.8 5V20h-3.6v-5.4c0-1.6-.3-2.8-1.9-2.8-1.7 0-1.9 1.3-1.9 2.8V20H9.6V9Z" />
    </g>
  ),
  github: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2.5a9.5 9.5 0 0 0-3 18.5c.5.1.7-.2.7-.5v-1.7c-2.6.6-3.2-1.2-3.2-1.2-.4-1.1-1-1.4-1-1.4-.9-.6 0-.6 0-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.1-.2-4.3-1-4.3-4.7 0-1 .4-1.9 1-2.6-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.6 1a9 9 0 0 1 4.8 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.5.6.7 1 1.6 1 2.6 0 3.7-2.2 4.5-4.3 4.7.3.3.6.8.6 1.6v2.4c0 .3.2.6.7.5A9.5 9.5 0 0 0 12 2.5Z"
    />
  ),
  medium: (
    <g fill="currentColor" stroke="none">
      <ellipse cx="7.5" cy="12" rx="5" ry="5.2" />
      <ellipse cx="15.6" cy="12" rx="2.5" ry="4.9" />
      <ellipse cx="20.2" cy="12" rx=".9" ry="4.4" />
    </g>
  ),
};

export default function Icon({ name, size = 24, className, title }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {P[name]}
    </svg>
  );
}
