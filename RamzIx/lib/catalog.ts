import raw from "@/data/catalog.json";

export type CountryCode = "ae" | "cn" | "tr" | "tj";

export type Product = {
  slug: string;
  name: string;
  subtitle: string | null;
  brand: string | null;
  category: string;
  country: CountryCode;
  source: string;
  price: number;
  listPrice: number | null;
  weightKg: number;
  images: string[];
  rating: number | null;
  reviews: number;
  sizes: string[] | null;
  description: string | null;
};

export const products = raw as Product[];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const COUNTRIES: Record<CountryCode, { name: string; short: string; note: string; days: string }> = {
  ae: { name: "Аморат (Дубай)", short: "Дубай", note: "Электроника, брендҳо", days: "7–12 рӯз" },
  cn: { name: "Чин", short: "Чин", note: "Ҳама навъ, нархи паст", days: "15–25 рӯз" },
  tr: { name: "Туркия", short: "Туркия", note: "Либос, хона, косметика", days: "10–18 рӯз" },
  tj: { name: "Тоҷикистон", short: "Ватанӣ", note: "Истеҳсоли ватанӣ", days: "1–3 рӯз" },
};

export const CATEGORIES: { id: string; name: string; icon: string; tint: string }[] = [
  { id: "audio", name: "Наушник ва аудио", icon: "headphones", tint: "#e8eefc" },
  { id: "phones", name: "Телефон ва аксессуар", icon: "phone", tint: "#fde8f1" },
  { id: "men", name: "Либоси мардона", icon: "shirt", tint: "#e6f4fb" },
  { id: "home", name: "Хона ва ошхона", icon: "home", tint: "#e7f6ee" },
  { id: "beauty", name: "Зебоӣ ва саломатӣ", icon: "sparkle", tint: "#fdecec" },
  { id: "kids", name: "Кӯдакон", icon: "baby", tint: "#f1ecfd" },
  { id: "office", name: "Компютер ва офис", icon: "laptop", tint: "#fdf3e1" },
  { id: "all", name: "Ҳамаи категорияҳо", icon: "grid", tint: "#eef1f6" },
];

/* Нархи зинагӣ: ҳар қадар миқдор зиёд — нархи як дона камтар */
export type Tier = { min: number; max: number; label: string; off: number; price: number | null };

export function tiersFor(base: number): Tier[] {
  const t = (min: number, max: number, label: string, off: number): Tier => ({
    min, max, label, off, price: Math.round(base * (1 - off)),
  });
  return [
    t(1, 3, "1–3 дона", 0),
    t(4, 9, "4–9 дона", 0.05),
    t(10, 49, "10–49 дона", 0.1),
    t(50, 99, "50–99 дона", 0.14),
    { min: 100, max: Infinity, label: "100+ дона", off: 0, price: null },
  ];
}

export const WHOLESALE_MIN = 10;
export const wholesalePrice = (base: number) => Math.round(base * 0.9);

export const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const WHATSAPP = "992000000000";
export const waLink = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
