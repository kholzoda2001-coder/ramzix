"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCountry, langFromBrowser, langFromCountry } from "@/lib/geo";
import { DEFAULT_LANG, LANGS, tr, type Lang } from "@/lib/i18n";

const KEY = "ramzix-lang";

type Vars = Record<string, string | number>;
type LangCtx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string, vars?: Vars) => string };

const Ctx = createContext<LangCtx>({ lang: DEFAULT_LANG, setLang: () => {}, t: (k, v) => tr(DEFAULT_LANG, k, v) });
export const useT = () => useContext(Ctx);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(KEY); } catch {}
    if (saved && LANGS.some((l) => l.id === saved)) return setLangState(saved as Lang);
    // Харидор худаш интихоб накардааст: забони браузер, вагарна аз рӯи кишвар. Интихоби худкор нигоҳ дошта намешавад.
    const b = langFromBrowser();
    if (b) return setLangState(b);
    let alive = true;
    getCountry().then((c) => { const l = langFromCountry(c); if (alive && l) setLangState(l); });
    return () => { alive = false; };
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch {}
  }, []);
  const t = useCallback((key: string, vars?: Vars) => tr(lang, key, vars), [lang]);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

/** Матни оддӣ дар JSX: <T>Матн</T> */
export function T({ children, vars }: { children: string; vars?: Vars }) {
  const { t } = useT();
  return <>{t(children, vars)}</>;
}
