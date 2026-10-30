// Маҳсулотро аз CJdropshipping мегирад ва ба Supabase мегузорад (id аз pid сохта мешавад — такрор кардан бехатар).
// Иҷро: node scripts/import-cj.mjs        Калид: CJ_API_KEY дар .env.local
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const { NEXT_PUBLIC_SUPABASE_URL: SB, SUPABASE_SERVICE_ROLE_KEY: SBK, CJ_API_KEY } = env;
if (!SB || !SBK || !CJ_API_KEY) throw new Error(".env.local пур нест (CJ_API_KEY, Supabase)");

/* pid → номи сайт, категория ва тавсифи кӯтоҳ */
const PICK = [
  { pid: "2610290433241615500", name: "Karaoke Bluetooth Speaker with Light", category: "audio", subtitle: "Динамики Bluetooth бо равшании рангӣ" },
  { pid: "2115701510347292674", name: "Wireless Lavalier Microphone (iPhone / Android)", category: "audio", subtitle: "Микрофони бесим барои телефон" },
  { pid: "2115727603937128450", name: "Wireless Lavalier Microphone for Phone & Laptop", category: "audio", subtitle: "Микрофони бесим барои телефон ва ноутбук" },
  { pid: "2115737579615236098", name: "Car Bluetooth FM Transmitter & Charger", category: "phones", subtitle: "Bluetooth, FM ва пуркунаки мошин" },
  { pid: "2610290542151617600", name: "Rotating Metal Desktop Phone Holder", category: "phones", subtitle: "Нигоҳдори металии телефон барои миз" },
  { pid: "2610290637411636500", name: "Automatic Touchless Foam Soap Dispenser", category: "home", subtitle: "Диспенсери собуни автоматӣ, USB" },
  { pid: "2610290823181616800", name: "Multifunctional Kitchen Appliance Cleaner", category: "home", subtitle: "Тозакунаки ҷиҳози ошхона" },
  { pid: "2610290150591606600", name: "Adhesive Wall Hooks for Kitchen & Bathroom", category: "home", subtitle: "Қуллобчаи часпак барои ошхона ва ҳаммом" },
  { pid: "2115720973153546241", name: "Portable Foot & Ankle Massager with Heating", category: "beauty", subtitle: "Массажори пой бо гармкунӣ" },
  { pid: "2610291055261605100", name: "All-copper Hot & Cold Bathroom Faucet", category: "home", subtitle: "Смесители мисии якдаста барои ҳаммом" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cj = async (path, token) => (await fetch(`https://developers.cjdropshipping.com/api2.0/v1/${path}`, { method: token ? "GET" : "POST", headers: { "Content-Type": "application/json", ...(token ? { "CJ-Access-Token": token } : {}) } , ...(token ? {} : { body: JSON.stringify({ apiKey: CJ_API_KEY }) }) })).json();

const auth = await cj("authentication/getAccessToken");
const token = auth?.data?.accessToken;
if (!token) throw new Error("CJ: токен гирифта нашуд — " + auth?.message);

const nums = (v) => String(v ?? "").match(/[\d.]+/g)?.map(Number).filter((n) => n > 0) ?? [];
const text = (html) => String(html ?? "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s*\n\s*/g, "\n").replace(/[ \t]+/g, " ").trim();

const rows = [];
for (const it of PICK) {
  const r = await cj(`product/query?pid=${it.pid}`, token);
  const p = r?.data;
  if (!p?.pid) { console.log("ГУЗАШТА ШУД:", it.pid, r?.message); await sleep(1200); continue; }
  const v = p.variants?.[0] ?? {};
  const price = Math.min(...nums(p.sellPrice));
  const kg = Math.max(...nums(p.productWeight), 1) / 1000;
  const m3 = Math.max(...(p.variants ?? []).map((x) => Number(x.variantVolume) || 0), 0) / 1e9;
  const images = [...new Set([...(Array.isArray(p.productImageSet) ? p.productImageSet : []), ...(Array.isArray(p.productImage) ? p.productImage : [p.productImage])].filter((u) => typeof u === "string" && u.startsWith("http")))].slice(0, 8);
  rows.push({
    id: "cj" + String(p.pid).slice(-12), slug: "cj-" + String(p.pid).slice(-12), name: it.name, subtitle: it.subtitle, brand: "", category: it.category, country: "cn",
    cost: price, cost_currency: "USD", weight_kg: Math.round(kg * 1000) / 1000, volume_m3: m3 ? Math.round(m3 * 100000) / 100000 : 0.001,
    images, description: text(p.description).slice(0, 1500), sizes: [], unit: "дона", per: 0, per_label: "", min: 1, step: 0,
    markup_pct: 5, active: true, note: `CJ ${p.productSku ?? ""} · pid ${p.pid}`,
    extra: { source: "cjdropshipping", rating: null, reviews: 0 },
  });
  console.log("OK", it.name, price, "USD", kg + " кг", images.length + " акс");
  await sleep(1200);
}

const res = await fetch(`${SB}/rest/v1/products?on_conflict=id`, {
  method: "POST",
  headers: { apikey: SBK, Authorization: `Bearer ${SBK}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify(rows),
});
console.log(res.ok ? `\nБа база гузашт: ${rows.length} маҳсулот` : `\nХАТО ${res.status}: ${await res.text()}`);
process.exit(res.ok ? 0 : 1);
