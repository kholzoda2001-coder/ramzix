"use client";

import { useMemo, useState } from "react";
import { PAY_METHODS, STATUSES, itemProfit, itemSell, newId, round, totals, useAdmin, type Item, type Order, type OrderType } from "@/lib/admin";
import { costPerUnit } from "@/lib/pricing";
import { products as catalog, unitOf } from "@/lib/catalog";
import { getDefaultMarkup } from "./settings-store";
import { money } from "./ui";

type Draft = { id: string; name: string; qty: string; unit: string; cost: string; markup: string };
const blank = (markup: number): Draft => ({ id: newId(), name: "", qty: "1", unit: "дона", cost: "", markup: String(markup) });
const n = (s: string) => (Number.isFinite(parseFloat(s.replace(",", "."))) ? parseFloat(s.replace(",", ".")) : 0);

/* POS / фармоиши нав: маҳсулот, хароҷоти харид, фоизи фоида → нархи фурӯш ва фоида худкор */
export default function OrderForm({ initial, onDone }: { initial?: Order; onDone: (id: string) => void }) {
  const admin = useAdmin();
  const defaultMarkup = getDefaultMarkup();
  const [type, setType] = useState<OrderType>(initial?.type ?? "pos");
  const [cust, setCust] = useState(initial?.customer ?? { name: "", phone: "", address: "" });
  const [mode, setMode] = useState<"unit" | "total">("total");
  const [rows, setRows] = useState<Draft[]>(
    initial
      ? initial.items.map((i) => ({ id: i.id, name: i.name, qty: String(i.qty), unit: i.unit, cost: String(i.costTotal), markup: String(i.markupPct) }))
      : [blank(defaultMarkup)],
  );
  const [shipCharged, setShipCharged] = useState(String(initial?.shippingCharged ?? 0));
  const [shipCost, setShipCost] = useState(String(initial?.shippingCost ?? 0));
  const [status, setStatus] = useState(initial?.status ?? "confirmed");
  const [note, setNote] = useState(initial?.note ?? "");
  const [pay, setPay] = useState({ amount: "", method: PAY_METHODS[0] });
  const [err, setErr] = useState("");

  // Маҳсулоти дастрас барои пешниҳоди ном
  const suggestions = useMemo(
    () => [
      ...admin.products.map((p) => ({ name: p.name, unit: p.unit, unitCost: p.unitCost, markup: p.markupPct })),
      ...catalog.map((p) => ({ name: p.name, unit: unitOf(p), unitCost: Math.round(costPerUnit(p) * 100) / 100, markup: undefined as number | undefined })),
    ],
    [admin.products],
  );

  const items: Item[] = rows.map((r) => {
    const qty = n(r.qty);
    const costTotal = mode === "total" ? n(r.cost) : n(r.cost) * qty;
    return { id: r.id, name: r.name.trim(), qty, unit: r.unit, costTotal: round(costTotal), markupPct: n(r.markup) };
  });
  const preview: Order = { id: "", code: "", type, date: "", customer: cust, items, shippingCharged: n(shipCharged), shippingCost: n(shipCost), status, payments: [], note };
  const t = totals(preview);

  const setRow = (id: string, patch: Partial<Draft>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const pick = (id: string, name: string) => {
    const s = suggestions.find((x) => x.name === name);
    if (!s) return setRow(id, { name });
    setRow(id, { name, unit: s.unit, ...(mode === "unit" ? { cost: String(s.unitCost) } : {}), ...(s.markup !== undefined ? { markup: String(s.markup) } : {}) });
  };

  const save = () => {
    if (!items.some((i) => i.name && i.qty > 0 && i.costTotal > 0)) return setErr("Камаш як маҳсулот бо ном, миқдор ва нарх лозим аст");
    if (type === "request" && !cust.name.trim()) return setErr("Номи харидорро нависед");
    setErr("");
    const valid = items.filter((i) => i.name && i.qty > 0);
    const id = admin.saveOrder({
      id: initial?.id, code: initial?.code, date: initial?.date, type,
      customer: { name: cust.name.trim(), phone: cust.phone.trim(), address: cust.address.trim() },
      items: valid, shippingCharged: n(shipCharged), shippingCost: n(shipCost), status,
      payments: initial?.payments ?? [], note: note.trim(),
    });
    if (!initial && n(pay.amount) > 0) admin.addPayment(id, { date: new Date().toISOString(), amount: n(pay.amount), method: pay.method });
    onDone(id);
  };

  return (
    <div className="ad-form">
      <div className="ad-seg">
        <button className={type === "pos" ? "on" : ""} onClick={() => setType("pos")}>Харид аз дохили админ (POS)</button>
        <button className={type === "request" ? "on" : ""} onClick={() => setType("request")}>Дархост аз сайт</button>
      </div>

      <section className="ad-card">
        <h3>Харидор</h3>
        <label><span>Ном{type === "request" ? " *" : ""}</span><input value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} /></label>
        <label><span>Телефон</span><input type="tel" inputMode="tel" value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} /></label>
        <label><span>Суроға</span><input value={cust.address} onChange={(e) => setCust({ ...cust, address: e.target.value })} /></label>
      </section>

      <section className="ad-card">
        <div className="ad-row-h">
          <h3>Маҳсулот</h3>
          <div className="ad-mini-seg">
            <button className={mode === "total" ? "on" : ""} onClick={() => setMode("total")}>Ҷамъи харид</button>
            <button className={mode === "unit" ? "on" : ""} onClick={() => setMode("unit")}>Нархи 1 дона</button>
          </div>
        </div>
        <datalist id="ad-names">{suggestions.map((s, i) => <option key={i} value={s.name} />)}</datalist>
        {rows.map((r, idx) => {
          const it = items[idx];
          return (
            <div className="ad-item" key={r.id}>
              <div className="ad-item-top">
                <input list="ad-names" placeholder="Номи маҳсулот (масалан: собуни сафед)" value={r.name} onChange={(e) => pick(r.id, e.target.value)} />
                {rows.length > 1 && <button className="ad-x" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} aria-label="Хориҷ">✕</button>}
              </div>
              <div className="ad-grid3">
                <label><span>Миқдор</span><input inputMode="decimal" value={r.qty} onChange={(e) => setRow(r.id, { qty: e.target.value })} /></label>
                <label><span>Воҳид</span><input value={r.unit} onChange={(e) => setRow(r.id, { unit: e.target.value })} /></label>
                <label><span>Фоида %</span><input inputMode="decimal" value={r.markup} onChange={(e) => setRow(r.id, { markup: e.target.value })} /></label>
              </div>
              <label><span>{mode === "total" ? "Ҷамъи нархи харид, смн" : "Нархи харид барои 1, смн"}</span><input inputMode="decimal" value={r.cost} onChange={(e) => setRow(r.id, { cost: e.target.value })} /></label>
              {it.costTotal > 0 && (
                <div className="ad-calc">
                  <span>Харид: <b>{money(it.costTotal)}</b>{it.qty > 0 && <small> ({money(it.costTotal / it.qty)}/{it.unit})</small>}</span>
                  <span>Фурӯш: <b>{money(itemSell(it))}</b>{it.qty > 0 && <small> ({money(itemSell(it) / it.qty)}/{it.unit})</small>}</span>
                  <span className="g">Фоида: <b>{money(itemProfit(it))}</b></span>
                </div>
              )}
            </div>
          );
        })}
        <button className="ad-add" onClick={() => setRows((rs) => [...rs, blank(defaultMarkup)])}>+ Маҳсулоти дигар</button>
      </section>

      <section className="ad-card">
        <h3>Расонидан ва пардохт</h3>
        <div className="ad-grid2">
          <label><span>Расонидан аз харидор, смн</span><input inputMode="decimal" value={shipCharged} onChange={(e) => setShipCharged(e.target.value)} /></label>
          <label><span>Хароҷоти расонидани шумо, смн</span><input inputMode="decimal" value={shipCost} onChange={(e) => setShipCost(e.target.value)} /></label>
        </div>
        <label><span>Ҳолати фармоиш</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as Order["status"])}>{STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
        </label>
        {!initial && (
          <div className="ad-grid2">
          <label><span>Пардохти гирифташуда, смн</span><input inputMode="decimal" placeholder="0" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></label>
            <label><span>Тарзи пардохт</span><select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>{PAY_METHODS.map((m) => <option key={m}>{m}</option>)}</select></label>
          </div>
        )}
        {!initial && t.total > 0 && <button className="ad-link" onClick={() => setPay({ ...pay, amount: String(t.total) })}>Пурра пардохт шуд ({money(t.total)})</button>}
        <label><span>Эзоҳ</span><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></label>
      </section>

      <section className="ad-sum">
        <div><span>Хароҷот (харид + расонидан)</span><b>{money(t.cost)} смн</b></div>
        <div><span>Ба харидор</span><b>{money(t.total)} смн</b></div>
        <div className="g"><span>Фоидаи софи шумо</span><b>{money(t.profit)} смн{t.cost > 0 && <small> · {t.margin}%</small>}</b></div>
      </section>

      {err && <p className="ad-err">{err}</p>}
      <button className="ad-primary" onClick={save}>{initial ? "Нигоҳ доштан" : "Сабт кардан"}</button>
    </div>
  );
}
