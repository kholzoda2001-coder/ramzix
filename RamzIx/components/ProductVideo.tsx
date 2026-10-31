"use client";

import { useState } from "react";
import { parseVideo } from "@/lib/video";
import { useT } from "./Lang";

/* Видеои маҳсулот. Плеер танҳо баъди пахш бор мешавад, то саҳифа сабук монад. */
export default function ProductVideo({ url, name }: { url: string; name: string }) {
  const { t } = useT();
  const v = parseVideo(url);
  const [on, setOn] = useState(false);
  if (!v) return null;

  return (
    <section className="pd-video" aria-label={t("Видео")}>
      {v.kind === "file" ? (
        <video src={v.url} controls playsInline preload="none" title={name} />
      ) : on ? (
        <iframe
          title={name}
          src={v.kind === "youtube"
            ? `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`
            : `https://player.vimeo.com/video/${v.id}?autoplay=1`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" className="pv-play" onClick={() => setOn(true)} aria-label={t("Видеоро тамошо кунед")}>
          {v.kind === "youtube" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" />
          )}
          <span className="pv-btn" aria-hidden>▶</span>
        </button>
      )}
    </section>
  );
}
