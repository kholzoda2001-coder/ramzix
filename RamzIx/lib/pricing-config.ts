/*
  Танзимоти нархгузорӣ ва тамос: ҳамаи рақамҳое, ки шумо иваз мекунед, дар ҳамин ҷо ҳастанд.
  Қиматҳои зерин пешфарзанд; дар admin («Танзимот → Нарх ва расонидан») иваз карда мешаванд,
  дар база (admin_settings, key = "pricing") нигоҳ дошта мешаванд ва ба ин объектҳо дар ҷояшон (in place) гузошта мешаванд.

  Харидор ду чизро мебинад:
    нархи мол    — нархи харид + фоидаи шумо (фоида дар дохили нарх, ҷудо нишон дода намешавад)
    расонидан    — вазн × нархи 1 кг барои кишвар (ё ҳаҷм × нархи 1 м³, кадомаш баландтар бошад)

  Фоида аз маблағи умумии сабад вобаста аст: ҳар қадар зиёд харад, фоида камтар (нархи мол арзонтар).
*/

export type Currency = "USD" | "AED" | "SAR" | "CNY" | "TJS";
export type CountryKey = "ae" | "cn" | "tr" | "tj";

export type ShippingMode = {
  id: string;
  label: string;
  /** Нархи 1 кг (доллар) */
  perKgUsd: number;
  /** Нархи 1 м³ (доллар): агар ҳаҷм аз вазн гаронтар бошад, ҳамин истифода мешавад */
  perM3Usd?: number;
  /** Нархи собит (доллар) то flatKg кило; аз болои он — perKgUsd барои ҳар кг. Барои расонидан дар дохили шаҳр/кишвар */
  flatUsd?: number;
  flatKg?: number;
  daysMin: number;
  daysMax: number;
  /** Нарх тахминӣ аст, ҳанӯз аз ширкати интиқол тасдиқ нашудааст */
  assumed?: boolean;
  note?: string;
};

export type MarkupTier = { from: number; pct: number };

export type PricingConfig = {
  /** Қурби расмии БМТ: 1 доллар = N сомонӣ */
  usdToTjs: number;
  /** Қурби асъорҳо ба доллар: 1 доллар = N воҳид */
  aedPerUsd: number;
  sarPerUsd: number;
  cnyPerUsd: number;
  /** Санаи қурб (барои нишон додан) */
  ratesDate: string;
  /** Фоидаи шумо (фоиз болои нархи харид), аз маблағи сабад бо нархи асосӣ (смн) */
  markupTiers: MarkupTier[];
  /** Кадом фоидаҳо дар саҳифаи маҳсулот ҳамчун «нархи оптовӣ» нишон дода мешаванд */
  shownWholesalePcts: number[];
  /** Аз ин миқдор ба харидор тавсия медиҳем нархи оптовӣ дархост кунад */
  rfqFrom: number;
  /** Нарх чанд соат дуруст аст */
  quoteHours: number;
  /** Рақами WhatsApp-и корхона бе «+» (формати wa.me) */
  whatsapp: string;
  shipping: Record<CountryKey, ShippingMode[]>;
};

/** Расонидан дар дохили Иморот: id = "local" (ба харидори Иморот ва моли Дубай татбиқ мешавад) */
export const LOCAL_UAE: ShippingMode = { id: "local", label: "Дар Иморот (курьер)", perKgUsd: 0.55, flatUsd: 6.81, flatKg: 5, daysMin: 1, daysMax: 2 };

export const DEFAULT_PRICING: PricingConfig = {
  usdToTjs: 9.224,
  aedPerUsd: 3.6725, // AED ба доллар баста шудааст
  sarPerUsd: 3.75,
  cnyPerUsd: 7.14, // тахминӣ: бо қурби воқеӣ иваз кунед
  ratesDate: "27.10.2026",
  markupTiers: [
    { from: 0, pct: 20 }, // нархи асосӣ (дона)
    // Ҳадҳо бо доллар гирд: 300 $, 1 000 $, 5 000 $ (бо қурби 9,224). Қурб иваз шавад, инҳоро низ иваз кунед.
    { from: 2767.2, pct: 13 }, // 300 $: оптом сар мешавад
    { from: 9224, pct: 8 }, // 1 000 $
    { from: 46120, pct: 5 }, // 5 000 $
  ],
  shownWholesalePcts: [13, 8, 5],
  rfqFrom: 100,
  quoteHours: 24,
  whatsapp: "971508385259",
  shipping: {
    ae: [
      { id: "cargo", label: "Мошин (карго)", perKgUsd: 1.5, daysMin: 30, daysMax: 40 },
      { id: "avia", label: "Ҳаво (авиа)", perKgUsd: 6, daysMin: 3, daysMax: 7 },
      // Харидор дар Иморот: курьер дар дохили Иморот (OTO). 25 AED то 5 кг, баъд 2 AED барои ҳар кг. Бо қурби 3,6725
      LOCAL_UAE,
    ],
    cn: [{ id: "cargo", label: "Карго", perKgUsd: 2.6, perM3Usd: 250, daysMin: 10, daysMax: 20 }],
    tr: [{ id: "cargo", label: "Карго", perKgUsd: 3, daysMin: 10, daysMax: 18, assumed: true }],
    tj: [{ id: "local", label: "Дар Тоҷикистон", perKgUsd: 0, daysMin: 1, daysMax: 3, note: "Расонидан аз рӯи шаҳр, менеҷер тасдиқ мекунад" }],
  },
};

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

/* ---- Ҳолати зинда: ҳамаи ҳисобкуниҳо аз ҳамин объектҳо мехонанд ---- */
export const RATES = { usdToTjs: DEFAULT_PRICING.usdToTjs, aedPerUsd: DEFAULT_PRICING.aedPerUsd, sarPerUsd: DEFAULT_PRICING.sarPerUsd, cnyPerUsd: DEFAULT_PRICING.cnyPerUsd, date: DEFAULT_PRICING.ratesDate };
/** Қурби асъор ба доллар: 1 воҳид = N доллар */
export const TO_USD: Record<Currency, number> = { USD: 1, AED: 1 / RATES.aedPerUsd, SAR: 1 / RATES.sarPerUsd, CNY: 1 / RATES.cnyPerUsd, TJS: 1 / RATES.usdToTjs };
export const MARKUP_TIERS: MarkupTier[] = clone(DEFAULT_PRICING.markupTiers);
export const SHOWN_WHOLESALE_PCTS: number[] = [...DEFAULT_PRICING.shownWholesalePcts];
export const SETTINGS = { rfqFrom: DEFAULT_PRICING.rfqFrom, quoteHours: DEFAULT_PRICING.quoteHours };
export const CONTACT = { whatsapp: DEFAULT_PRICING.whatsapp };
export const SHIPPING: Record<CountryKey, ShippingMode[]> = clone(DEFAULT_PRICING.shipping);

const listeners = new Set<() => void>();
/** Баъди ҳар тағйирот иҷро мешавад (масалан, рӯйхати масирҳои расонидан дар admin) */
export const onPricingApplied = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

/** Танзимотро ба объектҳои зинда мегузорад (дар ҷояшон, то ҳама ҷо ҳамон ҳамон нусхаро бинанд) */
export function applyPricing(c: PricingConfig) {
  RATES.usdToTjs = c.usdToTjs; RATES.aedPerUsd = c.aedPerUsd; RATES.sarPerUsd = c.sarPerUsd; RATES.cnyPerUsd = c.cnyPerUsd; RATES.date = c.ratesDate;
  TO_USD.AED = 1 / c.aedPerUsd; TO_USD.SAR = 1 / c.sarPerUsd; TO_USD.CNY = 1 / c.cnyPerUsd; TO_USD.TJS = 1 / c.usdToTjs;
  MARKUP_TIERS.splice(0, MARKUP_TIERS.length, ...c.markupTiers);
  SHOWN_WHOLESALE_PCTS.splice(0, SHOWN_WHOLESALE_PCTS.length, ...c.shownWholesalePcts);
  SETTINGS.rfqFrom = c.rfqFrom; SETTINGS.quoteHours = c.quoteHours;
  CONTACT.whatsapp = c.whatsapp;
  for (const k of Object.keys(c.shipping) as CountryKey[]) SHIPPING[k] = c.shipping[k];
  listeners.forEach((fn) => fn());
}

/** Ҳолати ҳозира ҳамчун танзимот (барои шакли admin) */
export function snapshotPricing(): PricingConfig {
  return clone({ ...RATES, ratesDate: RATES.date, markupTiers: MARKUP_TIERS, shownWholesalePcts: SHOWN_WHOLESALE_PCTS, rfqFrom: SETTINGS.rfqFrom, quoteHours: SETTINGS.quoteHours, whatsapp: CONTACT.whatsapp, shipping: SHIPPING });
}

const num = (v: unknown, min: number, max: number, fb: number) => { const n = typeof v === "string" ? parseFloat(v.replace(",", ".")) : Number(v); return Number.isFinite(n) && n >= min && n <= max ? n : fb; };
const text = (v: unknown, max: number, fb = "") => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : fb);

/** Маълумоти аз база ё аз клиентро месанҷад: ҳар чизи нодуруст бо пешфарз иваз мешавад */
export function mergePricing(raw: unknown): PricingConfig {
  const D = DEFAULT_PRICING;
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const tiers = Array.isArray(r.markupTiers)
    ? (r.markupTiers as unknown[]).slice(0, 10).map((t) => { const o = (t && typeof t === "object" ? t : {}) as Record<string, unknown>; return { from: num(o.from, 0, 1e9, -1), pct: num(o.pct, 0, 500, -1) }; }).filter((t) => t.from >= 0 && t.pct >= 0).sort((a, b) => a.from - b.from)
    : [];
  // Зинаи якум ҳатман аз 0 сар мешавад
  const markupTiers = tiers.length ? [{ ...tiers[0], from: 0 }, ...tiers.slice(1)] : clone(D.markupTiers);
  const shipping = clone(D.shipping);
  const rs = (r.shipping && typeof r.shipping === "object" ? r.shipping : {}) as Record<string, unknown>;
  for (const k of Object.keys(shipping) as CountryKey[]) {
    if (!Array.isArray(rs[k])) continue;
    const modes = (rs[k] as unknown[]).slice(0, 6).map((m, i) => {
      const o = (m && typeof m === "object" ? m : {}) as Record<string, unknown>;
      const id = text(o.id, 20, `m${i}`).replace(/[^\w-]/g, "") || `m${i}`;
      const mode: ShippingMode = { id, label: text(o.label, 40, "Карго"), perKgUsd: num(o.perKgUsd, 0, 1000, 0), daysMin: num(o.daysMin, 0, 365, 1), daysMax: num(o.daysMax, 0, 365, 3) };
      const m3 = num(o.perM3Usd, 0, 100000, 0);
      if (m3 > 0) mode.perM3Usd = m3;
      const flat = num(o.flatUsd, 0, 100000, 0);
      if (flat > 0) { mode.flatUsd = flat; mode.flatKg = num(o.flatKg, 0, 100000, 0); }
      if (o.assumed === true) mode.assumed = true;
      const note = text(o.note, 120); if (note) mode.note = note;
      return mode;
    });
    // Намуди «Дар Иморот» ҳамеша мемонад (дар базаи кӯҳна набуд)
    if (k === "ae" && !modes.some((m) => m.id === LOCAL_UAE.id)) modes.push(clone(LOCAL_UAE));
    if (modes.length) shipping[k] = modes;
  }
  const pcts = Array.isArray(r.shownWholesalePcts) ? (r.shownWholesalePcts as unknown[]).map((x) => num(x, 0, 500, -1)).filter((x) => x >= 0 && markupTiers.some((t) => t.pct === x)) : [];
  return {
    usdToTjs: num(r.usdToTjs, 0.01, 1000, D.usdToTjs), aedPerUsd: num(r.aedPerUsd, 0.01, 1000, D.aedPerUsd), sarPerUsd: num(r.sarPerUsd, 0.01, 1000, D.sarPerUsd), cnyPerUsd: num(r.cnyPerUsd, 0.01, 1000, D.cnyPerUsd),
    ratesDate: text(r.ratesDate, 20, D.ratesDate), markupTiers, shownWholesalePcts: pcts.length ? pcts : D.shownWholesalePcts.filter((x) => markupTiers.some((t) => t.pct === x)),
    rfqFrom: num(r.rfqFrom, 1, 1e7, D.rfqFrom), quoteHours: num(r.quoteHours, 1, 720, D.quoteHours), whatsapp: text(r.whatsapp, 20, D.whatsapp).replace(/\D/g, "") || D.whatsapp, shipping,
  };
}
