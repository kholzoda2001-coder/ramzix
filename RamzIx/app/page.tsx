import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import BrandLogo from "@/components/BrandLogo";
import Flag from "@/components/Flag";
import HeroSlider from "@/components/HeroSlider";
import HomeHeader from "@/components/HomeHeader";
import Icon from "@/components/Icon";
import ProductCard from "@/components/ProductCard";
import ProductFeed from "@/components/ProductFeed";
import { T } from "@/components/Lang";
import WaLink from "@/components/WaLink";
import { CATEGORIES, COUNTRIES, products, type CountryCode } from "@/lib/catalog";
import { categoryCount, getBrands } from "@/lib/filters";

const TRUST = [
  { icon: "shield", title: "Маҳсулоти аслӣ", text: "Аз таъминкунандагони санҷидашуда" },
  { icon: "truck", title: "Расонидан", text: "Ба тамоми Тоҷикистон" },
  { icon: "tag", title: "Нархи оптовӣ", text: "Бештар харед, арзонтар" },
  { icon: "headset", title: "Менеҷери шахсӣ", text: "Тоҷикӣ, русӣ, англисӣ" },
];

const STEPS = [
  { icon: "search", title: "Интихоб", text: "Маҳсулот ва миқдор" },
  { icon: "doc", title: "Тасдиқ", text: "Нарх ва мӯҳлат" },
  { icon: "card", title: "Пардохт", text: "Алиф, DC, бонк" },
  { icon: "truck", title: "Расонидан", text: "То дари мағоза" },
];

export default function Home() {
  const popular = interleave([...products].sort((a, b) => b.reviews - a.reviews)).slice(0, 4);
  const food = products.filter((p) => p.sale);
  const brands = getBrands().slice(0, 10);
  const feed = interleave(products.filter((p) => !popular.includes(p)));

  return (
    <>
      <HomeHeader />

      <main className="home">
        <nav className="cat-pills" aria-label="Категорияҳо">
          <Link href="/catalog" className="on"><T>Ҳама</T></Link>
          <Link href="/catalog?category=audio"><T>Наушник</T></Link>
          <Link href="/catalog?category=men"><T>Либос</T></Link>
          <Link href="/catalog?category=food"><T>Озуқа</T></Link>
          <Link href="/brands"><T>Брендҳо</T></Link>
          <Link href="/categories"><T>Категорияҳо</T></Link>
        </nav>

        <HeroSlider />

        <section className="trust-row">
          {TRUST.map((x) => (
            <div key={x.title} className="trust">
              <span className="trust-ic"><Icon name={x.icon} size={20} /></span>
              <div><b><T>{x.title}</T></b><span><T>{x.text}</T></span></div>
            </div>
          ))}
        </section>

        <section className="block" id="countries">
          <div className="sec-head"><h2><T>Харид аз рӯи кишвар</T></h2></div>
          <div className="countries">
            {(Object.keys(COUNTRIES) as CountryCode[]).map((c) => (
              <Link key={c} href={`/catalog?country=${c}`} className="country">
                <Flag code={c} className="country-flag" />
                <b><T>{COUNTRIES[c].short}</T></b>
                <span>{products.some((p) => p.country === c) ? <T vars={{ n: products.filter((p) => p.country === c).length }}>{"{n} мол"}</T> : <T>Ба наздикӣ</T>}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="block" id="catalog">
          <div className="sec-head"><h2><T>Категорияҳо</T></h2><Link href="/categories"><T>Ҳама</T> <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
          <div className="cats">
            {CATEGORIES.map((c) => (
              <Link key={c.id} href={c.id === "all" ? "/categories" : categoryCount(c.id) > 0 ? `/catalog?category=${c.id}` : "/categories"} className="cat">
                <span className="cat-ic" style={{ background: c.tint }}><Icon name={c.icon} size={26} stroke={1.6} /></span>
                <span><T>{c.name}</T></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="block">
          <div className="sec-head"><h2><T>Брендҳо</T></h2><Link href="/brands"><T>Ҳама</T> <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
          <div className="brand-row">
            {brands.map((b) => (
              <Link key={b.slug} href={`/catalog?brand=${b.slug}`} className="brand-chip">
                <BrandLogo name={b.name} small />
                <span><b>{b.name}</b><small><T vars={{ n: b.count }}>{"{n} мол"}</T></small></span>
              </Link>
            ))}
          </div>
        </section>

        {food.length > 0 && (
          <section className="block" id="food">
            <div className="sec-head">
              <div><h2><T>Озуқа ва нӯшокӣ</T></h2><p className="sec-sub"><T>Бо картон ва бо кило</T></p></div>
            </div>
            <div className="hscroll">
              {food.map((p) => <ProductCard key={p.slug} p={p} compact />)}
            </div>
          </section>
        )}

        <section className="tiers-card" id="rfq">
          <div className="tc-head">
            <span className="chip-sm light"><Icon name="tag" size={13} /> <T>Нархи оптовӣ</T></span>
            <h2><T>Бештар харед, арзонтар мешавад</T></h2>
            <p><T>Дар сабад ҳар қадар зиёд харед, нархи молҳо камтар мешавад. Барои фармоиши калон нархи махсусро дар WhatsApp пурсед.</T></p>
          </div>
          <WaLink text="Салом! Барои фармоиши калон нархи оптовӣ лозим аст." className="tc-rfq">
            <Icon name="wa" size={18} /> <T>Нархи оптовиро дар WhatsApp пурсед</T>
            <Icon name="chevron" size={16} stroke={2.4} />
          </WaLink>
        </section>

        <section className="block">
          <div className="sec-head"><h2><T>Маҳсулоти машҳур</T></h2></div>
          <div className="grid2">{popular.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
        </section>

        <section className="block">
          <div className="sec-head"><h2><T>Чӣ тавр кор мекунем</T></h2></div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="step">
                <span className="step-ic"><Icon name={s.icon} size={20} /><i>{i + 1}</i></span>
                <b><T>{s.title}</T></b>
                <span><T>{s.text}</T></span>
              </div>
            ))}
          </div>
        </section>

        <section className="block" id="popular">
          <div className="sec-head"><h2><T>Барои шумо</T></h2><Link href="/catalog"><T>Ҳама</T> <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
          <ProductFeed items={feed} />
        </section>

        <footer className="foot">
          <div className="pay">
            {["Алиф", "DC Pay", "Эсхата", "Visa / MC", "Интиқоли бонкӣ", "Нақд"].map((x) => <span key={x}><T>{x}</T></span>)}
          </div>
          <div className="foot-links">
            <a href="#"><T>Дар бораи мо</T></a><a href="#"><T>Шартҳои оптовӣ</T></a><a href="#"><T>Расонидан</T></a><a href="#"><T>Тамос</T></a>
          </div>
          <p><T>© 2026 RamzIx · Душанбе, Тоҷикистон</T></p>
        </footer>
      </main>

      <BottomNav />
    </>
  );
}

/* Маҳсулотро аз кишварҳои гуногун омехта мекунад, то лента якранг набошад */
function interleave<T extends { source: string }>(items: T[]): T[] {
  const groups = new Map<string, T[]>();
  items.forEach((p) => groups.set(p.source, [...(groups.get(p.source) ?? []), p]));
  const lists = [...groups.values()];
  const out: T[] = [];
  for (let i = 0; out.length < items.length; i++) lists.forEach((l) => l[i] && out.push(l[i]));
  return out;
}
