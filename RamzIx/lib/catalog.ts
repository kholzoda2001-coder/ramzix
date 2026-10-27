import raw from "@/data/catalog.json";
import extra from "@/data/extra-products.json";
import type { Currency } from "./pricing-config";

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
  description: string | null;
  sale?: Sale;
};

export const products = [...(raw as unknown as Product[]), ...(extra as unknown as Product[])];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const COUNTRIES: Record<CountryCode, { name: string; short: string; note: string; days: string }> = {
  ae: { name: "Аморат (Дубай)", short: "Дубай", note: "Электроника, брендҳо", days: "30–40 рӯз" },
  cn: { name: "Чин", short: "Чин", note: "Ҳама навъ, нархи паст", days: "10–20 рӯз" },
  tr: { name: "Туркия", short: "Туркия", note: "Либос, хона, косметика", days: "10–18 рӯз" },
  tj: { name: "Тоҷикистон", short: "Ватанӣ", note: "Истеҳсоли ватанӣ", days: "1–3 рӯз" },
};

export const CATEGORIES: { id: string; name: string; icon: string; tint: string }[] = [
  { id: "audio", name: "Наушник ва аудио", icon: "headphones", tint: "#e8eefc" },
  { id: "phones", name: "Телефон ва аксессуар", icon: "phone", tint: "#fde8f1" },
  { id: "men", name: "Либоси мардона", icon: "shirt", tint: "#e6f4fb" },
  { id: "home", name: "Хона ва ошхона", icon: "home", tint: "#f1ecfd" },
  { id: "beauty", name: "Зебоӣ ва саломатӣ", icon: "sparkle", tint: "#fdecec" },
  { id: "food", name: "Озуқа ва нӯшокӣ", icon: "cup", tint: "#e7f6ee" },
  { id: "office", name: "Компютер ва офис", icon: "laptop", tint: "#fdf3e1" },
  { id: "all", name: "Ҳамаи категорияҳо", icon: "grid", tint: "#eef1f6" },
];

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
export const WHATSAPP = "971508385259";
export const waLink = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
