import type { Metadata } from "next";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import BrandLogo from "@/components/BrandLogo";
import Flag from "@/components/Flag";
import PageTop from "@/components/PageTop";
import { getBrands } from "@/lib/filters";

export const metadata: Metadata = { title: "Брендҳо — RamzIx" };

export default function BrandsPage() {
  const brands = getBrands();
  return (
    <>
      <PageTop title="Брендҳо" sub={`${brands.length}`} />
      <main className="list-main">
        <div className="brand-grid">
          {brands.map((b) => (
            <Link key={b.slug} href={`/catalog?brand=${b.slug}`} className="brand-card">
              <BrandLogo name={b.name} />
              <b>{b.name}</b>
              <small>{b.count} маҳсулот</small>
              <span className="bc-flags">{b.countries.map((c) => <Flag key={c} code={c} className="bc-flag" />)}</span>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
