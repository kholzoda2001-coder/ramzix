"use client";

import { useMemo, useState } from "react";
import { PAY_METHODS, ROUTES, adminCostTjs, STATUSES, itemProfit, itemSell, newId, orderVolume, orderWeight, round, routeCost, routeOf, totals, useAdmin, type Item, type Order, type OrderType } from "@/lib/admin";
import { COUNTRIES, products as catalog, unitOf } from "@/lib/catalog";
import { costPerUnit } from "@/lib/pricing";
import ProductImage from "../ProductImage";
import { getDefaultMarkup } from "./settings-store";
import { useFx } from "./fx";

type Draft = { id: string; name: string; qty: string; unit: string; cost: string; markup: string; weight: string; vol: string; dl: string; dw: string; dh: string };
const blank = (markup: number, p: Partial<Draft> = {}): Draft => ({ id: newId(), name: "", qty: "1", unit: "дона", cost: "", markup: String(markup), weight: "", vol: "", dl: "", dw: "", dh: "", ...p });
const n = (s: string) => (Number.isFinite(parseFloat(s.replace(",", "."))) ? parseFloat(s.replace(",", ".")) : 0);
const QUICK = [3, 5, 10, 15, 20];

type Hit = { key: string; name: string; sub: string; unit: string; unitCost: number; markup?: number; weight?: number; vol?: number; country?: keyof typeof COUNTRIES; image?: string };

/* POS / фармоиши нав: ҷустуҷӯи маҳсулот → якчанд маҳсулот, вазн/ҳаҷм, расонидан аз рӯи тариф, фоизи худатон */
export default function OrderForm({ initial, onDone }: { initial?: Order; onDone: (id: string) => void }) {
  const { m, label, inp, base } = useFx();
  const admin = useAdmin();
  const defaultMarkup = getDefaultMarkup();
  const [type, setType] = useState<OrderType>(initial?.type ?? "pos");
  const [cust, setCust] = useState(initial?.customer ?? { name: "", phone: "", address: "" });
  const [mode, setMode] = useState<"unit" | "total">("total");
  const [rows, setRows] = useState<Draft[]>(
    initial
      ? initial.items.map((i) => ({ id: i.id, name: i.name, qty: String(i.qty), unit: i.unit, cost: inp(i.costTotal), markup: String(i.markupPct), weight: i.weightKg ? String(i.weightKg) : "", vol: i.volumeM3 ? String(i.volumeM3) : "", dl: "", dw: "", dh: "" }))
      : [],
  );
  const [route, setRoute] = useState(initial?.routeKey ?? "");
  const [shipCharged, setShipCharged] = useState<string | null>(initial ? inp(initial.shippingCharged) : null);
  const [shipCost, setShipCost] = useState<string | null>(initial ? inp(initial.shippingCost) : null);
  const [status, setStatus] = useState(initial?.status ?? "confirmed");
  const [note, setNote] = useState(initial?.note ?? "");
  const [pay, setPay] = useState({ amount: "", method: PAY_METHODS[0] });
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  const all: Hit[] = useMemo(
    () => [
      ...admin.products.map((p) => ({ key: "a" + p.id, name: p.name, sub: ["Маҳсулоти ман", COUNTRIES[p.country].short].join(" · "), unit: p.unit, unitCost: adminCostTjs(p), markup: p.markupPct, weight: p.weightKg || undefined, vol: p.volumeM3 || undefined, country: p.country, image: p.images[0] })),
      ...catalog.map((p) => ({
        key: p.slug, name: p.name, sub: [p.brand, COUNTRIES[p.country].short].filter(Boolean).join(" · "), unit: unitOf(p),
        unitCost: costPerUnit(p), weight: p.weightKg, vol: p.volumeM3, country: p.country, image: p.images[0],
      })),
    ],
    [admin.products],
  );
  const hits = useMemo(() => {
    const toks = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!toks.length) return [];
    return all.filter((h) => { const hay = `${h.name} ${h.sub}`.toLowerCase(); return toks.every((t) => hay.includes(t)); }).slice(0, 8);
  }, [q, all]);

  const addHit = (h: Hit) => {
    setRows((rs) => [...rs, blank(h.markup ?? defaultMarkup, {
      name: h.name, unit: h.unit, cost: inp(h.unitCost),
      weight: h.weight ? String(h.weight) : "", vol: h.vol ? String(h.vol) : "",
    })]);
    if (!route && h.country) setRoute(`${h.country}:${ROUTES.find((r) => r.country === h.country)?.mode.id ?? ""}`);
    setQ("");
  };

  const setRow = (id: string, patch: Partial<Draft>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const setDims = (id: string, patch: Partial<Draft>) =>
    setRows((rs) => rs.map((r) => {
      if (r.id !== id) return r;
      const x = { ...r, ...patch };
      const v = n(x.dl) * n(x.dw) * n(x.dh);
      return v > 0 ? { ...x, vol: String(Math.round(v) / 1e6) } : x;
    }));
  const setAllMarkup = (m: number) => setRows((rs) => rs.map((r) => ({ ...r, markup: String(m) })));

  const items: Item[] = rows.map((r) => {
    const qty = n(r.qty);
    const costTotal = base(mode === "total" ? n(r.cost) : n(r.cost) * qty);
    return { id: r.id, name: r.name.trim(), qty, unit: r.unit, costTotal: round(costTotal), markupPct: n(r.markup), weightKg: n(r.weight) || undefined, volumeM3: n(r.vol) || undefined };
  });

  const kg = orderWeight({ items });
  const m3 = orderVolume({ items });
  const calc = routeCost(route, kg, m3);
  const rt = routeOf(route);
  const charged = shipCharged ?? inp(calc.tjs);
  const cost = shipCost ?? inp(calc.tjs);

  const preview: Order = { id: "", code: "", type, date: "", customer: cust, items, shippingCharged: base(n(charged)), shippingCost: base(n(cost)), status, payments: [], note };
  const t = totals(preview);

  const save = () => {
    if (!items.some((i) => i.name && i.qty > 0 && i.costTotal > 0)) return setErr("Камаш як маҳсулот бо ном, миқдор ва нарх лозим аст");
    if (type === "request" && !cust.name.trim()) return setErr("Номи харидорро нависед");
    setErr("");
    const id = admin.saveOrder({
      id: initial?.id, code: initial?.code, date: initial?.date, type,
      customer: { name: cust.name.trim(), phone: cust.phone.trim(), address: cust.address.trim() },
      items: items.filter((i) => i.name && i.qty > 0), routeKey: route || undefined,
      shippingCharged: base(n(charged)), shippingCost: base(n(cost)), status,
      payments: initial?.payments ?? [], note: note.trim(),
    });
    if (!initial && n(pay.amount) > 0) admin.addPayment(id, { date: new Date().toISOString(), amount: pay.amount === inp(t.total) ? t.total : base(n(pay.amount)), method: pay.method });
    onDone(id);
  };

  return (
    <div className="ad-form">
      <div className="ad-seg">
        <button className={type === "pos" ? "on" : ""} onClick={() => setType("pos")}>Харид аз дохили админ (POS)</button>
        <button className={type === "request" ? "on" : ""} onClick={() => setType("request")}>Дархост аз сайт</button>
      </div>

      <section className="ad-card">
        <h3>Маҳсулот</h3>
        <div className="ad-find">
          <input placeholder="🔍 Номи маҳсулотро нависед…" value={q} onChange={(e) => setQ(e.target.value)} />
          {q.trim() && (
            <div className="ad-hits">
              {hits.map((h) => (
                <button key={h.key} onClick={() => addHit(h)}>
                  <span className="ad-hit-img">{h.image ? <ProductImage src={h.image} alt="" /> : "📦"}</span>
                  <span className="ad-hit-t"><b>{h.name}</b><small>{h.sub} · {m(h.unitCost)} {label}/{h.unit}</small></span>
                  <span className="ad-hit-add">+</span>
                </button>
              ))}
              <button className="ad-hit-manual" onClick={() => { setRows((rs) => [...rs, blank(defaultMarkup, { name: q.trim() })]); setQ(""); }}>
                ＋ «{q.trim()}» — маҳсулоти дастӣ (бе рӯйхат)
              </button>
            </div>
          )}
        </div>

        {rows.length === 0 && <p className="ad-hint">Маҳсулотро ҷустуҷӯ карда интихоб кунед. Якчанд маҳсулот илова кардан мумкин аст.</p>}

        {rows.length > 0 && (
          <div className="ad-row-h">
            <div className="ad-mini-seg">
              <button className={mode === "total" ? "on" : ""} onClick={() => setMode("total")}>Ҷамъи харид</button>
              <button className={mode === "unit" ? "on" : ""} onClick={() => setMode("unit")}>Нархи 1 дона</button>
            </div>
            <div className="ad-quick mini">
              <small>Фоида ҳама:</small>
              {QUICK.map((m) => <button key={m} onClick={() => setAllMarkup(m)}>{m}%</button>)}
            </div>
          </div>
        )}

        {rows.map((r, idx) => {
          const it = items[idx];
          return (
            <div className="ad-item" key={r.id}>
              <div className="ad-item-top">
                <input value={r.name} onChange={(e) => setRow(r.id, { name: e.target.value })} aria-label="Ном" />
                <button className="ad-x" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} aria-label="Хориҷ">✕</button>
              </div>
              <div className="ad-grid3">
                <label><span>Миқдор</span><input inputMode="decimal" value={r.qty} onChange={(e) => setRow(r.id, { qty: e.target.value })} /></label>
                <label><span>Воҳид</span><input value={r.unit} onChange={(e) => setRow(r.id, { unit: e.target.value })} /></label>
                <label><span>{mode === "total" ? `Ҷамъи харид, ${label}` : `Харид/1, ${label}`}</span><input inputMode="decimal" value={r.cost} onChange={(e) => setRow(r.id, { cost: e.target.value })} /></label>
              </div>
              <div className="ad-markup">
                <label><span>Фоида, %</span><input inputMode="decimal" value={r.markup} onChange={(e) => setRow(r.id, { markup: e.target.value })} /></label>
                <div className="ad-quick mini">{QUICK.map((m) => <button key={m} className={n(r.markup) === m ? "on" : ""} onClick={() => setRow(r.id, { markup: String(m) })}>{m}%</button>)}</div>
              </div>
              <div className="ad-grid2">
                <label><span>Вазни 1 {r.unit || "дона"}, кг</span><input inputMode="decimal" value={r.weight} onChange={(e) => setRow(r.id, { weight: e.target.value })} /></label>
                <label><span>Ҳаҷми 1 {r.unit || "дона"}, м³</span><input inputMode="decimal" value={r.vol} onChange={(e) => setRow(r.id, { vol: e.target.value, dl: "", dw: "", dh: "" })} /></label>
              </div>
              <div className="ad-dims">
                <small>ё андоза, см:</small>
                <input inputMode="decimal" placeholder="Дарозӣ" value={r.dl} onChange={(e) => setDims(r.id, { dl: e.target.value })} />
                <input inputMode="decimal" placeholder="Бараш" value={r.dw} onChange={(e) => setDims(r.id, { dw: e.target.value })} />
                <input inputMode="decimal" placeholder="Баландӣ" value={r.dh} onChange={(e) => setDims(r.id, { dh: e.target.value })} />
              </div>
              {it.costTotal > 0 && (
                <div className="ad-calc">
                  <span>Харид: <b>{m(it.costTotal)}</b>{it.qty > 0 && <small> ({m(it.costTotal / it.qty)}/{it.unit})</small>}</span>
                  <span>Фурӯш: <b>{m(itemSell(it))}</b>{it.qty > 0 && <small> ({m(itemSell(it) / it.qty)}/{it.unit})</small>}</span>
                  <span className="g">Фоида: <b>{m(itemProfit(it))}</b></span>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="ad-card">
        <h3>Харидор</h3>
        <label><span>Ном{type === "request" ? " *" : ""}</span><input value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} /></label>
        <label><span>Телефон</span><input type="tel" inputMode="tel" value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} /></label>
        <label><span>Суроғаи пурра</span><input value={cust.address} onChange={(e) => setCust({ ...cust, address: e.target.value })} /></label>
      </section>

      <section className="ad-card">
        <h3>Расонидан</h3>
        <label><span>Роҳ ва тариф</span>
          <select value={route} onChange={(e) => { setRoute(e.target.value); setShipCharged(null); setShipCost(null); }}>
            <option value="">Бе расонидан</option>
            {ROUTES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </label>
        {rt && (
          <div className="ad-ship-calc">
            <div><span>Вазни умумӣ</span><b>{kg} кг</b></div>
            <div><span>Ҳаҷми умумӣ</span><b>{m3} м³</b></div>
            <div><span>Аз рӯи вазн</span><b>{m(calc.byKgTjs)}</b></div>
            {rt.mode.perM3Usd ? <div><span>Аз рӯи ҳаҷм</span><b>{m(calc.byVolTjs)}</b></div> : null}
            <div className="tot"><span>Нархи расонидан (тариф)</span><b>{m(calc.tjs)} {label}</b></div>
            {kg === 0 && m3 === 0 && <p className="ad-hint">Вазн ё ҳаҷми маҳсулотро ворид кунед, то нархи расонидан ҳисоб шавад.</p>}
          </div>
        )}
        <div className="ad-grid2">
          <label><span>{`Аз харидор, ${label}`}</span><input inputMode="decimal" value={charged} onChange={(e) => setShipCharged(e.target.value)} /></label>
          <label><span>{`Хароҷоти шумо, ${label}`}</span><input inputMode="decimal" value={cost} onChange={(e) => setShipCost(e.target.value)} /></label>
        </div>
        {(shipCharged !== null || shipCost !== null) && rt && <button className="ad-link" onClick={() => { setShipCharged(null); setShipCost(null); }}>↺ Аз тариф ҳисоб кардан</button>}
      </section>

      <section className="ad-card">
        <h3>Пардохт ва ҳолат <small className="ad-opt">(ихтиёрӣ)</small></h3>
        <p className="ad-hint">Агар ҳозир фаромӯш шуд, баъдтар дар «Фармоишҳо» ҳолат ва пардохтро иваз мекунед.</p>
        <label><span>Ҳолати фармоиш</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as Order["status"])}>{STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
        </label>
        {!initial && (
          <>
            <div className="ad-grid2">
              <label><span>{`Пардохти гирифташуда, ${label}`}</span><input inputMode="decimal" placeholder="0" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></label>
              <label><span>Тарзи пардохт</span><select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>{PAY_METHODS.map((m) => <option key={m}>{m}</option>)}</select></label>
            </div>
            {t.total > 0 && (
              <div className="ad-quick">
                <button onClick={() => setPay({ ...pay, amount: inp(t.total) })}>Пурра ({m(t.total)})</button>
                <button onClick={() => setPay({ ...pay, amount: inp(t.total * 0.3) })}>30%</button>
                <button onClick={() => setPay({ ...pay, amount: inp(t.total * 0.5) })}>50%</button>
              </div>
            )}
          </>
        )}
        <label><span>Эзоҳ</span><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></label>
      </section>

      <section className="ad-sum">
        <div><span>Хароҷот (харид + расонидан)</span><b>{m(t.cost)} {label}</b></div>
        <div><span>Ба харидор</span><b>{m(t.total)} {label}</b></div>
        <div className="g"><span>Фоидаи софи шумо</span><b>{m(t.profit)} {label}{t.cost > 0 && <small> · {t.margin}%</small>}</b></div>
      </section>

      {err && <p className="ad-err">{err}</p>}
      <button className="ad-primary" onClick={save}>{initial ? "Нигоҳ доштан" : "Сабт кардан"}</button>
    </div>
  );
}
