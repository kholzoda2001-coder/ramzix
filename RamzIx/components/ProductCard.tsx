import Link from "next/link";
import { fmtPrice, fmtQty, unitOf, type Product } from "@/lib/catalog";
import { listUnitPrice, wholesalePrices } from "@/lib/pricing";
import Flag from "./Flag";
import Icon from "./Icon";
import ProductImage from "./ProductImage";

export default function ProductCard({ p, compact }: { p: Product; compact?: boolean }) {
  const unit = unitOf(p);
  const wh = wholesalePrices(p).map((w) => w.unit);

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
        <div className="pcard-pack">
          {p.sale?.per ? `${p.sale.per} ${p.sale.perLabel} / ${unit}` : `Аз ${fmtQty(p.sale?.min ?? 1)} ${unit}`}
        </div>
        {wh.length > 0 && (
          <div className="pcard-whole">
            <span>оптом</span>
            <b>{fmtPrice(Math.min(...wh))}–{fmtPrice(Math.max(...wh))} смн</b>
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
