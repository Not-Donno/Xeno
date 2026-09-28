import React from 'react';

export type IconName =
  | 'runner'
  | 'football'
  | 'basketball'
  | 'baseball'
  | 'cricket'
  | 'tennis'
  | 'volleyball'
  | 'cycling'
  | 'gym'
  | 'boxing'
  | 'golf'
  | 'swimming'
  | 'hiking'
  | 'training'
  | 'trophy'
  | 'shoe'
  | 'shirt'
  | 'jersey'
  | 'shorts'
  | 'pants'
  | 'jacket'
  | 'socks'
  | 'cap'
  | 'gloves'
  | 'bag'
  | 'watch'
  | 'box';

interface IconProps {
  name: IconName | string;
  className?: string;
  size?: number;
}

const icons: Record<string, React.ReactNode> = {
  runner: (
    <g>
      <circle cx="13" cy="4" r="2" />
      <path d="M13 7l-3 5h3l2 4M13 7l4 3 3 1M10 12l-4 2M13 7l1 5" />
      <path d="M10 17l-3 4M15 16l3 5" />
    </g>
  ),
  football: (
    <g>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7l3 2.5-1 3.5h-4l-1-3.5L12 7z" />
      <path d="M12 2v5M19.5 7.5l-3.5 2M22 12h-5M19.5 16.5l-3.5-2M12 22v-5M4.5 16.5l3.5-2M2 12h5M4.5 7.5l3.5 2" />
    </g>
  ),
  basketball: (
    <g>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20M2 12h20M4.5 4.5l15 15M19.5 4.5l-15 15" />
    </g>
  ),
  baseball: (
    <g>
      <circle cx="12" cy="12" r="10" />
      <path d="M5 5c2 2 2 12 0 14M19 5c-2 2-2 12 0 14" />
      <path d="M7 4l2 3M7 16l2 3M17 4l-2 3M17 16l-2 3" />
    </g>
  ),
  cricket: (
    <g>
      <rect x="8" y="3" width="8" height="14" rx="1" />
      <path d="M12 17v4M9 21h6" />
    </g>
  ),
  tennis: (
    <g>
      <circle cx="12" cy="12" r="10" />
      <path d="M5 5c3 3 3 9 0 12M19 5c-3 3-3 9 0 12" />
    </g>
  ),
  volleyball: (
    <g>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2l5 5-5 2M12 2L7 7l5 2M2 12l5-5 2 5M22 12l-5-5-2 5M12 22l-5-5 5-2M12 22l5-5-5-2" />
    </g>
  ),
  cycling: (
    <g>
      <circle cx="6" cy="17" r="3.5" />
      <circle cx="18" cy="17" r="3.5" />
      <path d="M6 17l4-8h6l2 8M10 9L8 5h3M14 9l-2-4" />
    </g>
  ),
  gym: (
    <g>
      <rect x="2" y="9" width="4" height="6" rx="1" />
      <rect x="18" y="9" width="4" height="6" rx="1" />
      <rect x="6" y="7" width="12" height="10" rx="2" />
      <rect x="10" y="11" width="4" height="2" />
    </g>
  ),
  boxing: (
    <g>
      <path d="M7 11V7a5 5 0 0110 0v4" />
      <rect x="5" y="11" width="14" height="8" rx="2" />
      <path d="M9 15h6" />
    </g>
  ),
  golf: (
    <g>
      <path d="M12 2v16M12 18h8" />
      <path d="M12 2l8 4-8 4" />
    </g>
  ),
  swimming: (
    <g>
      <path d="M2 16c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
      <path d="M2 20c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
      <circle cx="16" cy="6" r="2" />
      <path d="M4 12l6-4 4 2 4-1" />
    </g>
  ),
  hiking: (
    <g>
      <path d="M7 21l2-8M17 21l-2-8" />
      <path d="M9 13l3-9 3 9M9 13h6" />
      <path d="M7 21l-2-4h14l-2 4" />
    </g>
  ),
  training: (
    <g>
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <rect x="8" y="8" width="8" height="8" rx="4" />
    </g>
  ),
  trophy: (
    <g>
      <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 01-10 0V4z" />
      <path d="M7 6H4a2 2 0 002 4h1M17 6h3a2 2 0 01-2 4h-1" />
    </g>
  ),
  shoe: (
    <g>
      <path d="M2 16c0-1 1-2 2-2h3l4-3 3 3h4c2 0 4 1 4 3v2H2v-3z" />
      <path d="M9 11l2-4M13 11l-1-4" />
    </g>
  ),
  shirt: (
    <g>
      <path d="M8 3L4 7l2 2 2-1v11h8V8l2 1 2-2-4-4a4 4 0 01-8 0z" />
    </g>
  ),
  jersey: (
    <g>
      <path d="M8 3L4 7l2 2 2-1v11h8V8l2 1 2-2-4-4a4 4 0 01-8 0z" />
      <path d="M10 12h4M10 15h4" />
    </g>
  ),
  shorts: (
    <g>
      <path d="M5 8V3h14v5l-2 12H7L5 8z" />
      <path d="M5 8h14M12 8v12" />
    </g>
  ),
  pants: (
    <g>
      <path d="M6 3h12v18h-3l-2-12-2 12H6V3z" />
      <path d="M6 7h12" />
    </g>
  ),
  jacket: (
    <g>
      <path d="M9 3L4 7l2 2 2-1v13h8V8l2 1 2-2-5-4-3-2z" />
      <path d="M12 7v14M9 11h2M13 11h2" />
    </g>
  ),
  socks: (
    <g>
      <path d="M8 3h8v8l4 4v6H8V3z" />
      <path d="M8 8h8M8 12h12" />
    </g>
  ),
  cap: (
    <g>
      <path d="M4 14a8 8 0 0116 0v1H4v-1z" />
      <path d="M2 17h20M12 6v2" />
    </g>
  ),
  gloves: (
    <g>
      <path d="M8 21V8a4 4 0 018 0v13" />
      <path d="M8 12H4v5a4 4 0 004 4M16 12h4v5a4 4 0 01-4 4" />
      <path d="M12 4v4" />
    </g>
  ),
  bag: (
    <g>
      <rect x="4" y="7" width="16" height="13" rx="2" />
      <path d="M8 7V5a4 4 0 018 0v2" />
      <path d="M4 13h16" />
    </g>
  ),
  watch: (
    <g>
      <rect x="7" y="6" width="10" height="12" rx="2" />
      <path d="M9 6V3h6v3M9 18v3h6v-3" />
      <path d="M12 10v4l2 2" />
    </g>
  ),
  box: (
    <g>
      <rect x="3" y="8" width="18" height="13" rx="1" />
      <path d="M3 8l3-5h12l3 5M12 8v13" />
    </g>
  ),
};

export function Icon({ name, className, size = 24 }: IconProps) {
  const iconContent = icons[name];
  if (!iconContent) return null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {iconContent}
    </svg>
  );
}
