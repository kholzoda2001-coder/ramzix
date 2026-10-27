import type { Metadata } from "next";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Flag from "@/components/Flag";
import PageTop from "@/components/PageTop";
import { getBrands } from "@/lib/filters";

export const metadata: Metadata = { title: "Брендҳо — RamzIx" };

// Рангҳои доимӣ барои ҳар бренд (аз номаш)
const TINTS = ["#e8eefc", "#fde8f1", "#e6f4fb", "#f1ecfd", "#fdecec", "#e7f6ee", "#fdf3e1"];
const tintOf = (s: string) => TINTS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];

export default function BrandsPage() {
  const brands = getBrands();
  return (
    <>
      <PageTop title="Брендҳо" sub={`${brands.length}`} />
      <main className="list-main">
        <div className="brand-grid">
          {brands.map((b) => (
            <Link key={b.slug} href={`/catalog?brand=${b.slug}`} className="brand-card">
              <span className="bc-logo" style={{ background: tintOf(b.slug) }}>{b.name.slice(0, 2).toUpperCase()}</span>
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
