"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/catalog";
import { listUnitPrice } from "@/lib/pricing";
import { useMoney } from "./Currency";
import Icon from "./Icon";
import { useT } from "./Lang";
import ProductImage from "./ProductImage";
import useDragScroll from "./useDragScroll";

/** Слайдер: ҳар 5 сония слайди навбатӣ; ангушт ҳам кор мекунад (scroll-snap) */
export function Slider({ count, children }: { count: number; children: React.ReactNode }) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  useDragScroll(ref);
  const [i, setI] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || count < 2) return;
    const onScroll = () => setI(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    const timer = setInterval(() => {
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % count;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 5000);
    return () => { el.removeEventListener("scroll", onScroll); clearInterval(timer); };
  }, [count]);

  return (
    <div className="hero">
      <div className="hero-track" ref={ref}>{children}</div>
      <div className="hero-dots">
        {Array.from({ length: count }, (_, k) => (
          <button
            key={k}
            className={k === i ? "on" : ""}
            aria-label={t("Слайди {n}", { n: k + 1 })}
            onClick={() => ref.current?.scrollTo({ left: k * ref.current.clientWidth, behavior: "smooth" })}
          />
        ))}
      </div>
    </div>
  );
}

/** Як баннер: сарлавҳаи калон, ёддошт, нархи «аз …», тугма ва акси воқеии маҳсулот дар рост */
export function BannerSlide({ title, sub, href, from, to, list, fill = [], eager }: { title: string; sub: string; href: string; from: string; to: string; list: Product[]; fill?: Product[]; eager?: boolean }) {
  const { t } = useT();
  const { price, label } = useMoney();
  // Аввал акси асосии молҳои худи ин бахш; агар кам бошанд, аз молҳои дигари ҳамон категория пур мешавад
  const pics = [...new Set([...list, ...fill].map((p) => p.images[0]).filter(Boolean))].slice(0, 3);
  const from_ = Math.min(...(list.length ? list : fill).map(listUnitPrice));
  return (
    <div className="slide tb" data-ghost={t(title)} style={{ "--a": from, "--b": to } as React.CSSProperties}>
      <Link href={href} className="tb-pics" aria-label={t(title)} draggable={false}>
        {pics.map((src, k) => (
          <span key={src}><ProductImage src={src} alt="" eager={eager && k === 0} sizes="(min-width: 1000px) 260px, 140px" /></span>
        ))}
      </Link>
      {Number.isFinite(from_) && <span className="tb-badge" aria-hidden="true"><i>{t("аз")}</i><b>{price(from_)}</b><em>{label}</em></span>}
      <div className="tb-text">
        <span className="tb-chip">{t(sub)}</span>
        <h2>{t(title)}</h2>
        <Link href={href} className="sb-btn" draggable={false}>{t("Харид")} <Icon name="chevron" size={12} stroke={2.8} /></Link>
      </div>
    </div>
  );
}
