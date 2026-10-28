"use client";

import { PAY_LABEL, statusOf, totals, type Order } from "@/lib/admin";

export const money = (n: number) => {
  const r = Math.round(n * 100) / 100;
  const [i, f] = Math.abs(r).toFixed(2).split(".");
  return (r < 0 ? "−" : "") + i.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (f === "00" ? "" : "," + f);
};
export const dateStr = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("ru-RU") + " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

export function StatusChip({ status }: { status: Order["status"] }) {
  const s = statusOf(status);
  return <span className="ad-chip" style={{ color: s.color, background: s.color + "1a" }}>{s.label}</span>;
}

export function PayChip({ order }: { order: Order }) {
  const t = totals(order);
  const cls = t.payStatus === "paid" ? "ok" : t.payStatus === "partial" ? "mid" : "no";
  return <span className={`ad-chip pay ${cls}`}>{PAY_LABEL[t.payStatus]}{t.payStatus === "partial" ? ` · ${t.paidPct}%` : ""}</span>;
}

export function PayBar({ order }: { order: Order }) {
  const t = totals(order);
  return (
    <div className="ad-bar" title={`${t.paidPct}%`}>
      <i style={{ width: `${t.paidPct}%` }} className={t.payStatus} />
    </div>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="ad-sheet-wrap">
      <div className="ad-sheet-bg" onClick={onClose} />
      <div className="ad-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="ad-sheet-head"><b>{title}</b><button onClick={onClose} aria-label="Пӯшидан">✕</button></div>
        <div className="ad-sheet-body">{children}</div>
      </div>
    </div>
  );
}
