"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { CATEGORIES, COUNTRIES, fmtQty, shownCountries, unitOf, type Product } from "@/lib/catalog";
import { brandLogo, FEATURED_BRANDS } from "@/lib/brands";
import { type Brand, brandSlug, categoryCover, EMPTY_FILTERS, filterProducts, getBrands } from "@/lib/filters";
import { useCatalog } from "@/lib/useCatalog";
import { useSite } from "@/lib/useSite";
import BrandLogo from "./BrandLogo";
import Flag from "./Flag";
import Icon from "./Icon";
import { T, useT } from "./Lang";
import { useMoney } from "./Currency";
import { discountLadder, listUnitPrice, shownTiers } from "@/lib/pricing";
import { setPriceMode, usePriceMode } from "./PriceMode";
import ProductImage from "./ProductImage";
import ProductCard from "./ProductCard";
import ProductFeed from "./ProductFeed";
import useDragScroll from "./useDragScroll";

/* Маҳсулотро аз кишварҳои гуногун омехта мекунад, то лента якранг набошад */
function interleave<T extends { source: string }>(items: T[]): T[] {
  const groups = new Map<string, T[]>();
  items.forEach((p) => groups.set(p.source, [...(groups.get(p.source) ?? []), p]));
  const lists = [...groups.values()];
  const out: T[] = [];
  for (let i = 0; out.length < items.length; i++) lists.forEach((l) => l[i] && out.push(l[i]));
  return out;
}

export function Countries() {
  const { products } = useCatalog();
  return (
    <section className="block" id="countries">
      <div className="sec-head"><h2><T>Харид аз рӯи кишвар</T></h2></div>
      <div className="countries">
        {shownCountries().map((c) => {
          const n = products.filter((p) => p.country === c).length;
          return (
            <Link key={c} href={`/catalog?country=${c}`} className="country">
              <Flag code={c} className="country-flag" />
              <b><T>{COUNTRIES[c].short}</T></b>
              <span>{n > 0 ? <T vars={{ n }}>{"{n} мол"}</T> : <T>Ба наздикӣ</T>}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** Акси категория (аз маҳсулоти худи категория), бе акс — нишона */
function CatCover({ id, icon, tint, products, sizes = "64px" }: { id: string; icon: string; tint: string; products: Product[]; sizes?: string }) {
  const src = categoryCover(id, products);
  return (
    <span className="cs-img" style={{ background: tint }}>
      {src ? <ProductImage src={src} alt="" sizes={sizes} /> : <Icon name={icon} size={30} stroke={1.6} />}
    </span>
  );
}

/* Нишонҳои категорияҳо: рӯйхат ва тартиб аз admin меояд (lib/site-config.ts) */
export function CategoryGrid() {
  const { products } = useCatalog();
  const track = useRef<HTMLDivElement>(null);
  useDragScroll(track, { free: true });
  const { homeCats } = useSite();
  const cats = homeCats.filter((h) => h.show).map((h) => {
    const list = filterProducts(products, { ...EMPTY_FILTERS, category: h.ids, q: h.q });
    return { ...h, list, base: CATEGORIES.find((c) => c.id === h.ids[0]) ?? CATEGORIES[0] };
  }).filter((c) => c.list.length > 0);
  return (
    <section className="block" id="catalog">
      <div className="sec-head"><h2><T>Категорияҳо</T></h2><Link href="/categories"><T>Ҳама</T> <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
      <div className="cat-slider" ref={track}>
        {cats.map((c) => (
          <Link key={c.id} href={`/catalog?category=${c.ids.join(",")}${c.q ? `&q=${encodeURIComponent(c.q)}` : ""}`} className="cs-card" draggable={false}>
            <CatCover id={c.ids[0]} icon={c.base.icon} tint={c.base.tint} products={c.list} sizes="64px" />
            <b><T>{c.name}</T></b>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Сатри тахфиф дар зери баннер: остонаи навбатии нарх ва брендҳо */
export function PromoStrip() {
  const { sum, label } = useMoney();
  const { t } = useT();
  const s = discountLadder()[1];
  return (
    <div className="promo-sheet">
    <div className="promo-strip">
      <Link href="/#rfq"><b><Icon name="tag" size={15} /> <T>Тахфифи ҳаҷм</T></b><span>{t("Аз {x}: −{p}%", { x: `${sum(s.from)} ${label}`, p: String(s.off).replace(".", ",") })}</span></Link>
      <Link href="/brands"><b><Icon name="shield" size={15} /> <T>Брендҳо</T></b><span><T>Мол аз рӯи бренд</T></span></Link>
    </div>
    </div>
  );
}

/** Акси хурд бо нарх барои блокҳо */
function Mini({ p, tag }: { p: Product; tag?: string }) {
  const { price, label } = useMoney();
  const mode = usePriceMode();
  const w = shownTiers(p)[0];
  const value = mode === "whole" && w ? w.unit : listUnitPrice(p);
  return (
    <Link href={`/product/${p.slug}`} className="mini" draggable={false}>
      <span className="mini-img"><ProductImage src={p.images[0]} alt={p.name} sizes="96px" /></span>
      <b>{price(value)} <small>{label}</small></b>
      {tag && <small>{tag}</small>}
    </Link>
  );
}

/** Ду блок якдигарро пайравӣ мекунанд: нархи оптом (картон ва кило) ва маҳсулоти машҳур, ҳар кадом бо 4 мол */
export function DealsPair() {
  const { products } = useCatalog();
  const { t } = useT();
  const bulk = products.filter((p) => p.sale).sort((a, b) => (shownTiers(b)[0]?.off ?? 0) - (shownTiers(a)[0]?.off ?? 0)).slice(0, 4);
  const top = [...products].filter((p) => !p.sale).sort((a, b) => b.reviews - a.reviews || (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4);
  const off = (p: Product) => { const w = shownTiers(p)[0]; return w ? t("−{p}% аз {q}", { p: String(w.off).replace(".", ","), q: `${fmtQty(w.minQty)} ${t(unitOf(p))}` }) : undefined; };
  return (
    <>
      {bulk.length > 0 && (
        <section className="block deal-block">
          <div className="sec-head"><h2><T>Нархи оптом</T></h2><Link href="/catalog" onClick={() => setPriceMode("whole")}><T>Ҳама</T> <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
          <p className="deal-sub"><T>Картон ва кило: ҳар қадар зиёд, арзонтар</T></p>
          <div className="mini-row">{bulk.map((p) => <Mini key={p.slug} p={p} tag={off(p)} />)}</div>
        </section>
      )}
      {top.length > 0 && (
        <section className="block deal-block">
          <div className="sec-head"><h2><T>Маҳсулоти машҳур</T></h2><Link href="/catalog"><T>Ҳама</T> <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
          <div className="mini-row">{top.map((p) => <Mini key={p.slug} p={p} tag={off(p)} />)}</div>
        </section>
      )}
    </>
  );
}

/** Зинаҳои тахфифи сабад (аз pricing-config): «аз чӣ қадар маблағ — чанд фоиз арзонтар» */
export function TierLadder() {
  const { sum, label } = useMoney();
  const { t } = useT();
  const ladder = discountLadder();
  return (
    <div className="tc-steps ladder" role="list">
      {ladder.map((s, k) => (
        <div key={s.from} role="listitem" className={k === ladder.length - 1 ? "best" : ""}>
          <b>{s.off > 0 ? `−${String(s.off).replace(".", ",")}%` : "0%"}</b>
          <small>{k === 0 ? t("то {x}", { x: sum(ladder[1].from) }) : t("аз {x}", { x: sum(s.from) })}</small>
        </div>
      ))}
      <span className="ladder-cur">{label}</span>
    </div>
  );
}

/** Брендҳои мол дорад + брендҳои машҳури ҷаҳонӣ (бе мол, count = 0) */
function useAllBrands(products: Product[]): Brand[] {
  const { hiddenBrands } = useSite();
  return useMemo(() => {
    const real = getBrands(products);
    const have = new Set(real.map((b) => b.slug));
    const extra = FEATURED_BRANDS.filter((n) => !have.has(brandSlug(n)) && !hiddenBrands.includes(n)).map((n) => ({ slug: brandSlug(n), name: n, count: 0, countries: [] }));
    // Аввал брендҳое, ки логои ҳақиқӣ доранд (аввал бо мол, баъд ҷаҳонӣ), баъд бо ҳарфҳо
    const all = [...real, ...extra];
    return [...all.filter((b) => brandLogo(b.name).img), ...all.filter((b) => !brandLogo(b.name).img)];
  }, [products, hiddenBrands]);
}

/** Брендҳо дар саҳифаи асосӣ: логоҳо дар шакли мудаввар, мисли категорияҳо */
export function BrandRow() {
  const { products } = useCatalog();
  const brands = useAllBrands(products).slice(0, 16);
  const track = useRef<HTMLDivElement>(null);
  useDragScroll(track, { free: true });
  return (
    <section className="block">
      <div className="sec-head"><h2><T>Брендҳо</T></h2><Link href="/brands"><T>Ҳама</T> <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
      <div className="brand-row" ref={track}>
        {brands.map((b) => (
          <Link key={b.slug} href={`/catalog?brand=${b.slug}`} className="brand-round" aria-label={b.name} draggable={false}>
            <BrandLogo name={b.name} />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function FoodRow() {
  const { products } = useCatalog();
  const food = products.filter((p) => p.sale);
  if (food.length === 0) return null;
  return (
    <section className="block" id="food">
      <div className="sec-head">
        <div><h2><T>Озуқа ва нӯшокӣ</T></h2><p className="sec-sub"><T>Бо картон ва бо кило</T></p></div>
      </div>
      <div className="hscroll">
        {food.map((p) => <ProductCard key={p.slug} p={p} compact />)}
      </div>
    </section>
  );
}

function usePopular(products: Product[]) {
  return useMemo(() => {
    const popular = interleave([...products].sort((a, b) => b.reviews - a.reviews)).slice(0, 4);
    const feed = interleave(products.filter((p) => !popular.includes(p)));
    return { popular, feed };
  }, [products]);
}

export function PopularGrid() {
  const { products } = useCatalog();
  const { popular } = usePopular(products);
  return (
    <section className="block">
      <div className="sec-head"><h2><T>Маҳсулоти машҳур</T></h2></div>
      <div className="grid2">{popular.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
    </section>
  );
}

export function ForYouFeed() {
  const { products } = useCatalog();
  const { feed } = usePopular(products);
  return (
    <section className="block" id="popular">
      <div className="sec-head"><h2><T>Барои шумо</T></h2><Link href="/catalog"><T>Ҳама</T> <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
      <ProductFeed items={feed} />
    </section>
  );
}

/* Саҳифаи «Брендҳо» */
export function BrandsBody() {
  const { products } = useCatalog();
  const brands = useAllBrands(products);
  return (
    <div className="brand-grid">
      {brands.map((b) => (
        <Link key={b.slug} href={`/catalog?brand=${b.slug}`} className="brand-card">
          <span className="brand-round"><BrandLogo name={b.name} /></span>
          <b>{b.name}</b>
          {b.count === 0 && <small className="brand-soon"><T>Ба наздикӣ</T></small>}
        </Link>
      ))}
    </div>
  );
}
