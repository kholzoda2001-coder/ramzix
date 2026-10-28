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
import { BrandRow, CategoryGrid, Countries, FoodRow, ForYouFeed, PopularGrid } from "@/components/HomeSections";

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

        <Countries />

        <CategoryGrid />

        <BrandRow />

        <FoodRow />

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

        <PopularGrid />

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

        <ForYouFeed />

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
