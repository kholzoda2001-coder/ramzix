import type { Metadata } from "next";
import { Suspense } from "react";
import CatalogView from "@/components/CatalogView";

export const metadata: Metadata = { title: "Каталог — RamzIx" };

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="cart-empty" />}>
      <CatalogView />
    </Suspense>
  );
}
