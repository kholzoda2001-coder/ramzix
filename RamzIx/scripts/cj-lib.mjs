// Ёрирасонҳои умумӣ барои скриптҳои CJdropshipping.
import { readFileSync } from "node:fs";

export const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
export const SB = env.NEXT_PUBLIC_SUPABASE_URL, SBK = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SB || !SBK) throw new Error(".env.local: Supabase пур нест");
export const sbHeaders = { apikey: SBK, Authorization: `Bearer ${SBK}`, "Content-Type": "application/json" };

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const GAP = 1300; // CJ: ~1 дархост дар сония

export async function cjToken() {
  if (!env.CJ_API_KEY) throw new Error(".env.local: CJ_API_KEY нест");
  const r = await (await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey: env.CJ_API_KEY }) })).json();
  if (!r?.data?.accessToken) throw new Error("CJ: токен гирифта нашуд — " + r?.message);
  return r.data.accessToken;
}
export const cj = async (path, token) => (await fetch(`https://developers.cjdropshipping.com/api2.0/v1/${path}`, { headers: { "CJ-Access-Token": token } })).json();

export const nums = (v) => String(v ?? "").match(/[\d.]+/g)?.map(Number).filter((n) => n > 0) ?? [];

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", times: "×", deg: "°", plusmn: "±", le: "≤", ge: "≥" };
const decode = (s) => s.replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (m, e) =>
  e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENT[e.toLowerCase()] ?? m);
/** HTML → матни оддӣ (бо рамзҳои &lt; ва ғайра кушодашуда) */
export const text = (h) => decode(String(h ?? "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, " ")).replace(/\s*\n\s*/g, "\n").replace(/[ \t]+/g, " ").trim();

/** Номи кӯтоҳ: бе қавсҳои чинӣ, дар охири калимаи пурра бурида мешавад */
export function shortName(n, max = 100) {
  const s = decode(String(n ?? "")).replace(/【[^】]*】|\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ") > 40 ? cut.lastIndexOf(" ") : max).replace(/[\s,;:\-–/(]+$/, "");
}

/* Категорияи сайт аз рӯи номи маҳсулот. null — ба сайт намеҳад (пинҳон мешавад).
   Категорияи худи CJ барои ин боэътимод нест. */
const SKIP = /\bwom[ae]n|\blad(y|ies)\b|girl|toy|kids?\b|bab(y|ies)|child|\bpets?\b|puzzle|mouse trap|ornament|dressing table|socks?\b|control arm|regulator|steering|nissan|honda|dodge|toyota|car door|repair adhesive|\btent\b|passport|key case|110v|us plug|blouse|dress\b|skirt|bra\b/i;
const MEN = /\bmen\b|\bmens\b|men's|male/i;
// Либос бе нишони «мардона» — сайт категорияи занона надорад
const CLOTHES = /t-shirt|jacket|hoodie|shirt|sweater|pullover|vest\b|pants|coat\b|shawl|jeans/i;
// Тартиб муҳим аст: қоидаи аввалини мувофиқ ғолиб аст
const RULES = [
  ["home", /\blamp\b|kitchen/i],
  ["phones", /charger|charging station|power bank/i],
  ["audio", /earphone|headphone|earbud|ear-clip|in-ear|over-ear|speaker|microphone|lavalier|\bradio\b/i],
  ["phones", /phone (holder|stand|charm|case)|usb cable|type[- ]c cable|smart ?watch|bracelet|fm transmitter/i],
  ["beauty", /hair|makeup|skin|nail|massag|comb\b|mirror|facial|face\b|shower|serum|beauty/i],
  ["men", MEN],
  ["office", /desk|mouse pad|wireless mouse|keyboard|notebook|laptop|stationery|\bpen\b/i],
  ["home", /light|candle|towel|faucet|storage|organizer|hook|whisk|mixer|soap|cleaner|tray|rod\b|bag\b|bath|curtain/i],
];
export function classify(name) {
  if (SKIP.test(name) || (CLOTHES.test(name) && !MEN.test(name))) return null;
  return RULES.find(([, re]) => re.test(name))?.[0] ?? null;
}
export const SUB = { audio: "Аудио ва микрофон", phones: "Телефон ва аксессуар", men: "Либоси мардона", home: "Хона ва ошхона", beauty: "Зебоӣ ва саломатӣ", office: "Компютер ва офис" };
