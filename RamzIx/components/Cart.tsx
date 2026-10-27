"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { CountryCode } from "@/lib/catalog";
import Icon from "./Icon";

export type Line = { slug: string; qty: number; size?: string; color?: string };
/** Як маҳсулот бо андоза ва рангҳои гуногун — сатрҳои гуногуни сабад */
export const lineKey = (l: { slug: string; size?: string; color?: string }) => `${l.slug}|${l.size ?? ""}|${l.color ?? ""}`;
type Modes = Partial<Record<CountryCode, string>>;

type CartCtx = {
  lines: Line[];
  modes: Modes;
  ready: boolean;
  count: number;
  add: (line: Line, label: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  setMode: (country: CountryCode, mode: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx>({
  lines: [], modes: {}, ready: false, count: 0,
  add: () => {}, setQty: () => {}, remove: () => {}, setMode: () => {}, clear: () => {},
});
export const useCart = () => useContext(Ctx);

const KEY = "ramzix-cart-v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [modes, setModes] = useState<Modes>({});
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const d = JSON.parse(saved);
        setLines(d.lines ?? []);
        setModes(d.modes ?? {});
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify({ lines, modes })); } catch {}
  }, [lines, modes, ready]);

  const add = useCallback((line: Line, label: string) => {
    setLines((prev) => {
      const key = lineKey(line);
      const old = prev.find((l) => lineKey(l) === key);
      return [...prev.filter((l) => lineKey(l) !== key), { ...line, qty: +((old?.qty ?? 0) + line.qty).toFixed(2) }];
    });
    setToast(label);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) => prev.map((l) => (lineKey(l) === key ? { ...l, qty } : l)));
  }, []);
  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => lineKey(l) !== key)), []);
  const setMode = useCallback((country: CountryCode, mode: string) => setModes((m) => ({ ...m, [country]: mode })), []);
  const clear = useCallback(() => setLines([]), []);

  return (
    <Ctx.Provider value={{ lines, modes, ready, count: lines.length, add, setQty, remove, setMode, clear }}>
      {children}
      <div className={`toast ${toast ? "show" : ""}`} role="status">
        <span className="toast-ic"><Icon name="check" size={16} stroke={2.6} /></span>
        {toast}
      </div>
    </Ctx.Provider>
  );
}

export function CartBadge() {
  const { count } = useCart();
  return count > 0 ? <span className="badge">{count > 99 ? "99+" : count}</span> : null;
}
