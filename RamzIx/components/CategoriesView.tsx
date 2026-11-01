"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { brandSlug, categoryCount, getBrands, getTypes, typeName } from "@/lib/filters";
import { isWsOnly, listUnitPrice, shownTiers } from "@/lib/pricing";
import { useCatalog } from "@/lib/useCatalog";
import { useSite } from "@/lib/useSite";
import { useMoney } from "./Currency";
import Icon from "./Icon";
import { T, useT } from "./Lang";
import ProductImage from "./ProductImage";
import WaLink from "./WaLink";

/* Саҳифаи «Категорияҳо»: варақаҳои категория, филтри бренд ва шабакаи навъҳои мол (аз номи маҳсулот) */
export default function CategoriesView() {
  const { products } = useCatalog();
  const { wholesaleMode } = useSite();
  const { price, label } = useMoney();
  const { t } = useT();
  const cats = CATEGORIES.filter((c) => c.id !== "all" && categoryCount(c.id, products) > 0);
  const [picked, setPicked] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const id = picked ?? cats[0]?.id;
  const inCat = useMemo(() => products.filter((p) => p.category === id), [products, id]);
  const brands = getBrands(inCat);
  const list = brand ? inCat.filter((p) => p.brand === brand) : inCat;
  const types = useMemo(() => getTypes(list), [list]);
  const qs = `category=${id}${brand ? `&brand=${brandSlug(brand)}` : ""}`;
  const pick = (c: string) => { setPicked(c); setBrand(""); };
  const unitOf = (p: (typeof list)[number]) => (isWsOnly(p, wholesaleMode) && shownTiers(p)[0]?.unit) || listUnitPrice(p);

  return (
    <>
      <form className="c2-search" role="search" action="/catalog">
        <div className="search">
          <input name="q" placeholder={t("Ҷустуҷӯи маҳсулот, бренд ё артикул")} aria-label={t("Ҷустуҷӯ")} />
          <button className="search-go" aria-label={t("Ҷустуҷӯ")}><Icon name="search" size={18} stroke={2.4} /></button>
        </div>
      </form>

      <nav className="c3-tabs" aria-label={t("Категорияҳо")}>
        {cats.map((c) => (
          <button key={c.id} className={c.id === id ? "on" : ""} aria-pressed={c.id === id} onClick={() => pick(c.id)}>
            {t(c.name)} <small>{categoryCount(c.id, products)}</small>
          </button>
        ))}
      </nav>

      {brands.length > 1 && (
        <div className="th-filter c3-brands">
          <button className={brand ? "" : "on"} onClick={() => setBrand("")}><T>Ҳама</T></button>
          {brands.map((b) => <button key={b.slug} className={b.name === brand ? "on" : ""} onClick={() => setBrand(b.name)}>{b.name}</button>)}
        </div>
      )}

      <div className="c3-grid">
        {types.map((x, k) => {
          const units = x.list.filter((p) => !p.onRequest).map(unitOf);
          return (
            <Link key={x.key} href={`/catalog?${qs}&q=${encodeURIComponent(x.key)}`} className="c3-card">
              <span className="c3-img"><ProductImage src={x.cover} alt="" eager={k < 10} sizes="(min-width: 1000px) 200px, 45vw" /></span>
              <b>{typeName(x.list[0], t(x.list[0].name))}</b>
              <small>{t("{n} модел", { n: x.list.length })}</small>
              {units.length > 0 && <em>{t("аз {x}", { x: `${price(Math.min(...units))} ${label}` })}</em>}
            </Link>
          );
        })}
      </div>

      <Link href={`/catalog?${qs}`} className="more-btn"><T>Ҳамаи маҳсулот</T> <span>{list.length}</span></Link>

      <section className="c3-ask">
        <h2><T>Мол наёфтед?</T></h2>
        <p><T>Ному модел ё аксро фиристед, менеҷер меҷӯяд ва нарх мегӯяд.</T></p>
        <div>
          <Link href="/request"><Icon name="doc" size={18} /> <T>Дархост</T></Link>
          <WaLink text="Салом! Як мол меҷӯям." className="wa"><Icon name="wa" size={18} /> WhatsApp</WaLink>
        </div>
      </section>
    </>
  );
}
