import { COUNTRIES, type CountryCode, type Product } from "./catalog";
import { RATES, SHIPPING, TO_USD, onPricingApplied, type Currency } from "./pricing-config";

/* Маълумоти админ — ҳоло дар худи дастгоҳ (localStorage). Баъди пайвастани сервер ҳамин қабат ба Supabase иваз мешавад. */

export type OrderStatus = "new" | "confirmed" | "bought" | "shipped" | "delivered" | "cancelled";
export type OrderType = "pos" | "request";
/** weightKg / volumeM3 — барои 1 воҳид */
export type Item = { id: string; name: string; qty: number; unit: string; costTotal: number; markupPct: number; weightKg?: number; volumeM3?: number; /** Дархости харидор: пайванд ва аксҳо */ link?: string; images?: string[] };
export type Payment = { id: string; date: string; amount: number; method: string; note?: string };
export type Order = {
  id: string;
  code: string;
  type: OrderType;
  date: string;
  customer: { name: string; phone: string; address: string };
  items: Item[];
  shippingCharged: number;
  shippingCost: number;
  /** Роҳи расонидан, масалан "ae:cargo" (барои ҳисоби тариф) */
  routeKey?: string;
  status: OrderStatus;
  payments: Payment[];
  note: string;
};
export type ProductExtra = { /** Артикул: RX-0001 */ sku?: string; /** Истиноди видео */ video?: string; /** Тарҷумаи ном ва тавсиф (ru, en) */ i18n?: Product["i18n"]; /** true — нархи оптовӣ надорад */ noWholesale?: boolean; nameOriginal?: string; source?: string; rating?: number | null; reviews?: number; colors?: Product["colors"]; sale?: Partial<NonNullable<Product["sale"]>> };

/** Маҳсулоти админ: ҳамон сохтори сайт + идора (фаъол/пинҳон) */
export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  brand: string;
  category: string;
  country: CountryCode;
  /** нархи харид барои 1 воҳид бо асъори costCurrency */
  cost: number;
  costCurrency: Currency;
  weightKg: number;
  volumeM3: number;
  images: string[];
  description: string;
  sizes: string[];
  /** воҳиди фурӯш: дона | картон | кг */
  unit: string;
  per: number;
  perLabel: string;
  min: number;
  step: number;
  /** фоидаи пешфарз барои POS */
  markupPct: number;
  active: boolean;
  note: string;
  /** Майдонҳои иловагии сайт (рейтинг, рангҳо, тавсифи воҳиди фурӯш) — аз каталоги кӯҳна */
  extra?: ProductExtra;
};

export const adminCostTjs = (p: { cost: number; costCurrency: Currency }) => round(p.cost * TO_USD[p.costCurrency] * RATES.usdToTjs);

const TR: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", ғ: "gh", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", ӣ: "i", й: "y", к: "k", қ: "q", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ӯ: "u", ф: "f", х: "kh", ҳ: "h", ц: "ts", ч: "ch", ҷ: "j", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
const slugify = (s: string) => s.toLowerCase().replace(/[а-яёғӣқӯҳҷ]/g, (c) => TR[c] ?? c).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
export const makeSlug = (name: string, taken: string[]) => {
  const base = slugify(name) || "tovar";
  let s = base, i = 2;
  while (taken.includes(s)) s = `${base}-${i++}`;
  return s;
};

/** Маҳсулоти админ → маҳсулоти сайт (дар каталог нишон дода мешавад) */
export function toStorefront(p: AdminProduct): Product {
  const sale =
    p.unit === "картон"
      ? { unit: "картон", per: p.per > 0 ? p.per : undefined, perLabel: p.per > 0 ? p.perLabel || "дона" : undefined, step: 1, min: Math.max(1, p.min), quick: [1, 5, 10, 20, 50], rfqFrom: 200 }
      : p.unit === "кг"
        ? { unit: "кг", step: p.step > 0 ? p.step : 1, min: p.min > 0 ? p.min : 1, quick: [1, 5, 10, 25, 50].map((x) => Math.max(x, p.min || 1)), rfqFrom: 1000, decimals: p.step > 0 && p.step < 1 }
        : undefined;
  return {
    slug: p.slug, name: p.name, subtitle: p.subtitle || null, brand: p.brand || null, category: p.category, country: p.country, source: "admin",
    cost: p.cost, costCurrency: p.costCurrency, weightKg: p.weightKg, volumeM3: p.volumeM3 || undefined,
    images: p.images.length ? p.images : ["/products/placeholder.svg"], rating: null, reviews: 0, sizes: p.sizes.length ? p.sizes : null,
    description: p.description || null,
    sale: p.extra?.sale ? ({ ...p.extra.sale, ...sale } as Product["sale"]) : sale,
    ...(p.extra?.noWholesale ? { noWholesale: true } : {}),
    ...(p.extra?.sku ? { sku: p.extra.sku } : {}),
    ...(p.extra?.video ? { video: p.extra.video } : {}),
    ...(p.extra?.i18n ? { i18n: p.extra.i18n } : {}),
    ...(p.extra?.source ? { source: p.extra.source } : {}),
    ...(p.extra?.rating !== undefined ? { rating: p.extra.rating } : {}),
    ...(p.extra?.reviews ? { reviews: p.extra.reviews } : {}),
    ...(p.extra?.colors ? { colors: p.extra.colors } : {}),
    ...(p.extra?.nameOriginal ? { nameOriginal: p.extra.nameOriginal } : {}),
  };
}
export type Store = { orders: Order[]; products: AdminProduct[]; seq: number };

export const STATUSES: { id: OrderStatus; label: string; color: string }[] = [
  { id: "new", label: "Нав", color: "#2563eb" },
  { id: "confirmed", label: "Тасдиқ шуд", color: "#7c3aed" },
  { id: "bought", label: "Харида шуд", color: "#d97706" },
  { id: "shipped", label: "Равон шуд", color: "#0891b2" },
  { id: "delivered", label: "Расонида шуд", color: "#15803d" },
  { id: "cancelled", label: "Бекор шуд", color: "#94a3b8" },
];
export const statusOf = (id: OrderStatus) => STATUSES.find((s) => s.id === id) ?? STATUSES[0];
export const PAY_METHODS = ["Нақд", "Алиф", "DC Pay", "Эсхата", "Интиқоли бонкӣ", "Дигар"];

/* ---------- ҳисобҳо ---------- */

export const round = (n: number) => Math.round(n * 100) / 100;
export const itemSell = (i: Item) => round(i.costTotal * (1 + i.markupPct / 100));
export const itemProfit = (i: Item) => round(itemSell(i) - i.costTotal);

export function totals(o: Order) {
  const goodsCost = o.items.reduce((a, i) => a + i.costTotal, 0);
  const goodsSell = o.items.reduce((a, i) => a + itemSell(i), 0);
  const cost = round(goodsCost + o.shippingCost);
  const total = round(goodsSell + o.shippingCharged);
  const profit = round(total - cost);
  const paid = round(o.payments.reduce((a, p) => a + p.amount, 0));
  const due = round(total - paid);
  const paidPct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const payStatus: "paid" | "partial" | "unpaid" = total > 0 && paid >= total - 0.005 ? "paid" : paid > 0 ? "partial" : "unpaid";
  const margin = cost > 0 ? round((profit / cost) * 100) : 0;
  return { goodsCost, goodsSell: round(goodsSell), cost, total, profit, paid, due, paidPct, payStatus, margin };
}
export const PAY_LABEL = { paid: "Пардохт шуд", partial: "Қисман пардохт", unpaid: "Пардохт нашуд" } as const;

/* ---------- расонидан: тариф аз рӯи вазн ва ҳаҷм ---------- */

type Route = { key: string; country: keyof typeof SHIPPING; mode: (typeof SHIPPING)[keyof typeof SHIPPING][number]; label: string };
/** Рӯйхати масирҳо дар ҷояш нав мешавад, вақте тарифҳо аз admin иваз шаванд */
export const ROUTES: Route[] = [];
const refreshRoutes = () => {
  ROUTES.splice(0, ROUTES.length, ...(Object.keys(SHIPPING) as (keyof typeof SHIPPING)[]).flatMap((c) =>
    SHIPPING[c].map((m) => ({
      key: `${c}:${m.id}`,
      country: c,
      mode: m,
      label: `${COUNTRIES[c].short} · ${m.label}${m.perKgUsd > 0 ? ` — ${m.perKgUsd}/кг${m.perM3Usd ? `, ${m.perM3Usd}/м³` : ""}` : ""}`,
    })),
  ));
};
refreshRoutes();
onPricingApplied(refreshRoutes);
export const routeOf = (key?: string) => ROUTES.find((r) => r.key === key);

/** Нархи расонидан бо сомонӣ: аз вазн × нархи 1 кг ва ҳаҷм × нархи 1 м³ кадомаш зиёд бошад */
export function routeCost(key: string | undefined, kg: number, m3: number) {
  const r = routeOf(key);
  if (!r) return { tjs: 0, byKgTjs: 0, byVolTjs: 0, basis: "none" as const };
  const m = r.mode;
  const byKg = (m.flatUsd ? m.flatUsd + Math.max(0, kg - (m.flatKg ?? 0)) * m.perKgUsd : kg * m.perKgUsd) * RATES.usdToTjs;
  const byVol = r.mode.perM3Usd ? m3 * r.mode.perM3Usd * RATES.usdToTjs : 0;
  return { tjs: round(Math.max(byKg, byVol)), byKgTjs: round(byKg), byVolTjs: round(byVol), basis: byVol > byKg ? ("m3" as const) : byKg > 0 ? ("kg" as const) : ("none" as const) };
}
export const orderWeight = (o: Pick<Order, "items">) => round(o.items.reduce((a, i) => a + (i.weightKg ?? 0) * i.qty, 0));
export const orderVolume = (o: Pick<Order, "items">) => Math.round(o.items.reduce((a, i) => a + (i.volumeM3 ?? 0) * i.qty, 0) * 10000) / 10000;

export const empty = (): Store => ({ orders: [], products: [], seq: 0 });
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const newId = uid;

export const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
export const str = (v: unknown, n = 300) => (typeof v === "string" ? v.slice(0, n) : "");

export function clean(raw: unknown): Store {
  const d = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const orders = (Array.isArray(d.orders) ? d.orders : []).flatMap((o: Record<string, unknown>): Order[] => {
    if (!o || typeof o.id !== "string" || !Array.isArray(o.items)) return [];
    const c = (o.customer ?? {}) as Record<string, unknown>;
    return [{
      id: o.id, code: str(o.code, 20), type: o.type === "request" ? "request" : "pos", date: str(o.date, 40),
      customer: { name: str(c.name, 120), phone: str(c.phone, 40), address: str(c.address, 300) },
      items: (o.items as Record<string, unknown>[]).map((i) => ({ id: str(i.id, 20) || uid(), name: str(i.name, 150), qty: Math.max(0, num(i.qty)), unit: str(i.unit, 20) || "дона", costTotal: Math.max(0, num(i.costTotal)), markupPct: num(i.markupPct), weightKg: num(i.weightKg) || undefined, volumeM3: num(i.volumeM3) || undefined, link: /^https?:\/\//.test(str(i.link, 400)) ? str(i.link, 400) : undefined, images: Array.isArray(i.images) ? (i.images as unknown[]).filter((u): u is string => typeof u === "string" && /^https:\/\/\S{5,300}$/.test(u)).slice(0, 4) : undefined })),
      shippingCharged: Math.max(0, num(o.shippingCharged)), shippingCost: Math.max(0, num(o.shippingCost)),
      routeKey: str(o.routeKey, 30) || undefined,
      status: STATUSES.some((s) => s.id === o.status) ? (o.status as OrderStatus) : "new",
      payments: (Array.isArray(o.payments) ? o.payments : []).map((p: Record<string, unknown>) => ({ id: str(p.id, 20) || uid(), date: str(p.date, 40), amount: num(p.amount), method: str(p.method, 40), note: str(p.note, 200) })),
      note: str(o.note, 500),
    }];
  });
  const products = (Array.isArray(d.products) ? d.products : []).flatMap((p: Record<string, unknown>): AdminProduct[] => {
    if (!p || typeof p.id !== "string") return [];
    const country = (["ae", "cn", "tr", "tj"] as const).find((c) => c === p.country) ?? "ae";
    const cur = (["USD", "AED", "SAR", "CNY", "TJS"] as const).find((c) => c === p.costCurrency) ?? "TJS";
    // Маълумоти кӯҳна: unitCost (смн) → cost
    const cost = p.cost !== undefined ? Math.max(0, num(p.cost)) : Math.max(0, num(p.unitCost));
    return [{
      id: p.id, slug: str(p.slug, 80) || makeSlug(str(p.name, 150), []), name: str(p.name, 150), subtitle: str(p.subtitle, 200), brand: str(p.brand, 80),
      category: str(p.category, 30) || "home", country, cost, costCurrency: cur,
      weightKg: Math.max(0, num(p.weightKg)), volumeM3: Math.max(0, num(p.volumeM3)),
      images: (Array.isArray(p.images) ? p.images : []).filter((x): x is string => typeof x === "string").slice(0, 8),
      description: str(p.description, 3000), sizes: (Array.isArray(p.sizes) ? p.sizes : []).filter((x): x is string => typeof x === "string").slice(0, 20),
      unit: str(p.unit, 20) || "дона", per: Math.max(0, num(p.per)), perLabel: str(p.perLabel, 20), min: Math.max(0, num(p.min)), step: Math.max(0, num(p.step)),
      markupPct: num(p.markupPct), active: p.active !== false, note: str(p.note, 300),
      extra: p.extra && typeof p.extra === "object" && JSON.stringify(p.extra).length < 20000 ? (p.extra as ProductExtra) : undefined,
    }];
  });
  return { orders, products, seq: Math.max(num(d.seq), orders.length) };
}

