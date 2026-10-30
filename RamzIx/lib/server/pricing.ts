import { DEFAULT_PRICING, mergePricing, type PricingConfig } from "../pricing-config";
import { dbReady } from "./db";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/* Танзимоти нарх ва тамос аз база (admin_settings, key = "pricing"). Баъди захира дар admin фавран нав мешавад. */
export async function loadPricing(): Promise<PricingConfig> {
  if (!dbReady()) return DEFAULT_PRICING;
  try {
    const r = await fetch(`${URL_}/rest/v1/admin_settings?key=eq.pricing&select=value`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
      next: { revalidate: 30, tags: ["pricing"] },
    });
    if (!r.ok) return DEFAULT_PRICING;
    const rows = (await r.json()) as { value: unknown }[];
    return rows[0] ? mergePricing(rows[0].value) : DEFAULT_PRICING;
  } catch { return DEFAULT_PRICING; }
}
