"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, COUNTRIES, products } from "@/lib/catalog";
import {
  EMPTY_FILTERS,
  SORTS,
  activeCount,
  brandName,
  categoryName,
  filterProducts,
  filtersToQuery,
  parseFilters,
  sortProducts,
  type Filters,
  type Sort,
} from "@/lib/filters";
import BottomNav from "./BottomNav";
import { CartBadge } from "./Cart";
import FilterSheet from "./FilterSheet";
import Icon from "./Icon";
import ProductCard from "./ProductCard";

const PAGE = 12;

export default function CatalogView() {
  const router = useRouter();
  const sp = useSearchParams();
  const filters = useMemo(() => parseFilters(sp), [sp]);
  const [q, setQ] = useState(filters.q);
  const [sheet, setSheet] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const key = sp.toString();

  const list = useMemo(() => sortProducts(filterProducts(products, filters), filters.sort), [filters]);
  const nActive = activeCount(filters);

  const go = (f: Filters) => router.replace(`/catalog${filtersToQuery(f)}`, { scroll: false });

  // Ҷустуҷӯ: пас аз 300 мс нигоҳ доштан, URL нав мешавад
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => { if (q !== filters.q) go({ ...filters, q }); }, 300);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setQ(filters.q), [filters.q]);
  useEffect(() => setShown(PAGE), [key]);

  const quickCats = CATEGORIES.filter((c) => c.id !== "all" && products.some((p) => p.category === c.id));
  const removeFrom = <K extends "category" | "brand" | "country" | "unit">(k: K, v: string) =>
    go({ ...filters, [k]: (filters[k] as string[]).filter((x) => x !== v) } as Filters);

  const chips: { label: string; onRemove: () => void }[] = [
    ...filters.category.map((v) => ({ label: categoryName(v), onRemove: () => removeFrom("category", v) })),
    ...filters.brand.map((v) => ({ label: brandName(v), onRemove: () => removeFrom("brand", v) })),
    ...filters.country.map((v) => ({ label: COUNTRIES[v].short, onRemove: () => removeFrom("country", v) })),
    ...filters.unit.map((v) => ({ label: `Бо ${v}`, onRemove: () => removeFrom("unit", v) })),
    ...(filters.min !== undefined || filters.max !== undefined
      ? [{ label: `${filters.min ?? 0}–${filters.max ?? "∞"} смн`, onRemove: () => go({ ...filters, min: undefined, max: undefined }) }]
      : []),
  ];

  const title =
    filters.category.length === 1 && !filters.brand.length ? categoryName(filters.category[0])
    : filters.brand.length === 1 && !filters.category.length ? brandName(filters.brand[0])
    : "Каталог";

  return (
    <>
      <header className="pg-top">
        <div className="pg-row">
          <button className="ic-round" onClick={() => (history.length > 1 ? router.back() : router.push("/"))} aria-label="Бозгашт">
            <Icon name="back" stroke={2.2} />
          </button>
          <form className="pg-search" role="search" onSubmit={(e) => { e.preventDefault(); go({ ...filters, q }); }}>
            <Icon name="search" size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ҷустуҷӯи маҳсулот ё бренд" aria-label="Ҷустуҷӯ" />
            {q && <button type="button" onClick={() => { setQ(""); go({ ...filters, q: "" }); }} aria-label="Тоза кардан"><Icon name="close" size={16} /></button>}
          </form>
          <button className="ic-round filter-btn" onClick={() => setSheet(true)} aria-label="Филтрҳо">
            <Icon name="filter" size={20} />
            {nActive > 0 && <span className="badge">{nActive}</span>}
          </button>
          <Link href="/cart" className="ic-round" aria-label="Сабад"><Icon name="cart" size={21} /><CartBadge /></Link>
        </div>
        <div className="quick-cats">
          <button className={!filters.category.length ? "on" : ""} onClick={() => go({ ...filters, category: [] })}>Ҳама</button>
          {quickCats.map((c) => (
            <button key={c.id} className={filters.category.includes(c.id) ? "on" : ""} onClick={() => go({ ...filters, category: filters.category.includes(c.id) ? [] : [c.id] })}>
              {c.name}
            </button>
          ))}
        </div>
      </header>

      <main className="cat-main">
        <div className="cat-title">
          <h1>{title}</h1>
          <span>{list.length} маҳсулот</span>
        </div>

        <div className="toolbar">
          <button className="tb-filter" onClick={() => setSheet(true)}>
            <Icon name="filter" size={16} /> Филтрҳо{nActive > 0 ? ` · ${nActive}` : ""}
          </button>
          <label className="tb-sort">
            <Icon name="sort" size={16} />
            {SORTS.find((x) => x.id === filters.sort)?.label}
            <select value={filters.sort} onChange={(e) => go({ ...filters, sort: e.target.value as Sort })} aria-label="Тартиб">
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>

        {chips.length > 0 && (
          <div className="active-chips">
            {chips.map((c) => (
              <button key={c.label} onClick={c.onRemove}>{c.label}<Icon name="close" size={13} stroke={2.4} /></button>
            ))}
            <button className="clear" onClick={() => go({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort })}>Ҳамаро тоза кардан</button>
          </div>
        )}

        {list.length > 0 ? (
          <>
            <div className="grid2">{list.slice(0, shown).map((p) => <ProductCard key={p.slug} p={p} />)}</div>
            {list.length > shown && (
              <button className="more-btn" onClick={() => setShown(shown + PAGE)}>
                Боз нишон додан <span>{list.length - shown}</span> <Icon name="down" size={16} />
              </button>
            )}
          </>
        ) : (
          <div className="empty">
            <Icon name="search" size={34} stroke={1.5} />
            <b>Ҳеҷ чиз ёфт нашуд</b>
            <span>Филтрҳоро тағйир диҳед ё ҷустуҷӯро тоза кунед</span>
            <button className="btn btn-orange btn-sm" style={{ marginTop: 10 }} onClick={() => go(EMPTY_FILTERS)}>Тоза кардани филтрҳо</button>
          </div>
        )}
      </main>

      <FilterSheet open={sheet} initial={filters} onClose={() => setSheet(false)} onApply={(f) => { go({ ...f, q: filters.q }); setSheet(false); }} />
      <BottomNav />
    </>
  );
}
