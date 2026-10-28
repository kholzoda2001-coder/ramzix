"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/useCatalog";
import Icon from "./Icon";
import { T } from "./Lang";
import ProductView from "./ProductView";

/* Саҳифаи маҳсулоте, ки дар админ илова шудааст (дар каталоги доимӣ нест) */
export default function LocalProduct({ slug }: { slug: string }) {
  const { getProduct, products, ready } = useCatalog();
  const p = getProduct(slug);
  if (!p) {
    return (
      <main className="empty" style={{ marginTop: 80 }}>
        <Icon name="box" size={34} stroke={1.5} />
        {ready ? (
          <>
            <b><T>Саҳифа ёфт нашуд</T></b>
            <span><T>Шояд маҳсулот дигар дастрас нест.</T></span>
            <Link href="/" className="btn btn-orange" style={{ marginTop: 12 }}><T>Ба саҳифаи асосӣ</T></Link>
          </>
        ) : null}
      </main>
    );
  }
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 6);
  const other = products.filter((x) => x.category !== p.category).slice(0, 4);
  return <ProductView p={p} related={related} other={other} />;
}
