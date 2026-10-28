"use client";

import { useMemo, useState } from "react";
import { PAY_LABEL, PAY_METHODS, STATUSES, itemProfit, itemSell, totals, useAdmin, type Order } from "@/lib/admin";
import { WHATSAPP } from "@/lib/catalog";
import OrderForm from "./OrderForm";
import { PayBar, PayChip, Sheet, StatusChip, dateStr, money } from "./ui";

type Admin = ReturnType<typeof useAdmin>;

export default function Orders({ admin, openId, onOpen }: { admin: Admin; openId: string | null; onOpen: (id: string | null) => void }) {
  const [q, setQ] = useState("");
  const [st, setSt] = useState<string>("all");
  const [pay, setPay] = useState<string>("all");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return admin.orders.filter((o) => {
      const t = totals(o);
      if (st !== "all" && o.status !== st) return false;
      if (pay !== "all" && t.payStatus !== pay) return false;
      return !s || `${o.code} ${o.customer.name} ${o.customer.phone} ${o.items.map((i) => i.name).join(" ")}`.toLowerCase().includes(s);
    });
  }, [admin.orders, q, st, pay]);

  const open = admin.orders.find((o) => o.id === openId) ?? null;

  return (
    <>
      <input className="ad-search" placeholder="Ҷустуҷӯ: рақам, ном, телефон, маҳсулот" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="ad-chips">
        {[{ id: "all", label: "Ҳама" }, ...STATUSES].map((s) => <button key={s.id} className={st === s.id ? "on" : ""} onClick={() => setSt(s.id)}>{s.label}</button>)}
      </div>
      <div className="ad-chips">
        {[["all", "Ҳама пардохт"], ["unpaid", PAY_LABEL.unpaid], ["partial", PAY_LABEL.partial], ["paid", PAY_LABEL.paid]].map(([id, label]) => <button key={id} className={pay === id ? "on" : ""} onClick={() => setPay(id)}>{label}</button>)}
      </div>

      {list.length === 0 ? (
        <p className="ad-empty">{admin.orders.length === 0 ? "Ҳоло фармоиш нест. Аз «POS» фармоиши нав сабт кунед." : "Чизе ёфт нашуд"}</p>
      ) : (
        <div className="ad-list">
          {list.map((o) => {
            const t = totals(o);
            return (
              <button className="ad-order" key={o.id} onClick={() => onOpen(o.id)}>
                <div className="ao-top"><b>{o.code}</b><span className="ao-type">{o.type === "pos" ? "POS" : "Сайт"}</span><StatusChip status={o.status} /></div>
                <div className="ao-who">{o.customer.name || "Бе ном"}{o.customer.phone && <small> · {o.customer.phone}</small>}</div>
                <div className="ao-items">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</div>
                <div className="ao-money"><b>{money(t.total)} смн</b><span className="g">+{money(t.profit)}</span><PayChip order={o} /></div>
                <PayBar order={o} />
                <small className="ao-date">{dateStr(o.date)}</small>
              </button>
            );
          })}
        </div>
      )}

      <Sheet open={!!open} onClose={() => onOpen(null)} title={open ? open.code : ""}>
        {open && <Detail key={open.id} order={open} admin={admin} onClose={() => onOpen(null)} />}
      </Sheet>
    </>
  );
}

function Detail({ order: o, admin, onClose }: { order: Order; admin: Admin; onClose: () => void }) {
  const t = totals(o);
  const [edit, setEdit] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(PAY_METHODS[0]);
  const [confirmDel, setConfirmDel] = useState(false);

  if (edit) return <OrderForm initial={o} onDone={() => setEdit(false)} />;

  const addPay = () => {
    const a = parseFloat(amount.replace(",", "."));
    if (!(a > 0)) return;
    admin.addPayment(o.id, { date: new Date().toISOString(), amount: a, method });
    setAmount("");
  };
  const phone = o.customer.phone.replace(/[^\d+]/g, "");

  return (
    <div className="ad-detail">
      <div className="ad-d-head">
        <StatusChip status={o.status} /> <PayChip order={o} /> <small>{dateStr(o.date)}</small>
      </div>

      <section className="ad-card">
        <h3>Харидор</h3>
        <p><b>{o.customer.name || "Бе ном"}</b></p>
        {o.customer.phone && (
          <p className="ad-contact">
            <a href={`tel:${phone}`}>📞 {o.customer.phone}</a>
            <a href={`https://wa.me/${phone.replace(/^\+/, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>
          </p>
        )}
        {o.customer.address && <p>📍 {o.customer.address}</p>}
        {o.note && <p className="ad-note">📝 {o.note}</p>}
      </section>

      <section className="ad-card">
        <h3>Маҳсулот</h3>
        <table className="ad-table">
          <thead><tr><th>Ном</th><th>Харид</th><th>Фурӯш</th><th>Фоида</th></tr></thead>
          <tbody>
            {o.items.map((i) => (
              <tr key={i.id}>
                <td>{i.name}<small>{i.qty} {i.unit} · {i.markupPct}%</small></td>
                <td>{money(i.costTotal)}</td><td>{money(itemSell(i))}</td><td className="g">{money(itemProfit(i))}</td>
              </tr>
            ))}
            {(o.shippingCharged > 0 || o.shippingCost > 0) && (
              <tr><td>Расонидан</td><td>{money(o.shippingCost)}</td><td>{money(o.shippingCharged)}</td><td className="g">{money(o.shippingCharged - o.shippingCost)}</td></tr>
            )}
          </tbody>
          <tfoot><tr><td>Ҷамъ</td><td>{money(t.cost)}</td><td>{money(t.total)}</td><td className="g">{money(t.profit)}</td></tr></tfoot>
        </table>
        <p className="ad-hint">Фоидаи софи шумо: <b>{money(t.profit)} смн</b>{t.cost > 0 && ` (${t.margin}% болои хароҷот)`}</p>
      </section>

      <section className="ad-card">
        <h3>Пардохт</h3>
        <div className="ad-pay-sum">
          <div><span>Ҷамъ</span><b>{money(t.total)}</b></div>
          <div><span>Гирифта шуд</span><b className="g">{money(t.paid)} <small>{t.paidPct}%</small></b></div>
          <div><span>Боқимонда</span><b className={t.due > 0.005 ? "r" : ""}>{money(Math.max(0, t.due))}</b></div>
        </div>
        <PayBar order={o} />
        {o.payments.length > 0 && (
          <ul className="ad-pays">
            {o.payments.map((p) => (
              <li key={p.id}><span>{dateStr(p.date)} · {p.method}</span><b>{money(p.amount)}</b><button onClick={() => admin.removePayment(o.id, p.id)} aria-label="Хориҷ">✕</button></li>
            ))}
          </ul>
        )}
        {t.due > 0.005 && (
          <>
            <div className="ad-grid2">
              <label><span>Маблағ, смн</span><input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
              <label><span>Тарз</span><select value={method} onChange={(e) => setMethod(e.target.value)}>{PAY_METHODS.map((m) => <option key={m}>{m}</option>)}</select></label>
            </div>
            <div className="ad-quick">
              <button onClick={() => setAmount(String(t.due))}>Пурра ({money(t.due)})</button>
              <button onClick={() => setAmount(String(Math.round(t.total * 0.3 * 100) / 100))}>30%</button>
              <button onClick={() => setAmount(String(Math.round(t.total * 0.5 * 100) / 100))}>50%</button>
            </div>
            <button className="ad-primary" onClick={addPay}>Пардохтро сабт кардан</button>
          </>
        )}
      </section>

      <section className="ad-card">
        <h3>Ҳолати фармоиш</h3>
        <div className="ad-chips wrap">
          {STATUSES.map((s) => <button key={s.id} className={o.status === s.id ? "on" : ""} style={o.status === s.id ? { background: s.color, borderColor: s.color, color: "#fff" } : undefined} onClick={() => admin.patchOrder(o.id, { status: s.id })}>{s.label}</button>)}
        </div>
      </section>

      <div className="ad-actions">
        <button className="ad-ghost" onClick={() => setEdit(true)}>Таҳрир</button>
        {confirmDel ? (
          <button className="ad-danger" onClick={() => { admin.deleteOrder(o.id); onClose(); }}>Ҳа, нест кардан</button>
        ) : (
          <button className="ad-ghost red" onClick={() => setConfirmDel(true)}>Нест кардан</button>
        )}
      </div>
      <small className="ad-hint">Рақами WhatsApp-и корхона: +{WHATSAPP}</small>
    </div>
  );
}
