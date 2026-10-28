"use client";

import { useCallback, useEffect, useState } from "react";
import { COUNTRIES, type CountryCode, type Product } from "./catalog";
import { SHIPPING, TO_USD, USD_TO_TJS, type Currency } from "./pricing-config";

/* Маълумоти админ — ҳоло дар худи дастгоҳ (localStorage). Баъди пайвастани сервер ҳамин қабат ба Supabase иваз мешавад. */

export type OrderStatus = "new" | "confirmed" | "bought" | "shipped" | "delivered" | "cancelled";
export type OrderType = "pos" | "request";
/** weightKg / volumeM3 — барои 1 воҳид */
export type Item = { id: string; name: string; qty: number; unit: string; costTotal: number; markupPct: number; weightKg?: number; volumeM3?: number };
export type Payment = { id: string; date: string; amount: number; method: string; note?: string };
export type Order = {
  id: string;
  code: string;
  type: OrderType;
  date: string;
  customer: { name: string; phone: string; address: string };
  items: Item[];
  shippingCharged: number;
  shippingCost: number;
  /** Роҳи расонидан, масалан "ae:cargo" (барои ҳисоби тариф) */
  routeKey?: string;
  status: OrderStatus;
  payments: Payment[];
  note: string;
};
/** Маҳсулоти админ: ҳамон сохтори сайт + идора (фаъол/пинҳон) */
export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  brand: string;
  category: string;
  country: CountryCode;
  /** нархи харид барои 1 воҳид бо асъори costCurrency */
  cost: number;
  costCurrency: Currency;
  weightKg: number;
  volumeM3: number;
  images: string[];
  description: string;
  sizes: string[];
  /** воҳиди фурӯш: дона | картон | кг */
  unit: string;
  per: number;
  perLabel: string;
  min: number;
  step: number;
  /** фоидаи пешфарз барои POS */
  markupPct: number;
  active: boolean;
  note: string;
};

export const adminCostTjs = (p: { cost: number; costCurrency: Currency }) => round(p.cost * TO_USD[p.costCurrency] * USD_TO_TJS);

const TR: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", ғ: "gh", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", ӣ: "i", й: "y", к: "k", қ: "q", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ӯ: "u", ф: "f", х: "kh", ҳ: "h", ц: "ts", ч: "ch", ҷ: "j", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
const slugify = (s: string) => s.toLowerCase().replace(/[а-яёғӣқӯҳҷ]/g, (c) => TR[c] ?? c).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
export const makeSlug = (name: string, taken: string[]) => {
  const base = slugify(name) || "tovar";
  let s = base, i = 2;
  while (taken.includes(s)) s = `${base}-${i++}`;
  return s;
};

/** Маҳсулоти админ → маҳсулоти сайт (дар каталог нишон дода мешавад) */
export function toStorefront(p: AdminProduct): Product {
  const sale =
    p.unit === "картон"
      ? { unit: "картон", per: p.per > 0 ? p.per : undefined, perLabel: p.per > 0 ? p.perLabel || "дона" : undefined, step: 1, min: Math.max(1, p.min), quick: [1, 5, 10, 20, 50], rfqFrom: 200 }
      : p.unit === "кг"
        ? { unit: "кг", step: p.step > 0 ? p.step : 1, min: p.min > 0 ? p.min : 1, quick: [1, 5, 10, 25, 50].map((x) => Math.max(x, p.min || 1)), rfqFrom: 1000, decimals: p.step > 0 && p.step < 1 }
        : undefined;
  return {
    slug: p.slug, name: p.name, subtitle: p.subtitle || null, brand: p.brand || null, category: p.category, country: p.country, source: "admin",
    cost: p.cost, costCurrency: p.costCurrency, weightKg: p.weightKg, volumeM3: p.volumeM3 || undefined,
    images: p.images.length ? p.images : ["/products/placeholder.svg"], rating: null, reviews: 0, sizes: p.sizes.length ? p.sizes : null,
    description: p.description || null, sale,
  };
}
type Store = { orders: Order[]; products: AdminProduct[]; seq: number };

export const STATUSES: { id: OrderStatus; label: string; color: string }[] = [
  { id: "new", label: "Нав", color: "#2563eb" },
  { id: "confirmed", label: "Тасдиқ шуд", color: "#7c3aed" },
  { id: "bought", label: "Харида шуд", color: "#d97706" },
  { id: "shipped", label: "Равон шуд", color: "#0891b2" },
  { id: "delivered", label: "Расонида шуд", color: "#15803d" },
  { id: "cancelled", label: "Бекор шуд", color: "#94a3b8" },
];
export const statusOf = (id: OrderStatus) => STATUSES.find((s) => s.id === id) ?? STATUSES[0];
export const PAY_METHODS = ["Нақд", "Алиф", "DC Pay", "Эсхата", "Интиқоли бонкӣ", "Дигар"];

/* ---------- ҳисобҳо ---------- */

export const round = (n: number) => Math.round(n * 100) / 100;
export const itemSell = (i: Item) => round(i.costTotal * (1 + i.markupPct / 100));
export const itemProfit = (i: Item) => round(itemSell(i) - i.costTotal);

export function totals(o: Order) {
  const goodsCost = o.items.reduce((a, i) => a + i.costTotal, 0);
  const goodsSell = o.items.reduce((a, i) => a + itemSell(i), 0);
  const cost = round(goodsCost + o.shippingCost);
  const total = round(goodsSell + o.shippingCharged);
  const profit = round(total - cost);
  const paid = round(o.payments.reduce((a, p) => a + p.amount, 0));
  const due = round(total - paid);
  const paidPct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const payStatus: "paid" | "partial" | "unpaid" = total > 0 && paid >= total - 0.005 ? "paid" : paid > 0 ? "partial" : "unpaid";
  const margin = cost > 0 ? round((profit / cost) * 100) : 0;
  return { goodsCost, goodsSell: round(goodsSell), cost, total, profit, paid, due, paidPct, payStatus, margin };
}
export const PAY_LABEL = { paid: "Пардохт шуд", partial: "Қисман пардохт", unpaid: "Пардохт нашуд" } as const;

/* ---------- расонидан: тариф аз рӯи вазн ва ҳаҷм ---------- */

export const ROUTES = (Object.keys(SHIPPING) as (keyof typeof SHIPPING)[]).flatMap((c) =>
  SHIPPING[c].map((m) => ({
    key: `${c}:${m.id}`,
    country: c,
    mode: m,
    label: `${COUNTRIES[c].short} · ${m.label}${m.perKgUsd > 0 ? ` — $${m.perKgUsd}/кг${m.perM3Usd ? `, $${m.perM3Usd}/м³` : ""}` : ""}`,
  })),
);
export const routeOf = (key?: string) => ROUTES.find((r) => r.key === key);

/** Нархи расонидан бо сомонӣ: аз вазн × нархи 1 кг ва ҳаҷм × нархи 1 м³ кадомаш зиёд бошад */
export function routeCost(key: string | undefined, kg: number, m3: number) {
  const r = routeOf(key);
  if (!r) return { tjs: 0, byKgTjs: 0, byVolTjs: 0, basis: "none" as const };
  const byKg = kg * r.mode.perKgUsd * USD_TO_TJS;
  const byVol = r.mode.perM3Usd ? m3 * r.mode.perM3Usd * USD_TO_TJS : 0;
  return { tjs: round(Math.max(byKg, byVol)), byKgTjs: round(byKg), byVolTjs: round(byVol), basis: byVol > byKg ? ("m3" as const) : byKg > 0 ? ("kg" as const) : ("none" as const) };
}
export const orderWeight = (o: Pick<Order, "items">) => round(o.items.reduce((a, i) => a + (i.weightKg ?? 0) * i.qty, 0));
export const orderVolume = (o: Pick<Order, "items">) => Math.round(o.items.reduce((a, i) => a + (i.volumeM3 ?? 0) * i.qty, 0) * 10000) / 10000;

/* ---------- нигоҳдорӣ ---------- */

const KEY = "ramzix-admin-v1";
const EVENT = "ramzix-admin-change";
const empty = (): Store => ({ orders: [], products: [], seq: 0 });
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const newId = uid;

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const str = (v: unknown, n = 300) => (typeof v === "string" ? v.slice(0, n) : "");

function clean(raw: unknown): Store {
  const d = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const orders = (Array.isArray(d.orders) ? d.orders : []).flatMap((o: Record<string, unknown>): Order[] => {
    if (!o || typeof o.id !== "string" || !Array.isArray(o.items)) return [];
    const c = (o.customer ?? {}) as Record<string, unknown>;
    return [{
      id: o.id, code: str(o.code, 20), type: o.type === "request" ? "request" : "pos", date: str(o.date, 40),
      customer: { name: str(c.name, 120), phone: str(c.phone, 40), address: str(c.address, 300) },
      items: (o.items as Record<string, unknown>[]).map((i) => ({ id: str(i.id, 20) || uid(), name: str(i.name, 150), qty: Math.max(0, num(i.qty)), unit: str(i.unit, 20) || "дона", costTotal: Math.max(0, num(i.costTotal)), markupPct: num(i.markupPct), weightKg: num(i.weightKg) || undefined, volumeM3: num(i.volumeM3) || undefined })),
      shippingCharged: Math.max(0, num(o.shippingCharged)), shippingCost: Math.max(0, num(o.shippingCost)),
      routeKey: str(o.routeKey, 30) || undefined,
      status: STATUSES.some((s) => s.id === o.status) ? (o.status as OrderStatus) : "new",
      payments: (Array.isArray(o.payments) ? o.payments : []).map((p: Record<string, unknown>) => ({ id: str(p.id, 20) || uid(), date: str(p.date, 40), amount: num(p.amount), method: str(p.method, 40), note: str(p.note, 200) })),
      note: str(o.note, 500),
    }];
  });
  const products = (Array.isArray(d.products) ? d.products : []).flatMap((p: Record<string, unknown>): AdminProduct[] => {
    if (!p || typeof p.id !== "string") return [];
    const country = (["ae", "cn", "tr", "tj"] as const).find((c) => c === p.country) ?? "ae";
    const cur = (["USD", "AED", "SAR", "CNY", "TJS"] as const).find((c) => c === p.costCurrency) ?? "TJS";
    // Маълумоти кӯҳна: unitCost (смн) → cost
    const cost = p.cost !== undefined ? Math.max(0, num(p.cost)) : Math.max(0, num(p.unitCost));
    return [{
      id: p.id, slug: str(p.slug, 80) || makeSlug(str(p.name, 150), []), name: str(p.name, 150), subtitle: str(p.subtitle, 200), brand: str(p.brand, 80),
      category: str(p.category, 30) || "home", country, cost, costCurrency: cur,
      weightKg: Math.max(0, num(p.weightKg)), volumeM3: Math.max(0, num(p.volumeM3)),
      images: (Array.isArray(p.images) ? p.images : []).filter((x): x is string => typeof x === "string").slice(0, 8),
      description: str(p.description, 3000), sizes: (Array.isArray(p.sizes) ? p.sizes : []).filter((x): x is string => typeof x === "string").slice(0, 20),
      unit: str(p.unit, 20) || "дона", per: Math.max(0, num(p.per)), perLabel: str(p.perLabel, 20), min: Math.max(0, num(p.min)), step: Math.max(0, num(p.step)),
      markupPct: num(p.markupPct), active: p.active !== false, note: str(p.note, 300),
    }];
  });
  return { orders, products, seq: Math.max(num(d.seq), orders.length) };
}

function read(): Store {
  try { return clean(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { return empty(); }
}
function write(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  window.dispatchEvent(new Event(EVENT));
}
export const readAdminProducts = (): AdminProduct[] => read().products;
const mutate = (fn: (s: Store) => Store) => write(fn(read()));

export function useAdmin() {
  const [store, setStore] = useState<Store>(empty());
  const [ready, setReady] = useState(false);
  const refresh = useCallback(() => setStore(read()), []);
  useEffect(() => {
    refresh(); setReady(true);
    window.addEventListener(EVENT, refresh); window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, [refresh]);

  return {
    ...store,
    ready,
    saveOrder(o: Omit<Order, "id" | "code" | "date"> & { id?: string; code?: string; date?: string }): string {
      const id = o.id ?? uid();
      mutate((s) => {
        const exists = s.orders.some((x) => x.id === id);
        if (exists) return { ...s, orders: s.orders.map((x) => (x.id === id ? { ...x, ...o, id } as Order : x)) };
        const seq = s.seq + 1;
        const code = o.code ?? `${o.type === "pos" ? "POS" : "RX"}-${String(seq).padStart(4, "0")}`;
        return { ...s, seq, orders: [{ ...o, id, code, date: o.date ?? new Date().toISOString() } as Order, ...s.orders] };
      });
      return id;
    },
    patchOrder: (id: string, patch: Partial<Order>) => mutate((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
    deleteOrder: (id: string) => mutate((s) => ({ ...s, orders: s.orders.filter((o) => o.id !== id) })),
    addPayment: (id: string, p: Omit<Payment, "id">) => mutate((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, payments: [...o.payments, { ...p, id: uid() }] } : o)) })),
    removePayment: (id: string, pid: string) => mutate((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, payments: o.payments.filter((p) => p.id !== pid) } : o)) })),
    saveProduct: (p: Omit<AdminProduct, "id" | "slug"> & { id?: string; slug?: string }) => mutate((s) => {
      const id = p.id ?? uid();
      const others = s.products.filter((x) => x.id !== id).map((x) => x.slug);
      const slug = p.slug ?? makeSlug(p.name, others);
      const full: AdminProduct = { ...p, id, slug };
      return { ...s, products: s.products.some((x) => x.id === id) ? s.products.map((x) => (x.id === id ? full : x)) : [full, ...s.products] };
    }),
    toggleProduct: (id: string) => mutate((s) => ({ ...s, products: s.products.map((x) => (x.id === id ? { ...x, active: !x.active } : x)) })),
    deleteProduct: (id: string) => mutate((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) })),
    exportJson: () => JSON.stringify(read(), null, 2),
    importJson(text: string): boolean {
      try { write(clean(JSON.parse(text))); return true; } catch { return false; }
    },
  };
}

/* ---------- PIN (ҳифзи оддӣ дар дастгоҳ) ---------- */

const PIN_KEY = "ramzix-admin-pin";
const SESSION = "ramzix-admin-session";
const sha = async (s: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("ramzix:" + s)))).map((b) => b.toString(16).padStart(2, "0")).join("");
export const hasPin = () => { try { return !!localStorage.getItem(PIN_KEY); } catch { return false; } };
export const isUnlocked = () => { try { return sessionStorage.getItem(SESSION) === "1"; } catch { return false; } };
export const lock = () => { try { sessionStorage.removeItem(SESSION); } catch {} };
export async function setPin(pin: string) { try { localStorage.setItem(PIN_KEY, await sha(pin)); sessionStorage.setItem(SESSION, "1"); } catch {} }
export async function unlock(pin: string): Promise<boolean> {
  try {
    if ((await sha(pin)) !== localStorage.getItem(PIN_KEY)) return false;
    sessionStorage.setItem(SESSION, "1");
    return true;
  } catch { return false; }
}

/* ---------- фармоиши сайт → админ ---------- */

/** Дархости чекаути сайт ба рӯйхати фармоишҳои админ илова мешавад (то пайвастани сервер — дар ҳамин дастгоҳ) */
export function pushWebOrder(o: Omit<Order, "id" | "date" | "type" | "status" | "payments" | "note"> & { code: string; note?: string }) {
  mutate((s) => {
    if (s.orders.some((x) => x.code === o.code)) return s;
    return { ...s, seq: s.seq + 1, orders: [{ ...o, id: uid(), type: "request", date: new Date().toISOString(), status: "new", payments: [], note: o.note ?? "" } as Order, ...s.orders] };
  });
}
