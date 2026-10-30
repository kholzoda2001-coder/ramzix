"use client";

import Image from "next/image";
import { useState } from "react";
import { canOptimize } from "@/lib/image-hosts";
import Icon from "./Icon";

/* Тасвири маҳсулот: бо андозаи мувофиқи экран (sizes — паҳнои акс дар экран).
   Агар оптимизатор акси таъминкунандаро нагирад — акси аслӣ; агар он ҳам набошад — ҷойнишин. */
export default function ProductImage({ src, alt, eager, sizes = "(max-width: 480px) 50vw, 240px" }: { src: string; alt: string; eager?: boolean; sizes?: string }) {
  // Ҳолат ба ҳамин акс баста аст: агар дар ҳамин ҷой акси дигар биёяд, аз нав сар мешавад
  const [fallback, setFallback] = useState<{ src: string; stage: "raw" | "failed" } | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const stage = fallback?.src === src ? fallback.stage : canOptimize(src) ? "opt" : "raw";
  const setStage = (s: "raw" | "failed") => setFallback({ src, stage: s });
  const setLoaded = () => setLoadedSrc(src);
  const cls = loadedSrc === src ? undefined : "img-loading";
  if (stage === "failed") {
    return (
      <span className="img-fallback" aria-label={alt}>
        <Icon name="box" size={40} stroke={1.4} />
      </span>
    );
  }
  if (stage === "opt") {
    return (
      <Image
        src={src}
        alt={alt}
        width={800}
        height={800}
        sizes={sizes}
        quality={70}
        loading={eager ? "eager" : "lazy"}
        draggable={false}
        className={cls}
        onLoad={setLoaded}
        onError={() => setStage("raw")}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      referrerPolicy="no-referrer"
      decoding="async"
      className={cls}
      onLoad={setLoaded}
      onError={() => setStage("failed")}
    />
  );
}
