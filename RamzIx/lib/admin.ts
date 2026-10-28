"use client";

import { useCallback, useEffect, useState } from "react";

/* Маълумоти админ — ҳоло дар худи дастгоҳ (localStorage). Баъди пайвастани сервер ҳамин қабат ба Supabase иваз мешавад. */

export type OrderStatus = "new" | "confirmed" | "bought" | "shipped" | "delivered" | "cancelled";
export type OrderType = "pos" | "request";
export type Item = { id: string; name: string; qty: number; unit: string; costTotal: number; markupPct: number };
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
  status: OrderStatus;
  payments: Payment[];
  note: string;
};
export type AdminProduct = { id: string; name: string; unit: string; unitCost: number; markupPct: number; note: string };
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
      items: (o.items as Record<string, unknown>[]).map((i) => ({ id: str(i.id, 20) || uid(), name: str(i.name, 150), qty: Math.max(0, num(i.qty)), unit: str(i.unit, 20) || "дона", costTotal: Math.max(0, num(i.costTotal)), markupPct: num(i.markupPct) })),
      shippingCharged: Math.max(0, num(o.shippingCharged)), shippingCost: Math.max(0, num(o.shippingCost)),
      status: STATUSES.some((s) => s.id === o.status) ? (o.status as OrderStatus) : "new",
      payments: (Array.isArray(o.payments) ? o.payments : []).map((p: Record<string, unknown>) => ({ id: str(p.id, 20) || uid(), date: str(p.date, 40), amount: num(p.amount), method: str(p.method, 40), note: str(p.note, 200) })),
      note: str(o.note, 500),
    }];
  });
  const products = (Array.isArray(d.products) ? d.products : []).flatMap((p: Record<string, unknown>): AdminProduct[] =>
    p && typeof p.id === "string" ? [{ id: p.id, name: str(p.name, 150), unit: str(p.unit, 20) || "дона", unitCost: Math.max(0, num(p.unitCost)), markupPct: num(p.markupPct), note: str(p.note, 300) }] : []);
  return { orders, products, seq: Math.max(num(d.seq), orders.length) };
}

function read(): Store {
  try { return clean(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { return empty(); }
}
function write(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  window.dispatchEvent(new Event(EVENT));
}
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
    saveProduct: (p: Omit<AdminProduct, "id"> & { id?: string }) => mutate((s) => {
      const id = p.id ?? uid();
      return { ...s, products: s.products.some((x) => x.id === id) ? s.products.map((x) => (x.id === id ? { ...p, id } : x)) : [{ ...p, id }, ...s.products] };
    }),
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
