"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { currencyFromCountry, getCountry, langFromBrowser } from "@/lib/geo";
import { CURRENCIES, DEFAULT_CURRENCY, fromTjs, toTjs, type CurrencyId } from "@/lib/currency";

const KEY = "ramzix-currency";
const space = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

type Money = {
  cur: CurrencyId;
  label: string;
  setCur: (c: CurrencyId) => void;
  /** нархи 1 воҳид (аз сомонӣ) */
  price: (tjs: number) => string;
  /** маблағи умумӣ (аз сомонӣ) */
  sum: (tjs: number) => string;
  /** маблағи асъори интихобшуда → сомонӣ */
  toTjs: (n: number) => number;
  /** сомонӣ → маблағи асъори интихобшуда */
  conv: (tjs: number) => number;
};

const make = (cur: CurrencyId, setCur: (c: CurrencyId) => void): Money => {
  const label = CURRENCIES.find((c) => c.id === cur)!.label;
  const conv = (tjs: number) => fromTjs(tjs, cur);
  const dec = (n: number) => (n < 1000 ? (Math.round(n * 100) / 100).toFixed(2).replace(".", ",") : space(n));
  const price = (tjs: number) => {
    const n = conv(tjs);
    if (cur !== "TJS") return dec(n);
    if (n >= 100) return space(n);
    const r = Math.round(n * 10) / 10;
    return (Number.isInteger(r) ? String(r) : r.toFixed(1)).replace(".", ",");
  };
  // Маблағ бо дирам/сент то 1000 — то ҷамъ бо қисмҳо дар ҳамаи асъорҳо баробар бошад
  const sum = (tjs: number) => dec(conv(tjs));
  return { cur, label, setCur, price, sum, toTjs: (n) => toTjs(n, cur), conv };
};

const Ctx = createContext<Money>(make(DEFAULT_CURRENCY, () => {}));
export const useMoney = () => useContext(Ctx);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [cur, setCurState] = useState<CurrencyId>(DEFAULT_CURRENCY);
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(KEY); } catch {}
    if (saved && CURRENCIES.some((c) => c.id === saved)) return setCurState(saved as CurrencyId);
    // Харидор худаш интихоб накардааст: асъор аз рӯи кишвар (Тоҷикистон — смн, Аморат — AED, дигар — $). Нигоҳ дошта намешавад.
    let alive = true;
    getCountry().then((c) => {
      const cur = currencyFromCountry(c) ?? (langFromBrowser() === "tg" ? "TJS" : null);
      if (alive && cur) setCurState(cur);
    });
    return () => { alive = false; };
  }, []);
  const setCur = useCallback((c: CurrencyId) => {
    setCurState(c);
    try { localStorage.setItem(KEY, c); } catch {}
  }, []);
  return <Ctx.Provider value={make(cur, setCur)}>{children}</Ctx.Provider>;
}
