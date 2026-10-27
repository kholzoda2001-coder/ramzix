import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductView from "@/components/ProductView";
import { getProduct, products } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return p ? { title: `${p.name} — RamzIx`, description: p.subtitle ?? p.name } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();

  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 6);
  const other = products.filter((x) => x.category !== p.category).slice(0, 4);

  return <ProductView p={p} related={related} other={other} />;
}
