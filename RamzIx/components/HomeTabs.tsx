"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { CATEGORIES, type Product } from "@/lib/catalog";
import { listUnitPrice } from "@/lib/pricing";
import { useCatalog } from "@/lib/useCatalog";
import { useSite } from "@/lib/useSite";
import { BannerSlide, Slider } from "./Banners";
import { useMoney } from "./Currency";
import Icon from "./Icon";
import { T, useT } from "./Lang";
import ProductCard from "./ProductCard";
import { TierLadder } from "./HomeSections";
import { setPriceMode } from "./PriceMode";
import ProductImage from "./ProductImage";
import ProductRow from "./ProductRow";

/* Варақаҳои болои саҳифаи асосӣ: мундариҷа дар ҳамин саҳифа иваз мешавад, на бо гузариш ба каталог */
export const HOME_TABS = [
  { id: "all", label: "Ҳама" },
  { id: "men", label: "Мардона" },
  { id: "women", label: "Занона" },
  { id: "kids", label: "Кӯдакона" },
  { id: "shoes", label: "Пояфзол" },
];

// Маҷмӯаҳо ва молҳои тамғадор барои акси баннер мувофиқ нестанд
const NOT_FOR_BANNER = /маҷмӯи|парчам|рӯймол/i;
const has = (p: Product, q: string) => p.name.toLowerCase().includes(q);

/** Як қатор зеркатегория (аз admin): бо акси маҳсулоти воқеӣ; бе мол — танҳо нишона, бе пайванд */
function SubRow({ id, icon, list }: { id: string; icon: string; list: Product[] }) {
  const { t } = useT();
  const { banners } = useSite();
  return (
    <div className="sub-row">
      {(banners[id] ?? []).filter((s) => s.active && s.label).map((s) => {
        const q = s.q || s.label.toLowerCase();
        const p = list.find((x) => has(x, q));
        const body = (
          <>
            <span className="cs-img">{p ? <ProductImage src={p.images[0]} alt="" sizes="64px" /> : <Icon name={icon} size={24} stroke={1.5} />}</span>
            <b>{t(s.label)}</b>
          </>
        );
        return p
          ? <Link key={s.id} href={`/catalog?category=${id}&q=${encodeURIComponent(q)}`} className="cs-card" draggable={false}>{body}</Link>
          : <span key={s.id} className="cs-card soon">{body}</span>;
      })}
    </div>
  );
}

/** Баннерҳои варақа (аз admin): ҳар кадом як зеркатегория бо ранг ва матни худ; бе мол — намоён намешавад */
function TabBanners({ id, list }: { id: string; list: Product[] }) {
  const { banners } = useSite();
  const slides = (banners[id] ?? []).filter((b) => b.active).flatMap((b) => {
    const q = b.q || b.label.toLowerCase();
    const match = list.filter((p) => has(p, q) && !NOT_FOR_BANNER.test(p.name));
    return match.length ? [{ ...b, q, match }] : [];
  });
  const fill = list.filter((p) => !NOT_FOR_BANNER.test(p.name));
  if (!slides.length) return null;
  return (
    <Slider count={slides.length}>
      {slides.map((b, k) => (
        <BannerSlide key={b.id} title={b.title} sub={b.sub} href={`/catalog?category=${id}&q=${encodeURIComponent(b.q)}`} from={b.from} to={b.to} list={b.match} fill={fill} eager={k === 0} />
      ))}
    </Slider>
  );
}

let current = "all";
const listeners = new Set<() => void>();
export function setHomeTab(id: string) {
  current = id;
  listeners.forEach((l) => l());
  window.scrollTo(0, 0);
}
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useHomeTab = () => useSyncExternalStore(subscribe, () => current, () => "all");

export default function HomeSwitch({ children }: { children: React.ReactNode }) {
  const tab = useHomeTab();
  if (tab === "all") return <>{children}</>;
  return tab === "whole" ? <WholesaleHome /> : <CategoryHome id={tab} />;
}

/* Варақаи «Оптом»: зинаҳои тахфиф ва рӯйхати се нарх, аввал моли картонӣ ва килоӣ */
function WholesaleHome() {
  const { products } = useCatalog();
  const { t } = useT();
  const list = useMemo(() => [...products].sort((a, b) => Number(!!b.sale) - Number(!!a.sale) || b.reviews - a.reviews), [products]);
  const lead = list[0];
  if (!lead) return null;
  return (
    <>
      <section className="tab-hero">
        <div className="th-text">
          <span className="sb-tag"><T>Барои мағоза ва бизнес</T></span>
          <h2><T>Нархи оптом</T></h2>
          <span className="th-from"><T>Сабад калонтар — нарх арзонтар</T></span>
          <Link href="/catalog" className="sb-btn" onClick={() => setPriceMode("whole")}><T>Ҳамаи нархҳои оптом</T></Link>
        </div>
        <span className="th-photo"><ProductImage src={lead.images[0]} alt="" eager sizes="192px" /></span>
      </section>
      <div className="promo-sheet tab-sheet">
        <section className="tiers-card whole-card" aria-label={t("Тахфифи ҳаҷм")}><TierLadder /></section>
      </div>
      <div className="prows">{list.slice(0, 24).map((p) => <ProductRow key={p.slug} p={p} />)}</div>
      <Link href="/catalog" className="more-btn" onClick={() => setPriceMode("whole")}><T>Ҳамаи нархҳои оптом</T> <span>{list.length}</span></Link>
    </>
  );
}

/* Саҳифаи як категория дар дохили саҳифаи асосӣ: баннер, беҳтаринҳо, бахшҳо ва маҳсулот */
function CategoryHome({ id }: { id: string }) {
  const { products } = useCatalog();
  const { price, label } = useMoney();
  const { t } = useT();
  const list = useMemo(() => products.filter((p) => p.category === id).sort((a, b) => b.reviews - a.reviews || (b.rating ?? 0) - (a.rating ?? 0)), [products, id]);
  const cat = CATEGORIES.find((c) => c.id === id);
  const lead = list[0];
  if (!cat) return null;
  // Дар ин бахш ҳанӯз мол нест
  if (!lead) {
    return (
      <>
        <section className="tab-hero">
          <h2 className="sr-only">{t(cat.name)}</h2>
        </section>
        <div className="promo-sheet tab-sheet"><SubRow id={id} icon={cat.icon} list={list} /></div>
        <div className="tab-empty">
          <span className="nf-ic"><Icon name={cat.icon} size={32} stroke={1.5} /></span>
          <b><T>Ба наздикӣ</T></b>
          <span><T>Дар ин бахш ҳанӯз мол нест. Дигар бахшҳоро бинед.</T></span>
          <Link href="/catalog" className="btn btn-orange"><T>Ба каталог</T></Link>
        </div>
      </>
    );
  }
  const all = `/catalog?category=${id}`;

  return (
    <>
      <h2 className="sr-only">{t(cat.name)}</h2>
      <TabBanners key={id} id={id} list={list} />

      <div className="promo-sheet tab-sheet">
        <SubRow id={id} icon={cat.icon} list={list} />
        <div className="col-strip">
          {list.slice(0, 6).map((p) => (
            <Link key={p.slug} href={`/product/${p.slug}`} className="col-item" draggable={false}>
              <span className="col-img"><ProductImage src={p.images[0]} alt={t(p.name)} sizes="96px" /></span>
              <b>{price(listUnitPrice(p))} {label}</b>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid2 tab-feed">{list.slice(0, 20).map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      {list.length > 20 && <Link href={all} className="more-btn"><T>Ҳамаи маҳсулот</T> <span>{list.length}</span></Link>}
    </>
  );
}
