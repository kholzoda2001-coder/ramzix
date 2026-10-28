/* Номи дурусти брендҳо ва рангҳои логоашон.
   Логои воқеиро ба public/brands/<slug>.svg (ё .png) гузоред ва slug-ро ба LOGO_FILES илова кунед. */

type Info = { name: string; bg: string; fg: string; mark?: string };

const BRANDS: Record<string, Info> = {
  soundcore: { name: "Soundcore", bg: "#0a0a0a", fg: "#00b2ff", mark: "SC" },
  ramzix: { name: "RamzIx", bg: "#0b1f3a", fg: "#ff9d1c", mark: "RX" },
  shein: { name: "SHEIN", bg: "#000000", fg: "#ffffff", mark: "SH" },
  manfinity: { name: "Manfinity", bg: "#2b2b2b", fg: "#ffffff", mark: "MF" },
  benroma: { name: "BENROMA", bg: "#7a1f2b", fg: "#ffffff", mark: "BR" },
  monster: { name: "Monster Energy", bg: "#0d0d0d", fg: "#95d600", mark: "ME" },
  merch: { name: "MERCH", bg: "#e8eefc", fg: "#17306b", mark: "MR" },
  printshop4me: { name: "PrintShop4Me", bg: "#fde8f1", fg: "#b0245c", mark: "P4" },
  "daxis-sportwear-company": { name: "DAXIS Sportwear", bg: "#e6f4fb", fg: "#0b5a82", mark: "DX" },
  "sb-bianco": { name: "SB Bianco", bg: "#f4f1ec", fg: "#4a3b2a", mark: "SB" },
  deepsence: { name: "DEEPSENCE", bg: "#1c1c28", fg: "#ffffff", mark: "DS" },
  "pamir-honey": { name: "Pamir Honey", bg: "#fdf3e1", fg: "#b26a00", mark: "PH" },
  "pamir-spring": { name: "Pamir Spring", bg: "#e6f4fb", fg: "#0a6fa8", mark: "PS" },
  "ceylon-gold": { name: "Ceylon Gold", bg: "#fdf3e1", fg: "#8a5a00", mark: "CG" },
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

/** Ранг ва ҳарфҳои логои бренд */
export function brandLogo(name: string): { bg: string; fg: string; mark: string } {
  const key = slugOf(name.normalize("NFKD").replace(/[̀-ͯ]/g, ""));
  const known = Object.values(BRANDS).find((i) => i.name === name) ?? BRANDS[key];
  if (known) return { bg: known.bg, fg: known.fg, mark: known.mark ?? name.slice(0, 2).toUpperCase() };
  const t = TINTS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];
  return { bg: t, fg: "#17306b", mark: name.slice(0, 2).toUpperCase() };
}
