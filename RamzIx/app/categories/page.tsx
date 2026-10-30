import type { Metadata } from "next";
import BottomNav from "@/components/BottomNav";
import CategoriesView from "@/components/CategoriesView";

export const metadata: Metadata = { title: "Категорияҳо — RamzIx" };

export default function CategoriesPage() {
  return (
    <>
      <main className="c2-main"><CategoriesView /></main>
      <BottomNav />
    </>
  );
}
