"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { COUNTRIES, fmt, fmtPrice, fmtQty, getProduct, unitOf, waLink } from "@/lib/catalog";
import { modesFor, priceOrder, rfqFromOf } from "@/lib/pricing";
import { FEE_TIERS, MIN_FEE, QUOTE_VALID_HOURS } from "@/lib/pricing-config";
import { useCart } from "./Cart";
import Flag from "./Flag";
import Icon from "./Icon";
import ProductImage from "./ProductImage";

const round2 = (n: number) => Math.round(n * 100) / 100;

export default function CartView() {
  const router = useRouter();
  const { lines, modes, ready, setQty, remove, setMode, clear } = useCart();
  const order = useMemo(() => priceOrder(lines, modes, getProduct), [lines, modes]);

  const back = () => (history.length > 1 ? router.back() : router.push("/"));

  if (!ready) return <CartShell onBack={back}><div className="cart-empty" /></CartShell>;

  if (order.groups.length === 0) {
    return (
      <CartShell onBack={back}>
        <div className="cart-empty">
          <span className="cart-empty-ic"><Icon name="cart" size={34} stroke={1.5} /></span>
          <b>Сабад холӣ аст</b>
          <span>Маҳсулотро интихоб кунед ва ба сабад илова намоед</span>
          <Link href="/" className="btn btn-orange" style={{ marginTop: 14 }}>Ба каталог</Link>
        </div>
      </CartShell>
    );
  }

  // Прогресси то зинаи навбатии ҳаққи хизмат
  const next = order.next;
  const prevFrom = FEE_TIERS.filter((t) => t.from <= order.goods).pop()!.from;
  const progress = next ? Math.min(100, ((order.goods - prevFrom) / (next.from - prevFrom)) * 100) : 100;

  const message = buildMessage();

  function buildMessage() {
    const rows: string[] = ["Салом! Фармоиши нав аз RamzIx:", ""];
    let n = 1;
    for (const g of order.groups) {
      rows.push(`📦 ${COUNTRIES[g.country].name}:`);
      for (const l of g.lines) {
        rows.push(`${n++}) ${l.p.name} — ${fmtQty(l.qty)} ${unitOf(l.p)} × ${fmtPrice(l.unit)} = ${fmt(l.goods)} смн`);
      }
      rows.push(`   Расонидан (${g.shipping.mode.label}, ${fmtQty(round2(g.kg))} кг): ${g.shipping.tjs > 0 ? fmt(g.shipping.tjs) + " смн" : "бо тасдиқ"}`, "");
    }
    rows.push(
      `Нархи мол: ${fmt(order.goods)} смн`,
      `Ҳаққи хизмат (${order.feePct}%): ${fmt(order.fee)} смн`,
      `Расонидан: ${fmt(order.shipping)} смн`,
      `Ҷамъ: ${fmt(order.total)} смн`,
    );
    return rows.join("\n");
  }

  return (
    <CartShell onBack={back} onClear={clear}>
      {order.groups.map((g) => {
        const country = COUNTRIES[g.country];
        const modeList = modesFor(g.country);
        return (
          <section className="cart-group" key={g.country}>
            <div className="cg-head">
              <Flag code={g.country} className="cg-flag" />
              <b>{g.country === "tj" ? "Тоҷикистон" : `Аз ${country.short}`}</b>
              <span>{g.lines.length} маҳсулот · {fmtQty(round2(g.kg))} кг</span>
            </div>

            {g.lines.map((l) => {
              const step = l.p.sale?.step ?? 1;
              const min = l.p.sale?.min ?? 1;
              const unit = unitOf(l.p);
              const set = (v: number) => setQty(l.p.slug, Math.max(min, round2(Math.round(v / step) * step)));
              const rfq = l.qty >= rfqFromOf(l.p);
              return (
                <div className="cl" key={l.p.slug}>
                  <Link href={`/product/${l.p.slug}`} className="cl-img"><ProductImage src={l.p.images[0]} alt={l.p.name} /></Link>
                  <div className="cl-body">
                    <Link href={`/product/${l.p.slug}`} className="cl-name">{l.p.name}</Link>
                    <div className="cl-price">
                      <b>{fmtPrice(l.unit)}</b> смн / {unit}
                      {l.p.sale?.per && <small> · {l.p.sale.per} {l.p.sale.perLabel}</small>}
                    </div>
                    <div className="cl-ctrl">
                      <div className="cl-qty">
                        <button onClick={() => set(l.qty - step)} disabled={l.qty <= min} aria-label="Кам"><Icon name="minus" size={16} stroke={2.4} /></button>
                        <span>{fmtQty(l.qty)} <small>{unit}</small></span>
                        <button onClick={() => set(l.qty + step)} aria-label="Зиёд"><Icon name="plus" size={16} stroke={2.4} /></button>
                      </div>
                      <b className="cl-sum">{fmt(l.goods)} смн</b>
                    </div>
                    {rfq && <div className="cl-warn">Миқдори калон: менеҷер нархи махсус медиҳад</div>}
                  </div>
                  <button className="cl-del" onClick={() => remove(l.p.slug)} aria-label="Хориҷ кардан"><Icon name="close" size={18} /></button>
                </div>
              );
            })}

            <div className="cg-ship">
              <div className="cg-ship-head"><Icon name="truck" size={18} /><b>Расонидан</b></div>
              {modeList.length > 1 && (
                <div className="modes">
                  {modeList.map((m) => (
                    <button key={m.id} className={m.id === g.shipping.mode.id ? "on" : ""} onClick={() => setMode(g.country, m.id)}>
                      <b>{m.label}</b>
                      <small>{m.daysMin}–{m.daysMax} рӯз</small>
                    </button>
                  ))}
                </div>
              )}
              <div className="est-row">
                <span>
                  {g.shipping.mode.label}, {fmtQty(round2(g.kg))} кг
                  <small>
                    {g.shipping.mode.daysMin}–{g.shipping.mode.daysMax} рӯз
                    {g.shipping.basis === "m3" ? " · аз рӯи ҳаҷм" : ""}
                    {g.shipping.mode.assumed ? " · нарх тахминӣ" : ""}
                    {g.shipping.mode.note ? ` · ${g.shipping.mode.note}` : ""}
                  </small>
                </span>
                <b>{g.shipping.tjs > 0 ? `${fmt(g.shipping.tjs)} смн` : "бо тасдиқ"}</b>
              </div>
            </div>
          </section>
        );
      })}

      {/* Ҳаққи хизмат: то зинаи навбатӣ */}
      <div className="fee-card">
        {next ? (
          <>
            <div className="fee-line">
              <Icon name="bolt" size={16} />
              Боз <b>{fmt(next.need)} смн</b> мол харед: ҳаққи хизмат <b>{next.pct}%</b> мешавад
            </div>
            <div className="fee-bar"><i style={{ width: `${progress}%` }} /></div>
          </>
        ) : (
          <div className="fee-line"><Icon name="check" size={16} stroke={2.6} /> Ҳаққи хизмати ҳадди ақал: <b>{order.feePct}%</b></div>
        )}
      </div>

      <div className="sum-card">
        <div className="est-row"><span>Нархи мол</span><b>{fmt(order.goods)} смн</b></div>
        <div className="est-row">
          <span>
            Ҳаққи хизмат ({order.feePct}%)
            {order.minFeeApplied && <small>Ҳадди ақал {MIN_FEE} смн барои фармоиш</small>}
          </span>
          <b>{fmt(order.fee)} смн</b>
        </div>
        <div className="est-row"><span>Расонидан</span><b>{order.shipping > 0 ? `${fmt(order.shipping)} смн` : "бо тасдиқ"}</b></div>
        <div className="est-total"><span>Ҷамъ</span><b>{fmt(order.total)} смн</b></div>
        <p className="est-note">Нарх {QUOTE_VALID_HOURS} соат дуруст аст. Пеш аз харид менеҷер мавҷудият ва нархро тасдиқ мекунад.</p>
      </div>

      <div className="cart-bar">
        <div className="cb-total"><small>Ҷамъ</small><b>{fmt(order.total)} смн</b></div>
        <a className="cb-btn" href={waLink(message)} target="_blank" rel="noreferrer">
          <Icon name="wa" size={20} /> Фиристодани фармоиш
        </a>
      </div>
    </CartShell>
  );
}

function CartShell({ children, onBack, onClear }: { children: React.ReactNode; onBack: () => void; onClear?: () => void }) {
  return (
    <>
      <header className="cart-top">
        <button className="ic-round" onClick={onBack} aria-label="Бозгашт"><Icon name="back" stroke={2.2} /></button>
        <h1>Сабад</h1>
        {onClear ? <button className="cart-clear" onClick={onClear}>Тоза кардан</button> : <span />}
      </header>
      <main className="cart-main">{children}</main>
    </>
  );
}
