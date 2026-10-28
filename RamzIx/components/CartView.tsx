"use client";

import { CurrencySwitch, useMoney } from "./Currency";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { COUNTRIES, fmtQty, getProduct, unitOf, waLink } from "@/lib/catalog";
import { discountLadder, modesFor, priceOrder, rfqFromOf } from "@/lib/pricing";
import { lineKey, useCart } from "./Cart";
import Flag from "./Flag";
import Icon from "./Icon";
import ProductImage from "./ProductImage";

const round2 = (n: number) => Math.round(n * 100) / 100;

export default function CartView() {
  const { price, sum, label } = useMoney();
  const router = useRouter();
  const { lines, modes, ready, setQty, remove, setMode, clear } = useCart();
  const order = useMemo(() => priceOrder(lines, modes, getProduct), [lines, modes]);

  // Маҳсулоте, ки дигар дар каталог нест, аз сабад хориҷ мешавад (нишонаи сабад ҳам дуруст мешавад)
  useEffect(() => {
    if (!ready) return;
    lines.filter((l) => !getProduct(l.slug)).forEach((l) => remove(lineKey(l)));
  }, [ready, lines, remove]);

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

  const ladder = discountLadder();
  const reached = ladder.reduce((r, st, i) => (order.listAmount >= st.from ? i : r), 0);
  // Дарозии хати пурраи нардбон: байни нуқтаҳои зинаҳо (ҳар як зина як ҳисса)
  const lo = ladder[reached].from;
  const hi = ladder[reached + 1]?.from ?? lo;
  const within = hi > lo ? Math.min(1, (order.listAmount - lo) / (hi - lo)) : 0; // дар зинаи охирин хат ба нуқтаи охирин мерасад ва аз он намегузарад
  const fillPct = ladder.length > 1 ? ((reached + within) / (ladder.length - 1)) * 80 : 0;

  const message = buildMessage();

  function buildMessage() {
    const rows: string[] = ["Салом! Фармоиши нав аз RamzIx:", ""];
    let n = 1;
    for (const g of order.groups) {
      rows.push(`📦 ${COUNTRIES[g.country].name}:`);
      for (const l of g.lines) {
        rows.push(`${n++}) ${l.p.name}${l.color ? `, ${l.color}` : ""}${l.size ? `, ${l.size}` : ""} — ${fmtQty(l.qty)} ${unitOf(l.p)} × ${price(l.unit)} = ${sum(l.goods)} ${label}`);
      }
      rows.push(`   Расонидан (${g.shipping.mode.label}, ${fmtQty(round2(g.kg))} кг): ${g.shipping.tjs > 0 ? sum(g.shipping.tjs) + " " + label : "бо тасдиқ"}`, "");
    }
    rows.push(
      `Нархи мол: ${sum(order.listGoods)} ${label}`,
      ...(order.discount > 0 ? [`Тахфиф (−${order.discountPct}%): −${sum(order.discount)} ${label}`] : []),
      `Расонидан: ${sum(order.shipping)} ${label}`,
      `Ҷамъ: ${sum(order.total)} ${label}`,
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
              const set = (v: number) => setQty(l.key, Math.max(min, round2(Math.round(v / step) * step)));
              const rfq = l.qty >= rfqFromOf(l.p);
              return (
                <div className="cl" key={l.key}>
                  <Link href={`/product/${l.p.slug}`} className="cl-img"><ProductImage src={l.p.images[0]} alt={l.p.name} /></Link>
                  <div className="cl-body">
                    <Link href={`/product/${l.p.slug}`} className="cl-name">{l.p.name}</Link>
                    {(l.size || l.color) && <div className="cl-var">{[l.color && `Ранг: ${l.color}`, l.size && `Андоза: ${l.size}`].filter(Boolean).join(" · ")}</div>}
                    <div className="cl-price">
                      {l.unit < l.listUnit - 0.05 && <span className="cl-old">{price(l.listUnit)}</span>}<b>{price(l.unit)}</b> {label} / {unit}
                      {l.p.sale?.per && <small> · {l.p.sale.per} {l.p.sale.perLabel}</small>}
                    </div>
                    <div className="cl-ctrl">
                      <div className="cl-qty">
                        <button onClick={() => set(l.qty - step)} disabled={l.qty <= min} aria-label="Кам"><Icon name="minus" size={16} stroke={2.4} /></button>
                        <span>{fmtQty(l.qty)} <small>{unit}</small></span>
                        <button onClick={() => set(l.qty + step)} aria-label="Зиёд"><Icon name="plus" size={16} stroke={2.4} /></button>
                      </div>
                      <b className="cl-sum">{sum(l.goods)} {label}</b>
                    </div>
                    {rfq && <div className="cl-warn">Миқдори калон: менеҷер нархи махсус медиҳад</div>}
                  </div>
                  <button className="cl-del" onClick={() => remove(l.key)} aria-label="Хориҷ кардан"><Icon name="close" size={18} /></button>
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
                    {[
                      modeList.length === 1 ? `${g.shipping.mode.daysMin}–${g.shipping.mode.daysMax} рӯз` : null,
                      g.shipping.basis === "m3" ? "аз рӯи ҳаҷм" : null,
                      g.shipping.mode.assumed ? "нарх тахминӣ" : null,
                      g.shipping.mode.note ?? null,
                    ].filter(Boolean).join(" · ")}
                  </small>
                </span>
                <b>{g.shipping.tjs > 0 ? `${sum(g.shipping.tjs)} ${label}` : "бо тасдиқ"}</b>
              </div>
            </div>
          </section>
        );
      })}

      {/* Тахфиф ҳангоми зиёд харидан */}
      <div className="disc-card">
        <div className="disc-head">
          <Icon name="bolt" size={17} /><b>Тахфиф ҳангоми зиёд харидан</b>
          {order.discountPct > 0 && <span className="disc-now">−{order.discountPct}%</span>}
        </div>
        <div className="ladder">
          <i className="fill" style={{ width: `${fillPct}%` }} />
          {ladder.map((st, i) => (
            <div key={st.from} className={`st ${i <= reached ? "on" : ""}`}>
              <span className="dot">{i <= reached && <Icon name="check" size={12} stroke={3.2} />}</span>
              <b>{st.off > 0 ? `−${st.off}%` : "Асосӣ"}</b>
              <small>{st.from > 0 ? `аз ${sum(st.from)}` : "то " + sum(ladder[1].from)}</small>
            </div>
          ))}
        </div>
        <p className="disc-hint">
          {order.next ? (
            <>Боз <b>{sum(order.next.need)} {label}</b> харед (бо нархи асосӣ): тахфиф <b>−{order.next.off}%</b> мешавад.</>
          ) : (
            <>Шумо тахфифи ҳадди аксарро гирифтед: <b>−{order.discountPct}%</b>.</>
          )}
        </p>
      </div>

      <div className="sum-card">
        <div className="est-row"><span>Нархи мол</span><b>{sum(order.listGoods)} {label}</b></div>
        <div className="est-row disc">
          <span>Тахфиф{order.discountPct > 0 && <small>−{order.discountPct}% аз нархи асосӣ</small>}</span>
          <b>{order.discount > 0 ? `−${sum(order.discount)} ${label}` : "—"}</b>
        </div>
        <div className="est-row"><span>Расонидан</span><b>{order.shipping > 0 ? `${sum(order.shipping)} ${label}` : "бо тасдиқ"}</b></div>
        <div className="est-total"><span>Ҷамъ</span><b>{sum(order.total)} {label}</b></div>
      </div>

      <div className="cart-bar">
        <div className="cb-total"><small>Ҷамъ</small><b>{sum(order.total)} {label}</b></div>
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
        <CurrencySwitch light />
        {onClear && <button className="cart-clear" onClick={onClear}>Тоза кардан</button>}
      </header>
      <main className="cart-main">{children}</main>
    </>
  );
}
