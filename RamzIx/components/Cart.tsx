"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Icon from "./Icon";

type Line = { slug: string; qty: number; unit: number };
type CartCtx = { count: number; total: number; add: (line: Line, label: string) => void };

const Ctx = createContext<CartCtx>({ count: 0, total: 0, add: () => {} });
export const useCart = () => useContext(Ctx);

const KEY = "ramzix-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setLines(JSON.parse(saved));
    } catch {}
  }, []);

  const add = useCallback((line: Line, label: string) => {
    setLines((prev) => {
      const rest = prev.filter((l) => l.slug !== line.slug);
      const old = prev.find((l) => l.slug === line.slug);
      const next = [...rest, { ...line, qty: (old?.qty ?? 0) + line.qty }];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setToast(label);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.unit, 0);

  return (
    <Ctx.Provider value={{ count, total, add }}>
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
