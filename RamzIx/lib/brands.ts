/* Номи дурусти брендҳо ва рангҳои логоашон.
   site — сайти расмии бренд: лого (иконка) аз он гирифта мешавад. Бе site ё агар акс бор нашавад —
   логои матнӣ (ҳарфҳо бо рангҳои бренд). Логои худро метавонед ба public/brands/<slug>.png гузоред
   ва дар logo нишон диҳед: logo: "/brands/<slug>.png". */

type Info = { name: string; bg: string; fg: string; mark?: string; site?: string; logo?: string };

const BRANDS: Record<string, Info> = {
  soundcore: { name: "Soundcore", bg: "#0a0a0a", fg: "#00b2ff", mark: "SC", site: "soundcore.com" },
  shein: { name: "SHEIN", bg: "#000000", fg: "#ffffff", mark: "SH", site: "shein.com" },
  monster: { name: "Monster Energy", bg: "#0d0d0d", fg: "#95d600", mark: "ME", site: "monsterenergy.com" },

  /* Брендҳои машҳури ҷаҳонӣ: логои расмӣ дар public/brands. Онҳо танҳо вақте дар сайт пайдо мешаванд, ки дар admin ба маҳсулот ин бренд гузошта шавад */
  nike: { name: "Nike", bg: "#ffffff", fg: "#111111", mark: "NI", logo: "/brands/nike.svg" },
  adidas: { name: "Adidas", bg: "#ffffff", fg: "#111111", mark: "AD", logo: "/brands/adidas.svg" },
  puma: { name: "PUMA", bg: "#ffffff", fg: "#111111", mark: "PU", logo: "/brands/puma.svg" },
  zara: { name: "Zara", bg: "#ffffff", fg: "#111111", mark: "ZA", logo: "/brands/zara.svg" },
  "h-m": { name: "H&M", bg: "#ffffff", fg: "#111111", mark: "H&", logo: "/brands/handm.svg" },
  "under-armour": { name: "Under Armour", bg: "#ffffff", fg: "#111111", mark: "UN", logo: "/brands/underarmour.svg" },
  reebok: { name: "Reebok", bg: "#ffffff", fg: "#111111", mark: "RE", logo: "/brands/reebok.svg" },
  "new-balance": { name: "New Balance", bg: "#ffffff", fg: "#111111", mark: "NE", logo: "/brands/newbalance.svg" },
  fila: { name: "FILA", bg: "#ffffff", fg: "#111111", mark: "FI", logo: "/brands/fila.svg" },
  bosch: { name: "Bosch", bg: "#ffffff", fg: "#111111", mark: "BO", logo: "/brands/bosch.svg" },
  ikea: { name: "IKEA", bg: "#ffffff", fg: "#111111", mark: "IK", logo: "/brands/ikea.svg" },
  panasonic: { name: "Panasonic", bg: "#ffffff", fg: "#111111", mark: "PA", logo: "/brands/panasonic.svg" },
  samsung: { name: "Samsung", bg: "#ffffff", fg: "#111111", mark: "SA", logo: "/brands/samsung.svg" },
  lg: { name: "LG", bg: "#ffffff", fg: "#111111", mark: "LG", logo: "/brands/lg.svg" },
  xiaomi: { name: "Xiaomi", bg: "#ffffff", fg: "#111111", mark: "XI", logo: "/brands/xiaomi.svg" },
  apple: { name: "Apple", bg: "#ffffff", fg: "#111111", mark: "AP", logo: "/brands/apple.svg" },
  huawei: { name: "Huawei", bg: "#ffffff", fg: "#111111", mark: "HU", logo: "/brands/huawei.svg" },
  oppo: { name: "OPPO", bg: "#ffffff", fg: "#111111", mark: "OP", logo: "/brands/oppo.svg" },
  oneplus: { name: "OnePlus", bg: "#ffffff", fg: "#111111", mark: "ON", logo: "/brands/oneplus.svg" },
  vivo: { name: "vivo", bg: "#ffffff", fg: "#111111", mark: "VI", logo: "/brands/vivo.svg" },
  google: { name: "Google", bg: "#ffffff", fg: "#111111", mark: "GO", logo: "/brands/google.svg" },
  sony: { name: "Sony", bg: "#ffffff", fg: "#111111", mark: "SO", logo: "/brands/sony.svg" },
  jbl: { name: "JBL", bg: "#ffffff", fg: "#111111", mark: "JB", logo: "/brands/jbl.svg" },
  nikon: { name: "Nikon", bg: "#ffffff", fg: "#111111", mark: "NI", logo: "/brands/nikon.svg" },
  lenovo: { name: "Lenovo", bg: "#ffffff", fg: "#111111", mark: "LE", logo: "/brands/lenovo.svg" },
  hp: { name: "HP", bg: "#ffffff", fg: "#111111", mark: "HP", logo: "/brands/hp.svg" },
  dell: { name: "Dell", bg: "#ffffff", fg: "#111111", mark: "DE", logo: "/brands/dell.svg" },
  asus: { name: "ASUS", bg: "#ffffff", fg: "#111111", mark: "AS", logo: "/brands/asus.svg" },
  acer: { name: "Acer", bg: "#ffffff", fg: "#111111", mark: "AC", logo: "/brands/acer.svg" },
  intel: { name: "Intel", bg: "#ffffff", fg: "#111111", mark: "IN", logo: "/brands/intel.svg" },
  nvidia: { name: "NVIDIA", bg: "#ffffff", fg: "#111111", mark: "NV", logo: "/brands/nvidia.svg" },
  amd: { name: "AMD", bg: "#ffffff", fg: "#111111", mark: "AM", logo: "/brands/amd.svg" },
  "coca-cola": { name: "Coca-Cola", bg: "#ffffff", fg: "#111111", mark: "CO", logo: "/brands/cocacola.svg" },
  "red-bull": { name: "Red Bull", bg: "#ffffff", fg: "#111111", mark: "RE", logo: "/brands/redbull.svg" },
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

/* Брендҳои машҳури ҷаҳонӣ, ки дар рӯйхат ҳамеша нишон дода мешаванд (аввал онҳое, ки мол доранд).
   Тартиб омехтаи соҳаҳост, то дар қатори боло ҳам телефон, ҳам либос, ҳам асбоб бошад. */
const FEATURED_ORDER = ["Apple", "Nike", "Samsung", "Adidas", "Xiaomi", "Bosch", "Sony", "PUMA", "IKEA", "JBL", "Zara", "Huawei", "Lenovo", "HP", "H&M", "Coca-Cola"];
const ALL_FEATURED = Object.values(BRANDS).filter((i) => i.logo?.startsWith("/brands/")).map((i) => i.name);
export const FEATURED_BRANDS = [...FEATURED_ORDER.filter((n) => ALL_FEATURED.includes(n)), ...ALL_FEATURED.filter((n) => !FEATURED_ORDER.includes(n))];
