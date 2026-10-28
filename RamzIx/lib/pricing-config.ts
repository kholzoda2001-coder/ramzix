/*
  Танзимоти нархгузорӣ: ҳамаи рақамҳое, ки шумо иваз мекунед, дар ҳамин ҷо ҳастанд.

  Харидор ду чизро мебинад:
    нархи мол    — нархи харид + фоидаи шумо (фоида дар дохили нарх, ҷудо нишон дода намешавад)
    расонидан    — вазн × нархи 1 кг барои кишвар (ё ҳаҷм × нархи 1 м³, кадомаш баландтар бошад)

  Фоида аз маблағи умумии сабад вобаста аст: ҳар қадар зиёд харад, фоида камтар (нархи мол арзонтар).
  Нархи оптовӣ барои миқдори калон тавассути WhatsApp ҳал мешавад.
*/

export type Currency = "USD" | "AED" | "SAR" | "CNY" | "TJS";
export type CountryKey = "ae" | "cn" | "tr" | "tj";

/** Қурби асъор ба доллар. TJS ва USD аз usdToTjs ҳисоб мешаванд. */
export const USD_TO_TJS = 9.224; // расмии Бонки миллии Тоҷикистон, 27.10.2026
export const TO_USD: Record<Currency, number> = {
  USD: 1,
  AED: 1 / 3.6725, // AED ба доллар баста шудааст
  SAR: 0.26666667,
  CNY: 0.14, // тахминӣ: бо қурби воқеӣ иваз кунед
  TJS: 1 / USD_TO_TJS,
};

/**
  Фоидаи шумо (фоиз болои нархи харид). Аз маблағи умумии фармоиш БО НАРХИ АСОСӢ (смн) вобаста:
  аз `from` смн сар карда — ҳамин фоиз. Зинаи якум — нархи асосӣ, ки дар корт нишон дода мешавад.
*/
export const MARKUP_TIERS = [
  { from: 0, pct: 13 },
  { from: 3000, pct: 10 },
  { from: 5000, pct: 8 },
  { from: 20000, pct: 5 },
  { from: 50000, pct: 3 },
];

/** Кадом фоидаҳо дар саҳифаи маҳсулот ҳамчун «нархи оптовӣ» нишон дода мешаванд. */
export const SHOWN_WHOLESALE_PCTS = [8, 3];

/** Аз ин миқдор ба харидор тавсия медиҳем нархи оптовӣ дархост кунад (агар маҳсулот худаш нишон надода бошад). */
export const RFQ_FROM_DEFAULT = 100;

/** Нарх чанд соат дуруст аст. */
export const QUOTE_VALID_HOURS = 24;

export type ShippingMode = {
  id: string;
  label: string;
  /** Нархи 1 кг (доллар) */
  perKgUsd: number;
  /** Нархи 1 м³ (доллар): агар ҳаҷм аз вазн гаронтар бошад, ҳамин истифода мешавад */
  perM3Usd?: number;
  daysMin: number;
  daysMax: number;
  /** Нарх тахминӣ аст, ҳанӯз аз ширкати интиқол тасдиқ нашудааст */
  assumed?: boolean;
  note?: string;
};

export const SHIPPING: Record<CountryKey, ShippingMode[]> = {
  ae: [
    { id: "cargo", label: "Мошин (карго)", perKgUsd: 1.5, daysMin: 30, daysMax: 40 },
    { id: "avia", label: "Ҳаво (авиа)", perKgUsd: 6, daysMin: 3, daysMax: 7 },
  ],
  cn: [
    { id: "cargo", label: "Карго", perKgUsd: 2.6, perM3Usd: 250, daysMin: 10, daysMax: 20 },
  ],
  tr: [
    { id: "cargo", label: "Карго", perKgUsd: 3, daysMin: 10, daysMax: 18, assumed: true },
  ],
  tj: [
    {
      id: "local",
      label: "Дар Тоҷикистон",
      perKgUsd: 0,
      daysMin: 1,
      daysMax: 3,
      note: "Расонидан аз рӯи шаҳр, менеҷер тасдиқ мекунад",
    },
  ],
};
