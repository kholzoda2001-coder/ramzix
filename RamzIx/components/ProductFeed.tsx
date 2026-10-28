"use client";

import { useState } from "react";
import { COUNTRIES, type CountryCode, type Product } from "@/lib/catalog";
import Flag from "./Flag";
import Icon from "./Icon";
import ProductCard from "./ProductCard";
import { T } from "./Lang";

const TABS: (CountryCode | "all")[] = ["all", "ae", "cn", "tr", "tj"];
const PAGE = 10;

export default function ProductFeed({ items }: { items: Product[] }) {
  const [tab, setTab] = useState<CountryCode | "all">("all");
  const [shown, setShown] = useState(PAGE);
  const list = tab === "all" ? items : items.filter((p) => p.country === tab);

  return (
    <>
      <div className="seg" role="tablist">
        {TABS.map((x) => (
          <button key={x} role="tab" aria-selected={tab === x} className={tab === x ? "on" : ""} onClick={() => { setTab(x); setShown(PAGE); }}>
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
