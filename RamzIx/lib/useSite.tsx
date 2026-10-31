"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useT } from "@/components/Lang";
import { applyCatalogMeta } from "./catalog";
import { DEFAULT_SITE, DEFAULT_TEXTS, mergeSite, type SiteConfig } from "./site-config";

/* Мундариҷаи сайт: `initial` аз сервер меояд, баъд дар клиент нав мешавад (ва баъди захира дар admin) */
const Ctx = createContext<SiteConfig>(DEFAULT_SITE);
export const useSite = () => useContext(Ctx);

export function SiteProvider({ children, initial }: { children: React.ReactNode; initial: SiteConfig }) {
  // Категория ва кишварҳо пеш аз render ба рӯйхатҳои зинда гузошта мешаванд, то server ва браузер як чиз бинанд
  const [site, setSite] = useState<SiteConfig>(() => { applyCatalogMeta(initial.categories, initial.countries); return initial; });
  useEffect(() => {
    const load = () => fetch("/api/site").then((r) => r.json()).then((d) => { const s = mergeSite(d); applyCatalogMeta(s.categories, s.countries); setSite(s); }).catch(() => {});
    load();
    window.addEventListener("ramzix-site-change", load);
    return () => window.removeEventListener("ramzix-site-change", load);
  }, []);
  return <Ctx.Provider value={site}>{children}</Ctx.Provider>;
}

/** Матни таҳриршаванда (аз admin) бо тарҷума: `const tx = useText(); tx("pickup")` */
export function useText() {
  const { texts } = useSite();
  const { t } = useT();
  return (key: string) => t(texts[key] ?? DEFAULT_TEXTS[key] ?? "");
}
