import { brandLogo } from "@/lib/brands";

/* Логои бренд: ранги худи бренд ва ҳарфҳои он */
export default function BrandLogo({ name, small }: { name: string; small?: boolean }) {
  const l = brandLogo(name);
  return <span className={`bc-logo ${small ? "sm" : ""}`} style={{ background: l.bg, color: l.fg }} aria-hidden="true">{l.mark}</span>;
}
