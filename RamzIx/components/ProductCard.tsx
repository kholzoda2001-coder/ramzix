import Link from "next/link";
import { fmtPrice, fmtQty, unitOf, type Product } from "@/lib/catalog";
import { priceTiers } from "@/lib/pricing";
import Flag from "./Flag";
import Icon from "./Icon";
import ProductImage from "./ProductImage";

export default function ProductCard({ p, compact }: { p: Product; compact?: boolean }) {
  const unit = unitOf(p);
  const tiers = priceTiers(p).filter((t) => t.unit !== null);
  const first = tiers[0];
  const best = tiers.length > 1 ? tiers[tiers.length - 1] : null;

  return (
    <Link href={`/product/${p.slug}`} className={`pcard ${compact ? "compact" : ""}`}>
      <div className="pcard-img">
        <ProductImage src={p.images[0]} alt={p.name} />
        <Flag code={p.country} className="pcard-flag" />
        {best && best.off > 0 && <span className="pcard-off">то −{best.off}%</span>}
        <span className="pcard-fav" aria-hidden="true"><Icon name="heart" size={16} /></span>
      </div>
      <div className="pcard-body">
        <div className="pcard-name">{p.name}</div>
        <div className="pcard-price">
          <b>{fmtPrice(first.unit!)}</b> <span>смн / {unit}</span>
        </div>
        {p.sale && (
          <div className="pcard-pack">
            {p.sale.per ? `${p.sale.per} ${p.sale.perLabel} / ${unit}` : `Аз ${fmtQty(p.sale.min)} ${unit}`}
          </div>
        )}
        {best && (
          <div className="pcard-whole">
            <span>аз {fmtQty(best.min)} {unit}</span>
            <b>{fmtPrice(best.unit!)} смн</b>
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
