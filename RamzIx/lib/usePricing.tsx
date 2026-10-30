"use client";

import { useEffect, useState } from "react";
import { applyPricing, mergePricing, type PricingConfig } from "./pricing-config";

/* Танзимоти нарх ва тамос: `initial` аз сервер меояд ва пеш аз ҳисоб кардани нархҳо (ҳангоми render) ба объектҳои зинда гузошта мешавад,
   то server ва браузер як нарх бинанд. Баъди захира дар admin нав мешавад. */
export function PricingProvider({ children, initial }: { children: React.ReactNode; initial: PricingConfig }) {
  useState(() => { applyPricing(initial); return 0; });
  const [, bump] = useState(0);
  useEffect(() => {
    const load = () => fetch("/api/pricing").then((r) => r.json()).then((d) => { applyPricing(mergePricing(d)); bump((n) => n + 1); }).catch(() => {});
    window.addEventListener("ramzix-pricing-change", load);
    return () => window.removeEventListener("ramzix-pricing-change", load);
  }, []);
  return <>{children}</>;
}
