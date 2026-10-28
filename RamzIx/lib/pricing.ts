import type { CountryCode, Product } from "./catalog";
import {
  MARKUP_TIERS,
  SHOWN_WHOLESALE_PCTS,
  RFQ_FROM_DEFAULT,
  SHIPPING,
  TO_USD,
  USD_TO_TJS,
  type ShippingMode,
} from "./pricing-config";

/* ---------- нархи мол ---------- */

export const rfqFromOf = (p: Product) => p.sale?.rfqFrom ?? RFQ_FROM_DEFAULT;

/** Нархи харид барои 1 воҳид (смн) */
export const costPerUnit = (p: Product) => p.cost * TO_USD[p.costCurrency] * USD_TO_TJS;

const BASE_PCT = MARKUP_TIERS[0].pct;

/** Нархи асосии нишондодашаванда барои 1 воҳид: нархи харид + фоида барои фармоиши хурд */
export const listUnitPrice = (p: Product) => costPerUnit(p) * (1 + BASE_PCT / 100);

/** Фоида барои маблағи фармоиш (бо нархи асосӣ) */
export const markupPct = (listAmount: number) => {
  let pct = MARKUP_TIERS[0].pct;
  for (const t of MARKUP_TIERS) if (listAmount >= t.from) pct = t.pct;
  return pct;
};

/** Арзонӣ нисбат ба нархи асосӣ, фоиз (масалан 8% фоида → 4.4%) */
export const discountFor = (pct: number) => Math.round((1 - (1 + pct / 100) / (1 + BASE_PCT / 100)) * 1000) / 10;

/** Нархҳои оптовии дар саҳифаи маҳсулот нишондодашаванда */
export function wholesalePrices(p: Product) {
  return SHOWN_WHOLESALE_PCTS.flatMap((pct) => {
    const tier = MARKUP_TIERS.find((t) => t.pct === pct);
    if (!tier) return [];
    return [{ pct, from: tier.from, unit: costPerUnit(p) * (1 + pct / 100), off: discountFor(pct) }];
  });
}

/** Зинаҳои тахфиф барои сабад: аз чӣ қадар маблағ чанд фоиз арзонтар */
export const discountLadder = () => MARKUP_TIERS.map((t) => ({ from: t.from, off: discountFor(t.pct) }));

/* ---------- вазн, ҳаҷм, расонидан ---------- */

export const weightOf = (p: Product, qty: number) => p.weightKg * qty;
export const volumeOf = (p: Product, qty: number) => (p.volumeM3 ?? 0) * qty;

/* Мувақатан: интихоби намуди расонидан (ҳаво/замин) хомӯш аст — танҳо намуди аввал (замин/карго) кор мекунад */
export const modesFor = (country: CountryCode): ShippingMode[] => SHIPPING[country].slice(0, 1);
export const defaultMode = (country: CountryCode) => modesFor(country)[0].id;
export const getMode = (country: CountryCode, id?: string) =>
  modesFor(country).find((m) => m.id === id) ?? modesFor(country)[0];

export type Shipping = { tjs: number; basis: "kg" | "m3" | "none"; mode: ShippingMode };

export function shippingCost(country: CountryCode, modeId: string | undefined, kg: number, m3: number): Shipping {
  const mode = getMode(country, modeId);
  const byKg = kg * mode.perKgUsd;
  const byVol = mode.perM3Usd ? m3 * mode.perM3Usd : 0;
  const usd = Math.max(byKg, byVol);
  return {
    tjs: usd * USD_TO_TJS,
    basis: usd === 0 ? "none" : byVol > byKg ? "m3" : "kg",
    mode,
  };
}

/* ---------- ҳисоби фармоиш ---------- */

export type CartLine = { slug: string; qty: number; size?: string; color?: string };

export type PricedLine = {
  key: string;
  size?: string;
  color?: string;
  p: Product;
  qty: number;
  /** нархи 1 воҳид бо нархи асосӣ ва бо тахфифи ҷорӣ, смн */
  listUnit: number;
  unit: number;
  goods: number;
};

export type PricedGroup = {
  country: CountryCode;
  lines: PricedLine[];
  goods: number;
  kg: number;
  m3: number;
  shipping: Shipping;
};

export type PricedOrder = {
  groups: PricedGroup[];
  /** маблағи мол бо нархи асосӣ */
  listGoods: number;
  /** тахфиф, смн ва фоиз */
  discount: number;
  discountPct: number;
  /** маблағи мол бо тахфиф */
  goods: number;
  shipping: number;
  total: number;
  /** маблағи фармоиш бо нархи асосӣ, барои ҳисоби зинаҳо */
  listAmount: number;
  /** зинаи навбатӣ: чӣ қадар боқӣ мондааст ва тахфифи он */
  next: { need: number; off: number; from: number } | null;
};

export function priceOrder(
  lines: CartLine[],
  modes: Partial<Record<CountryCode, string>>,
  lookup: (slug: string) => Product | undefined,
): PricedOrder {
  const found = lines.flatMap((l) => {
    const p = lookup(l.slug);
    return p ? [{ p, qty: l.qty, size: l.size, color: l.color, cost: costPerUnit(p) }] : [];
  });

  // Тахфиф аз маблағи фармоиш бо нархи асосӣ муайян мешавад
  const listAmount = found.reduce((s, l) => s + l.cost * (1 + BASE_PCT / 100) * l.qty, 0);
  const pct = markupPct(listAmount);

  const byCountry = new Map<CountryCode, PricedLine[]>();
  for (const l of found) {
    const listUnit = l.cost * (1 + BASE_PCT / 100);
    const unit = l.cost * (1 + pct / 100);
    const row: PricedLine = {
      key: `${l.p.slug}|${l.size ?? ""}|${l.color ?? ""}`,
      size: l.size,
      color: l.color,
      p: l.p,
      qty: l.qty,
      listUnit,
      unit,
      goods: Math.round(unit * l.qty),
    };
    byCountry.set(l.p.country, [...(byCountry.get(l.p.country) ?? []), row]);
  }

  const groups: PricedGroup[] = [...byCountry.entries()].map(([country, rows]) => {
    const kg = rows.reduce((s, r) => s + weightOf(r.p, r.qty), 0);
    const m3 = rows.reduce((s, r) => s + volumeOf(r.p, r.qty), 0);
    return {
      country,
      lines: rows,
      goods: rows.reduce((s, r) => s + r.goods, 0),
      kg,
      m3,
      shipping: shippingCost(country, modes[country], kg, m3),
    };
  });

  const goods = groups.reduce((s, g) => s + g.goods, 0);
  const listGoods = groups.reduce((s, g) => s + g.lines.reduce((a, r) => a + Math.round(r.listUnit * r.qty), 0), 0);
  const shipping = Math.round(groups.reduce((s, g) => s + g.shipping.tjs, 0));

  const nextTier = MARKUP_TIERS.find((t) => t.from > listAmount);
  const next =
    listAmount > 0 && nextTier
      ? {
          need: Math.ceil((nextTier.from - listAmount) / 10) * 10,
          off: discountFor(nextTier.pct),
          from: nextTier.from,
        }
      : null;

  return {
    groups,
    listGoods,
    discount: Math.max(0, listGoods - goods),
    discountPct: discountFor(pct),
    goods,
    shipping,
    total: goods + shipping,
    listAmount,
    next,
  };
}
