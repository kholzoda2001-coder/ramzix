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
export const MAX_QTY = 99999;
const clampQty = (q: number) => Math.min(MAX_QTY, Math.max(0, Math.round(q * 100) / 100));

/* Маълумоти хотираро тафтиш мекунад: агар вайрон бошад, сабад намешиканад */
function cleanLines(raw: unknown): Line[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((l): Line[] => {
    if (!l || typeof l !== "object" || typeof (l as Line).slug !== "string") return [];
    const q = clampQty(Number((l as Line).qty));
    if (!Number.isFinite(q) || q <= 0) return [];
    const { size, color } = l as Line;
    return [{ slug: (l as Line).slug, qty: q, size: typeof size === "string" ? size : undefined, color: typeof color === "string" ? color : undefined }];
  });
}
function cleanModes(raw: unknown): Modes {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => typeof v === "string")) as Modes;
}

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
        setLines(cleanLines(d?.lines));
        setModes(cleanModes(d?.modes));
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
      return [...prev.filter((l) => lineKey(l) !== key), { ...line, qty: clampQty((old?.qty ?? 0) + line.qty) }];
    });
    setToast(label);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) => prev.map((l) => (lineKey(l) === key ? { ...l, qty: clampQty(qty) } : l)));
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
