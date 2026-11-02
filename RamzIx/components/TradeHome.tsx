"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { brandLogo } from "@/lib/brands";
import { CATEGORIES, fmtQty, unitOf, type Product } from "@/lib/catalog";
import { type Brand, categoryCover, EMPTY_FILTERS, filterProducts, getBrands } from "@/lib/filters";
import { discountLadder, infoModes, listUnitPrice, shownTiers, wsSave } from "@/lib/pricing";
import { useCatalog } from "@/lib/useCatalog";
import { useSite } from "@/lib/useSite";
import { useMoney } from "./Currency";
import Flag from "./Flag";
import Icon from "./Icon";
import { Tx } from "./HomeInfo";
import { T, useT } from "./Lang";
import ProductImage from "./ProductImage";
import ProductCard from "./ProductCard";
import useDragScroll from "./useDragScroll";
import WaLink from "./WaLink";

/* Саҳифаи асосии «танҳо оптов»: нарх ошкор аз сатри аввал, рақамҳои дақиқ ва фармоиши зуд аз рӯйхат */

/** «Танҳо оптов» (admin → Сайт): саҳифаи оптовӣ, вагарна саҳифаи мағоза */
export function HomeByMode({ trade, shop }: { trade: React.ReactNode; shop: React.ReactNode }) {
  return <>{useSite().wholesaleMode ? trade : shop}</>;
}

/** Сатрбандии блок: аввал 3-то дар қатори як, баъд қатори ду; зиёда аз 6-то — ду қатор бо слайд */
const slideCols = (n: number) => ({ "--cols": Math.max(3, Math.ceil(n / 2)) }) as React.CSSProperties;

const firstUnit = (p: Product) => shownTiers(p)[0]?.unit ?? listUnitPrice(p);
const priced = (products: Product[]) => products.filter((p) => !p.onRequest && shownTiers(p).length > 0).sort((a, b) => b.reviews - a.reviews);

/** Аз ҳар бренд як мол, то витрина якранг набошад */
function showcase(products: Product[]) {
  const list = priced(products);
  const seen = new Set<string>();
  const lead = list.filter((p) => { const k = p.brand ?? ""; if (seen.has(k)) return false; seen.add(k); return true; });
  return [...lead, ...list.filter((p) => !lead.includes(p))].slice(0, 4);
}

function Tile({ p }: { p: Product }) {
  const { price, label } = useMoney();
  const { t } = useT();
  const w = shownTiers(p)[0];
  return (
    <Link href={`/product/${p.slug}`} className="th-tile">
      <span className="th-tile-img"><ProductImage src={p.images[0]} alt={t(p.name)} sizes="(min-width: 1000px) 220px, 150px" /></span>
      <b>{price(w.unit)} <i>{label}</i></b>
      <small>{t("аз {q}", { q: `${fmtQty(w.minQty)} ${t(unitOf(p))}` })}</small>
    </Link>
  );
}

export function TradeHero() {
  const { products } = useCatalog();
  const { t } = useT();
  const tiles = useMemo(() => showcase(products), [products]);
  return (
    <section className="th-hero">
      <div className="th-copy">
        <span className="th-chip"><T>Нарх ошкор, бе бақайдгирӣ</T></span>
        <h1><T>Техникаи хона бо нархи оптов</T></h1>
        <p><T>Барои мағозаҳо дар Тоҷикистон, UAE ва тамоми ҷаҳон</T></p>
        <form className="th-search" role="search" action="/catalog">
          <Icon name="search" size={19} />
          <input name="q" placeholder={t("Ҷустуҷӯи маҳсулот, бренд ё артикул")} aria-label={t("Ҷустуҷӯ")} />
        </form>
        <div className="th-btns">
          <Link href="/catalog" className="th-main"><T>Каталог</T> <Icon name="chevron" size={15} stroke={2.6} /></Link>
          <WaLink text="Салом! Прайс-лист лозим аст." className="th-wa"><Icon name="wa" size={18} /> <T>Прайс-лист дар WhatsApp</T></WaLink>
        </div>
      </div>
      <div className="th-show">{tiles.map((p) => <Tile key={p.slug} p={p} />)}</div>
    </section>
  );
}

export function TradeFacts() {
  const { products } = useCatalog();
  const { sum, label } = useMoney();
  const { t } = useT();
  const facts = [
    { big: String(products.length), small: t("модел дар каталог") },
    { big: String(getBrands(products).length), small: t("бренд") },
    { big: `${sum(discountLadder()[1].from)} ${label}`, small: t("фармоиши ҳадди ақал") },
    { big: t("2 соат"), small: t("ҷавоби менеҷер") },
  ];
  return <div className="th-facts">{facts.map((f) => <span key={f.small}><b>{f.big}</b><small>{f.small}</small></span>)}</div>;
}

export function TradeCats() {
  const { products } = useCatalog();
  const { homeCats } = useSite();
  const { t } = useT();
  const track = useRef<HTMLDivElement>(null);
  useDragScroll(track, { free: true });
  const cats = homeCats.filter((h) => h.show).map((h) => {
    const list = filterProducts(products, { ...EMPTY_FILTERS, category: h.ids, q: h.q });
    return { ...h, list, cover: categoryCover(h.ids[0], list), base: CATEGORIES.find((c) => c.id === h.ids[0]) };
  }).filter((c) => c.list.length > 0);
  return (
    <section className="block th-sec">
      <div className="sec-head"><h2><T>Категорияҳо</T></h2><Link href="/categories"><T>Ҳама</T> <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
      <div className="th-cats slide-x" style={slideCols(cats.length)} ref={track}>
        {cats.map((c) => (
          <Link key={c.id} href={`/catalog?category=${c.ids.join(",")}${c.q ? `&q=${encodeURIComponent(c.q)}` : ""}`}>
            <span className="th-cat-img">{c.cover ? <ProductImage src={c.cover} alt="" sizes="160px" /> : <Icon name={c.base?.icon ?? "tag"} size={30} stroke={1.6} />}</span>
            <b><T>{c.name}</T></b>
            <small>{t("{n} модел", { n: c.list.length })}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Корти бренд: логотипи пурра, шумораи моделҳо ва арзонтарин нарх (дар каталог ва саҳифаи «Брендҳо») */
export function BrandTile({ b }: { b: Brand }) {
  const { products } = useCatalog();
  const { price, label } = useMoney();
  const { t } = useT();
  const img = brandLogo(b.name).img;
  const units = products.filter((p) => p.brand === b.name && !p.onRequest).map(firstUnit);
  return (
    <Link href={`/catalog?brand=${b.slug}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <span className="th-logo">{img ? <img src={img} alt={b.name} loading="lazy" decoding="async" /> : <b>{b.name}</b>}</span>
      <span className="th-brand-txt">
        {b.count > 0 ? <small>{t("{n} модел", { n: b.count })}</small> : <small><T>Ба наздикӣ</T></small>}
        {units.length > 0 && <small className="th-from">{t("аз {x}", { x: `${price(Math.min(...units))} ${label}` })}</small>}
      </span>
    </Link>
  );
}

export function TradeBrands() {
  const { products } = useCatalog();
  const track = useRef<HTMLDivElement>(null);
  useDragScroll(track, { free: true });
  const brands = getBrands(products);
  return (
    <section className="block th-sec">
      <div className="sec-head"><h2><T>Брендҳо</T></h2><Link href="/brands"><T>Ҳама</T> <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
      <div className="th-brands slide-x" style={slideCols(brands.length)} ref={track}>{brands.map((b) => <BrandTile key={b.slug} b={b} />)}</div>
    </section>
  );
}

/** Моли серхарид бо кортҳои колеҷ: нархи ҳар зина ва иловаи зуд */
export function TradeRows() {
  const { products } = useCatalog();
  const { homeCats } = useSite();
  const [cat, setCat] = useState("");
  const cats = homeCats.filter((h) => h.show);
  const picked = cats.find((c) => c.id === cat);
  const list = useMemo(() => priced(picked ? filterProducts(products, { ...EMPTY_FILTERS, category: picked.ids, q: picked.q }) : products).slice(0, 6), [products, picked]);
  if (!products.length) return null;
  return (
    <section className="block th-sec th-rows">
      <div className="sec-head"><h2><T>Моли серхарид</T></h2><Link href="/catalog"><T>Ҳама</T> <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
      <div className="th-filter">
        <button className={cat ? "" : "on"} onClick={() => setCat("")}><T>Ҳама</T></button>
        {cats.map((c) => <button key={c.id} className={c.id === cat ? "on" : ""} onClick={() => setCat(c.id)}><T>{c.name}</T></button>)}
      </div>
      <div className="grid2 th-grid">{list.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      <Link href="/catalog" className="more-btn"><T>Ҳамаи маҳсулот</T> <span>{products.length}</span></Link>
    </section>
  );
}

/** Зинаҳои нарх дар мисоли як моли воқеӣ */
export function TradeTiers() {
  const { products } = useCatalog();
  const { price, sum, label } = useMoney();
  const { t } = useT();
  const sample = useMemo(() => priced(products)[0], [products]);
  const ladder = discountLadder().slice(1);
  const tiers = sample ? shownTiers(sample) : [];
  return (
    <section className="th-tiers" id="rfq">
      <h2><Tx k="tierTitle" /></h2>
      <p><Tx k="tierText" /></p>
      <div className="th-steps">
        {ladder.map((s, k) => {
          const w = tiers[k];
          const save = wsSave(100 - s.off, 100 - ladder[0].off);
          return (
            <div key={s.from} className={k === ladder.length - 1 ? "best" : ""}>
              <small>{t("аз {x}", { x: `${sum(s.from)} ${label}` })}</small>
              <b>{save > 0 ? `−${String(save).replace(".", ",")}%` : t("Оптом")}</b>
              {w && <small>{t("{u} {l} / дона", { u: price(w.unit), l: label })}</small>}
            </div>
          );
        })}
      </div>
      {sample && <p className="th-sample">{t("Намуна: {name}", { name: t(sample.name) })}</p>}
    </section>
  );
}

/** Расонидан аз рӯи кишвари харидор: мӯҳлатҳо аз танзимоти нарх */
export function TradeShip() {
  const { t } = useT();
  // Ҳар роҳ бо нарх барои 1 кг ва мӯҳлат; нархи ниҳоӣ бо менеҷер
  const days = (dest: "tj" | "ae") => infoModes("ae", dest).map((m) => `${t(m.label)}: ${m.perKgUsd > 0 && dest === "tj" ? `$${String(m.perKgUsd).replace(".", ",")}/${t("кг")}, ` : ""}${t("{a}–{b} рӯз", { a: m.daysMin, b: m.daysMax })}`).join(" · ");
  const rows = [
    { code: "tj", name: "Тоҷикистон", text: days("tj") },
    { code: "ae", name: "Иморот", text: days("ae") },
    { code: "intl", name: "Дигар кишвар", text: t("Менеҷер нарх ва мӯҳлатро мегӯяд") },
  ];
  return (
    <section className="block th-sec th-ship">
      <div className="sec-head"><h2><T>Расонидан</T></h2></div>
      <p className="th-ship-note"><T>Нархи ниҳоии расонидан бо менеҷер муайян мешавад</T></p>
      <div>
        {rows.map((r) => <span key={r.code}><Flag code={r.code} className="th-flag" /><b><T>{r.name}</T></b><small>{r.text}</small></span>)}
      </div>
    </section>
  );
}

export function TradeCta() {
  return (
    <section className="th-cta">
      <h2><T>Нархи махсус лозим аст?</T></h2>
      <p><T>Рӯйхати молро фиристед, менеҷер ҳисоб карда ҷавоб медиҳад.</T></p>
      <WaLink text="Салом! Барои фармоиши калон нархи оптовӣ лозим аст." className="th-wa"><Icon name="wa" size={18} /> <T>Менеҷер дар WhatsApp</T></WaLink>
    </section>
  );
}
