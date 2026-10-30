"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, COUNTRIES, type CountryCode } from "@/lib/catalog";
import { brandSlug, categoryCount, getBrands } from "@/lib/filters";
import { useCatalog } from "@/lib/useCatalog";
import Flag from "./Flag";
import Icon from "./Icon";
import { T, useT } from "./Lang";
import ProductImage from "./ProductImage";

/* Саҳифаи «Категорияҳо»: рӯйхат дар чап, дар рост бахшҳои ҳамон категория аз маълумоти воқеии каталог */
export default function CategoriesView() {
  const { products } = useCatalog();
  const { t } = useT();
  const cats = CATEGORIES.filter((c) => c.id !== "all" && categoryCount(c.id, products) > 0);
  const [picked, setPicked] = useState<string | null>(null);
  const id = picked ?? cats[0]?.id;
  const list = products.filter((p) => p.category === id).sort((a, b) => b.reviews - a.reviews);
  const countries = (Object.keys(COUNTRIES) as CountryCode[]).flatMap((c) => {
    const p = list.find((x) => x.country === c);
    return p ? [{ c, p }] : [];
  });
  const brands = getBrands(list).flatMap((b) => {
    const p = list.find((x) => x.brand === b.name);
    return p ? [{ b, p }] : [];
  });
  const all = `/catalog?category=${id}`;

  return (
    <>
      <form className="c2-search" role="search" action="/catalog">
        <div className="search">
          <input name="q" placeholder={t("Ҷустуҷӯи маҳсулот, бренд ё артикул")} aria-label={t("Ҷустуҷӯ")} />
          <button className="search-go" aria-label={t("Ҷустуҷӯ")}><Icon name="search" size={18} stroke={2.4} /></button>
        </div>
      </form>
      <div className="c2">
        <nav className="c2-rail" aria-label={t("Категорияҳо")}>
          {cats.map((c) => (
            <button key={c.id} className={c.id === id ? "on" : ""} aria-pressed={c.id === id} onClick={() => setPicked(c.id)}>{t(c.name)}</button>
          ))}
        </nav>
        <div className="c2-pane">
          <div className="c2-grid">
            <Link href={all} className="c2-tile">
              <span className="c2-img all"><Icon name="grid" size={28} stroke={1.6} /></span>
              <span>{t("Ҳама ({n})", { n: list.length })}</span>
            </Link>
          </div>

          {countries.length > 0 && <h2><T>Аз рӯи кишвар</T></h2>}
          <div className="c2-grid">
            {countries.map(({ c, p }) => (
              <Link key={c} href={`${all}&country=${c}`} className="c2-tile">
                <span className="c2-img"><ProductImage src={p.images[0]} alt="" sizes="96px" /><Flag code={c} className="cs-flag" /></span>
                <span><T>{COUNTRIES[c].short}</T></span>
              </Link>
            ))}
          </div>

          {brands.length > 0 && <h2><T>Брендҳо</T></h2>}
          <div className="c2-grid">
            {brands.map(({ b, p }) => (
              <Link key={b.slug} href={`${all}&brand=${brandSlug(b.name)}`} className="c2-tile">
                <span className="c2-img"><ProductImage src={p.images[0]} alt="" sizes="96px" /></span>
                <span>{b.name}</span>
              </Link>
            ))}
          </div>

          <h2><T>Маҳсулоти машҳур</T></h2>
          <div className="c2-grid">
            {list.slice(0, 9).map((p) => (
              <Link key={p.slug} href={`/product/${p.slug}`} className="c2-tile">
                <span className="c2-img"><ProductImage src={p.images[0]} alt="" sizes="96px" /></span>
                <span className="clip">{t(p.name)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
