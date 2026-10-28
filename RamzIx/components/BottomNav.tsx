"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { CartBadge } from "./Cart";
import { useT, T } from "./Lang";

const ITEMS = [
  { href: "/", icon: "home", label: "Асосӣ (меню)" },
  { href: "/catalog", icon: "grid", label: "Каталог" },
  { href: "/#rfq", icon: "doc", label: "Дархостҳо" },
  { href: "/cart", icon: "cart", label: "Сабад", badge: true },
  { href: "/profile", icon: "user", label: "Профил" },
];

export default function BottomNav() {
  const { t } = useT();
  const path = usePathname();
  return (
    <nav className="bottom-nav" aria-label={t("Менюи асосӣ")}>
      {ITEMS.map((it) => (
        <Link key={it.label} href={it.href} className={it.href === "/" ? (path === "/" ? "on" : "") : path.startsWith(it.href.split("#")[0]) && it.href.split("#")[0] !== "/" ? "on" : ""}>
          <span className="bn-ic">
            <Icon name={it.icon} size={23} />
            {it.badge && <CartBadge />}
          </span>
          {t(it.label)}
        </Link>
      ))}
    </nav>
  );
}
