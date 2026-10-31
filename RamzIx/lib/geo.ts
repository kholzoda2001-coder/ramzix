import type { CurrencyId } from "./currency";
import { LANGS, type Lang } from "./i18n";

/* Худкор муайян кардани забон ва асъор барои харидори нав (то он даме ки худаш интихоб накардааст) */

const KEY = "ramzix-country";
let pending: Promise<string | null> | null = null;

/** Кишвари харидор (рамзи 2 ҳарфа) ё null; дар ҳамин сессия як маротиба пурсида мешавад */
export function getCountry(): Promise<string | null> {
  try {
    const s = sessionStorage.getItem(KEY);
    if (s) return Promise.resolve(s === "-" ? null : s);
  } catch {}
  pending ??= fetch("/api/geo")
    .then((r) => r.json())
    .then((d: { country?: string | null }) => {
      const c = d.country ?? null;
      try { sessionStorage.setItem(KEY, c ?? "-"); } catch {}
      return c;
    })
    .catch(() => null);
  return pending;
}

/** Забони браузер: аввалин забони дастгиришаванда аз рӯйхати харидор */
export function langFromBrowser(): Lang | null {
  for (const l of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    const code = l.toLowerCase().slice(0, 2);
    const hit = LANGS.find((x) => x.id === code);
    if (hit) return hit.id;
  }
  return null;
}

const RU = new Set(["RU", "BY", "KZ", "KG", "UZ", "AM", "AZ", "MD", "TM", "UA", "GE"]);
export const langFromCountry = (c: string | null): Lang | null => (c === "TJ" ? "tg" : c && RU.has(c) ? "ru" : c ? "en" : null);

/** Тоҷикистон — сомонӣ, Аморат — дирҳам, дигар ҷой — доллар */
export const currencyFromCountry = (c: string | null): CurrencyId | null => (c === "TJ" ? "TJS" : c === "AE" ? "AED" : c ? "USD" : null);
