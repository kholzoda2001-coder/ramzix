"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toStorefront, readAdminProducts } from "./admin";
import { products as staticProducts, type Product } from "./catalog";
import { cleanBrand } from "./brands";

/* Каталоги сайт = маҳсулоти доимӣ + маҳсулоти фаъоли админ (ҳоло аз ҳамин дастгоҳ; баъд аз база) */
type Ctx = { products: Product[]; getProduct: (slug: string) => Product | undefined; ready: boolean };
const Cat = createContext<Ctx>({ products: staticProducts, getProduct: (s) => staticProducts.find((p) => p.slug === s), ready: false });
export const useCatalog = () => useContext(Cat);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [extra, setExtra] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const load = () => setExtra(readAdminProducts().filter((p) => p.active && p.name && p.cost > 0).map((p) => { const x = toStorefront(p); return { ...x, brand: cleanBrand(x.brand) }; }));
    load(); setReady(true);
    window.addEventListener("ramzix-admin-change", load);
    window.addEventListener("storage", load);
    return () => { window.removeEventListener("ramzix-admin-change", load); window.removeEventListener("storage", load); };
  }, []);
  const value = useMemo<Ctx>(() => {
    const slugs = new Set(staticProducts.map((p) => p.slug));
    const all = [...extra.filter((p) => !slugs.has(p.slug)), ...staticProducts];
    return { products: all, getProduct: (slug) => all.find((p) => p.slug === slug), ready };
  }, [extra, ready]);
  return <Cat.Provider value={value}>{children}</Cat.Provider>;
}
