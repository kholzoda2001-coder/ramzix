"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CATEGORIES, COUNTRIES, type CountryCode, type Product } from "@/lib/catalog";
import { categoryCount, getBrands } from "@/lib/filters";
import { useCatalog } from "@/lib/useCatalog";
import BrandLogo from "./BrandLogo";
import Flag from "./Flag";
import Icon from "./Icon";
import { T } from "./Lang";
import ProductCard from "./ProductCard";
import ProductFeed from "./ProductFeed";

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
        {(Object.keys(COUNTRIES) as CountryCode[]).map((c) => {
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

export function CategoryGrid() {
  const { products } = useCatalog();
  return (
    <section className="block" id="catalog">
      <div className="sec-head"><h2><T>Категорияҳо</T></h2><Link href="/categories"><T>Ҳама</T> <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
      <div className="cats">
        {CATEGORIES.map((c) => (
          <Link key={c.id} href={c.id === "all" ? "/categories" : categoryCount(c.id, products) > 0 ? `/catalog?category=${c.id}` : "/categories"} className="cat">
            <span className="cat-ic" style={{ background: c.tint }}><Icon name={c.icon} size={26} stroke={1.6} /></span>
            <span><T>{c.name}</T></span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BrandRow() {
  const { products } = useCatalog();
  const brands = useMemo(() => getBrands(products).slice(0, 10), [products]);
  return (
    <section className="block">
      <div className="sec-head"><h2><T>Брендҳо</T></h2><Link href="/brands"><T>Ҳама</T> <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
      <div className="brand-row">
        {brands.map((b) => (
          <Link key={b.slug} href={`/catalog?brand=${b.slug}`} className="brand-chip">
            <BrandLogo name={b.name} small />
            <span><b>{b.name}</b><small><T vars={{ n: b.count }}>{"{n} мол"}</T></small></span>
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

/* Саҳифаҳои «Категорияҳо» ва «Брендҳо» */
export function CategoriesBody() {
  const { products } = useCatalog();
  const cats = CATEGORIES.filter((c) => c.id !== "all");
  return (
    <>
      <Link href="/catalog" className="all-card">
        <span className="ac-ic"><Icon name="grid" size={26} /></span>
        <span><b><T>Ҳама маҳсулот</T></b><small><T vars={{ n: products.length }}>{"{n} маҳсулот аз ҳама кишвар"}</T></small></span>
        <Icon name="chevron" size={18} stroke={2.2} />
      </Link>
      <div className="cat-grid">
        {cats.map((c) => {
          const n = categoryCount(c.id, products);
          const body = (
            <>
              <span className="cg-ic" style={{ background: c.tint }}><Icon name={c.icon} size={30} stroke={1.6} /></span>
              <b><T>{c.name}</T></b>
              <small>{n > 0 ? <T vars={{ n }}>{"{n} маҳсулот"}</T> : <T>Ба наздикӣ</T>}</small>
            </>
          );
          return n > 0 ? (
            <Link key={c.id} href={`/catalog?category=${c.id}`} className="cat-card">{body}</Link>
          ) : (
            <div key={c.id} className="cat-card soon">{body}</div>
          );
        })}
      </div>
    </>
  );
}

export function BrandsBody() {
  const { products } = useCatalog();
  const brands = useMemo(() => getBrands(products), [products]);
  return (
    <div className="brand-grid">
      {brands.map((b) => (
        <Link key={b.slug} href={`/catalog?brand=${b.slug}`} className="brand-card">
          <BrandLogo name={b.name} />
          <b>{b.name}</b>
          <small><T vars={{ n: b.count }}>{"{n} маҳсулот"}</T></small>
          <span className="bc-flags">{b.countries.map((c) => <Flag key={c} code={c} className="bc-flag" />)}</span>
        </Link>
      ))}
    </div>
  );
}
