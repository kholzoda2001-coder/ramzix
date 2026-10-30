import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductView from "@/components/ProductView";
import { loadStorefront } from "@/lib/server/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const p = (await loadStorefront()).find((x) => x.slug === slug);
  return p ? { title: `${p.name} — RamzIx`, description: p.subtitle ?? p.name } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const products = await loadStorefront();
  const p = products.find((x) => x.slug === slug);
  // Дар база нест ё пинҳон аст → 404-и ҳақиқӣ (барои Google ҳам)
  if (!p) notFound();

  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 6);
  const other = products.filter((x) => x.category !== p.category).slice(0, 4);

  return <ProductView p={p} related={related} other={other} />;
}
