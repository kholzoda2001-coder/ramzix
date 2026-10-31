/* Номи дурусти брендҳо ва рангҳои логоашон.
   site — сайти расмии бренд: лого (иконка) аз он гирифта мешавад. Бе site ё агар акс бор нашавад —
   логои матнӣ (ҳарфҳо бо рангҳои бренд). Логои худро метавонед ба public/brands/<slug>.png гузоред
   ва дар logo нишон диҳед: logo: "/brands/<slug>.png". */

type Info = { name: string; bg: string; fg: string; mark?: string; site?: string; logo?: string };

const BRANDS: Record<string, Info> = {
  eurolux: { name: "Eurolux", bg: "#ffffff", fg: "#111111", mark: "EU", logo: "/brands/eurolux.svg" },
  bergamo: { name: "Bergamo", bg: "#ffffff", fg: "#111111", mark: "BG", logo: "/brands/bergamo.png" },
};

/* Номҳое, ки бренд нестанд */
const NOT_BRANDS = new Set(["generic", "no brand", "unbranded"]);

const slugOf = (b: string) => b.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").replace(/ı/g, "i").replace(/İ/g, "i");

/** Номи дурусти бренд; агар бренд набошад — null */
export function cleanBrand(b: string | null | undefined): string | null {
  if (!b) return null;
  const s = slugOf(b.normalize("NFKD").replace(/[̀-ͯ]/g, ""));
  if (NOT_BRANDS.has(s)) return null;
  return BRANDS[s]?.name ?? b.trim();
}

const TINTS = ["#e8eefc", "#fde8f1", "#e6f4fb", "#f1ecfd", "#fdecec", "#e7f6ee", "#fdf3e1"];

/** Ранг, ҳарфҳо ва (агар бошад) акси логои бренд */
export function brandLogo(name: string): { bg: string; fg: string; mark: string; img?: string } {
  const key = slugOf(name.normalize("NFKD").replace(/[̀-ͯ]/g, ""));
  const known = Object.values(BRANDS).find((i) => i.name === name) ?? BRANDS[key];
  if (known) {
    const img = known.logo ?? (known.site ? `https://www.google.com/s2/favicons?domain=${known.site}&sz=128` : undefined);
    return { bg: known.bg, fg: known.fg, mark: known.mark ?? name.slice(0, 2).toUpperCase(), img };
  }
  const t = TINTS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];
  return { bg: t, fg: "#17306b", mark: name.slice(0, 2).toUpperCase() };
}

/* Брендҳои «пешакӣ» (бе мол) дар сайт нишон дода намешаванд: ҳамаи брендҳо аз маҳсулот меоянд */
export const FEATURED_BRANDS: string[] = [];
