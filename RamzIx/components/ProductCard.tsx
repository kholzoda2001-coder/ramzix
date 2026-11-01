"use client";

import Link from "next/link";
import { fmtQty, unitOf, type Product } from "@/lib/catalog";
import { listUnitPrice, shownTiers } from "@/lib/pricing";
import { useCart } from "./Cart";
import { useMoney } from "./Currency";
import Icon from "./Icon";
import { T, useT } from "./Lang";
import ProductImage from "./ProductImage";

export default function ProductCard({ p, compact }: { p: Product; compact?: boolean }) {
  const { price, label } = useMoney();
  const { t } = useT();
  const { add } = useCart();
  const min = p.sale?.min ?? 1;
  const unit = t(unitOf(p));
  // Зинаҳои оптом: «нарх аз N» (қиматтар аввал)
  const all = shownTiers(p);
  const [w1] = all;
  const best = all[all.length - 1]; // арзонтарин нархи оптом

  return (
    <Link href={`/product/${p.slug}`} className={`pcard ${compact ? "compact" : ""}`}>
      <div className="pcard-img">
        <ProductImage src={p.images[0]} alt={t(p.name)} />
        {!compact && !p.onRequest && !p.sizes?.length && !p.colors?.length && (
          <button className="pcard-add" aria-label={t("Ба сабад")} onClick={(e) => { e.preventDefault(); e.stopPropagation(); add({ slug: p.slug, qty: min }, t("{q} ба сабад илова шуд", { q: `${fmtQty(min)} ${unit}` })); }}>
            <Icon name="cart" size={19} />
          </button>
        )}
      </div>
      <div className="pcard-body">
        <div className="pcard-name">{t(p.name)}</div>
        {p.onRequest ? (
          <div className="pcard-price req"><T>Нарх бо дархост</T></div>
        ) : (
          <div className="pcard-price">
            <b>{price(listUnitPrice(p))}</b> <span>{label} / {unit}</span>
          </div>
        )}
        {w1 && !p.onRequest && (
          <div className="pcard-whole">
            <span className="ws-tag"><T>оптом</T></span><b>{price(best.unit)} {label}</b>
          </div>
        )}
      </div>
    </Link>
  );
}
