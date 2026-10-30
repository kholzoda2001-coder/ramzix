import { toStorefront, type AdminProduct } from "../admin-core";
import { cleanBrand } from "../brands";
import type { Product } from "../catalog";
import { dbReady, rowToProduct } from "./db";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/* Каталоги сайт аз база (маҳсулоти фаъол). Кэши кӯтоҳ — серверро аз дархостҳои такрорӣ нигоҳ медорад. */
export async function loadStorefront(): Promise<Product[]> {
  if (!dbReady()) return [];
  try {
    const r = await fetch(`${URL_}/rest/v1/products?select=*&active=eq.true&cost=gt.0&order=created_at.desc&limit=5000`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
      next: { revalidate: 30, tags: ["catalog"] },
    });
    if (!r.ok) return [];
    const rows = (await r.json()) as Record<string, unknown>[];
    return rows.map(rowToProduct).filter((p: AdminProduct) => p.name).map((p) => { const x = toStorefront({ ...p, note: "", markupPct: 0 }); return { ...x, brand: cleanBrand(x.brand) }; });
  } catch { return []; }
}
