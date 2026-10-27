import Link from "next/link";
import { fmt, fmtQty, tiersFor, unitOf, wholesalePrice, WHOLESALE_MIN, type Product } from "@/lib/catalog";
import Flag from "./Flag";
import Icon from "./Icon";
import ProductImage from "./ProductImage";

export default function ProductCard({ p, compact }: { p: Product; compact?: boolean }) {
  const off = p.listPrice ? Math.round((1 - p.price / p.listPrice) * 100) : 0;
  const unit = unitOf(p);
  // Барои маҳсулоти картонӣ/вазнӣ: зинаи якуми тахфифдор
  const bulk = p.sale ? tiersFor(p.price, p.sale).find((t) => t.off > 0 && t.price) : null;
  return (
    <Link href={`/product/${p.slug}`} className={`pcard ${compact ? "compact" : ""}`}>
      <div className="pcard-img">
        <ProductImage src={p.images[0]} alt={p.name} />
        <Flag code={p.country} className="pcard-flag" />
        {off > 0 && <span className="pcard-off">−{off}%</span>}
        <span className="pcard-fav" aria-hidden="true"><Icon name="heart" size={16} /></span>
      </div>
      <div className="pcard-body">
        <div className="pcard-name">{p.name}</div>
        <div className="pcard-price">
          <b>{fmt(p.price)}</b> <span>смн{p.sale ? ` / ${unit}` : ""}</span>
          {p.listPrice && <s>{fmt(p.listPrice)}</s>}
        </div>
        {p.sale && <div className="pcard-pack">{p.sale.per ? `${p.sale.per} ${p.sale.perLabel} / ${unit}` : `Аз ${fmtQty(p.sale.min)} ${unit}`}</div>}
        <div className="pcard-whole">
          {bulk ? (
            <>
              <span>аз {fmtQty(bulk.min)} {unit}</span>
              <b>{fmt(bulk.price!)} смн</b>
            </>
          ) : (
            <>
              <span>аз {WHOLESALE_MIN} дона</span>
              <b>{fmt(wholesalePrice(p.price))} смн</b>
            </>
          )}
        </div>
        {!compact && (
          <div className="pcard-meta">
            {p.rating ? <span><Icon name="star" size={12} className="star" /> {p.rating}</span> : <span className="new">Нав</span>}
            <span>{p.brand ?? ""}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
