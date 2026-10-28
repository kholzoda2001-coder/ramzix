"use client";

import { useCallback, useEffect, useState } from "react";

/* Профил ва таърихи фармоишҳо — ҳоло дар худи дастгоҳ нигоҳ дошта мешавад (то пайвастани сервер) */

export type Profile = { name: string; phone: string; shop: string; country: "tj" | "ae"; address: string };
export type OrderLine = { slug: string; qty: number; size?: string; color?: string };
export type Order = { id: number; date: string; count: number; totalTjs: number; lines: OrderLine[] };
type Store = { profile: Profile; orders: Order[] };

const KEY = "ramzix-profile-v1";
const EVENT = "ramzix-profile-change";
export const EMPTY_PROFILE: Profile = { name: "", phone: "", shop: "", country: "tj", address: "" };

const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : "");

export function readStore(): Store {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "{}");
    const p = d?.profile ?? {};
    const orders: Order[] = Array.isArray(d?.orders)
      ? d.orders.flatMap((o: Order): Order[] =>
          o && typeof o.id === "number" && Array.isArray(o.lines) && Number.isFinite(o.totalTjs)
            ? [{ id: o.id, date: str(o.date), count: Number(o.count) || 0, totalTjs: o.totalTjs, lines: o.lines.filter((l) => l && typeof l.slug === "string" && Number(l.qty) > 0) }]
            : [],
        )
      : [];
    // Маълумоти кӯҳна: шаҳр ба суроғаи пурра ҳамроҳ мешавад
    const address = [str(p.city), str(p.address)].filter(Boolean).join(", ");
    return { profile: { name: str(p.name), phone: str(p.phone), shop: str(p.shop), country: p.country === "ae" ? "ae" : "tj", address }, orders };
  } catch {
    return { profile: EMPTY_PROFILE, orders: [] };
  }
}

function write(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function saveProfile(profile: Profile) { write({ ...readStore(), profile }); }

export function addOrder(o: Omit<Order, "id" | "date">): number {
  const s = readStore();
  const id = Date.now();
  write({ ...s, orders: [{ ...o, id, date: new Date().toISOString() }, ...s.orders].slice(0, 50) });
  return id;
}

/** Рақами намоёни фармоиш: RX-123456 */
export const orderCode = (id: number) => `RX-${String(id).slice(-6)}`;

export function clearProfile() { write({ profile: EMPTY_PROFILE, orders: [] }); }

export function useProfile() {
  const [store, setStore] = useState<Store>({ profile: EMPTY_PROFILE, orders: [] });
  const [ready, setReady] = useState(false);
  const refresh = useCallback(() => setStore(readStore()), []);
  useEffect(() => {
    refresh();
    setReady(true);
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, [refresh]);
  return { ...store, ready };
}
