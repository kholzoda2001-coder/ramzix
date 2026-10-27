import Link from "next/link";
import Logo from "./Logo";
import Icon from "./Icon";
import { CartBadge } from "./Cart";

export default function HomeHeader() {
  return (
    <header className="home-header">
      <div className="hh-row">
        <button className="ic-btn" aria-label="Меню"><Icon name="menu" /></button>
        <Logo />
        <div className="hh-actions">
          <button className="ic-btn" aria-label="Огоҳиҳо"><Icon name="bell" /><span className="dot" /></button>
          <Link href="/cart" className="ic-btn" aria-label="Сабад"><Icon name="cart" /><CartBadge /></Link>
        </div>
      </div>
      <form className="search" role="search" action="/">
        <Icon name="search" size={20} />
        <input name="q" placeholder="Ҷустуҷӯи маҳсулот, бренд ё артикул" aria-label="Ҷустуҷӯ" />
        <button type="button" className="search-scan" aria-label="Филтр"><Icon name="grid" size={18} /></button>
      </form>
      <div className="hh-meta">
        <span><Icon name="pin" size={15} /> Расонидан ба <b>Душанбе</b> <Icon name="down" size={14} /></span>
        <span className="hh-lang">TJ · смн</span>
      </div>
    </header>
  );
}
