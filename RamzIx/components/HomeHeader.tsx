"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
import Icon from "./Icon";
import { CartBadge } from "./Cart";
import { useT, T } from "./Lang";
import SideMenu from "./SideMenu";

export default function HomeHeader() {
  const { t } = useT();
  const [menu, setMenu] = useState(false);
  return (
    <header className="home-header">
      <SideMenu open={menu} onClose={() => setMenu(false)} />
      <div className="hh-row">
        <button className="ic-btn" aria-label={t("Меню")} aria-expanded={menu} onClick={() => setMenu(true)}><Icon name="menu" /></button>
        <Logo />
        <div className="hh-actions">
          <button className="ic-btn" aria-label={t("Огоҳиҳо")}><Icon name="bell" /><span className="dot" /></button>
          <Link href="/cart" className="ic-btn" aria-label={t("Сабад")}><Icon name="cart" /><CartBadge /></Link>
        </div>
      </div>
      <form className="search" role="search" action="/catalog">
        <Icon name="search" size={20} />
        <input name="q" placeholder={t("Ҷустуҷӯи маҳсулот, бренд ё артикул")} aria-label={t("Ҷустуҷӯ")} />
        <Link href="/catalog" className="search-scan" aria-label={t("Филтр")}><Icon name="filter" size={18} /></Link>
      </form>
      <div className="hh-meta">
        <span><Icon name="pin" size={15} /> <T>Расонидан ба</T> <b><T>Душанбе</T></b> <Icon name="down" size={14} /></span>
      </div>
    </header>
  );
}
