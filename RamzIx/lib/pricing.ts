import type { CountryCode, Product } from "./catalog";
import {
  MARKUP_TIERS,
  SHOWN_WHOLESALE_PCTS,
  SETTINGS,
  SHIPPING,
  TO_USD,
  RATES,
  type ShippingMode,
} from "./pricing-config";

/* ---------- нархи мол ---------- */

export const rfqFromOf = (p: Product) => p.sale?.rfqFrom ?? SETTINGS.rfqFrom;

/** Нархи харид барои 1 воҳид (смн) */
export const costPerUnit = (p: Product) => p.cost * TO_USD[p.costCurrency] * RATES.usdToTjs;

const basePct = () => MARKUP_TIERS[0].pct;

/** Нархи асосии нишондодашаванда барои 1 воҳид: нархи харид + фоида барои фармоиши хурд */
export const listUnitPrice = (p: Product) => costPerUnit(p) * (1 + basePct() / 100);

/** Фоида барои маблағи фармоиш (бо нархи асосӣ) */
export const markupPct = (listAmount: number) => {
  let pct = MARKUP_TIERS[0].pct;
  for (const t of MARKUP_TIERS) if (listAmount >= t.from) pct = t.pct;
  return pct;
};

/** Арзонӣ нисбат ба нархи асосӣ, фоиз (масалан 8% фоида → 4.4%) */
export const discountFor = (pct: number) => Math.round((1 - (1 + pct / 100) / (1 + basePct() / 100)) * 1000) / 10;

/** Нархҳои оптовии дар саҳифаи маҳсулот нишондодашаванда */
export function wholesalePrices(p: Product) {
  if (p.noWholesale) return [];
  return SHOWN_WHOLESALE_PCTS.flatMap((pct) => {
    const tier = MARKUP_TIERS.find((t) => t.pct === pct);
    if (!tier) return [];
    return [{ pct, from: tier.from, unit: costPerUnit(p) * (1 + pct / 100), off: discountFor(pct) }];
  });
}

/** Зинаҳои тахфиф барои сабад: аз чӣ қадар маблағ чанд фоиз арзонтар */
export const discountLadder = () => MARKUP_TIERS.map((t) => ({ from: t.from, off: discountFor(t.pct) }));

export type QtyTier = { from: number; pct: number; minQty: number; unit: number; off: number };

/**
  Зинаҳои нарх барои як маҳсулот бо миқдор: «аз N дона — нархи X».
  Қоида ҳамон қоидаи сабад аст (тахфиф аз маблағи фармоиш бо нархи асосӣ), фақат ба миқдори ҳамин маҳсулот
  табдил дода шудааст. Агар дар сабад моли дигар ҳам бошад, тахфиф барвақттар сар мешавад.
*/
export function qtyTiers(p: Product): QtyTier[] {
  const list = listUnitPrice(p);
  const cost = costPerUnit(p);
  const min = p.sale?.min ?? 1;
  const step = p.sale?.step ?? 1;
  const out: QtyTier[] = [];
  // Моли бе нархи оптовӣ (аз admin): танҳо зинаи аввал — нархи дона
  for (const t of p.noWholesale ? MARKUP_TIERS.slice(0, 1) : MARKUP_TIERS) {
    const need = list > 0 ? t.from / list : 0;
    const minQty = Math.max(min, Math.round(Math.ceil(need / step - 1e-9) * step * 100) / 100);
    const tier = { from: t.from, pct: t.pct, minQty, unit: cost * (1 + t.pct / 100), off: discountFor(t.pct) };
    // Агар ду зина ба як миқдор афтанд, арзонтарашро нигоҳ медорем
    if (out.length && out[out.length - 1].minQty >= minQty) out[out.length - 1] = tier;
    else out.push(tier);
  }
  return out;
}

/** Зинае, ки ба ин миқдор мувофиқ аст */
export const tierAt = (tiers: QtyTier[], qty: number) => [...tiers].reverse().find((t) => qty >= t.minQty) ?? tiers[0];

/** Зинаҳои оптовие, ки дар корт ва рӯйхат нишон дода мешаванд (аз SHOWN_WHOLESALE_PCTS) */
export const shownTiers = (p: Product) => qtyTiers(p).filter((t) => SHOWN_WHOLESALE_PCTS.includes(t.pct));

/* ---------- вазн, ҳаҷм, расонидан ---------- */

const round2 = (n: number) => Math.round(n * 100) / 100;
export const weightOf = (p: Product, qty: number) => p.weightKg * qty;
export const volumeOf = (p: Product, qty: number) => (p.volumeM3 ?? 0) * qty;

/** Харидор дар куҷост: Тоҷикистон ё Иморот */
export type Dest = "tj" | "ae";
const isLocal = (m: ShippingMode) => m.id === "local";

/* Мувақатан: интихоби намуди расонидан (ҳаво/замин) хомӯш аст — танҳо як намуд кор мекунад.
   Харидор дар Иморот ва мол аз Дубай: курьери дохили Иморот. Мол аз кишвари дигар ба Иморот: нарх аз менеҷер (0, «бо тасдиқ»). */
export const modesFor = (country: CountryCode, dest: Dest = "tj"): ShippingMode[] => {
  const main = SHIPPING[country].filter((m) => !isLocal(m)).slice(0, 1);
  if (dest !== "ae") return main.length ? main : SHIPPING[country].slice(0, 1);
  if (country === "ae") {
    const local = SHIPPING.ae.filter(isLocal);
    if (local.length) return local.slice(0, 1);
  }
  const base = main[0] ?? SHIPPING[country][0];
  return [{ ...base, id: "quote", perKgUsd: 0, perM3Usd: undefined, flatUsd: undefined, flatKg: undefined, assumed: true, note: "Менеҷер нархро тасдиқ мекунад" }];
};
export const defaultMode = (country: CountryCode, dest: Dest = "tj") => modesFor(country, dest)[0].id;
export const getMode = (country: CountryCode, id?: string, dest: Dest = "tj") =>
  modesFor(country, dest).find((m) => m.id === id) ?? modesFor(country, dest)[0];

export type Shipping = { tjs: number; basis: "kg" | "m3" | "none"; mode: ShippingMode };

export function shippingCost(country: CountryCode, modeId: string | undefined, kg: number, m3: number, dest: Dest = "tj"): Shipping {
  const mode = getMode(country, modeId, dest);
  // Нархи собит то flatKg, баъд барои ҳар кг иловагӣ
  const byKg = mode.flatUsd ? mode.flatUsd + Math.max(0, kg - (mode.flatKg ?? 0)) * mode.perKgUsd : kg * mode.perKgUsd;
  const byVol = mode.perM3Usd ? m3 * mode.perM3Usd : 0;
  // Нархи собит (курьер) бе вазн ҳам ҳисоб мешавад; дигар намудҳо бе вазн/ҳаҷм — «бо тасдиқ»
  const usd = mode.flatUsd || kg > 0 || m3 > 0 ? Math.max(byKg, byVol) : 0;
  return {
    tjs: round2(usd * RATES.usdToTjs),
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
  dest: Dest = "tj",
): PricedOrder {
  const found = lines.flatMap((l) => {
    const p = lookup(l.slug);
    return p ? [{ p, qty: l.qty, size: l.size, color: l.color, cost: costPerUnit(p) }] : [];
  });

  // Тахфиф аз маблағи фармоиш бо нархи асосӣ муайян мешавад; моли бе нархи оптовӣ ба ин ҳисоб намеравад
  const listAmount = found.reduce((s, l) => s + (l.p.noWholesale ? 0 : l.cost * (1 + basePct() / 100) * l.qty), 0);
  const pct = markupPct(listAmount);

  const byCountry = new Map<CountryCode, PricedLine[]>();
  for (const l of found) {
    const listUnit = l.cost * (1 + basePct() / 100);
    const unit = l.p.noWholesale ? listUnit : l.cost * (1 + pct / 100);
    const row: PricedLine = {
      key: `${l.p.slug}|${l.size ?? ""}|${l.color ?? ""}`,
      size: l.size,
      color: l.color,
      p: l.p,
      qty: l.qty,
      listUnit,
      unit,
      goods: round2(unit * l.qty),
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
      shipping: shippingCost(country, modes[country], kg, m3, dest),
    };
  });

  // Маблағҳо то дирам (0,01 смн) — на то сомонии пурра, то дар ҳар асъор ҷамъ бо қисмҳо баробар бошад
  const goods = round2(groups.reduce((s, g) => s + g.goods, 0));
  const listGoods = round2(groups.reduce((s, g) => s + g.lines.reduce((a, r) => a + round2(r.listUnit * r.qty), 0), 0));
  const shipping = round2(groups.reduce((s, g) => s + g.shipping.tjs, 0));

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
    discount: Math.max(0, round2(listGoods - goods)),
    discountPct: discountFor(pct),
    goods,
    shipping,
    total: round2(goods + shipping),
    listAmount,
    next,
  };
}
