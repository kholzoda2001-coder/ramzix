// Маҳсулоти доимиро (data/catalog.json + data/extra-products.json) ба Supabase мегузаронад.
// Иҷро: node scripts/import-static.mjs   (бе хатар такрор кардан мумкин аст — id аз slug сохта мешавад)
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL, KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) throw new Error(".env.local пур нест");

const load = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const list = [...load("catalog.json"), ...load("extra-products.json")];
const CUR = ["USD", "AED", "SAR", "CNY", "TJS"];

const rows = list.map((p) => {
  const s = p.sale ?? {};
  if (!CUR.includes(p.costCurrency)) throw new Error(`асъори номаълум: ${p.slug} ${p.costCurrency}`);
  return {
    id: "s" + createHash("sha1").update(p.slug).digest("hex").slice(0, 11),
    slug: p.slug, name: p.name, subtitle: p.subtitle ?? "", brand: p.brand ?? "", category: p.category, country: p.country,
    cost: p.cost, cost_currency: p.costCurrency, weight_kg: p.weightKg ?? 0, volume_m3: p.volumeM3 ?? 0,
    images: p.images ?? [], description: p.description ?? "", sizes: p.sizes ?? [],
    unit: s.unit ?? "дона", per: s.per ?? 0, per_label: s.perLabel ?? "", min: s.min ?? 1, step: s.step ?? 0,
    markup_pct: 5, active: true, note: "",
    extra: { source: p.source, rating: p.rating ?? null, reviews: p.reviews ?? 0, ...(p.colors ? { colors: p.colors } : {}), ...(p.sale ? { sale: p.sale } : {}) },
  };
});

const r = await fetch(`${URL_}/rest/v1/products?on_conflict=id`, {
  method: "POST",
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify(rows),
});
console.log(r.ok ? `OK: ${rows.length} маҳсулот ба база гузашт` : `ХАТО ${r.status}: ${await r.text()}`);
process.exit(r.ok ? 0 : 1);
