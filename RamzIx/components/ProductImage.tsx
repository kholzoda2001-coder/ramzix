"use client";

import { useState } from "react";
import Icon from "./Icon";

/* Тасвири маҳсулот аз CDN-и таъминкунанда; агар бор нашавад — ҷойнишин */
export default function ProductImage({ src, alt, eager }: { src: string; alt: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="img-fallback" aria-label={alt}>
        <Icon name="box" size={40} stroke={1.4} />
      </span>
    );
  }
  return (
    // Тасвирҳо аз доменҳои гуногуни таъминкунанда меоянд, бинобар ин <img> оддӣ
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      referrerPolicy="no-referrer"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
