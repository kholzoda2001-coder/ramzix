"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toStorefront, type AdminProduct } from "./admin-core";
import type { Product } from "./catalog";
import { cleanBrand } from "./brands";

/* Каталоги сайт = маҳсулоти фаъол аз база. `initial` аз сервер меояд (бе вахти холӣ), баъд дар клиент нав мешавад. */
type Ctx = { products: Product[]; getProduct: (slug: string) => Product | undefined; ready: boolean };
const Cat = createContext<Ctx>({ products: [], getProduct: () => undefined, ready: false });
export const useCatalog = () => useContext(Cat);

export function CatalogProvider({ children, initial = [] }: { children: React.ReactNode; initial?: Product[] }) {
  const [all, setExtra] = useState<Product[]>(initial);
  const [ready, setReady] = useState(initial.length > 0);
  useEffect(() => {
    let alive = true;
    const load = () => fetch("/api/products").then((r) => r.json()).then((d: { products?: AdminProduct[] }) => {
      if (!alive) return;
      setExtra((d.products ?? []).filter((p) => p.active && p.name && p.cost > 0).map((p) => { const x = toStorefront(p); return { ...x, brand: cleanBrand(x.brand) }; }));
    }).catch(() => {}).finally(() => alive && setReady(true));
    load();
    // Баъди тағйироти admin (дар ҳамин браузер) каталог аз нав гирифта мешавад
    const t = { id: 0 as unknown as ReturnType<typeof setTimeout> };
    const onChange = () => { clearTimeout(t.id); t.id = setTimeout(load, 800); };
    window.addEventListener("ramzix-admin-change", onChange);
    return () => { alive = false; clearTimeout(t.id); window.removeEventListener("ramzix-admin-change", onChange); };
  }, []);
  const value = useMemo<Ctx>(() => {
    return { products: all, getProduct: (slug) => all.find((p) => p.slug === slug), ready };
  }, [all, ready]);
  return <Cat.Provider value={value}>{children}</Cat.Provider>;
}
