import Link from "next/link";
import { fmt, wholesalePrice, WHOLESALE_MIN, type Product } from "@/lib/catalog";
import Flag from "./Flag";
import Icon from "./Icon";
import ProductImage from "./ProductImage";

export default function ProductCard({ p, compact }: { p: Product; compact?: boolean }) {
  const off = p.listPrice ? Math.round((1 - p.price / p.listPrice) * 100) : 0;
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
          <b>{fmt(p.price)}</b> <span>смн</span>
          {p.listPrice && <s>{fmt(p.listPrice)}</s>}
        </div>
        <div className="pcard-whole">
          <span>аз {WHOLESALE_MIN} дона</span>
          <b>{fmt(wholesalePrice(p.price))} смн</b>
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
