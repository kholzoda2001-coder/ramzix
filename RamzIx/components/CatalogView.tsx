"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, COUNTRIES } from "@/lib/catalog";
import { useCatalog } from "@/lib/useCatalog";
import {
  EMPTY_FILTERS,
  getBrands,
  getTypes,
  typeName,
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
import { useMoney } from "./Currency";
import FilterSheet from "./FilterSheet";
import { T, useT } from "./Lang";
import Icon from "./Icon";
import ProductCard from "./ProductCard";
import TradeRow, { TradeCartBar, TradeHead } from "./TradeRow";

const PAGE = 36;

export default function CatalogView() {
  const { label, conv } = useMoney();
  const { products } = useCatalog();
  const { t } = useT();
  const router = useRouter();
  const sp = useSearchParams();
  const filters = useMemo(() => parseFilters(sp), [sp]);
  const [q, setQ] = useState(filters.q);
  const [sheet, setSheet] = useState(false);
  const [shown, setShown] = useState(PAGE);
  // Намуд: пешфарз ҳамеша шабака (колеҷ); рӯйхат танҳо вақте ки харидор худаш интихоб кунад
  const [view, setView] = useState<"grid" | "list">("grid");
  const isList = view === "list";
  const key = sp.toString();

  const list = useMemo(() => sortProducts(filterProducts(products, filters), filters.sort), [filters, products]);
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

  // Навъ ва бренд аз ҳамон категорияи интихобшуда: ин рӯйхатҳо аз ҷустуҷӯ вобаста нестанд
  const scope = useMemo(() => (filters.category.length ? products.filter((p) => filters.category.includes(p.category)) : products), [products, filters.category]);
  const types = useMemo(() => getTypes(filters.brand.length ? filterProducts(scope, { ...EMPTY_FILTERS, brand: filters.brand }) : scope), [scope, filters.brand]);
  const brandList = getBrands(scope);

  const quickCats = CATEGORIES.filter((c) => c.id !== "all" && products.some((p) => p.category === c.id));
  const removeFrom = <K extends "category" | "brand" | "country" | "unit">(k: K, v: string) =>
    go({ ...filters, [k]: (filters[k] as string[]).filter((x) => x !== v) } as Filters);

  const chips: { label: string; onRemove: () => void }[] = [
    ...filters.category.map((v) => ({ label: t(categoryName(v)), onRemove: () => removeFrom("category", v) })),
    ...filters.brand.map((v) => ({ label: brandName(v, products), onRemove: () => removeFrom("brand", v) })),
    ...filters.country.map((v) => ({ label: t(COUNTRIES[v].short), onRemove: () => removeFrom("country", v) })),
    ...filters.unit.map((v) => ({ label: t(v === "кг" ? "Бо кило" : `Бо ${v}`), onRemove: () => removeFrom("unit", v) })),
    ...(filters.min !== undefined || filters.max !== undefined
      ? [{ label: `${filters.min !== undefined ? Math.round(conv(filters.min)) : 0}–${filters.max !== undefined ? Math.round(conv(filters.max)) : "∞"} ${label}`, onRemove: () => go({ ...filters, min: undefined, max: undefined }) }]
      : []),
  ];

  const title =
    filters.category.length === 1 && !filters.brand.length ? t(categoryName(filters.category[0]))
    : filters.brand.length === 1 && !filters.category.length ? brandName(filters.brand[0], products)
    : t("Каталог");

  return (
    <>
      <header className="pg-top">
        <div className="pg-row">
          <button className="ic-round" onClick={() => (history.length > 1 ? router.back() : router.push("/"))} aria-label={t("Бозгашт")}>
            <Icon name="back" stroke={2.2} />
          </button>
          <form className="pg-search" role="search" onSubmit={(e) => { e.preventDefault(); go({ ...filters, q }); }}>
            <Icon name="search" size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Ҷустуҷӯи маҳсулот ё бренд")} aria-label={t("Ҷустуҷӯ")} />
            {q && <button type="button" onClick={() => { setQ(""); go({ ...filters, q: "" }); }} aria-label={t("Тоза кардан")}><Icon name="close" size={16} /></button>}
          </form>
          <Link href="/cart" className="ic-round" aria-label={t("Сабад")}><Icon name="cart" size={21} /><CartBadge /></Link>
        </div>
        <div className="qc-row">
          <div className="quick-cats">
            <button className={!filters.category.length ? "on" : ""} onClick={() => go({ ...filters, category: [] })}><T>Ҳама</T></button>
            {quickCats.map((c) => (
              <button key={c.id} className={filters.category.includes(c.id) ? "on" : ""} onClick={() => go({ ...filters, category: filters.category.includes(c.id) ? [] : [c.id] })}>
                {t(c.name)}
              </button>
            ))}
          </div>
          <div className="view-sw" role="group" aria-label={t("Намуд")}>
            <button aria-pressed={!isList} aria-label={t("Шабака")} className={!isList ? "on" : ""} onClick={() => setView("grid")}><Icon name="grid" size={18} /></button>
            <button aria-pressed={isList} aria-label={t("Рӯйхат")} className={isList ? "on" : ""} onClick={() => setView("list")}><Icon name="list" size={18} /></button>
          </div>
        </div>
      </header>

      <main className="cat-main">
        <h1 className="sr-only">{title}</h1>
        <div className="toolbar">
          <button className="tb-filter" onClick={() => setSheet(true)}>
            <Icon name="filter" size={16} /> <span className="tb-ft">{t("Филтрҳо")}</span>{nActive > 0 ? ` ${nActive}` : ""}
          </button>
          <label className="tb-sort">
            {filters.brand.length === 1 ? brandName(filters.brand[0], products) : t("Бренд")}
            <Icon name="down" size={14} />
            <select value={filters.brand[0] ?? ""} onChange={(e) => go({ ...filters, brand: e.target.value ? [e.target.value] : [] })} aria-label={t("Бренд")}>
              <option value="">{t("Ҳамаи брендҳо")}</option>
              {brandList.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
          </label>
          <label className="tb-sort">
            <Icon name="sort" size={16} />
            {t(SORTS.find((x) => x.id === filters.sort)?.label ?? "")}
            <select value={filters.sort} onChange={(e) => go({ ...filters, sort: e.target.value as Sort })} aria-label={t("Тартиб")}>
              {SORTS.map((s) => <option key={s.id} value={s.id}>{t(s.label)}</option>)}
            </select>
          </label>
          <span className="tb-count">{t("{n} маҳсулот", { n: list.length })}</span>
        </div>

        <div className="th-filter cv-types">
          {types.map((x) => (
            <button key={x.key} className={filters.q === x.key ? "on" : ""} onClick={() => go({ ...filters, q: filters.q === x.key ? "" : x.key })}>
              {typeName(x.list[0], t(x.list[0].name))} <small>{x.list.length}</small>
            </button>
          ))}
        </div>

        {chips.length > 0 && (
          <div className="active-chips">
            {chips.map((c) => (
              <button key={c.label} onClick={c.onRemove}>{c.label}<Icon name="close" size={13} stroke={2.4} /></button>
            ))}
            <button className="clear" onClick={() => go({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort })}><T>Ҳамаро тоза кардан</T></button>
          </div>
        )}

        {list.length > 0 ? (
          <>
            {isList
              ? <div className="tr-list"><TradeHead />{list.slice(0, shown).map((p, k) => <TradeRow key={p.slug} p={p} eager={k < 12} />)}</div>
              : <div className="grid2">{list.slice(0, shown).map((p) => <ProductCard key={p.slug} p={p} />)}</div>}
            {list.length > shown && (
              <button className="more-btn" onClick={() => setShown(shown + PAGE)}>
                <T>Боз нишон додан</T> <span>{list.length - shown}</span> <Icon name="down" size={16} />
              </button>
            )}
          </>
        ) : (
          <div className="empty">
            <Icon name="search" size={34} stroke={1.5} />
            <b><T>Ҳеҷ чиз ёфт нашуд</T></b>
            <span><T>Филтрҳоро тағйир диҳед ё ҷустуҷӯро тоза кунед</T></span>
            <button className="btn btn-orange btn-sm" style={{ marginTop: 10 }} onClick={() => go(EMPTY_FILTERS)}><T>Тоза кардани филтрҳо</T></button>
            <Link href="/request" style={{ marginTop: 12, fontWeight: 700, textDecoration: "underline" }}><T>Мол наёфтед? Дархост диҳед</T></Link>
          </div>
        )}
        <TradeCartBar />
      </main>

      <FilterSheet open={sheet} initial={filters} onClose={() => setSheet(false)} onApply={(f) => { go({ ...f, q: filters.q }); setSheet(false); }} />
      <BottomNav />
    </>
  );
}
