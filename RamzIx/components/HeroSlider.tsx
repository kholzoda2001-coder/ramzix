"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { waLink } from "@/lib/catalog";
import Icon from "./Icon";
import useDragScroll from "./useDragScroll";
import { useT, T } from "./Lang";
import WaLink from "./WaLink";

const SLIDES = [
  { key: "earbuds" },
  { key: "global" },
  { key: "tiers" },
] as const;

export default function HeroSlider() {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  useDragScroll(ref);
  const [i, setI] = useState(0);

  // Ҳар 5 сония слайди навбатӣ; ангушт ҳам кор мекунад (scroll-snap)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => setI(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    const t = setInterval(() => {
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % SLIDES.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 5000);
    return () => { el.removeEventListener("scroll", onScroll); clearInterval(t); };
  }, []);

  return (
    <div className="hero">
      <div className="hero-track" ref={ref}>
        <div className="slide slide-img">
          <Image src="/hero-earbuds.webp" alt={t("Наушникҳои бесими Anker soundcore")} width={780} height={480} priority className="slide-photo" />
          <div className="slide-img-text">
            <span className="chip-sm">Anker · soundcore</span>
            <h2><T>Наушникҳои бесим</T></h2>
            <p><T>Аслӣ, аз Дубай, бо кафолат</T></p>
            <Link href="/#popular" className="btn btn-sm btn-navy"><T>Харид</T> <Icon name="chevron" size={14} stroke={2.4} /></Link>
          </div>
        </div>

        <div className="slide slide-global">
          <span className="chip-sm light"><Icon name="globe" size={13} /> <T>Таъминоти байналмилалӣ</T></span>
          <h2><T>Маҳсулот аз</T> <em><T>Дубай, Чин, Туркия</T></em> <T>барои мағозаи шумо</T></h2>
          <p><T>Расонидан ба тамоми Тоҷикистон</T></p>
          <Link href="/#countries" className="btn btn-sm btn-orange"><T>Дидани каталог</T> <Icon name="chevron" size={14} stroke={2.4} /></Link>
          <div className="slide-art" aria-hidden="true">
            <svg viewBox="0 0 120 90"><g fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 62h100l-12 16H22z" fill="#13325e" /><path d="M28 62V46h22v16M54 62V38h22v24M80 62V50h16v12" fill="#1d3a66" /><path d="M60 38V22l10 6-10 6" /></g><g stroke="#ffffff55" strokeWidth="2" strokeLinecap="round"><path d="M14 84h20M44 86h30M84 84h22" /></g></svg>
          </div>
        </div>

        <div className="slide slide-tiers">
          <span className="chip-sm light"><Icon name="tag" size={13} /> <T>Нархи оптовӣ</T></span>
          <h2><T>Бештар харед,</T> <em><T>арзонтар</T></em> <T>пардохт кунед</T></h2>
          <p><T>Барои фармоиши калон нархи махсус</T></p>
          <WaLink text="Салом! Барои фармоиши калон нархи оптовӣ лозим аст." className="btn btn-sm btn-orange"><Icon name="wa" size={16} /> <T>Дар WhatsApp пурсед</T></WaLink>
        </div>
      </div>
      <div className="hero-dots">
        {SLIDES.map((s, k) => (
          <button
            key={s.key}
            className={k === i ? "on" : ""}
            aria-label={t("Слайди {n}", { n: k + 1 })}
            onClick={() => ref.current?.scrollTo({ left: k * ref.current.clientWidth, behavior: "smooth" })}
          />
        ))}
      </div>
    </div>
  );
}
