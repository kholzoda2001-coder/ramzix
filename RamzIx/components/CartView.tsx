"use client";

import { useMoney } from "./Currency";
import { T, useT } from "./Lang";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { COUNTRIES, fmtQty, unitOf } from "@/lib/catalog";
import { useCatalog } from "@/lib/useCatalog";
import { discountLadder, modesFor, priceOrder, rfqFromOf } from "@/lib/pricing";
import { lineKey, useCart } from "./Cart";
import Flag from "./Flag";
import Icon from "./Icon";
import ProductCard from "./ProductCard";
import ProductImage from "./ProductImage";

const round2 = (n: number) => Math.round(n * 100) / 100;

export default function CartView() {
  const { price, sum, label } = useMoney();
  const { t } = useT();
  const { getProduct, products, ready: catReady } = useCatalog();
  const router = useRouter();
  const { lines, modes, ready, setQty, remove, setMode, clear } = useCart();
  const order = useMemo(() => priceOrder(lines, modes, getProduct), [lines, modes, getProduct]);

  // Маҳсулоте, ки дигар дар каталог нест, аз сабад хориҷ мешавад (нишонаи сабад ҳам дуруст мешавад)
  useEffect(() => {
    if (!ready || !catReady) return;
    lines.filter((l) => !getProduct(l.slug)).forEach((l) => remove(lineKey(l)));
  }, [ready, catReady, lines, remove, getProduct]);

  // Тавсияҳо: аввал аз ҳамон категорияҳо, моли дар сабадбуда нишон дода намешавад
  const recs = useMemo(() => {
    const inCart = new Set(lines.map((l) => l.slug));
    const cats = new Set(lines.flatMap((l) => { const p = getProduct(l.slug); return p ? [p.category] : []; }));
    return products.filter((p) => !inCart.has(p.slug)).sort((a, b) => Number(cats.has(b.category)) - Number(cats.has(a.category)) || b.reviews - a.reviews).slice(0, 6);
  }, [lines, products, getProduct]);
  const recBlock = recs.length > 0 && (
    <section className="cart-recs">
      <h2><T>Шояд ба шумо писанд ояд</T></h2>
      <div className="grid2">{recs.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
    </section>
  );

  const back = () => (history.length > 1 ? router.back() : router.push("/"));

  if (!ready) return <CartShell onBack={back}><div className="skel-card" /><div className="skel-card short" /></CartShell>;

  if (order.groups.length === 0) {
    return (
      <CartShell onBack={back}>
        <div className="cart-empty">
          <span className="cart-empty-ic"><Icon name="cart" size={34} stroke={1.5} /></span>
          <b><T>Сабад холӣ аст</T></b>
          <span><T>Маҳсулотро интихоб кунед ва ба сабад илова намоед</T></span>
          <Link href="/" className="btn btn-orange" style={{ marginTop: 14 }}><T>Ба каталог</T></Link>
        </div>
        {recBlock}
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

  return (
    <CartShell onBack={back} onClear={clear}>
      {order.groups.map((g) => {
        const country = COUNTRIES[g.country];
        const modeList = modesFor(g.country);
        return (
          <section className="cart-group" key={g.country}>
            <div className="cg-head">
              <Flag code={g.country} className="cg-flag" />
              <b>{g.country === "tj" ? t("Тоҷикистон") : t("Аз {c}", { c: t(country.short) })}</b>
              <span>{t("{n} маҳсулот · {kg} кг", { n: g.lines.length, kg: fmtQty(round2(g.kg)) })}</span>
            </div>

            {g.lines.map((l) => {
              const step = l.p.sale?.step ?? 1;
              const min = l.p.sale?.min ?? 1;
              const unit = t(unitOf(l.p));
              const set = (v: number) => setQty(l.key, Math.max(min, round2(Math.round(v / step) * step)));
              const rfq = l.qty >= rfqFromOf(l.p);
              return (
                <div className="cl" key={l.key}>
                  <Link href={`/product/${l.p.slug}`} className="cl-img"><ProductImage src={l.p.images[0]} alt={t(l.p.name)} sizes="96px" /></Link>
                  <div className="cl-body">
                    <Link href={`/product/${l.p.slug}`} className="cl-name">{t(l.p.name)}</Link>
                    {(l.size || l.color) && <div className="cl-var">{[l.color && `${t("Ранг")}: ${t(l.color)}`, l.size && `${t("Андоза")}: ${l.size}`].filter(Boolean).join(" · ")}</div>}
                    <div className="cl-price">
                      {l.unit < l.listUnit - 0.05 && <span className="cl-old">{price(l.listUnit)}</span>}<b>{price(l.unit)}</b> {label} / {unit}
                      {l.p.sale?.per && <small> · {l.p.sale.per} {t(l.p.sale.perLabel ?? "")}</small>}
                    </div>
                    <div className="cl-ctrl">
                      <div className="cl-qty">
                        <button onClick={() => set(l.qty - step)} disabled={l.qty <= min} aria-label={t("Кам")}><Icon name="minus" size={16} stroke={2.4} /></button>
                        <span>{fmtQty(l.qty)} <small>{unit}</small></span>
                        <button onClick={() => set(l.qty + step)} aria-label={t("Зиёд")}><Icon name="plus" size={16} stroke={2.4} /></button>
                      </div>
                      <b className="cl-sum">{sum(l.goods)} {label}</b>
                    </div>
                    {rfq && <div className="cl-warn"><T>Миқдори калон: менеҷер нархи махсус медиҳад</T></div>}
                  </div>
                  <button className="cl-del" onClick={() => remove(l.key)} aria-label={t("Хориҷ кардан")}><Icon name="close" size={18} /></button>
                </div>
              );
            })}

            <div className="cg-ship">
              <div className="cg-ship-head"><Icon name="truck" size={18} /><b><T>Расонидан</T></b></div>
              {modeList.length > 1 && (
                <div className="modes">
                  {modeList.map((m) => (
                    <button key={m.id} className={m.id === g.shipping.mode.id ? "on" : ""} onClick={() => setMode(g.country, m.id)}>
                      <b>{t(m.label)}</b>
                      <small>{t("{a}–{b} рӯз", { a: m.daysMin, b: m.daysMax })}</small>
                    </button>
                  ))}
                </div>
              )}
              <div className="est-row">
                <span>
                  {t(g.shipping.mode.label)}, {fmtQty(round2(g.kg))} {t("кг")}
                  <small>
                    {[
                      modeList.length === 1 ? t("{a}–{b} рӯз", { a: g.shipping.mode.daysMin, b: g.shipping.mode.daysMax }) : null,
                      g.shipping.basis === "m3" ? t("аз рӯи ҳаҷм") : null,
                      g.shipping.mode.assumed ? t("нарх тахминӣ") : null,
                      g.shipping.mode.note ? t(g.shipping.mode.note) : null,
                    ].filter(Boolean).join(" · ")}
                  </small>
                </span>
                <b>{g.shipping.tjs > 0 ? `${sum(g.shipping.tjs)} ${label}` : t("бо тасдиқ")}</b>
              </div>
            </div>
          </section>
        );
      })}

      {/* Тахфиф ҳангоми зиёд харидан */}
      <div className="disc-card">
        <div className="disc-head">
          <Icon name="bolt" size={17} /><b><T>Тахфиф ҳангоми зиёд харидан</T></b>
          {order.discountPct > 0 && <span className="disc-now">−{order.discountPct}%</span>}
        </div>
        <div className="ladder">
          <i className="fill" style={{ width: `${fillPct}%` }} />
          {ladder.map((st, i) => (
            <div key={st.from} className={`st ${i <= reached ? "on" : ""}`}>
              <span className="dot">{i <= reached && <Icon name="check" size={12} stroke={3.2} />}</span>
              <b>{st.off > 0 ? `−${st.off}%` : t("Асосӣ")}</b>
              <small>{st.from > 0 ? t("аз {x}", { x: sum(st.from) }) : t("то {x}", { x: sum(ladder[1].from) })}</small>
            </div>
          ))}
        </div>
        <p className="disc-hint">
          {order.next ? (
            <>{t("Боз {a} харед (бо нархи асосӣ): тахфиф {b} мешавад.", { a: `${sum(order.next.need)} ${label}`, b: `−${order.next.off}%` })}</>
          ) : (
            <>{t("Шумо тахфифи ҳадди аксарро гирифтед: {a}.", { a: `−${order.discountPct}%` })}</>
          )}
        </p>
      </div>

      <div className="sum-card">
        <div className="est-row"><span><T>Нархи мол</T></span><b>{sum(order.listGoods)} {label}</b></div>
        <div className="est-row disc">
          <span><T>Тахфиф</T>{order.discountPct > 0 && <small>{t("−{p}% аз нархи асосӣ", { p: order.discountPct })}</small>}</span>
          <b>{order.discount > 0 ? `−${sum(order.discount)} ${label}` : "—"}</b>
        </div>
        <div className="est-row"><span><T>Расонидан</T></span><b>{order.shipping > 0 ? `${sum(order.shipping)} ${label}` : t("бо тасдиқ")}</b></div>
        <div className="est-total"><span><T>Ҷамъ</T></span><b>{sum(order.total)} {label}</b></div>
      </div>

      {recBlock}

      <div className="cart-bar">
        <div className="cb-total"><small><T>Ҷамъ</T></small><b>{sum(order.total)} {label}</b></div>
        <Link className="cb-btn" href="/checkout">
          <Icon name="check" size={20} stroke={2.6} /> <T>Расмӣ кардани фармоиш</T>
        </Link>
      </div>
    </CartShell>
  );
}

function CartShell({ children, onBack, onClear }: { children: React.ReactNode; onBack: () => void; onClear?: () => void }) {
  const { t } = useT();
  return (
    <>
      <header className="cart-top">
        <button className="ic-round" onClick={onBack} aria-label={t("Бозгашт")}><Icon name="back" stroke={2.2} /></button>
        <h1><T>Сабад</T></h1>
        {onClear && <button className="cart-clear" onClick={onClear}><T>Тоза кардан</T></button>}
      </header>
      <main className="cart-main">{children}</main>
    </>
  );
}
