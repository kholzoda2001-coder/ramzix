"use client";

import Link from "next/link";
import { fmtQty, unitOf, type Product } from "@/lib/catalog";
import { listUnitPrice, shownTiers } from "@/lib/pricing";
import { useCart } from "./Cart";
import { useMoney } from "./Currency";
import Flag from "./Flag";
import Icon from "./Icon";
import { T, useT } from "./Lang";
import { usePriceMode } from "./PriceMode";
import ProductImage from "./ProductImage";

export default function ProductCard({ p, compact }: { p: Product; compact?: boolean }) {
  const { price, label } = useMoney();
  const { t } = useT();
  const mode = usePriceMode();
  const { add } = useCart();
  const min = p.sale?.min ?? 1;
  const unit = t(unitOf(p));
  // Зинаҳои оптом: «нарх аз N» (қиматтар аввал)
  const [w1, w2] = shownTiers(p);
  const whole = mode === "whole" && !!w1;
  const tier = (x: { unit: number; minQty: number }) => t("{p} аз {q}", { p: price(x.unit), q: fmtQty(x.minQty) });

  return (
    <Link href={`/product/${p.slug}`} className={`pcard ${compact ? "compact" : ""}`}>
      <div className="pcard-img">
        <ProductImage src={p.images[0]} alt={t(p.name)} />
        <Flag code={p.country} className="pcard-flag" />
        {!compact && !p.sizes?.length && !p.colors?.length && (
          <button className="pcard-add" aria-label={t("Ба сабад")} onClick={(e) => { e.preventDefault(); e.stopPropagation(); add({ slug: p.slug, qty: min }, t("{q} ба сабад илова шуд", { q: `${fmtQty(min)} ${unit}` })); }}>
            <Icon name="cart" size={19} />
          </button>
        )}
      </div>
      <div className="pcard-body">
        <div className="pcard-name">{t(p.name)}</div>
        <div className="pcard-price">
          <b>{price(whole ? w1.unit : listUnitPrice(p))}</b> <span>{label} / {unit}</span>
        </div>
        {w1 && (
          <div className={`pcard-whole ${whole ? "on" : ""}`}>
            {whole
              ? <><span>{t("аз {q}", { q: fmtQty(w1.minQty) })}</span>{w2 && <b>{tier(w2)}</b>}</>
              : <><span><T>оптом</T></span><b>{tier(w1)}</b></>}
          </div>
        )}
      </div>
    </Link>
  );
}
