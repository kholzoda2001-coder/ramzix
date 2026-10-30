import { DEFAULT_SITE, mergeSite, type SiteConfig } from "../site-config";
import { dbReady } from "./db";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/* Мундариҷаи сайт аз база (admin_settings, key = "site"). Кэши кӯтоҳ, баъди захира дар admin фавран нав мешавад. */
export async function loadSite(): Promise<SiteConfig> {
  if (!dbReady()) return DEFAULT_SITE;
  try {
    const r = await fetch(`${URL_}/rest/v1/admin_settings?key=eq.site&select=value`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
      next: { revalidate: 30, tags: ["site"] },
    });
    if (!r.ok) return DEFAULT_SITE;
    const rows = (await r.json()) as { value: unknown }[];
    return rows[0] ? mergeSite(rows[0].value) : DEFAULT_SITE;
  } catch { return DEFAULT_SITE; }
}
