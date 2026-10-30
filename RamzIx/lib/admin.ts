"use client";

import { useCallback, useEffect, useState } from "react";
import { clean, empty, uid, type AdminProduct, type Order, type Payment, type Store, makeSlug } from "./admin-core";

export * from "./admin-core";

/* Маълумоти админ дар Supabase (тавассути /api/admin/*). Дар хотира нусхаи кории ҳозира нигоҳ дошта мешавад;
   ҳар тағйирот фавран нишон дода мешавад ва ба сервер фиристода мешавад (optimistic). */

export const newId = uid;
const EVENT = "ramzix-admin-change";

let cache: Store = empty();
let loaded = false;
let loading: Promise<void> | null = null;
let saveError = "";

const emit = () => window.dispatchEvent(new Event(EVENT));

async function api<T = unknown>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T }> {
  try {
    const r = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, credentials: "same-origin" });
    const data = (await r.json().catch(() => ({}))) as T;
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: {} as T };
  }
}

export function loadAdmin(force = false): Promise<void> {
  if (loaded && !force) return Promise.resolve();
  if (loading) return loading;
  loading = api<Store>("/api/admin/data").then((r) => {
    if (r.ok) { cache = clean(r.data); loaded = true; saveError = ""; } else if (r.status === 401) { loaded = false; }
    else saveError = "Пайвастшавӣ ба сервер нашуд";
    loading = null; emit();
  });
  return loading;
}

/** Фарқи ду ҳолат → фақат сатрҳои тағйирёфта ба сервер мераванд */
function persist(prev: Store, next: Store) {
  const diff = <T extends { id: string }>(a: T[], b: T[]) => {
    const old = new Map(a.map((x) => [x.id, x]));
    const cur = new Set(b.map((x) => x.id));
    return { upsert: b.filter((x) => old.get(x.id) !== x), remove: a.filter((x) => !cur.has(x.id)).map((x) => x.id) };
  };
  const p = diff(prev.products, next.products);
  const o = diff(prev.orders, next.orders);
  if (!p.upsert.length && !p.remove.length && !o.upsert.length && !o.remove.length) return;
  api("/api/admin/sync", { method: "POST", body: JSON.stringify({ products: p, orders: o }) }).then((r) => {
    if (r.status === 401) { saveError = "Сессия тамом шуд — дубора ворид шавед"; loaded = false; }
    else if (!r.ok) saveError = "Захира нашуд — интернетро санҷед";
    else saveError = "";
    emit();
  });
}

function mutate(fn: (s: Store) => Store) {
  const prev = cache;
  cache = fn(prev);
  emit();
  persist(prev, cache);
}
export const readAdminProducts = (): AdminProduct[] => cache.products;

export function useAdmin() {
  const [store, setStore] = useState<Store>(cache);
  const [ready, setReady] = useState(loaded);
  const refresh = useCallback(() => { setStore(cache); setReady(loaded); }, []);
  useEffect(() => {
    refresh();
    window.addEventListener(EVENT, refresh);
    loadAdmin();
    return () => window.removeEventListener(EVENT, refresh);
  }, [refresh]);

  return {
    ...store,
    ready,
    error: saveError,
    reload: () => loadAdmin(true),
    saveOrder(o: Omit<Order, "id" | "code" | "date"> & { id?: string; code?: string; date?: string }): string {
      const id = o.id ?? uid();
      mutate((s) => {
        const exists = s.orders.some((x) => x.id === id);
        if (exists) return { ...s, orders: s.orders.map((x) => (x.id === id ? { ...x, ...o, id } as Order : x)) };
        let seq = s.seq + 1;
        const prefix = o.type === "pos" ? "POS" : "RX";
        const taken = new Set(s.orders.map((x) => x.code));
        let code = o.code ?? `${prefix}-${String(seq).padStart(4, "0")}`;
        while (taken.has(code)) code = `${prefix}-${String(++seq).padStart(4, "0")}`;
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
    exportJson: () => JSON.stringify(cache, null, 2),
    importJson(text: string): boolean {
      try { const next = clean(JSON.parse(text)); mutate(() => next); return true; } catch { return false; }
    },
  };
}

/* ---------- PIN: санҷиш дар сервер, сессия тавассути cookie-и httpOnly ---------- */

export type Gate = "set" | "locked" | "open";
export async function gateState(): Promise<Gate> {
  const r = await api<{ state: Gate }>("/api/admin/auth");
  return r.ok ? r.data.state : "locked";
}
const post = async (body: object) => (await api("/api/admin/auth", { method: "POST", body: JSON.stringify(body) })).ok;
export const setPin = (pin: string) => post({ action: "setup", pin });
export const unlock = (pin: string) => post({ action: "login", pin });
export const changePin = (old: string, pin: string) => post({ action: "change", old, pin });
export async function lock() { await post({ action: "logout" }); cache = empty(); loaded = false; emit(); }

/* ---------- фармоиши сайт → админ ---------- */

/** Дархости чекаути сайт ба база меравад (endpoint-и ошкор, танҳо иловаи фармоиши нав) */
export function pushWebOrder(o: Omit<Order, "id" | "date" | "type" | "status" | "payments" | "note"> & { code: string; note?: string }) {
  api("/api/orders", { method: "POST", body: JSON.stringify({ ...o, id: uid() }), keepalive: true });
}
