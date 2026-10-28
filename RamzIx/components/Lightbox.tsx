"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import ProductImage from "./ProductImage";
import useDragScroll from "./useDragScroll";
import { useT, T } from "./Lang";

/* Галереяи экрани пурра: ҳар расм калон, бо кашидан ё тирҳо иваз мешавад */
export default function Lightbox({ images, name, start, onClose }: { images: string[]; name: string; start: number; onClose: (last: number) => void }) {
  const { t } = useT();
  const track = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(start);
  const cur = useRef(start);
  useDragScroll(track);

  useEffect(() => {
    const el = track.current;
    if (el) { el.style.scrollBehavior = "auto"; el.scrollLeft = start * el.clientWidth; el.style.scrollBehavior = ""; }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(cur.current);
      if (e.key === "ArrowRight") go(cur.current + 1);
      if (e.key === "ArrowLeft") go(cur.current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (i: number) => {
    const el = track.current;
    if (!el || i < 0 || i >= images.length) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label={name}>
      <div className="lb-top">
        <span>{k + 1} / {images.length}</span>
        <button onClick={() => onClose(cur.current)} aria-label={t("Пӯшидан")}><Icon name="close" size={22} stroke={2.2} /></button>
      </div>
      <div
        className="lb-track"
        ref={track}
        onScroll={(e) => {
          const i = Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth);
          cur.current = i;
          setK(i);
        }}
      >
        {images.map((src, i) => (
          <div className="lb-slide" key={src}><ProductImage src={src} alt={`${name} — ${i + 1}`} eager /></div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button className="lb-nav prev" onClick={() => go(k - 1)} disabled={k === 0} aria-label={t("Қафо")}><Icon name="chevron" size={22} stroke={2.4} /></button>
          <button className="lb-nav next" onClick={() => go(k + 1)} disabled={k === images.length - 1} aria-label={t("Пеш")}><Icon name="chevron" size={22} stroke={2.4} /></button>
          <div className="lb-thumbs">
            {images.map((src, i) => (
              <button key={src} className={i === k ? "on" : ""} onClick={() => go(i)} aria-label={t("Сурати {n}", { n: i + 1 })}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
