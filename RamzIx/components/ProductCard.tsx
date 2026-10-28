"use client";

import Link from "next/link";
import { unitOf, type Product } from "@/lib/catalog";
import { listUnitPrice, wholesalePrices } from "@/lib/pricing";
import { useMoney } from "./Currency";
import Flag from "./Flag";
import Icon from "./Icon";
import { T, useT } from "./Lang";
import ProductImage from "./ProductImage";

export default function ProductCard({ p, compact }: { p: Product; compact?: boolean }) {
  const { price, label } = useMoney();
  const { t } = useT();
  const unit = t(unitOf(p));
  const wh = wholesalePrices(p).map((w) => w.unit);

  return (
    <Link href={`/product/${p.slug}`} className={`pcard ${compact ? "compact" : ""}`}>
      <div className="pcard-img">
        <ProductImage src={p.images[0]} alt={t(p.name)} />
        <Flag code={p.country} className="pcard-flag" />
        <span className="pcard-fav" aria-hidden="true"><Icon name="heart" size={16} /></span>
      </div>
      <div className="pcard-body">
        <div className="pcard-name">{t(p.name)}</div>
        <div className="pcard-price">
          <b>{price(listUnitPrice(p))}</b> <span>{label} / {unit}</span>
        </div>
        {p.sale?.per && (
          <div className="pcard-pack">{p.sale.per} {t(p.sale.perLabel ?? "")} / {unit}</div>
        )}
        {wh.length > 0 && (
          <div className="pcard-whole">
            <span><T>оптом</T></span>
            <b>{price(Math.min(...wh))}–{price(Math.max(...wh))} {label}</b>
          </div>
        )}
        {!compact && (
          <div className="pcard-meta">
            <span>{p.brand ?? ""}</span>
            {p.rating ? <span><Icon name="star" size={12} className="star" /> {p.rating}</span> : <span />}
          </div>
        )}
      </div>
    </Link>
  );
}
