"use client";

import { useState } from "react";
import { COUNTRIES, type CountryCode, type Product } from "@/lib/catalog";
import Flag from "./Flag";
import Icon from "./Icon";
import ProductCard from "./ProductCard";

const TABS: (CountryCode | "all")[] = ["all", "ae", "cn", "tr", "tj"];
const PAGE = 10;

export default function ProductFeed({ items }: { items: Product[] }) {
  const [tab, setTab] = useState<CountryCode | "all">("all");
  const [shown, setShown] = useState(PAGE);
  const list = tab === "all" ? items : items.filter((p) => p.country === tab);

  return (
    <>
      <div className="seg" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => { setTab(t); setShown(PAGE); }}>
            {t === "all" ? "Ҳама" : <><Flag code={t} className="seg-flag" />{COUNTRIES[t].short}</>}
          </button>
        ))}
      </div>
      {list.length ? (
        <>
          <div className="grid2">{list.slice(0, shown).map((p) => <ProductCard key={p.slug} p={p} />)}</div>
          {list.length > shown && (
            <button className="more-btn" onClick={() => setShown(shown + PAGE)}>
              Боз нишон додан <span>{list.length - shown}</span> <Icon name="down" size={16} />
            </button>
          )}
        </>
      ) : (
        <div className="empty">
          <Icon name="box" size={34} stroke={1.5} />
          <b>Ба наздикӣ</b>
          <span>Маҳсулоти ватанӣ ба зудӣ илова мешавад</span>
        </div>
      )}
    </>
  );
}
