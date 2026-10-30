// Либоси занона, кӯдакона ва пояфзол аз CJ.
//   node scripts/import-cj-fashion.mjs search <candidates.json>   — номзадҳоро меёбад
//   node scripts/import-cj-fashion.mjs import <picks.json>        — [{pid, category, name}] -ро ба база мегузорад
// Нарх аз варианти қиматтарин гирифта мешавад; андозаҳо аз вариантҳо. Такрор кардан бехатар аст.
import { readFileSync, writeFileSync } from "node:fs";
import { GAP, SB, cj, cjToken, nums, sbHeaders, shortName, sleep, text } from "./cj-lib.mjs";

const PLAN = [
  { category: "women", sub: "Курта", q: "women jacket", cat: /women|lady/i },
  { category: "women", sub: "Либос", q: "women dress", cat: /women|lady|dress/i },
  { category: "women", sub: "Юбка", q: "women skirt", cat: /women|lady|skirt/i },
  { category: "women", sub: "Свитер", q: "women sweater", cat: /women|lady|sweater/i },
  { category: "women", sub: "Шим", q: "women pants", cat: /women|lady|pants/i },
  { category: "kids", sub: "Либос", q: "children clothing set", cat: /kid|child|baby|boy|girl/i },
  { category: "kids", sub: "Бозича", q: "educational toy", cat: /toy|kid|baby/i },
  { category: "kids", sub: "Мактабӣ", q: "school backpack", cat: /bag|backpack|kid|child/i },
  { category: "kids", sub: "Навзод", q: "baby romper", cat: /baby|kid/i },
  { category: "shoes", sub: "Кроссовка", q: "sneakers", cat: /shoe|sneaker/i },
  { category: "shoes", sub: "Туфли", q: "leather shoes", cat: /shoe|flat|pump|loafer/i },
  { category: "shoes", sub: "Сандал", q: "sandals", cat: /shoe|sandal|slipper/i },
  { category: "shoes", sub: "Мӯза", q: "boots", cat: /shoe|boot/i },
];
// Тамғаҳои бегона ва моли номуносиб ворид намешаванд
const BAD = /[　-鿿]|\btest\b|lingerie|underwear|sexy|nike|adidas|gucci|chanel|dior|lv\b|puma|jordan|disney|pokemon|barbie|lego/i;

const [mode, file] = process.argv.slice(2);
if (!["search", "import"].includes(mode) || !file) throw new Error("search|import <file>");
const token = await cjToken();

if (mode === "search") {
  const out = [];
  for (const g of PLAN) {
    const seen = [];
    for (const page of [1, 2]) {
      const r = await cj(`product/list?pageNum=${page}&pageSize=30&productNameEn=${encodeURIComponent(g.q)}`, token);
      await sleep(GAP);
      for (const p of r?.data?.list ?? []) {
        const price = Math.max(...nums(p.sellPrice));
        if (!p.pid || !p.productImage || p.isTestProduct || BAD.test(p.productNameEn ?? "") || !g.cat.test(p.categoryName ?? "") || !(price > 1 && price < 60)) continue;
        if (!seen.some((x) => x.pid === p.pid) && !out.some((x) => x.pid === p.pid)) seen.push({ pid: p.pid, category: g.category, sub: g.sub, price, cj: p.categoryName, name: shortName(p.productNameEn, 70) });
      }
      if (seen.length >= 8) break;
    }
    console.log(g.category, g.sub, seen.length);
    out.push(...seen.slice(0, 8));
  }
  writeFileSync(file, JSON.stringify(out, null, 1));
  process.exit(0);
}

/* ---- Ворид ---- */
const SIZE = /^(xxs|xs|s|m|l|xl|xxl|xxxl|[2-6]xl|one ?size|\d{2,3}(cm)?|\d{1,2}-\d{1,2}(y|m|t)?)$/i;
const picks = JSON.parse(readFileSync(file, "utf8"));
const rows = [];
for (const it of picks) {
  const p = (await cj(`product/query?pid=${it.pid}`, token))?.data;
  await sleep(GAP);
  if (!p?.pid) { console.log("нест:", it.pid); continue; }
  const images = [...new Set([...(Array.isArray(p.productImageSet) ? p.productImageSet : []), ...(Array.isArray(p.productImage) ? p.productImage : [p.productImage])].filter((u) => typeof u === "string" && u.startsWith("http")))].slice(0, 8);
  const vars = p.variants ?? [];
  const cost = Math.max(...vars.map((v) => Number(v.variantSellPrice) || 0), ...nums(p.sellPrice));
  const sizes = [...new Set(vars.flatMap((v) => String(v.variantKey ?? "").split(/[-_/ ]+/).filter((x) => SIZE.test(x)).map((x) => x.toUpperCase())))].slice(0, 12);
  const kg = Math.max(...nums(p.productWeight), 100) / 1000;
  const m3 = Math.max(...vars.map((x) => Number(x.variantVolume) || 0), 0) / 1e9;
  if (!images.length || !(cost > 0)) { console.log("гузашта шуд:", it.pid); continue; }
  const id = String(p.pid).slice(-12);
  rows.push({
    id: "cj" + id, slug: "cj-" + id, name: it.name, subtitle: "", brand: "", category: it.category, country: "cn",
    cost: Math.round(cost * 100) / 100, cost_currency: "USD", weight_kg: Math.round(kg * 1000) / 1000, volume_m3: m3 ? Math.round(m3 * 100000) / 100000 : 0.001,
    images, description: text(p.description).slice(0, 1500), sizes, unit: "дона", per: 0, per_label: "", min: 1, step: 0,
    markup_pct: 5, active: true, note: `CJ ${p.productSku ?? ""} · ${p.categoryName ?? ""} · pid ${p.pid}`,
    extra: { source: "cjdropshipping", rating: null, reviews: 0, nameOriginal: shortName(p.productNameEn) },
  });
  console.log("OK", it.name, cost, sizes.join(","));
}
const res = await fetch(`${SB}/rest/v1/products?on_conflict=id`, { method: "POST", headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows) });
console.log(res.ok ? `Ба база гузашт: ${rows.length}` : `ХАТО ${res.status}: ${await res.text()}`);
