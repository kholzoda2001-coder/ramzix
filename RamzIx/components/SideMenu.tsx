"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CATEGORIES, waLink } from "@/lib/catalog";
import { CONTACT } from "@/lib/pricing-config";
import { CURRENCIES } from "@/lib/currency";
import { categoryCount, categoryCover } from "@/lib/filters";
import { useCatalog } from "@/lib/useCatalog";
import { useMoney } from "./Currency";
import Icon from "./Icon";
import { T, useT } from "./Lang";
import ProductImage from "./ProductImage";

/* Менюи ҷонибӣ: категорияҳо бо акс, асъор ва пайвандҳо */
export default function SideMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const { products } = useCatalog();
  const { cur, setCur, label } = useMoney();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!mounted) return null;
  const cats = CATEGORIES.filter((c) => c.id !== "all" && categoryCount(c.id, products) > 0);
  const nextCur = () => {
    const i = CURRENCIES.findIndex((c) => c.id === cur);
    setCur(CURRENCIES[(i + 1) % CURRENCIES.length].id);
  };
  const askLink = waLink(t("Салом! Савол дорам."));

  // Дар body кушода мешавад, то сарлавҳаи часпанда ба болояш набарояд
  return createPortal(
    <div className={`sm-wrap ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="sm-bg" onClick={onClose} />
      <button className="sm-x" onClick={onClose} aria-label={t("Пӯшидан")}><Icon name="close" size={24} stroke={2} /></button>
      <aside className="sm" role="dialog" aria-modal="true" aria-label={t("Меню")}>
        <div className="sm-scroll">
          <nav className="sm-cats" aria-label={t("Категорияҳо")}>
            {cats.map((c) => {
              const src = categoryCover(c.id, products);
              return (
                <Link key={c.id} href={`/catalog?category=${c.id}`} onClick={onClose}>
                  <span className="sm-thumb">{src ? <ProductImage src={src} alt="" sizes="64px" /> : <Icon name={c.icon} size={22} />}</span>
                  <span className="sm-name">{t(c.name)}</span>
                  <Icon name="chevron" size={16} stroke={2.2} />
                </Link>
              );
            })}
          </nav>

          <button className="sm-cur" onClick={nextCur}>
            <Icon name="tag" size={20} />
            <span><T>Иваз кардани асъор</T></span>
            <small>{label}</small>
          </button>

          <div className="sm-info">
            <h3>RAMZIX</h3>
            <Link href="/catalog" onClick={onClose}><T>Каталог</T></Link>
            <Link href="/brands" onClick={onClose}><T>Брендҳо</T></Link>
            <Link href="/#rfq" onClick={onClose}><T>Шартҳои оптовӣ</T></Link>
            <Link href="/profile" onClick={onClose}><T>Профил</T></Link>
            <a href={askLink} target="_blank" rel="noreferrer" onClick={onClose}><T>Менеҷер дар WhatsApp</T> <small>+{CONTACT.whatsapp}</small></a>
          </div>
        </div>

        <div className="sm-foot">
          <Link href="/" onClick={onClose} aria-label={t("Асосӣ (меню)")}><Icon name="home" size={24} /></Link>
          <Link href="/cart" onClick={onClose} aria-label={t("Сабад")}><Icon name="cart" size={24} /></Link>
          <a href={askLink} target="_blank" rel="noreferrer" aria-label="WhatsApp"><Icon name="wa" size={24} /></a>
          <Link href="/profile" onClick={onClose} aria-label={t("Профил")}><Icon name="user" size={24} /></Link>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
