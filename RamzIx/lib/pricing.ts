import type { CountryCode, Product } from "./catalog";
import {
  FEE_TIERS,
  MIN_FEE,
  RFQ_FROM_DEFAULT,
  SHIPPING,
  TO_USD,
  USD_TO_TJS,
  type ShippingMode,
} from "./pricing-config";

/* ---------- нархи мол ---------- */

const minQtyOf = (p: Product) => p.sale?.min ?? 1;
const stepOf = (p: Product) => p.sale?.step ?? 1;
export const rfqFromOf = (p: Product) => p.sale?.rfqFrom ?? RFQ_FROM_DEFAULT;

const toTjs = (amount: number, p: Product) => amount * TO_USD[p.costCurrency] * USD_TO_TJS;

const costSteps = (p: Product) => p.costTiers ?? [{ min: minQtyOf(p), cost: p.cost }];

/** Нархи харид барои 1 воҳид (смн) барои миқдори qty */
export function unitCost(p: Product, qty: number): number {
  const steps = costSteps(p);
  let cost = steps[0].cost;
  for (const t of steps) if (qty >= t.min) cost = t.cost;
  return toTjs(cost, p);
}

export type PriceTier = {
  min: number;
  max: number;
  label: string;
  /** нархи 1 воҳид (смн); null — бо дархост */
  unit: number | null;
  /** арзонӣ нисбат ба зинаи аввал, фоиз */
  off: number;
};

const qtyText = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ""));

/** Зинаҳои нарх барои намоиш дар саҳифаи маҳсулот */
export function priceTiers(p: Product): PriceTier[] {
  const unit = p.sale?.unit ?? "дона";
  const step = stepOf(p);
  const steps = costSteps(p).filter((t) => t.min < rfqFromOf(p));
  const first = toTjs(steps[0].cost, p);
  const rfq = rfqFromOf(p);
  const tiers: PriceTier[] = steps.map((t, i) => {
    const max = +((i + 1 < steps.length ? steps[i + 1].min : rfq) - step).toFixed(2);
    const u = toTjs(t.cost, p);
    return {
      min: t.min,
      max,
      label: max > t.min ? `${qtyText(t.min)}–${qtyText(max)} ${unit}` : `${qtyText(t.min)} ${unit}`,
      unit: u,
      off: Math.round((1 - u / first) * 100),
    };
  });
  tiers.push({ min: rfq, max: Infinity, label: `${qtyText(rfq)}+ ${unit}`, unit: null, off: 0 });
  return tiers;
}

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

/* ---------- ҳаққи хизмат ---------- */

export const feePctFor = (goods: number) => {
  let pct = FEE_TIERS[0].pct;
  for (const t of FEE_TIERS) if (goods >= t.from) pct = t.pct;
  return pct;
};

/** Зинаи навбатии ҳаққи хизмат: чӣ қадар боқӣ мондааст */
export function nextFeeTier(goods: number) {
  const next = FEE_TIERS.find((t) => t.from > goods);
  return next ? { need: next.from - goods, pct: next.pct, from: next.from } : null;
}

export const feeFor = (goods: number) => (goods > 0 ? Math.max((goods * feePctFor(goods)) / 100, MIN_FEE) : 0);

/* ---------- ҳисоби фармоиш ---------- */

export type CartLine = { slug: string; qty: number };

export type PricedLine = {
  p: Product;
  qty: number;
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
  feePct: number;
  fee: number;
  minFeeApplied: boolean;
  shipping: number;
  total: number;
  next: ReturnType<typeof nextFeeTier>;
};

export function priceOrder(
  lines: CartLine[],
  modes: Partial<Record<CountryCode, string>>,
  lookup: (slug: string) => Product | undefined,
): PricedOrder {
  const byCountry = new Map<CountryCode, PricedLine[]>();
  for (const l of lines) {
    const p = lookup(l.slug);
    if (!p) continue;
    const unit = unitCost(p, l.qty);
    const row: PricedLine = { p, qty: l.qty, unit, goods: unit * l.qty };
    byCountry.set(p.country, [...(byCountry.get(p.country) ?? []), row]);
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

  const goods = Math.round(groups.reduce((s, g) => s + g.goods, 0));
  const feePct = feePctFor(goods);
  const rawFee = (goods * feePct) / 100;
  const fee = goods > 0 ? Math.round(Math.max(rawFee, MIN_FEE)) : 0;
  const shipping = Math.round(groups.reduce((s, g) => s + g.shipping.tjs, 0));

  return {
    groups,
    goods,
    feePct,
    fee,
    minFeeApplied: goods > 0 && rawFee < MIN_FEE,
    shipping,
    total: goods + fee + shipping,
    next: nextFeeTier(goods),
  };
}
