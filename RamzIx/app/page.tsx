import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Flag from "@/components/Flag";
import HeroSlider from "@/components/HeroSlider";
import HomeHeader from "@/components/HomeHeader";
import Icon from "@/components/Icon";
import ProductCard from "@/components/ProductCard";
import ProductFeed from "@/components/ProductFeed";
import { CATEGORIES, COUNTRIES, fmt, products, waLink, type CountryCode } from "@/lib/catalog";
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
          <Link href="/catalog" className="on">Ҳама</Link>
          <Link href="/catalog?category=audio">Наушник</Link>
          <Link href="/catalog?category=men">Либос</Link>
          <Link href="/catalog?category=food">Озуқа</Link>
          <Link href="/brands">Брендҳо</Link>
          <Link href="/categories">Категорияҳо</Link>
        </nav>

        <HeroSlider />

        <section className="trust-row">
          {TRUST.map((t) => (
            <div key={t.title} className="trust">
              <span className="trust-ic"><Icon name={t.icon} size={20} /></span>
              <div><b>{t.title}</b><span>{t.text}</span></div>
            </div>
          ))}
        </section>

        <section className="block" id="countries">
          <div className="sec-head"><h2>Харид аз рӯи кишвар</h2></div>
          <div className="countries">
            {(Object.keys(COUNTRIES) as CountryCode[]).map((c) => (
              <Link key={c} href={`/catalog?country=${c}`} className="country">
                <Flag code={c} className="country-flag" />
                <b>{COUNTRIES[c].short}</b>
                <span>{products.filter((p) => p.country === c).length || "Ба наздикӣ"}{products.some((p) => p.country === c) ? " мол" : ""}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="block" id="catalog">
          <div className="sec-head"><h2>Категорияҳо</h2><Link href="/categories">Ҳама <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
          <div className="cats">
            {CATEGORIES.map((c) => (
              <Link key={c.id} href={c.id === "all" ? "/categories" : categoryCount(c.id) > 0 ? `/catalog?category=${c.id}` : "/categories"} className="cat">
                <span className="cat-ic" style={{ background: c.tint }}><Icon name={c.icon} size={26} stroke={1.6} /></span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="block">
          <div className="sec-head"><h2>Брендҳо</h2><Link href="/brands">Ҳама <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
          <div className="brand-row">
            {brands.map((b) => (
              <Link key={b.slug} href={`/catalog?brand=${b.slug}`} className="brand-chip">
                <span className="bc-logo sm">{b.name.slice(0, 2).toUpperCase()}</span>
                <span><b>{b.name}</b><small>{b.count} мол</small></span>
              </Link>
            ))}
          </div>
        </section>

        {food.length > 0 && (
          <section className="block" id="food">
            <div className="sec-head">
              <div><h2>Озуқа ва нӯшокӣ</h2><p className="sec-sub">Бо картон ва бо кило</p></div>
            </div>
            <div className="hscroll">
              {food.map((p) => <ProductCard key={p.slug} p={p} compact />)}
            </div>
          </section>
        )}

        <section className="tiers-card" id="rfq">
          <div className="tc-head">
            <span className="chip-sm light"><Icon name="tag" size={13} /> Нархи оптовӣ</span>
            <h2>Бештар харед, арзонтар мешавад</h2>
            <p>Дар сабад ҳар қадар зиёд харед, нархи молҳо камтар мешавад. Барои фармоиши калон нархи махсусро дар WhatsApp пурсед.</p>
          </div>
          <a href={waLink("Салом! Барои фармоиши калон нархи оптовӣ лозим аст.")} className="tc-rfq">
            <Icon name="wa" size={18} /> Нархи оптовиро дар WhatsApp пурсед
            <Icon name="chevron" size={16} stroke={2.4} />
          </a>
        </section>

        <section className="block">
          <div className="sec-head"><h2>Маҳсулоти машҳур</h2></div>
          <div className="grid2">{popular.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
        </section>

        <section className="block">
          <div className="sec-head"><h2>Чӣ тавр кор мекунем</h2></div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="step">
                <span className="step-ic"><Icon name={s.icon} size={20} /><i>{i + 1}</i></span>
                <b>{s.title}</b>
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="block" id="popular">
          <div className="sec-head"><h2>Барои шумо</h2><Link href="/catalog">Ҳама <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
          <ProductFeed items={feed} />
        </section>

        <section className="partner" id="profile">
          <span className="partner-ic"><Icon name="store" size={26} /></span>
          <h2>Мағоза ё ширкат доред?</h2>
          <p>Ҳисоби бизнес кушоед: нархҳои махсус, фактураи расмӣ ва пардохт бо мӯҳлат.</p>
          <ul>
            <li><Icon name="check" size={16} stroke={2.6} /> Менеҷери шахсӣ ва пайгирии бор</li>
            <li><Icon name="check" size={16} stroke={2.6} /> Фармоиш аз рӯи талаботи шумо</li>
            <li><Icon name="check" size={16} stroke={2.6} /> Ҳуҷҷатҳои гумрукӣ ва сертификат</li>
          </ul>
          <div className="partner-actions">
            <a href="#" className="btn btn-orange">Бақайдгирии бизнес</a>
            <a href={waLink("Салом! Мехоҳам ҳисоби бизнес кушоям.")} className="btn btn-wa" aria-label="WhatsApp"><Icon name="wa" /></a>
          </div>
        </section>

        <footer className="foot">
          <div className="pay">
            {["Алиф", "DC Pay", "Эсхата", "Visa / MC", "Интиқоли бонкӣ", "Нақд"].map((x) => <span key={x}>{x}</span>)}
          </div>
          <div className="foot-links">
            <a href="#">Дар бораи мо</a><a href="#">Шартҳои оптовӣ</a><a href="#">Расонидан</a><a href="#">Тамос</a>
          </div>
          <p>© 2026 RamzIx · Душанбе, Тоҷикистон</p>
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
