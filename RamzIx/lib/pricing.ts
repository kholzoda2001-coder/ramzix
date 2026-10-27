import type { CountryCode, Product } from "./catalog";
import {
  MARKUP_TIERS,
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

/** Фоидаи шумо барои маблағи умумии харид (смн, бо нархи харид) */
export const markupPct = (goodsCost: number) => {
  for (const t of MARKUP_TIERS) if (goodsCost <= t.upTo) return t.pct;
  return MARKUP_TIERS[MARKUP_TIERS.length - 1].pct;
};

/** Нархи асосии нишондодашаванда барои 1 воҳид: нархи харид + фоида барои фармоиши хурд */
export const listUnitPrice = (p: Product) => costPerUnit(p) * (1 + MARKUP_TIERS[0].pct / 100);

/* ---------- вазн, ҳаҷм, расонидан ---------- */

export const weightOf = (p: Product, qty: number) => p.weightKg * qty;
export const volumeOf = (p: Product, qty: number) => (p.volumeM3 ?? 0) * qty;

export const modesFor = (country: CountryCode): ShippingMode[] => SHIPPING[country];
export const defaultMode = (country: CountryCode) => SHIPPING[country][0].id;
export const getMode = (country: CountryCode, id?: string) =>
  SHIPPING[country].find((m) => m.id === id) ?? SHIPPING[country][0];

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

export type CartLine = { slug: string; qty: number };

export type PricedLine = {
  p: Product;
  qty: number;
  /** нархи 1 воҳид барои харидор (бо фоида), смн */
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
  goods: number;
  shipping: number;
  total: number;
  /** Агар боз харад, нарх арзонтар мешавад: тақрибан чӣ қадар ва чанд фоиз */
  next: { need: number; drop: number } | null;
};

export function priceOrder(
  lines: CartLine[],
  modes: Partial<Record<CountryCode, string>>,
  lookup: (slug: string) => Product | undefined,
): PricedOrder {
  const found = lines.flatMap((l) => {
    const p = lookup(l.slug);
    return p ? [{ p, qty: l.qty, cost: costPerUnit(p) }] : [];
  });

  // Фоида аз маблағи умумии нархи харид муайян мешавад
  const costTotal = found.reduce((s, l) => s + l.cost * l.qty, 0);
  const pct = markupPct(costTotal);

  const byCountry = new Map<CountryCode, PricedLine[]>();
  for (const l of found) {
    const unit = l.cost * (1 + pct / 100);
    const row: PricedLine = { p: l.p, qty: l.qty, unit, goods: Math.round(unit * l.qty) };
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
  const shipping = Math.round(groups.reduce((s, g) => s + g.shipping.tjs, 0));

  // Зинаи навбатӣ (фоидаи камтар)
  let next: PricedOrder["next"] = null;
  const idx = MARKUP_TIERS.findIndex((t) => costTotal <= t.upTo);
  const nextTier = idx >= 0 ? MARKUP_TIERS[idx + 1] : undefined;
  if (costTotal > 0 && nextTier && nextTier.pct < pct) {
    next = {
      need: Math.ceil(((MARKUP_TIERS[idx].upTo - costTotal) * (1 + pct / 100)) / 50) * 50,
      drop: Math.round((1 - (1 + nextTier.pct / 100) / (1 + pct / 100)) * 1000) / 10,
    };
  }

  return { groups, goods, shipping, total: goods + shipping, next };
}
