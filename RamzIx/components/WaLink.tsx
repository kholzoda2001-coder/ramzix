"use client";

import { waLink } from "@/lib/catalog";
import { useT } from "./Lang";

/* Пайванди WhatsApp бо паёми тарҷумашуда */
export default function WaLink({ text, className, children }: { text: string; className?: string; children: React.ReactNode }) {
  const { t } = useT();
  return <a href={waLink(t(text))} className={className}>{children}</a>;
}
