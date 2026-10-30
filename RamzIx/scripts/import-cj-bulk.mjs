// Маҳсулоти CJdropshipping-ро аз рӯи категорияҳои сайт ҷустуҷӯ карда, ба Supabase мегузорад.
// Иҷро: node scripts/import-cj-bulk.mjs [шумора=100]   (id аз pid — такрор кардан бехатар)
import { GAP, SB, SUB, cj, cjToken, classify, nums, sbHeaders, shortName, sleep, text } from "./cj-lib.mjs";

const TOTAL = Number(process.argv[2]) || 100;

/* категория → калимаҳои ҷустуҷӯ ва ҳиссаи шумора. Категорияи ниҳоӣ аз рӯи ном (classify) муайян мешавад. */
const PLAN = [
  { category: "audio", share: 0.14, q: ["earphones", "headphones", "bluetooth speaker", "microphone"] },
  { category: "phones", share: 0.2, q: ["phone case", "phone charger", "power bank", "usb cable", "smart watch"] },
  { category: "men", share: 0.16, q: ["men t-shirt", "men hoodie", "men jacket", "men sneakers", "men wallet"] },
  { category: "home", share: 0.22, q: ["storage organizer", "kitchen gadget", "led lamp", "bath towel", "cleaning brush"] },
  { category: "beauty", share: 0.14, q: ["hair dryer", "makeup brush", "skin care", "facial massager"] },
  { category: "office", share: 0.14, q: ["laptop stand", "desk organizer", "wireless mouse", "notebook"] },
];
const token = await cjToken();
const bad = /[　-鿿]|test|adult|sex|vibrator|lingerie|gun|knife|weapon/i;

/* 1) Ҷустуҷӯ */
const picked = [];
const seen = new Set();
for (const g of PLAN) {
  const want = Math.round(TOTAL * g.share), per = Math.ceil(want / g.q.length) + 2;
  const got = [];
  for (const q of g.q) {
    const r = await cj(`product/list?pageNum=1&pageSize=${per + 8}&productNameEn=${encodeURIComponent(q)}`, token);
    await sleep(GAP);
    let n = 0;
    for (const p of r?.data?.list ?? []) {
      if (n >= per || got.length >= want) break;
      const price = Math.min(...nums(p.sellPrice));
      const category = classify(shortName(p.productNameEn));
      if (!p.pid || seen.has(p.pid) || !p.productImage || !category || bad.test(p.productNameEn ?? "") || p.isTestProduct || !(price > 0.3 && price < 150)) continue;
      seen.add(p.pid); got.push({ pid: p.pid, category }); n++;
    }
  }
  console.log(g.category, got.length + "/" + want);
  picked.push(...got);
}

/* 2) Ҷузъиёт */
const rows = [];
for (const it of picked) {
  const p = (await cj(`product/query?pid=${it.pid}`, token))?.data;
  await sleep(GAP);
  if (!p?.pid) continue;
  const images = [...new Set([...(Array.isArray(p.productImageSet) ? p.productImageSet : []), ...(Array.isArray(p.productImage) ? p.productImage : [p.productImage])].filter((u) => typeof u === "string" && u.startsWith("http")))].slice(0, 8);
  const price = Math.min(...nums(p.sellPrice));
  if (!images.length || !(price > 0)) continue;
  const kg = Math.max(...nums(p.productWeight), 100) / 1000;
  const m3 = Math.max(...(p.variants ?? []).map((x) => Number(x.variantVolume) || 0), 0) / 1e9;
  const id = String(p.pid).slice(-12);
  rows.push({
    id: "cj" + id, slug: "cj-" + id, name: shortName(p.productNameEn), subtitle: SUB[it.category], brand: "", category: it.category, country: "cn",
    cost: price, cost_currency: "USD", weight_kg: Math.round(kg * 1000) / 1000, volume_m3: m3 ? Math.round(m3 * 100000) / 100000 : 0.001,
    images, description: text(p.description).slice(0, 1500), sizes: [], unit: "дона", per: 0, per_label: "", min: 1, step: 0,
    markup_pct: 5, active: true, note: `CJ ${p.productSku ?? ""} · ${p.categoryName ?? ""} · pid ${p.pid}`,
    extra: { source: "cjdropshipping", rating: null, reviews: 0 },
  });
  if (rows.length % 10 === 0) console.log("..." + rows.length);
}

/* 3) Ба база */
let ok = 0;
for (let i = 0; i < rows.length; i += 50) {
  const res = await fetch(`${SB}/rest/v1/products?on_conflict=id`, {
    method: "POST",
    headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows.slice(i, i + 50)),
  });
  if (!res.ok) { console.log("ХАТО", res.status, await res.text()); process.exit(1); }
  ok += Math.min(50, rows.length - i);
}
console.log(`\nБа база гузашт: ${ok} маҳсулот`);
