import { CONTACT, type Currency } from "./pricing-config";

export type CountryCode = "ae" | "cn" | "tr" | "tj";

/* Воҳиди фурӯш: картон, кг, бастабандӣ… (агар набошад — дона) */
export type Sale = {
  unit: string;
  per?: number;
  perLabel?: string;
  step: number;
  min: number;
  quick: number[];
  rfqFrom: number;
  shelfLife?: string;
  storage?: string;
  note?: string;
  decimals?: boolean;
};

export type Product = {
  slug: string;
  name: string;
  subtitle: string | null;
  brand: string | null;
  category: string;
  country: CountryCode;
  source: string;
  /** Нархи харид барои 1 воҳид (бо асъори costCurrency), барои миқдори ҳадди ақал */
  cost: number;
  costCurrency: Currency;
  /** Вазн ва ҳаҷми 1 воҳид (бо бастабандӣ) барои ҳисоби расонидан */
  weightKg: number;
  volumeM3?: number;
  images: string[];
  rating: number | null;
  reviews: number;
  sizes: string[] | null;
  /** Рангҳо (вариатсия): image — индекси акс дар images */
  colors?: { name: string; hex: string; image?: number }[];
  /** Номи аслии таъминкунанда (барои ҷустуҷӯ) */
  nameOriginal?: string;
  description: string | null;
  sale?: Sale;
  /** true — нархи оптовӣ надорад: ҳамеша бо нархи дона, ба тахфифи сабад ворид намешавад */
  noWholesale?: boolean;
  /** Артикули мо: RX-0001 (ҳар маҳсулот ягона рақам дорад) */
  sku?: string;
  /** Номи маҳсулот, зерсарлавҳа ва тавсиф ба русӣ ва англисӣ (матни асосӣ — тоҷикӣ) */
  i18n?: Partial<Record<"ru" | "en", { name: string; subtitle?: string; description?: string }>>;
};

/* Маҳсулот дар базаи маълумот (Supabase) нигоҳ дошта мешавад — ниг. lib/server/catalog.ts ва lib/useCatalog.tsx */

export type CountryMeta = { name: string; short: string; note: string; days: string; /** false — кишвар дар сайт нишон дода намешавад (молҳояш ҳам) */ show: boolean };
export type CategoryMeta = { id: string; name: string; icon: string; tint: string; /** false — категория ва молҳояш дар сайт нишон дода намешаванд */ show: boolean };

/* Қиматҳои пешфарз; дар сайт аз admin («Сайт») иваз мешаванд — ниг. applyCatalogMeta */
export const DEFAULT_COUNTRIES: Record<CountryCode, CountryMeta> = {
  ae: { name: "Аморат (Дубай)", short: "Дубай", note: "Электроника, брендҳо", days: "30–40 рӯз", show: true },
  cn: { name: "Чин", short: "Чин", note: "Ҳама навъ, нархи паст", days: "10–20 рӯз", show: true },
  tr: { name: "Туркия", short: "Туркия", note: "Либос, хона, косметика", days: "10–18 рӯз", show: true },
  tj: { name: "Тоҷикистон", short: "Ватанӣ", note: "Истеҳсоли ватанӣ", days: "1–3 рӯз", show: true },
};

export const DEFAULT_CATEGORIES: CategoryMeta[] = [
  { id: "audio", name: "Наушник ва аудио", icon: "headphones", tint: "#e8eefc", show: true },
  { id: "phones", name: "Телефон ва аксессуар", icon: "phone", tint: "#fde8f1", show: true },
  { id: "men", name: "Либоси мардона", icon: "shirt", tint: "#e6f4fb", show: true },
  { id: "women", name: "Либоси занона", icon: "shirt", tint: "#fde8f1", show: true },
  { id: "kids", name: "Кӯдакона", icon: "baby", tint: "#fdf3e1", show: true },
  { id: "shoes", name: "Пояфзол", icon: "tag", tint: "#f1ecfd", show: true },
  { id: "home", name: "Хона ва ошхона", icon: "home", tint: "#f1ecfd", show: true },
  { id: "beauty", name: "Зебоӣ ва саломатӣ", icon: "sparkle", tint: "#fdecec", show: true },
  { id: "perfume", name: "Атриёт", icon: "sparkle", tint: "#f6e9fb", show: true },
  { id: "food", name: "Озуқа ва нӯшокӣ", icon: "cup", tint: "#e7f6ee", show: true },
  { id: "office", name: "Компютер ва офис", icon: "laptop", tint: "#fdf3e1", show: true },
];
const ALL_CATEGORY: CategoryMeta = { id: "all", name: "Ҳамаи категорияҳо", icon: "grid", tint: "#eef1f6", show: true };

/* Рӯйхатҳои зинда: SiteProvider онҳоро пеш аз render аз танзимоти сайт пур мекунад (ҳамин тавр pricing-config) */
export const COUNTRIES: Record<CountryCode, CountryMeta> = {
  ae: { ...DEFAULT_COUNTRIES.ae }, cn: { ...DEFAULT_COUNTRIES.cn }, tr: { ...DEFAULT_COUNTRIES.tr }, tj: { ...DEFAULT_COUNTRIES.tj },
};
export const CATEGORIES: CategoryMeta[] = [...DEFAULT_CATEGORIES.map((c) => ({ ...c })), { ...ALL_CATEGORY }];

export function applyCatalogMeta(cats: CategoryMeta[], countries: Record<CountryCode, CountryMeta>) {
  CATEGORIES.splice(0, CATEGORIES.length, ...cats.map((c) => ({ ...c })), { ...ALL_CATEGORY });
  for (const c of Object.keys(COUNTRIES) as CountryCode[]) Object.assign(COUNTRIES[c], countries[c]);
}
/** Категорияҳо ва кишварҳое, ки дар сайт нишон дода мешаванд */
export const shownCategories = () => CATEGORIES.filter((c) => c.id !== "all" && c.show);
export const shownCountries = () => (Object.keys(COUNTRIES) as CountryCode[]).filter((c) => COUNTRIES[c].show);

export const unitOf = (p: Product) => p.sale?.unit ?? "дона";
export const fmtQty = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ""));

export const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/* Нарх: барои маблағи хурд (<100) як рақами баъди вергул, масалан 11.5 */
export const fmtPrice = (n: number) => {
  if (n >= 100) return fmt(n);
  const r = Math.round(n * 10) / 10;
  return (Number.isInteger(r) ? String(r) : r.toFixed(1)).replace(".", ",");
};

/** Рақами WhatsApp бе «+» ва фосила (формати wa.me): +971 50 838 5259 */
export const waLink = (text: string) => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
