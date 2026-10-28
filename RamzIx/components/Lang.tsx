"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_LANG, LANGS, tr, type Lang } from "@/lib/i18n";

const KEY = "ramzix-lang";

type Vars = Record<string, string | number>;
type LangCtx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string, vars?: Vars) => string };

const Ctx = createContext<LangCtx>({ lang: DEFAULT_LANG, setLang: () => {}, t: (k, v) => tr(DEFAULT_LANG, k, v) });
export const useT = () => useContext(Ctx);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s && LANGS.some((l) => l.id === s)) setLangState(s as Lang);
    } catch {}
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
