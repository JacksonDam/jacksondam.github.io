import { BRAND_PATHS } from '../data/skillLogos';

// Marks with no public brand icon, drawn as line icons on the same 24px grid as Icon.jsx.
const DRAWN = {
  java: (
    <>
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
      <path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M3 21h15" />
      <path d="M8 3.5c-.8 1 .8 2 0 3M12 3.5c-.8 1 .8 2 0 3" />
    </>
  ),
  sql: (
    <>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
      <path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13" />
      <path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
    </>
  ),
  swiftui: (
    <>
      <rect x="8" y="3" width="13" height="13" rx="3.5" />
      <path d="M16 16v1.5a3.5 3.5 0 0 1-3.5 3.5h-6A3.5 3.5 0 0 1 3 17.5v-6A3.5 3.5 0 0 1 6.5 8H8" />
    </>
  ),
  mockito: (
    <>
      <path d="M5.5 8h13l-1.5 11.3a2 2 0 0 1-2 1.7H9a2 2 0 0 1-2-1.7L5.5 8Z" />
      <path d="M13.5 8 16 3h2.5" />
      <path d="M6.6 13.5h10.8" />
    </>
  ),
  guice: (
    <g transform="rotate(45 12 12)">
      <rect x="9.5" y="8" width="5" height="10" rx="1" />
      <path d="M12 18v4M12 8V4M9.5 4h5M8 8h8M9.5 11.5h2M9.5 14.5h2" />
    </g>
  ),
  ai: (
    <>
      <path d="M11 3.5l1.9 5.1 5.1 1.9-5.1 1.9-1.9 5.1-1.9-5.1-5.1-1.9 5.1-1.9L11 3.5Z" />
      <path d="M18.5 14.5v5M16 17h5" />
    </>
  ),
};

export default function SkillLogo({ logo, className }) {
  if (logo === 'javascript') {
    // The JS mark is a yellow square with the letters cut out; black behind them, as in the real badge.
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <rect x=".5" y=".5" width="23" height="23" fill="#000" />
        <path d={BRAND_PATHS.javascript} fill="#f7df1e" />
      </svg>
    );
  }
  if (DRAWN[logo]) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {DRAWN[logo]}
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={BRAND_PATHS[logo]} />
    </svg>
  );
}
