"use client";

import { useCallback, useEffect, useState } from "react";
import { CURRENCIES, fromTjs, toTjs, type CurrencyId } from "@/lib/currency";
import { money } from "./ui";

/* Асъори админ: ҳамаи маблағҳо дар база бо сомонӣ нигоҳ дошта мешаванд, ин ҷо танҳо нишон ва ворид кардан иваз мешавад */
const KEY = "ramzix-admin-cur";
const EVENT = "ramzix-admin-cur-change";

export function useFx() {
  const [cur, setCurState] = useState<CurrencyId>("TJS");
  useEffect(() => {
    const read = () => { try { const s = localStorage.getItem(KEY); if (s && CURRENCIES.some((c) => c.id === s)) setCurState(s as CurrencyId); } catch {} };
    read();
    window.addEventListener(EVENT, read);
    return () => window.removeEventListener(EVENT, read);
  }, []);
  const setCur = useCallback((c: CurrencyId) => {
    try { localStorage.setItem(KEY, c); } catch {}
    window.dispatchEvent(new Event(EVENT));
  }, []);
  const label = CURRENCIES.find((c) => c.id === cur)!.label;
  return {
    cur,
    label,
    setCur,
    /** маблағи сомонӣ → матни асъори интихобшуда (бе аломат) */
    m: (tjs: number) => money(fromTjs(tjs, cur)),
    /** сомонӣ → сатр барои майдони воридкунӣ */
    inp: (tjs: number) => String(Math.round(fromTjs(tjs, cur) * 100) / 100),
    /** маблағи ворид шуда (дар асъори интихобшуда) → сомонӣ */
    base: (n: number) => Math.round(toTjs(n, cur) * 100) / 100,
  };
}
