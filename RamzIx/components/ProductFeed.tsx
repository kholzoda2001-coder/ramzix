"use client";

import { useState } from "react";
import { COUNTRIES, shownCountries, type CountryCode, type Product } from "@/lib/catalog";
import Flag from "./Flag";
import Icon from "./Icon";
import ProductCard from "./ProductCard";
import { T } from "./Lang";

const PAGE = 10;

export default function ProductFeed({ items }: { items: Product[] }) {
  const [tab, setTab] = useState<CountryCode | "all">("all");
  // Танҳо кишварҳое, ки дар admin фаъоланд ва мол доранд
  const TABS: (CountryCode | "all")[] = ["all", ...shownCountries().filter((c) => items.some((p) => p.country === c))];
  const [shown, setShown] = useState(PAGE);
  const cur = TABS.includes(tab) ? tab : "all";
  const list = cur === "all" ? items : items.filter((p) => p.country === cur);

  return (
    <>
      <div className="seg" role="tablist">
        {TABS.map((x) => (
          <button key={x} role="tab" aria-selected={cur === x} className={cur === x ? "on" : ""} onClick={() => { setTab(x); setShown(PAGE); }}>
            {x === "all" ? <T>Ҳама</T> : <><Flag code={x} className="seg-flag" /><T>{COUNTRIES[x].short}</T></>}
          </button>
        ))}
      </div>
      {list.length ? (
        <>
          <div className="grid2">{list.slice(0, shown).map((p) => <ProductCard key={p.slug} p={p} />)}</div>
          {list.length > shown && (
            <button className="more-btn" onClick={() => setShown(shown + PAGE)}>
              <T>Боз нишон додан</T> <span>{list.length - shown}</span> <Icon name="down" size={16} />
            </button>
          )}
        </>
      ) : (
        <div className="empty">
          <Icon name="box" size={34} stroke={1.5} />
          <b><T>Ба наздикӣ</T></b>
          <span><T>Маҳсулоти ватанӣ ба зудӣ илова мешавад</T></span>
        </div>
      )}
    </>
  );
}
