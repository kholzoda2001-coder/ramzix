import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Countdown from "@/components/Countdown";
import Flag from "@/components/Flag";
import HeroSlider from "@/components/HeroSlider";
import HomeHeader from "@/components/HomeHeader";
import Icon from "@/components/Icon";
import ProductCard from "@/components/ProductCard";
import ProductFeed from "@/components/ProductFeed";
import { CATEGORIES, COUNTRIES, products, waLink, type CountryCode } from "@/lib/catalog";

const TRUST = [
  { icon: "shield", title: "Маҳсулоти аслӣ", text: "Аз таъминкунандагони санҷидашуда" },
  { icon: "truck", title: "Расонидан", text: "Ба тамоми Тоҷикистон" },
  { icon: "tag", title: "Нархи зинагӣ", text: "Аз 4 дона арзонтар" },
  { icon: "headset", title: "Менеҷери шахсӣ", text: "Тоҷикӣ, русӣ, англисӣ" },
];

const STEPS = [
  { icon: "search", title: "Интихоб", text: "Маҳсулот ва миқдор" },
  { icon: "doc", title: "Тасдиқ", text: "Нарх ва мӯҳлат" },
  { icon: "card", title: "Пардохт", text: "Алиф, DC, бонк" },
  { icon: "truck", title: "Расонидан", text: "То дари мағоза" },
];

export default function Home() {
  // Тахфифҳо: маҳсулоте, ки нархи пешинаашон баландтар буд
  const deals = products.filter((p) => p.listPrice).slice(0, 6);
  const popular = interleave([...products].sort((a, b) => b.reviews - a.reviews)).slice(0, 4);
  const feed = interleave(products.filter((p) => !popular.includes(p)));

  return (
    <>
      <HomeHeader />

      <main className="home">
        <nav className="cat-pills" aria-label="Категорияҳо">
          <a className="on">Ҳама</a>
          <a href="#catalog">Наушник</a>
          <a href="#catalog">Либос</a>
          <a href="#catalog">Телефон</a>
          <a href="#catalog">Хона</a>
          <a href="#catalog">Зебоӣ</a>
          <a href="#catalog">Кӯдакон</a>
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
              <Link key={c} href="/#catalog" className="country">
                <Flag code={c} className="country-flag" />
                <b>{COUNTRIES[c].short}</b>
                <span>{products.filter((p) => p.country === c).length || "Ба наздикӣ"}{products.some((p) => p.country === c) ? " мол" : ""}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="block" id="catalog">
          <div className="sec-head"><h2>Категорияҳо</h2><Link href="/#catalog">Ҳама <Icon name="chevron" size={14} stroke={2.4} /></Link></div>
          <div className="cats">
            {CATEGORIES.map((c) => (
              <Link key={c.id} href="/#popular" className="cat">
                <span className="cat-ic" style={{ background: c.tint }}><Icon name={c.icon} size={26} stroke={1.6} /></span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {deals.length > 0 && (
          <section className="block deals">
            <div className="sec-head">
              <h2><Icon name="bolt" size={20} className="bolt" /> Нархи рӯз</h2>
              <span className="deals-timer">Тамом мешавад <Countdown /></span>
            </div>
            <div className="hscroll">
              {deals.map((p) => <ProductCard key={p.slug} p={p} compact />)}
            </div>
          </section>
        )}

        <section className="tiers-card">
          <div className="tc-head">
            <span className="chip-sm light"><Icon name="tag" size={13} /> Чӣ тавр нарх кор мекунад</span>
            <h2>Як дона ҳам мумкин, оптом арзонтар</h2>
            <p>Нархи як дона худкор аз рӯи миқдор паст мешавад.</p>
          </div>
          <div className="tc-steps">
            <div><small>Чакана</small><b>1–3</b><span>нархи оддӣ</span></div>
            <div><small>Хурдоптом</small><b>4–9</b><span>−5%</span></div>
            <div className="best"><small>Оптовӣ</small><b>10–49</b><span>−10%</span></div>
            <div><small>Калон</small><b>50+</b><span>то −14%</span></div>
          </div>
          <a href={waLink("Салом! Барои фармоиши калон (100+ дона) нархи махсус лозим аст.")} className="tc-rfq" id="rfq">
            <Icon name="doc" size={18} /> 100+ дона? Нархи махсусро дархост кунед
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
          <div className="sec-head"><h2>Барои шумо</h2></div>
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
