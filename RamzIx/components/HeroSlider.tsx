"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FEE_TIERS } from "@/lib/pricing-config";
import Icon from "./Icon";

const SLIDES = [
  { key: "earbuds" },
  { key: "global" },
  { key: "tiers" },
] as const;

export default function HeroSlider() {
  const ref = useRef<HTMLDivElement>(null);
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
          <Image src="/hero-earbuds.webp" alt="Наушникҳои бесими Anker soundcore" width={780} height={480} priority className="slide-photo" />
          <div className="slide-img-text">
            <span className="chip-sm">Anker · soundcore</span>
            <h2>Наушникҳои бесим</h2>
            <p>Аслӣ, аз Дубай, бо кафолат</p>
            <Link href="/#popular" className="btn btn-sm btn-navy">Харид <Icon name="chevron" size={14} stroke={2.4} /></Link>
          </div>
        </div>

        <div className="slide slide-global">
          <span className="chip-sm light"><Icon name="globe" size={13} /> Таъминоти байналмилалӣ</span>
          <h2>Маҳсулот аз <em>Дубай, Чин, Туркия</em> барои мағозаи шумо</h2>
          <p>Расонидан ба тамоми Тоҷикистон</p>
          <Link href="/#countries" className="btn btn-sm btn-orange">Дидани каталог <Icon name="chevron" size={14} stroke={2.4} /></Link>
          <div className="slide-art" aria-hidden="true">
            <svg viewBox="0 0 120 90"><g fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 62h100l-12 16H22z" fill="#13325e" /><path d="M28 62V46h22v16M54 62V38h22v24M80 62V50h16v12" fill="#1d3a66" /><path d="M60 38V22l10 6-10 6" /></g><g stroke="#ffffff55" strokeWidth="2" strokeLinecap="round"><path d="M14 84h20M44 86h30M84 84h22" /></g></svg>
          </div>
        </div>

        <div className="slide slide-tiers">
          <span className="chip-sm light"><Icon name="tag" size={13} /> Ҳаққи хизмат</span>
          <h2>Бештар харед, <em>камтар</em> хизмат пардохт кунед</h2>
          <div className="mini-tiers">
            {FEE_TIERS.map((t, i) => (
              <span key={t.from} className={i === 1 ? "on" : ""}>
                <b>{t.pct}%</b>{i === 0 ? "оддӣ" : `${t.from / 1000}k+`}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="hero-dots">
        {SLIDES.map((s, k) => (
          <button
            key={s.key}
            className={k === i ? "on" : ""}
            aria-label={`Слайди ${k + 1}`}
            onClick={() => ref.current?.scrollTo({ left: k * ref.current.clientWidth, behavior: "smooth" })}
          />
        ))}
      </div>
    </div>
  );
}
