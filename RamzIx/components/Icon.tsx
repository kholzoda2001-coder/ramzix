const PATHS: Record<string, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  cart: <><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2.5 3h2.6l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.1L21 7H6" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  heart: <path d="M12 20s-7.5-4.6-9.2-9.4A4.9 4.9 0 0 1 12 6.3a4.9 4.9 0 0 1 9.2 4.3C19.5 15.4 12 20 12 20Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>,
  home: <><path d="M3 11 12 3.5l9 7.5" /><path d="M5.5 9.5V20h13V9.5" /></>,
  doc: <><path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z" /><path d="M14 3v5h5M8.5 13h7M8.5 17h4.5" /></>,
  shield: <><path d="M12 3 4.5 6v6c0 4.8 3.2 8 7.5 9 4.3-1 7.5-4.2 7.5-9V6z" /><path d="m8.8 12 2.3 2.3 4.3-4.6" /></>,
  truck: <><path d="M2.5 6.5h11v9.5h-11zM13.5 9.5h4l3.5 3.5V16h-7.5" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>,
  tag: <><path d="M3.5 12V4.5a1 1 0 0 1 1-1H12l8.5 8.5-8.5 8.5z" /><circle cx="8" cy="8" r="1.4" /></>,
  headset: <><path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2" /><rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" /></>,
  wa: <><path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.1z" /><path d="M9 8.6c0 3.3 3.1 6.4 6.4 6.4l.9-1.5-1.9-1-1 .9a5 5 0 0 1-2.3-2.3l.9-1-1-1.9z" fill="currentColor" stroke="none" /></>,
  box: <><path d="M20.5 8 12 3.5 3.5 8v8l8.5 4.5 8.5-4.5z" /><path d="m3.5 8 8.5 4.5L20.5 8M12 12.5v8" /></>,
  pin: <><path d="M12 21s6.5-5.8 6.5-11.2a6.5 6.5 0 0 0-13 0C5.5 15.2 12 21 12 21Z" /><circle cx="12" cy="9.8" r="2.3" /></>,
  card: <><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19M6.5 15h4" /></>,
  return: <><path d="M4 9h10.5a5 5 0 0 1 0 10H8" /><path d="m8 5-4 4 4 4" /></>,
  back: <path d="M15 5 8 12l7 7" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  down: <path d="m6 9 6 6 6-6" />,
  share: <><circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1" /></>,
  bell: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  bolt: <path d="M13 2.5 5 13.5h6.5l-1 8 8-11H12z" />,
  star: <path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9l-5.4 2.9 1.1-6.1-4.5-4.3 6.1-.8z" fill="currentColor" stroke="none" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  headphones: <><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="14" width="4.5" height="6.5" rx="2" /><rect x="16.5" y="14" width="4.5" height="6.5" rx="2" /></>,
  phone: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></>,
  shirt: <path d="M8.5 3.5 3.5 6l1.8 4.2 2.2-.9V20.5h9V9.3l2.2.9L20.5 6l-5-2.5a3.5 3.5 0 0 1-7 0Z" />,
  sparkle: <path d="M12 3c.8 4.4 2.6 6.2 7 7-4.4.8-6.2 2.6-7 7-.8-4.4-2.6-6.2-7-7 4.4-.8 6.2-2.6 7-7ZM18.5 15.5c.3 1.7 1 2.4 2.5 2.7-1.6.3-2.2 1-2.5 2.6-.3-1.6-1-2.3-2.6-2.6 1.6-.3 2.3-1 2.6-2.7Z" />,
  baby: <><circle cx="12" cy="12" r="8.5" /><circle cx="9.3" cy="11" r=".9" fill="currentColor" /><circle cx="14.7" cy="11" r=".9" fill="currentColor" /><path d="M9.5 15a3.5 3.5 0 0 0 5 0M12 3.5c-1 1.2-1 2.3 0 3" /></>,
  laptop: <><rect x="4.5" y="5" width="15" height="10.5" rx="1.5" /><path d="M2.5 19h19" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5a13 13 0 0 1 0 17M12 3.5a13 13 0 0 0 0 17" /></>,
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  store: <><path d="M3.5 9 5 4.5h14L20.5 9M3.5 9v11h17V9M3.5 9h17" /><path d="M9.5 20v-5.5h5V20" /></>,
};

export default function Icon({ name, size = 22, className, stroke = 1.8 }: { name: string; size?: number; className?: string; stroke?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
