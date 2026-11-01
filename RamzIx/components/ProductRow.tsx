"use client";

import Link from "next/link";
import { fmtQty, unitOf, type Product } from "@/lib/catalog";
import { listUnitPrice, minQtyOf, shownTiers } from "@/lib/pricing";
import { useSite } from "@/lib/useSite";
import { useCart } from "./Cart";
import { useMoney } from "./Currency";
import Icon from "./Icon";
import { T, useT } from "./Lang";
import ProductImage from "./ProductImage";

/* Сатри каталог барои харидори оптом: се нарх паҳлӯи ҳам ва иловаи зуд ба сабад */
export default function ProductRow({ p }: { p: Product }) {
  const { price, label } = useMoney();
  const { t } = useT();
  const { add } = useCart();
  const unit = t(unitOf(p));
  const min = minQtyOf(p, useSite().wholesaleMode);
  const qty = (q: number) => `${fmtQty(q)} ${unit}`;
  // Танҳо нархҳои оптом (нархи асосӣ дар таби «Чакана» аст); агар зина набошад, нархи асосӣ мемонад
  const tiers = shownTiers(p);
  const cells = tiers.length ? tiers : [{ unit: listUnitPrice(p), minQty: min }];
  // Маҳсулот бо андоза ё ранг бе интихоб ба сабад намеравад
  const needsChoice = !!(p.sizes?.length || p.colors?.length);

  return (
    <article className="prow">
      <Link href={`/product/${p.slug}`} className="prow-img">
        <ProductImage src={p.images[0]} alt={t(p.name)} sizes="96px" />
      </Link>
      <div className="prow-body">
        <Link href={`/product/${p.slug}`} className="prow-name">{t(p.name)}</Link>
        <span className="prow-meta">
          {p.sale?.per ? `${p.sale.per} ${t(p.sale.perLabel ?? "")} / ${unit} · ` : ""}
          {t("Ҳадди ақал: {q}", { q: qty(min) })}
        </span>
        <div className="prow-prices">
          {p.onRequest ? <span><b><T>Нарх бо дархост</T></b></span> : cells.map((c, k) => (
            <span key={c.minQty} className={tiers.length || k ? "w" : ""}>
              <b>{price(c.unit)}</b>
              <small>{t("аз {q}", { q: fmtQty(c.minQty) })}</small>
            </span>
          ))}
        </div>
      </div>
      {needsChoice ? (
        <Link href={`/product/${p.slug}`} className="prow-add" aria-label={t("Интихоби андоза ё ранг")}><Icon name="chevron" size={18} stroke={2.4} /></Link>
      ) : (
        <button className="prow-add" aria-label={t("Ба сабад")} onClick={() => add({ slug: p.slug, qty: min }, t("{q} ба сабад илова шуд", { q: qty(min) }))}><Icon name="plus" size={18} stroke={2.4} /></button>
      )}
      <span className="prow-cur">{label}</span>
    </article>
  );
}
