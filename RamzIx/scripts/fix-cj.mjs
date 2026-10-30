// Маҳсулоти CJ-и аллакай воридшударо ислоҳ мекунад: номи пурра (бе буриш дар мобайни калима),
// тавсиф бе &lt; ва ғайра, категория аз рӯи ном; номуносибҳо пинҳон (active=false), нест намешаванд.
// Иҷро: node scripts/fix-cj.mjs
import { GAP, SB, SUB, cj, cjToken, classify, sbHeaders, shortName, sleep, text } from "./cj-lib.mjs";

const rows = await (await fetch(`${SB}/rest/v1/products?select=id,slug,name,description,category,active,note&slug=like.cj-*`, { headers: sbHeaders })).json();
let token = null;
const stats = { renamed: 0, recategorized: 0, hidden: 0, desc: 0 };

for (const r of rows) {
  const patch = {};
  let name = r.name;
  // Номҳое, ки бо скрипти кӯҳна дар 90 аломат бурида шуда буданд — номи пурраро аз CJ мегирем
  const pid = r.note.match(/pid (\d+)/)?.[1];
  if (r.name.length >= 88 && pid) {
    token ??= await cjToken();
    const p = (await cj(`product/query?pid=${pid}`, token))?.data;
    await sleep(GAP);
    if (p?.productNameEn) name = shortName(p.productNameEn);
  } else name = shortName(name);
  if (name !== r.name) { patch.name = name; stats.renamed++; }

  const desc = text(r.description);
  if (desc !== r.description) { patch.description = desc.slice(0, 1500); stats.desc++; }

  const cat = classify(name);
  if (!cat) { if (r.active) { patch.active = false; stats.hidden++; } }
  else if (cat !== r.category) { patch.category = cat; patch.subtitle = SUB[cat]; stats.recategorized++; }

  if (Object.keys(patch).length) {
    const res = await fetch(`${SB}/rest/v1/products?id=eq.${r.id}`, { method: "PATCH", headers: { ...sbHeaders, Prefer: "return=minimal" }, body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }) });
    if (!res.ok) { console.log("ХАТО", r.slug, res.status, await res.text()); process.exit(1); }
    console.log(`${r.slug}: ${patch.active === false ? "ПИНҲОН " : ""}${patch.category ? r.category + "→" + patch.category + " " : ""}${patch.name ? "ном " : ""}${patch.description ? "тавсиф" : ""} | ${name.slice(0, 60)}`);
  }
}
console.log("\n", rows.length, "маҳсулоти CJ санҷида шуд:", stats);
