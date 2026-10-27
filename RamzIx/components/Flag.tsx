import type { CountryCode } from "@/lib/catalog";

/* Парчамҳои соддакардашуда (SVG, бе тасвири беруна) */
const FLAGS: Record<CountryCode, React.ReactNode> = {
  ae: (
    <svg viewBox="0 0 12 6" preserveAspectRatio="none">
      <rect width="12" height="2" fill="#00732f" />
      <rect y="2" width="12" height="2" fill="#fff" />
      <rect y="4" width="12" height="2" fill="#000" />
      <rect width="3" height="6" fill="#ff0000" />
    </svg>
  ),
  cn: (
    <svg viewBox="0 0 30 20" preserveAspectRatio="none">
      <rect width="30" height="20" fill="#de2910" />
      <path fill="#ffde00" d="m5 2 1.2 3.6H10L7 7.8l1.1 3.6L5 9.2l-3.1 2.2L3 7.8 0 5.6h3.8z" />
      <circle cx="11" cy="2.5" r=".9" fill="#ffde00" />
      <circle cx="13" cy="4.8" r=".9" fill="#ffde00" />
      <circle cx="13" cy="7.8" r=".9" fill="#ffde00" />
      <circle cx="11" cy="10" r=".9" fill="#ffde00" />
    </svg>
  ),
  tr: (
    <svg viewBox="0 0 30 20" preserveAspectRatio="none">
      <rect width="30" height="20" fill="#e30a17" />
      <circle cx="11" cy="10" r="5" fill="#fff" />
      <circle cx="12.3" cy="10" r="4" fill="#e30a17" />
      <path fill="#fff" d="m17.2 10 3.9-1.3-2.4 3.3V8l2.4 3.3z" />
    </svg>
  ),
  tj: (
    <svg viewBox="0 0 28 14" preserveAspectRatio="none">
      <rect width="28" height="4" fill="#cc0000" />
      <rect y="4" width="28" height="6" fill="#fff" />
      <rect y="10" width="28" height="4" fill="#006600" />
      <path d="M11.8 8.3h4.4l-.4-1.6-.9.7-.9-1.3-.9 1.3-.9-.7z" fill="#f8c300" />
      <g fill="#f8c300">
        <circle cx="10.8" cy="6.6" r=".35" /><circle cx="11.3" cy="5.6" r=".35" /><circle cx="12.4" cy="5" r=".35" />
        <circle cx="14" cy="4.8" r=".35" /><circle cx="15.6" cy="5" r=".35" /><circle cx="16.7" cy="5.6" r=".35" />
        <circle cx="17.2" cy="6.6" r=".35" />
      </g>
    </svg>
  ),
};

export default function Flag({ code, className }: { code: CountryCode; className?: string }) {
  return <span className={`flag ${className ?? ""}`}>{FLAGS[code]}</span>;
}
