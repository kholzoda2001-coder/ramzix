import type { Metadata } from "next";
import BottomNav from "@/components/BottomNav";
import PageTop from "@/components/PageTop";
import { CategoriesBody } from "@/components/HomeSections";

export const metadata: Metadata = { title: "Категорияҳо — RamzIx" };

export default function CategoriesPage() {
  return (
    <>
      <PageTop title="Категорияҳо" />
      <main className="list-main">
        <CategoriesBody />
      </main>
      <BottomNav />
    </>
  );
}
