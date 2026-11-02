"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CATEGORIES, waLink } from "@/lib/catalog";
import { CURRENCIES } from "@/lib/currency";
import { categoryCount } from "@/lib/filters";
import { LANGS } from "@/lib/i18n";
import { useCatalog } from "@/lib/useCatalog";
import { CartBadge } from "./Cart";
import { useMoney } from "./Currency";
import Icon from "./Icon";
import { T, useT } from "./Lang";
import { LogoMark } from "./Logo";

/* Сарлавҳаи компютер (≥1000px): лого, ҷустуҷӯ, бахшҳо ва сабад дар як ҷо. Дар телефон пинҳон аст (CSS) */
const LINKS = [
  { href: "/catalog", label: "Каталог" },
  { href: "/categories", label: "Категорияҳо" },
  { href: "/brands", label: "Брендҳо" },
  { href: "/request", label: "Дархост" },
  { href: "/#rfq", label: "Шартҳои оптовӣ" },
];

function Bar() {
  const { t, lang, setLang } = useT();
  const { cur, setCur } = useMoney();
  const { products } = useCatalog();
  const path = usePathname();
  const params = useSearchParams();
  const cat = path === "/catalog" ? params.get("category") : null;
  const cats = CATEGORIES.filter((c) => c.id !== "all" && categoryCount(c.id, products) > 0);
  if (path.startsWith("/admin")) return null;

  return (
    <header className="db">
      <div className="db-in">
        <Link href="/" className="db-logo" aria-label="RamzIx"><LogoMark size={30} /><span>Ramz<b>Ix</b></span></Link>
        <form className="db-search" role="search" action="/catalog">
          <Icon name="search" size={18} />
          <input key={params.get("q") ?? ""} name="q" defaultValue={path === "/catalog" ? params.get("q") ?? "" : ""} placeholder={t("Ҷустуҷӯи маҳсулот, бренд ё артикул")} aria-label={t("Ҷустуҷӯ")} />
          <button><T>Ёфтан</T></button>
        </form>
        <div className="db-tools">
          <select value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} aria-label={t("Забон")}>
            {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <select value={cur} onChange={(e) => setCur(e.target.value as typeof cur)} aria-label={t("Асъор")}>
            {CURRENCIES.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
          </select>
          <a className="db-wa" href={waLink(t("Салом! Савол дорам."))} target="_blank" rel="noreferrer"><Icon name="wa" size={18} />WhatsApp</a>
          <Link href="/profile" className={`db-ic ${path.startsWith("/profile") ? "on" : ""}`}><Icon name="user" size={22} /><small><T>Профил</T></small></Link>
          <Link href="/cart" className={`db-ic ${path.startsWith("/cart") ? "on" : ""}`}><span><Icon name="cart" size={22} /><CartBadge /></span><small><T>Сабад</T></small></Link>
        </div>
      </div>
      <nav className="db-nav" aria-label={t("Менюи асосӣ")}>
        <div className="db-in">
          {LINKS.map((l) => <Link key={l.href} href={l.href} className={!l.href.includes("#") && path.startsWith(l.href) && !cat ? "on" : ""}><T>{l.label}</T></Link>)}
          <span className="db-sep" />
          {cats.map((c) => <Link key={c.id} href={`/catalog?category=${c.id}`} className={cat === c.id ? "on" : ""}><T>{c.name}</T></Link>)}
        </div>
      </nav>
    </header>
  );
}

// useSearchParams дар Next ҳудуди Suspense мехоҳад
export default function DeskBar() {
  return <Suspense fallback={null}><Bar /></Suspense>;
}
