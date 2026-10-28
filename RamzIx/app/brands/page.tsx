import type { Metadata } from "next";
import BottomNav from "@/components/BottomNav";
import { BrandsBody } from "@/components/HomeSections";
import PageTop from "@/components/PageTop";

export const metadata: Metadata = { title: "Брендҳо — RamzIx" };

export default function BrandsPage() {
  return (
    <>
      <PageTop title="Брендҳо" />
      <main className="list-main">
        <BrandsBody />
      </main>
      <BottomNav />
    </>
  );
}
