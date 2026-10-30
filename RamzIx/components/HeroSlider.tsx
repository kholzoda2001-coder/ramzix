"use client";

import Image from "next/image";
import Link from "next/link";
import { COUNTRIES } from "@/lib/catalog";
import { discountLadder } from "@/lib/pricing";
import { SHIPPING } from "@/lib/pricing-config";
import type { HeroCfg } from "@/lib/site-config";
import { useCatalog } from "@/lib/useCatalog";
import { useSite } from "@/lib/useSite";
import { BannerSlide, Slider } from "./Banners";
import Icon from "./Icon";
import { useT, T } from "./Lang";

/* Баннерҳои варақаи «Ҳама»: рӯйхат, матн, ранг ва пайвандҳо аз admin (Сайт → Саҳифаи асосӣ) меоянд */
export default function HeroSlider() {
  const { t } = useT();
  const { products } = useCatalog();
  const { hero } = useSite();

  // Нархи карго ва тахфиф аз танзимоти зинда: дар баннер ҳамеша қимати ҳозира нишон дода мешавад
  const cargo = (["cn", "ae"] as const).map((c) => { const m = SHIPPING[c][0]; return { name: COUNTRIES[c].short, kg: m.perKgUsd, a: m.daysMin, b: m.daysMax }; });
  const maxOff = String(discountLadder().at(-1)?.off ?? 0).replace(".", ",");

  const slides = hero.filter((h) => h.active).flatMap((h) => {
    if (h.kind === "category") {
      const list = products.filter((p) => p.category === h.category);
      return list.length ? [{ h, list }] : [];
    }
    return [{ h, list: [] }];
  });

  const parts = (title: string) => title.split("*").map((s, i) => (i % 2 ? <span key={i}><em>{t(s.trim())}</em>{" "}</span> : <span key={i}>{t(s.trim())}{" "}</span>));

  const render = ({ h, list }: { h: HeroCfg; list: typeof products }) => {
    if (h.kind === "discount") {
      return (
        <div key={h.id} className="slide slide-big">
          <span className="sb-tag">{t(h.tag)}</span>
          <span className="sb-up"><T>то</T></span>
          <b className="sb-num">{maxOff}<i>%</i></b>
          <span className="sb-sub">{t(h.sub)}</span>
          <Link href={h.href || "/#rfq"} className="sb-btn"><T>Харид</T></Link>
          <Image src="/hero-earbuds.webp" alt="" width={780} height={480} className="sb-photo" />
        </div>
      );
    }
    if (h.kind === "global") {
      return (
        <div key={h.id} className="slide slide-global">
          <span className="chip-sm light"><Icon name="globe" size={13} /> {t(h.tag)}</span>
          <h2>{parts(h.title)}</h2>
          <p>{h.sub ? t(h.sub) : cargo.map((c) => t("{c}: ${k}/кг, {a}–{b} рӯз", { c: t(c.name), k: String(c.kg).replace(".", ","), a: c.a, b: c.b })).join(" · ")}</p>
          <Link href={h.href || "/catalog"} className="btn btn-sm btn-orange"><T>Дидани каталог</T> <Icon name="chevron" size={14} stroke={2.4} /></Link>
          <div className="slide-art" aria-hidden="true">
            <svg viewBox="0 0 120 90"><g fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 62h100l-12 16H22z" fill="#13325e" /><path d="M28 62V46h22v16M54 62V38h22v24M80 62V50h16v12" fill="#1d3a66" /><path d="M60 38V22l10 6-10 6" /></g><g stroke="#ffffff55" strokeWidth="2" strokeLinecap="round"><path d="M14 84h20M44 86h30M84 84h22" /></g></svg>
          </div>
        </div>
      );
    }
    if (h.kind === "category") {
      return <BannerSlide key={h.id} title={h.title} sub={h.sub} href={h.href || `/catalog?category=${h.category}`} from={h.from} to={h.to} list={list} fill={list} />;
    }
    return (
      <div key={h.id} className="slide slide-custom" style={{ background: `linear-gradient(135deg, ${h.from}, ${h.to})` }}>
        {h.tag && <span className="chip-sm light">{t(h.tag)}</span>}
        <h2>{parts(h.title)}</h2>
        {h.sub && <p>{t(h.sub)}</p>}
        {h.href && <Link href={h.href} className="btn btn-sm btn-orange"><T>Харид</T> <Icon name="chevron" size={14} stroke={2.4} /></Link>}
      </div>
    );
  };

  if (!slides.length) return null;
  return <Slider count={slides.length}>{slides.map(render)}</Slider>;
}
