import { USD_TO_TJS } from "./pricing-config";

export type CurrencyId = "USD" | "AED" | "TJS";

/* Қурб нисбат ба 1 доллар. AED ба доллар баста шудааст (3,6725), TJS — қурби расмии БМТ */
export const CURRENCIES: { id: CurrencyId; label: string; name: string; perUsd: number }[] = [
  { id: "USD", label: "$", name: "Доллар", perUsd: 1 },
  { id: "AED", label: "AED", name: "Дирҳам", perUsd: 3.6725 },
  { id: "TJS", label: "смн", name: "Сомонӣ", perUsd: USD_TO_TJS },
];

export const RATES_DATE = "27.10.2026";
export const DEFAULT_CURRENCY: CurrencyId = "USD";

/** Ҳамаи нархҳои дохилӣ бо сомонӣ мебошанд; ин ба асъори интихобшуда мегузаронад */
export const fromTjs = (tjs: number, cur: CurrencyId) =>
  (tjs / USD_TO_TJS) * (CURRENCIES.find((c) => c.id === cur)?.perUsd ?? 1);

/** Баръакс: маблағи асъори интихобшударо ба сомонӣ */
export const toTjs = (n: number, cur: CurrencyId) =>
  (n / (CURRENCIES.find((c) => c.id === cur)?.perUsd ?? 1)) * USD_TO_TJS;
