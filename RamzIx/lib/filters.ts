import { CATEGORIES, COUNTRIES, unitOf, type CountryCode, type Product } from "./catalog";
import { listUnitPrice } from "./pricing";

/* ---------- бренд ---------- */

export const brandSlug = (b: string) => b.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");

export type Brand = { slug: string; name: string; count: number; countries: CountryCode[] };

export function getBrands(list: Product[] = []): Brand[] {
  const map = new Map<string, Brand>();
  for (const p of list) {
    if (!p.brand) continue;
    const slug = brandSlug(p.brand);
    const b = map.get(slug) ?? { slug, name: p.brand, count: 0, countries: [] };
    b.count++;
    if (!b.countries.includes(p.country)) b.countries.push(p.country);
    map.set(slug, b);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const categoryCount = (id: string, list: Product[] = []) => list.filter((p) => p.category === id).length;

/* Маҳсулоте, ки категорияро беҳтар нишон медиҳад (аз рӯи ном) — барои акси муқова */
const COVER_HINT: Record<string, RegExp> = {
  audio: /earbud|headphone|earphone/i,
  phones: /charger|power bank|smart ?watch/i,
  men: /jacket|sweater|hoodie|t-shirt/i,
  home: /lamp|towel|faucet/i,
  beauty: /hair dryer|comb|makeup|massag/i,
  office: /desk|mouse|laptop/i,
};

/** Акси муқова барои категория: маҳсулоти мувофиқ ба ном, баъд машҳуртарин (бо баҳо/шарҳ) */
export function categoryCover(id: string, list: Product[] = []): string | null {
  const hint = COVER_HINT[id];
  const score = (p: Product) => (hint?.test(p.name) ? 1e6 : 0) + (p.source !== "cjdropshipping" ? 1e4 : 0) + (p.reviews ?? 0) * 10 + (p.rating ?? 0);
  const best = list
    .filter((p) => p.category === id && p.images[0] && !p.images[0].endsWith("placeholder.svg"))
    .sort((a, b) => score(b) - score(a))[0];
  return best?.images[0] ?? null;
}

/* ---------- филтрҳо ---------- */

export type Sort = "default" | "price-asc" | "price-desc" | "popular" | "rating";

export const SORTS: { id: Sort; label: string }[] = [
  { id: "default", label: "Пешфарз" },
  { id: "price-asc", label: "Аввал арзонтар" },
  { id: "price-desc", label: "Аввал гаронтар" },
  { id: "popular", label: "Серталаб" },
  { id: "rating", label: "Баҳои баланд" },
];

export const UNITS = ["дона", "картон", "кг"];

export type Filters = {
  q: string;
  category: string[];
  brand: string[];
  country: CountryCode[];
  unit: string[];
  min?: number;
  max?: number;
  sort: Sort;
};

export const EMPTY_FILTERS: Filters = { q: "", category: [], brand: [], country: [], unit: [], sort: "default" };

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);
const num = (v: string | null) => {
  const n = v ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
};

export function parseFilters(sp: { get(k: string): string | null }): Filters {
  const sort = sp.get("sort") as Sort | null;
  return {
    q: sp.get("q") ?? "",
    category: list(sp.get("category")),
    brand: list(sp.get("brand")),
    country: list(sp.get("country")).filter((c): c is CountryCode => c in COUNTRIES),
    unit: list(sp.get("unit")),
    min: num(sp.get("min")),
    max: num(sp.get("max")),
    sort: SORTS.some((s) => s.id === sort) ? (sort as Sort) : "default",
  };
}

export function filtersToQuery(f: Filters): string {
  const sp = new URLSearchParams();
  if (f.q.trim()) sp.set("q", f.q.trim());
  if (f.category.length) sp.set("category", f.category.join(","));
  if (f.brand.length) sp.set("brand", f.brand.join(","));
  if (f.country.length) sp.set("country", f.country.join(","));
  if (f.unit.length) sp.set("unit", f.unit.join(","));
  if (f.min !== undefined) sp.set("min", String(f.min));
  if (f.max !== undefined) sp.set("max", String(f.max));
  if (f.sort !== "default") sp.set("sort", f.sort);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const activeCount = (f: Filters) =>
  f.category.length + f.brand.length + f.country.length + f.unit.length + (f.min !== undefined || f.max !== undefined ? 1 : 0);

/** Нархи 1 воҳид барои миқдори ҳадди ақал (смн) */
export const basePrice = (p: Product) => listUnitPrice(p);

const norm = (s: string) => s.toLowerCase();

/* Калимаҳои ҷустуҷӯ, ки як гурӯҳи молро дарбар мегиранд (барои нишонҳои саҳифаи асосӣ) */
const SYNONYMS: Record<string, string[]> = {
  "нӯшокӣ": ["нӯшокӣ", "нӯшокии", "monster", "оби минералӣ", "чойи"],
  "ошхона": ["ошхона", "миксер"],
};

export function filterProducts(items: Product[], f: Filters): Product[] {
  const q = norm(f.q.trim());
  const terms = SYNONYMS[q] ?? [q];
  return items.filter((p) => {
    if (f.category.length && !f.category.includes(p.category)) return false;
    if (f.brand.length && !(p.brand && f.brand.includes(brandSlug(p.brand)))) return false;
    if (f.country.length && !f.country.includes(p.country)) return false;
    if (f.unit.length && !f.unit.includes(unitOf(p))) return false;
    if (q) {
      // Барои гурӯҳҳо танҳо ном: зеретитри «Хона ва ошхона» дар ҳамаи молҳои хона ҳаст
      const hay = norm(SYNONYMS[q] ? `${p.name} ${p.nameOriginal ?? ""}` : `${p.name} ${p.nameOriginal ?? ""} ${p.subtitle ?? ""} ${p.brand ?? ""} ${p.slug}`);
      if (!terms.some((t) => hay.includes(t))) return false;
    }
    if (f.min !== undefined || f.max !== undefined) {
      const price = basePrice(p);
      if (f.min !== undefined && price < f.min) return false;
      if (f.max !== undefined && price > f.max) return false;
    }
    return true;
  });
}

export function sortProducts(items: Product[], sort: Sort): Product[] {
  const out = [...items];
  switch (sort) {
    case "price-asc": return out.sort((a, b) => basePrice(a) - basePrice(b));
    case "price-desc": return out.sort((a, b) => basePrice(b) - basePrice(a));
    case "popular": return out.sort((a, b) => b.reviews - a.reviews);
    case "rating": return out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.reviews - a.reviews);
    default: return out;
  }
}

export const categoryName = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? id;
export const brandName = (slug: string, list: Product[] = []) => getBrands(list).find((b) => b.slug === slug)?.name ?? slug;
