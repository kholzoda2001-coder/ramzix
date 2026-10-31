"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { discountLadder } from "@/lib/pricing";
import Icon from "./Icon";
import { CartBadge } from "./Cart";
import { useMoney } from "./Currency";
import { T, useT } from "./Lang";
import { LogoMark } from "./Logo";
import SideMenu from "./SideMenu";
import { useSite } from "@/lib/useSite";
import { setHomeTab, useHomeTab } from "./HomeTabs";

// Варақаҳои сарлавҳа (false — пинҳон)
const SHOW_TABS = true;

/* Сарлавҳа болои баннер шаффоф аст; пас аз поён рафтан равшан мешавад ва сатри ҷустуҷӯ пайдо мешавад */
export default function HomeHeader() {
  const { t } = useT();
  const { sum, label } = useMoney();
  const [menu, setMenu] = useState(false);
  const [solid, setSolid] = useState(false);
  const step = discountLadder()[1];
  const tab = useHomeTab();
  const tabs = useSite().tabs.filter((x) => x.show);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 170);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`home-header ${solid ? "solid" : ""}`}>
      <SideMenu open={menu} onClose={() => setMenu(false)} />
      <div className="hh-row">
        <button className="ic-btn" aria-label={t("Меню")} aria-expanded={menu} onClick={() => setMenu(true)}><Icon name="menu" /></button>
        {solid ? (
          <form className="search" role="search" action="/catalog">
            <input name="q" placeholder={t("Ҷустуҷӯи маҳсулот, бренд ё артикул")} aria-label={t("Ҷустуҷӯ")} />
            <button className="search-go" aria-label={t("Ҷустуҷӯ")}><Icon name="search" size={18} stroke={2.4} /></button>
          </form>
        ) : (
          <Link href="/" className="hh-word" aria-label="RamzIx" onClick={() => setHomeTab("all")}><LogoMark size={26} /><span>Ramz<b>Ix</b></span></Link>
        )}
        <div className="hh-actions">
          {!solid && <Link href="/catalog" className="ic-btn" aria-label={t("Ҷустуҷӯ")}><Icon name="search" /></Link>}
          <Link href="/cart" className="ic-btn" aria-label={t("Сабад")}><Icon name="cart" /><CartBadge /></Link>
        </div>
      </div>
      {SHOW_TABS && (
        <nav className="hh-tabs" aria-label={t("Категорияҳо")}>
          {tabs.map((x) => <button key={x.id} className={x.id === tab ? "on" : ""} aria-pressed={x.id === tab} onClick={() => setHomeTab(x.id)}><T>{x.label}</T></button>)}
        </nav>
      )}
      {solid && (
        <Link href="/#rfq" className="hh-promo">
          <b><Icon name="tag" size={15} /> <T>Тахфифи ҳаҷм</T></b>
          <span>{t("Аз {x}: −{p}%", { x: `${sum(step.from)} ${label}`, p: String(step.off).replace(".", ",") })}</span>
        </Link>
      )}
    </header>
  );
}
