"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { COUNTRIES, WHATSAPP, products, waLink, type CountryCode } from "@/lib/catalog";
import { useProfile } from "@/lib/profile";
import { CartBadge } from "./Cart";
import Flag from "./Flag";
import Icon from "./Icon";
import { T, useT } from "./Lang";
import { LogoMark } from "./Logo";

const LINKS = [
  { href: "/", icon: "home", label: "Асосӣ (меню)" },
  { href: "/catalog", icon: "grid", label: "Каталог" },
  { href: "/categories", icon: "tag", label: "Категорияҳо" },
  { href: "/brands", icon: "store", label: "Брендҳо" },
  { href: "/cart", icon: "cart", label: "Сабад", badge: true },
  { href: "/profile", icon: "user", label: "Профил" },
];

/* Менюи ҷонибӣ: аз тугмаи се хат дар чапи боло кушода мешавад */
export default function SideMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const path = usePathname();
  const { profile } = useProfile();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const who = profile.name || profile.shop;
  const initials = who.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!mounted) return null;
  // Дар body кушода мешавад, то сарлавҳаи часпанда (z-index) ба болояш набарояд
  return createPortal(
    <div className={`sm-wrap ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="sm-bg" onClick={onClose} />
      <aside className="sm" role="dialog" aria-modal="true" aria-label={t("Меню")}>
        <div className="sm-head">
          <button className="sm-x" onClick={onClose} aria-label={t("Пӯшидан")}><Icon name="close" size={20} stroke={2.2} /></button>
          <Link href="/profile" onClick={onClose} className="sm-user">
            <span className="sm-av">{initials || <LogoMark size={44} />}</span>
            <span>
              <b>{who || t("Меҳмон")}</b>
              <small>{who ? profile.phone : t("Маълумоти худро илова кунед")}</small>
            </span>
          </Link>
        </div>

        <nav className="sm-body">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={onClose} className={path === l.href ? "on" : ""}>
              <span className="sm-ic"><Icon name={l.icon} size={20} /></span>
              <span>{t(l.label)}</span>
              {l.badge && <CartBadge />}
            </Link>
          ))}

          <h3><T>Харид аз рӯи кишвар</T></h3>
          {(Object.keys(COUNTRIES) as CountryCode[]).map((c) => (
            <Link key={c} href={`/catalog?country=${c}`} onClick={onClose}>
              <Flag code={c} className="sm-flag" />
              <span>{t(COUNTRIES[c].short)}</span>
              <small>{products.filter((p) => p.country === c).length || ""}</small>
            </Link>
          ))}
        </nav>

        <a className="sm-wa" href={waLink(t("Салом! Савол дорам."))} target="_blank" rel="noreferrer" onClick={onClose}>
          <Icon name="wa" size={20} />
          <span><b><T>Менеҷер дар WhatsApp</T></b><small>+{WHATSAPP}</small></span>
        </a>
      </aside>
    </div>,
    document.body,
  );
}
