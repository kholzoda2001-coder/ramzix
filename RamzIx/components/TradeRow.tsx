"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { fmtQty, unitOf, type Product } from "@/lib/catalog";
import { listUnitPrice, minQtyOf, priceOrder, shownTiers } from "@/lib/pricing";
import { useCatalog } from "@/lib/useCatalog";
import { useDest } from "@/lib/useDest";
import { useSite } from "@/lib/useSite";
import { lineKey, useCart } from "./Cart";
import { useMoney } from "./Currency";
import Icon from "./Icon";
import { T, useT } from "./Lang";
import ProductImage from "./ProductImage";

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Сарлавҳаи ҷадвал (танҳо дар компютер) */
export function TradeHead() {
  return (
    <div className="tr-head">
      <span /><span><T>Модел</T></span><span><T>Ҳадди ақал</T></span><span><T>Нарх аз рӯи миқдор</T></span><span><T>Миқдор</T></span>
    </div>
  );
}

/* Сатри каталог барои оптовик: зинаи нарх аз рӯи миқдор равшан мешавад, фармоиш бе рафтан ба саҳифаи маҳсулот */
export default function TradeRow({ p, eager }: { p: Product; eager?: boolean }) {
  const { price, sum, label } = useMoney();
  const { t } = useT();
  const { wholesaleMode } = useSite();
  const { lines, add, setQty, remove } = useCart();
  const min = minQtyOf(p, wholesaleMode);
  const step = p.sale?.step ?? 1;
  const unit = t(unitOf(p));
  const key = lineKey({ slug: p.slug });
  const inCart = lines.find((l) => lineKey(l) === key);
  const [own, setOwn] = useState(min);
  const [text, setText] = useState<string | null>(null);
  const qty = inCart?.qty ?? own;
  const tiers = shownTiers(p);
  const cells = tiers.length ? tiers : [{ unit: listUnitPrice(p), minQty: min }];
  const cur = cells.reduce((r, c, i) => (qty >= c.minQty ? i : r), 0);
  const needsChoice = !!(p.sizes?.length || p.colors?.length);
  const href = `/product/${p.slug}`;

  const set = (v: number) => {
    const q = Math.min(99999, Math.max(min, round2(Math.round((v || min) / step) * step)));
    if (inCart) setQty(key, q); else setOwn(q);
  };
  const minus = () => (inCart && qty <= min ? remove(key) : set(qty - step));

  return (
    <article className={`tr ${inCart ? "in" : ""}`}>
      <Link href={href} className="tr-img"><ProductImage src={p.images[0]} alt={t(p.name)} eager={eager} sizes="72px" /></Link>
      <div className="tr-info">
        <Link href={href} className="tr-name">{t(p.name)}</Link>
        <span className="tr-meta">{p.sku && <span>{p.sku}</span>}<span className="tr-minm">{t("Ҳадди ақал: {q}", { q: `${fmtQty(min)} ${unit}` })}</span></span>
      </div>
      <span className="tr-min">{fmtQty(min)} {unit}</span>
      {p.onRequest ? (
        <>
          <span className="tr-req"><T>Нарх бо дархост</T></span>
          <Link href={href} className="tr-go"><T>Нархро пурсед</T></Link>
        </>
      ) : (
        <>
          <div className="tr-prices">
            {cells.map((c, k) => (
              <button key={c.minQty} className={k === cur ? "on" : ""} disabled={needsChoice} onClick={() => set(c.minQty)}>
                <b>{price(c.unit)}</b>
                <small>{t("аз {q}", { q: fmtQty(c.minQty) })}</small>
              </button>
            ))}
            <i>{label}</i>
          </div>
          {needsChoice ? (
            <Link href={href} className="tr-go"><T>Интихоб</T> <Icon name="chevron" size={14} stroke={2.4} /></Link>
          ) : (
            <div className="tr-ctrl">
              <div className="tr-qty">
                <button onClick={minus} disabled={!inCart && qty <= min} aria-label={t("Кам")}><Icon name="minus" size={15} stroke={2.4} /></button>
                <input
                  value={text ?? String(qty)}
                  inputMode="numeric"
                  aria-label={t("Миқдор")}
                  onChange={(e) => setText(e.target.value.replace(/[^\d.,]/g, ""))}
                  onBlur={() => { if (text !== null) set(parseFloat(text.replace(",", "."))); setText(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                />
                <button onClick={() => set(qty + step)} aria-label={t("Зиёд")}><Icon name="plus" size={15} stroke={2.4} /></button>
              </div>
              {inCart ? (
                <Link href="/cart" className="tr-add done"><Icon name="check" size={15} stroke={2.8} /> {sum(cells[cur].unit * qty)}</Link>
              ) : (
                <button className="tr-add" onClick={() => add({ slug: p.slug, qty }, t("{q} ба сабад илова шуд", { q: `${fmtQty(qty)} ${unit}` }))}><Icon name="cart" size={15} /> <T>Ба сабад</T></button>
              )}
            </div>
          )}
        </>
      )}
    </article>
  );
}

/** Сатри часпидаи сабад: дар каталог фармоиш дар пеши чашм мемонад */
export function TradeCartBar() {
  const { sum, label } = useMoney();
  const { t } = useT();
  const { getProduct } = useCatalog();
  const { lines, modes } = useCart();
  const dest = useDest();
  const order = useMemo(() => priceOrder(lines, modes, getProduct, dest), [lines, modes, getProduct, dest]);
  if (!lines.length) return null;
  const next = order.next ? Math.max(0, order.next.from * (1 - order.next.off / 100) - order.goods) : 0;
  return (
    <Link href="/cart" className="tr-bar">
      <span>
        <b>{sum(order.goods)} {label}</b>
        <small>{t("{n} маҳсулот", { n: lines.length })}{next > 0 ? ` · ${t("То нархи беҳтар: {a}", { a: `${sum(next)} ${label}` })}` : ""}</small>
      </span>
      <em><Icon name="cart" size={17} /> <T>Сабад</T></em>
    </Link>
  );
}
