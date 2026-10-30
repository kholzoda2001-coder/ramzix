"use client";

import { useState } from "react";
import { brandLogo } from "@/lib/brands";
import { useSite } from "@/lib/useSite";

/* Логои бренд: акси логои расмӣ (агар бошад), вагарна ҳарфҳо бо рангҳои бренд */
export default function BrandLogo({ name, small }: { name: string; small?: boolean }) {
  const { brandLogos } = useSite();
  const l = brandLogo(name);
  l.img = brandLogos[name] ?? l.img;
  const [broken, setBroken] = useState(false);
  if (l.img && !broken) {
    return (
      <span className={`bc-logo img ${small ? "sm" : ""}`} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={l.img} alt="" loading="lazy" decoding="async" onError={() => setBroken(true)} />
      </span>
    );
  }
  return <span className={`bc-logo ${small ? "sm" : ""}`} style={{ background: l.bg, color: l.fg }} aria-hidden="true">{l.mark}</span>;
}
