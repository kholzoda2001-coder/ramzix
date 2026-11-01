import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import HeroSlider from "@/components/HeroSlider";
import HomeHeader from "@/components/HomeHeader";
import HomeSwitch from "@/components/HomeTabs";
import Icon from "@/components/Icon";
import { T } from "@/components/Lang";
import WaLink from "@/components/WaLink";
import { HowSteps, PayList, TrustRow, Tx } from "@/components/HomeInfo";
import { BrandRow, CategoryGrid, FoodRow, DealsPair, ForYouFeed, TierLadder } from "@/components/HomeSections";
import { HomeByMode, TradeBrands, TradeCats, TradeCta, TradeFacts, TradeHero, TradeRows, TradeShip, TradeTiers } from "@/components/TradeHome";

export default function Home() {
  const rfq = (
    <section className="tiers-card" id="rfq">
      <div className="tc-head">
        <span className="chip-sm light"><Icon name="tag" size={13} /> <T>Нархи оптовӣ</T></span>
        <h2><Tx k="tierTitle" /></h2>
        <p><Tx k="tierText" /></p>
      </div>
      <TierLadder />
      <WaLink text="Салом! Барои фармоиши калон нархи оптовӣ лозим аст." className="tc-rfq">
        <Icon name="wa" size={18} /> <T>Нархи оптовиро дар WhatsApp пурсед</T>
        <Icon name="chevron" size={16} stroke={2.4} />
      </WaLink>
    </section>
  );
  const foot = (
    <footer className="foot">
      <PayList />
      <div className="foot-links">
        <Link href="/#rfq"><T>Шартҳои оптовӣ</T></Link><Link href="/categories"><T>Категорияҳо</T></Link><Link href="/brands"><T>Брендҳо</T></Link><WaLink text="Салом! Савол дорам."><T>Тамос</T></WaLink>
      </div>
      <p><Tx k="footer" /></p>
    </footer>
  );

  return (
    <>
      <HomeHeader />

      <main className="home">
        <HomeSwitch>
          <HomeByMode
            trade={
              <>
                <TradeHero />
                <TradeFacts />
                <TradeCats />
                <TradeBrands />
                <TradeRows />
                <TradeTiers />
                <HowSteps />
                <TradeShip />
                <TrustRow />
                <TradeCta />
                {foot}
              </>
            }
            shop={
              <>
                <HeroSlider />
                <CategoryGrid />
                <DealsPair />
                <BrandRow />
                <ForYouFeed />
                <FoodRow />
                {rfq}
                <TrustRow />
                <HowSteps />
                {foot}
              </>
            }
          />
        </HomeSwitch>
      </main>

      <BottomNav />
    </>
  );
}
