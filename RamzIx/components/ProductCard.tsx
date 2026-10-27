import Link from "next/link";
import { fmtPrice, fmtQty, unitOf, type Product } from "@/lib/catalog";
import { listUnitPrice } from "@/lib/pricing";
import Flag from "./Flag";
import Icon from "./Icon";
import ProductImage from "./ProductImage";

export default function ProductCard({ p, compact }: { p: Product; compact?: boolean }) {
  const unit = unitOf(p);

  return (
    <Link href={`/product/${p.slug}`} className={`pcard ${compact ? "compact" : ""}`}>
      <div className="pcard-img">
        <ProductImage src={p.images[0]} alt={p.name} />
        <Flag code={p.country} className="pcard-flag" />
        <span className="pcard-fav" aria-hidden="true"><Icon name="heart" size={16} /></span>
      </div>
      <div className="pcard-body">
        <div className="pcard-name">{p.name}</div>
        <div className="pcard-price">
          <b>{fmtPrice(listUnitPrice(p))}</b> <span>смн / {unit}</span>
        </div>
        {p.sale && (
          <div className="pcard-pack">
            {p.sale.per ? `${p.sale.per} ${p.sale.perLabel} / ${unit}` : `Аз ${fmtQty(p.sale.min)} ${unit}`}
          </div>
        )}
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
