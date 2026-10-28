"use client";

import { useMemo, useState } from "react";
import { STATUSES, totals, useAdmin } from "@/lib/admin";
import { PayBar, StatusChip, money } from "./ui";

type Admin = ReturnType<typeof useAdmin>;

export default function Dashboard({ admin, onOpen }: { admin: Admin; onOpen: (id: string) => void }) {
  const [period, setPeriod] = useState<"all" | "month" | "week">("month");

  const data = useMemo(() => {
    const now = Date.now();
    const from = period === "all" ? 0 : now - (period === "month" ? 30 : 7) * 86400000;
    const list = admin.orders.filter((o) => o.status !== "cancelled" && new Date(o.date).getTime() >= from);
    const sum = list.reduce(
      (a, o) => { const t = totals(o); return { total: a.total + t.total, profit: a.profit + t.profit, paid: a.paid + t.paid, due: a.due + Math.max(0, t.due), cost: a.cost + t.cost }; },
      { total: 0, profit: 0, paid: 0, due: 0, cost: 0 },
    );
    const byStatus = STATUSES.map((s) => ({ ...s, n: admin.orders.filter((o) => o.status === s.id && new Date(o.date).getTime() >= from).length }));
    const debts = admin.orders.filter((o) => o.status !== "cancelled" && totals(o).due > 0.005).sort((a, b) => totals(b).due - totals(a).due).slice(0, 6);
    return { list, sum, byStatus, debts };
  }, [admin.orders, period]);

  return (
    <>
      <div className="ad-chips">
        {([["week", "7 рӯз"], ["month", "30 рӯз"], ["all", "Ҳама вақт"]] as const).map(([id, l]) => <button key={id} className={period === id ? "on" : ""} onClick={() => setPeriod(id)}>{l}</button>)}
      </div>

      <div className="ad-kpis">
        <div><span>Фармоишҳо</span><b>{data.list.length}</b></div>
        <div><span>Гардиши фурӯш</span><b>{money(data.sum.total)}</b><small>смн</small></div>
        <div className="g"><span>Фоидаи соф</span><b>{money(data.sum.profit)}</b><small>смн{data.sum.cost > 0 && ` · ${Math.round((data.sum.profit / data.sum.cost) * 100)}%`}</small></div>
        <div><span>Гирифта шуд</span><b>{money(data.sum.paid)}</b><small>смн</small></div>
        <div className="r"><span>Қарз (бояд гирем)</span><b>{money(data.sum.due)}</b><small>смн</small></div>
        <div><span>Хароҷот</span><b>{money(data.sum.cost)}</b><small>смн</small></div>
      </div>

      <section className="ad-card">
        <h3>Аз рӯи ҳолат</h3>
        <div className="ad-stat-list">
          {data.byStatus.map((s) => (
            <div key={s.id}><i style={{ background: s.color }} /><span>{s.label}</span><b>{s.n}</b></div>
          ))}
        </div>
      </section>

      <section className="ad-card">
        <h3>Пардохт нагирифташуда</h3>
        {data.debts.length === 0 ? <p className="ad-empty">Қарз нест 🎉</p> : (
          <div className="ad-list">
            {data.debts.map((o) => {
              const t = totals(o);
              return (
                <button className="ad-order slim" key={o.id} onClick={() => onOpen(o.id)}>
                  <div className="ao-top"><b>{o.code}</b><span className="ao-who-inline">{o.customer.name || "Бе ном"}</span><StatusChip status={o.status} /></div>
                  <div className="ao-money"><b className="r">{money(t.due)} смн</b><small>аз {money(t.total)} · {t.paidPct}%</small></div>
                  <PayBar order={o} />
                </button>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
