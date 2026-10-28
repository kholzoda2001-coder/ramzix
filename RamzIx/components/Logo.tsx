import Link from "next/link";
import { T } from "./Lang";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#f59e0b" />
      <path d="M15 36V12h11.5a7.5 7.5 0 0 1 2.4 14.6L35 36h-7.2l-5.4-8.6h-1.6V36z" fill="#0b1f3a" />
      <path d="M21 17.6v5.2h5a2.6 2.6 0 0 0 0-5.2z" fill="#f59e0b" />
      <path d="M5 17h6.5M3.5 22h8M6 27h5.5" stroke="#0b1f3a" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo() {
  return (
    <Link href="/" className="logo" aria-label="RamzIx">
      <LogoMark />
      <span className="logo-text">
        <span>Ramz<b>Ix</b></span>
        <small><T>Оптовӣ · Бахшоӣ · Боварӣ</T></small>
      </span>
    </Link>
  );
}
