import type { Metadata } from "next";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import PageTop from "@/components/PageTop";
import { CATEGORIES, products } from "@/lib/catalog";
import { categoryCount } from "@/lib/filters";

export const metadata: Metadata = { title: "Категорияҳо — RamzIx" };

export default function CategoriesPage() {
  const cats = CATEGORIES.filter((c) => c.id !== "all");
  return (
    <>
      <PageTop title="Категорияҳо" />
      <main className="list-main">
        <Link href="/catalog" className="all-card">
          <span className="ac-ic"><Icon name="grid" size={26} /></span>
          <span><b>Ҳама маҳсулот</b><small>{products.length} маҳсулот аз ҳама кишвар</small></span>
          <Icon name="chevron" size={18} stroke={2.2} />
        </Link>

        <div className="cat-grid">
          {cats.map((c) => {
            const n = categoryCount(c.id);
            const body = (
              <>
                <span className="cg-ic" style={{ background: c.tint }}><Icon name={c.icon} size={30} stroke={1.6} /></span>
                <b>{c.name}</b>
                <small>{n > 0 ? `${n} маҳсулот` : "Ба наздикӣ"}</small>
              </>
            );
            return n > 0 ? (
              <Link key={c.id} href={`/catalog?category=${c.id}`} className="cat-card">{body}</Link>
            ) : (
              <div key={c.id} className="cat-card soon">{body}</div>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
