/* Мундариҷаи сайт, ки аз admin идора мешавад: баннерҳо ва зеркатегорияҳои варақаҳо,
   нишонҳои категория дар саҳифаи асосӣ ва брендҳои пинҳоншуда.
   Дар база (admin_settings, key = "site") нигоҳ дошта мешавад; агар набошад — ҳамин қиматҳои пешфарз. */

export type BannerCfg = {
  id: string;
  /** Номи зеркатегория дар қатори болои баннер */
  label: string;
  title: string;
  sub: string;
  from: string;
  to: string;
  /** Калимаи ҷустуҷӯ дар номи маҳсулот: ҳам баннер, ҳам зеркатегория ҳамин молҳоро нишон медиҳад */
  q: string;
  active: boolean;
};

export type HomeCatCfg = {
  id: string;
  name: string;
  /** Категорияҳо (id), масалан ["audio","phones"] */
  ids: string[];
  q: string;
  show: boolean;
};

export type HeroKind = "discount" | "global" | "category" | "custom";
export type HeroCfg = {
  id: string;
  kind: HeroKind;
  active: boolean;
  /** Нишонаи хурд (барои discount ва global) */
  tag: string;
  /** Сарлавҳа; дар global бо *ситора* қисми барҷаста мешавад */
  title: string;
  sub: string;
  from: string;
  to: string;
  /** Пайванди тугма; барои category — худи категория */
  href: string;
  category: string;
};

export type SiteConfig = {
  /** Баннерҳои варақаи «Ҳама» */
  hero: HeroCfg[];
  /** Матнҳои таҳриршаванда (калид → матн) */
  texts: Record<string, string>;
  /** Логои брендҳо, ки аз admin боргирӣ шудаанд: номи бренд → data URL */
  brandLogos: Record<string, string>;
  /** Калид — id-и варақа: men, women, kids, shoes */
  banners: Record<string, BannerCfg[]>;
  homeCats: HomeCatCfg[];
  /** Номҳои брендҳои ҷаҳонӣ, ки дар сайт нишон дода намешаванд */
  hiddenBrands: string[];
};

const B = (id: string, label: string, title: string, sub: string, from: string, to: string, q: string): BannerCfg => ({ id, label, title, sub, from, to, q, active: true });

const H = (id: string, kind: HeroKind, o: Partial<HeroCfg>): HeroCfg => ({ id, kind, active: true, tag: "", title: "", sub: "", from: "#333333", to: "#111111", href: "", category: "", ...o });

/* Матнҳои таҳриршаванда: ҳамаи ваъдаҳо, қадамҳо ва усулҳои пардохт. Қимати аввал — пешфарз. */
export const TEXT_FIELDS: { key: string; label: string; group: string; def: string; long?: boolean }[] = [
  { key: "warrantyWholesale", group: "Саҳифаи маҳсулот", label: "Кафолат: молҳои оптомӣ (картон, кило)", def: "Бо сана ва сертификат" },
  { key: "warrantyAudio", group: "Саҳифаи маҳсулот", label: "Кафолат: наушник ва аудио", def: "12 моҳ" },
  { key: "warrantyDefault", group: "Саҳифаи маҳсулот", label: "Кафолат: молҳои дигар", def: "Ивази нуқсон 14 рӯз" },
  { key: "termsDocsTitle", group: "Саҳифаи маҳсулот", label: "Шарти 1: сарлавҳа", def: "Фактура ва ҳуҷҷат" },
  { key: "termsDocsText", group: "Саҳифаи маҳсулот", label: "Шарти 1: матн", def: "Барои ҳисоби бизнес: фактура, шартнома, ҳуҷҷатҳои гумрукӣ", long: true },
  { key: "termsDeferTitle", group: "Саҳифаи маҳсулот", label: "Шарти 2: сарлавҳа", def: "Пардохт бо мӯҳлат" },
  { key: "termsDeferText", group: "Саҳифаи маҳсулот", label: "Шарти 2: матн", def: "Барои мизоҷони доимӣ: 30% пешпардохт, боқимонда то 14 рӯз", long: true },
  { key: "termsRfqTitle", group: "Саҳифаи маҳсулот", label: "Шарти 3: сарлавҳа", def: "Нархи оптовӣ" },
  { key: "termsRfqText", group: "Саҳифаи маҳсулот", label: "Шарти 3: матн", def: "Барои миқдори калон нархи махсус: дар WhatsApp пурсед, ҷавоб то 2 соат", long: true },
  { key: "pickup", group: "Саҳифаи маҳсулот", label: "Худ гирифтан (ҷой)", def: "Анбори Душанбе" },
  { key: "sellerTrust", group: "Саҳифаи маҳсулот", label: "Ҷадвали фурӯшанда (молҳои худӣ)", def: "Санҷидашуда · Ҷавоб < 1 соат" },
  { key: "sellerTrustDrop", group: "Саҳифаи маҳсулот", label: "Ҷадвали фурӯшанда (молҳои CJ)", def: "Ҷавоб < 1 соат" },
  { key: "trust1Title", group: "Саҳифаи асосӣ: ваъдаҳо", label: "Ваъда 1: сарлавҳа", def: "Пардохт" },
  { key: "trust1Text", group: "Саҳифаи асосӣ: ваъдаҳо", label: "Ваъда 1: матн", def: "Нақд, Алиф, DC Pay" },
  { key: "trust2Title", group: "Саҳифаи асосӣ: ваъдаҳо", label: "Ваъда 2: сарлавҳа", def: "Худ гирифтан" },
  { key: "trust2Text", group: "Саҳифаи асосӣ: ваъдаҳо", label: "Ваъда 2: матн", def: "Анбори Душанбе" },
  { key: "trust3Title", group: "Саҳифаи асосӣ: ваъдаҳо", label: "Ваъда 3: сарлавҳа", def: "Фактура" },
  { key: "trust3Text", group: "Саҳифаи асосӣ: ваъдаҳо", label: "Ваъда 3: матн", def: "Барои бизнес" },
  { key: "trust4Title", group: "Саҳифаи асосӣ: ваъдаҳо", label: "Ваъда 4: сарлавҳа", def: "Менеҷери шахсӣ" },
  { key: "trust4Text", group: "Саҳифаи асосӣ: ваъдаҳо", label: "Ваъда 4: матн", def: "Тоҷикӣ, русӣ, англисӣ" },
  { key: "step1Title", group: "Саҳифаи асосӣ: «Чӣ тавр кор мекунем»", label: "Қадам 1: сарлавҳа", def: "Интихоб" },
  { key: "step1Text", group: "Саҳифаи асосӣ: «Чӣ тавр кор мекунем»", label: "Қадам 1: матн", def: "Маҳсулот ва миқдор" },
  { key: "step2Title", group: "Саҳифаи асосӣ: «Чӣ тавр кор мекунем»", label: "Қадам 2: сарлавҳа", def: "Тасдиқ" },
  { key: "step2Text", group: "Саҳифаи асосӣ: «Чӣ тавр кор мекунем»", label: "Қадам 2: матн", def: "Нарх ва мӯҳлат" },
  { key: "step3Title", group: "Саҳифаи асосӣ: «Чӣ тавр кор мекунем»", label: "Қадам 3: сарлавҳа", def: "Пардохт" },
  { key: "step3Text", group: "Саҳифаи асосӣ: «Чӣ тавр кор мекунем»", label: "Қадам 3: матн", def: "Алиф, DC, бонк" },
  { key: "step4Title", group: "Саҳифаи асосӣ: «Чӣ тавр кор мекунем»", label: "Қадам 4: сарлавҳа", def: "Расонидан" },
  { key: "step4Text", group: "Саҳифаи асосӣ: «Чӣ тавр кор мекунем»", label: "Қадам 4: матн", def: "То дари мағоза" },
  { key: "payments", group: "Пардохт", label: "Усулҳои пардохт дар поёни сайт (бо вергул)", def: "Алиф, DC Pay, Эсхата, Visa / MC, Интиқоли бонкӣ, Нақд", long: true },
  { key: "checkoutNote", group: "Пардохт", label: "Эзоҳ дар саҳифаи фармоиш", def: "Пардохт онлайн нест: менеҷер бо шумо тамос мегирад, фармоишро тасдиқ мекунад ва тарзи пардохтро (Алиф, DC, бонк, нақд) мегӯяд. Баъди пардохт маҳсулот равон карда мешавад.", long: true },
];
export const DEFAULT_TEXTS: Record<string, string> = Object.fromEntries(TEXT_FIELDS.map((f) => [f.key, f.def]));

export const DEFAULT_SITE: SiteConfig = {
  hero: [
    H("h1", "discount", { tag: "Тахфифи ҳаҷм", sub: "Сабад калонтар — нарх арзонтар", href: "/#rfq" }),
    H("h2", "global", { tag: "Таъминоти байналмилалӣ", title: "Маҳсулот аз *Дубай, Чин, Туркия* барои мағозаи шумо", href: "/catalog" }),
    H("h3", "category", { category: "women", title: "Либоси занона", sub: "Курта, либос, свитер", from: "#b0305f", to: "#5e1238" }),
    H("h4", "category", { category: "shoes", title: "Пояфзол", sub: "Кроссовка, туфли, мӯза", from: "#c2410c", to: "#6e2006" }),
  ],
  texts: DEFAULT_TEXTS,
  brandLogos: {},
  banners: {
    men: [
      B("m1", "Курта", "Куртаи мардона", "Барои ҳар мавсим", "#1f3a5f", "#0d1b2e", "курта"),
      B("m2", "Свитер", "Свитери мардона", "Гармӣ ва тарзи нав", "#6b4430", "#2b1a12", "свитер"),
      B("m3", "Футболка", "Футболкаи мардона", "Пахта ва оверсайз", "#0f6b66", "#06302e", "футболка"),
      B("m4", "Шим", "Шими мардона", "Карго ва ҳаррӯза", "#4a5262", "#181b22", "шим"),
      B("m5", "Поло", "Полои мардона", "Классика ва ҳаррӯза", "#2d4a2d", "#122012", "поло"),
    ],
    women: [
      B("w1", "Либос", "Либоси занона", "Аз ҳаррӯза то идона", "#b0305f", "#5e1238", "либос"),
      B("w2", "Курта", "Куртаи занона", "Блейзер ва пуховик", "#6a3f8f", "#2f1a47", "курта"),
      B("w3", "Свитер", "Свитери занона", "Нарм ва гарм", "#a8553f", "#56241a", "свитер"),
      B("w4", "Юбка", "Юбкаи занона", "Сабук ва зебо", "#1f6f6b", "#0c3a38", "юбка"),
    ],
    kids: [
      B("k1", "Либос", "Либоси кӯдакона", "Гарм ва бароҳат", "#2b7fc4", "#134a80", "либос"),
      B("k2", "Бозича", "Бозичаҳо", "Барои бозӣ ва омӯзиш", "#e0532f", "#9c2c14", "бозича"),
      B("k3", "Мактабӣ", "Ҷузвдони мактабӣ", "Барои мактаб тайёр", "#2f9e62", "#14603a", "мактаб"),
      B("k4", "Навзод", "Барои навзод", "Нарм ва бехатар", "#8b6fc9", "#4f3a8c", "навзод"),
    ],
    shoes: [
      B("s1", "Кроссовка", "Кроссовка", "Роҳат дар ҳар қадам", "#c2410c", "#6e2006", "кроссовка"),
      B("s2", "Туфли", "Туфли", "Расмӣ ва ҳаррӯза", "#5a3825", "#26160d", "туфли"),
      B("s3", "Сандал", "Сандал", "Барои рӯзҳои гарм", "#b7791f", "#6b430d", "сандал"),
      B("s4", "Мӯза", "Мӯза", "Гарм ва устувор", "#3a3a3a", "#0f0f0f", "мӯза"),
    ],
  },
  homeCats: [
    { id: "c1", name: "Занона", ids: ["women"], q: "", show: true },
    { id: "c2", name: "Мардона", ids: ["men"], q: "", show: true },
    { id: "c3", name: "Кӯдакона", ids: ["kids"], q: "", show: true },
    { id: "c4", name: "Пояфзол", ids: ["shoes"], q: "", show: true },
    { id: "c5", name: "Электронӣ", ids: ["audio", "phones"], q: "", show: true },
    { id: "c6", name: "Хона", ids: ["home"], q: "", show: true },
    { id: "c7", name: "Ошхона", ids: ["home"], q: "ошхона", show: true },
    { id: "c8", name: "Зебоӣ", ids: ["beauty"], q: "", show: true },
    { id: "c9", name: "Атриёт", ids: ["perfume"], q: "", show: true },
    { id: "c10", name: "Нӯшокӣ", ids: ["food"], q: "нӯшокӣ", show: true },
    { id: "c11", name: "Офис", ids: ["office"], q: "", show: true },
    { id: "c12", name: "Мактаб", ids: ["kids"], q: "мактаб", show: true },
  ],
  hiddenBrands: [],
};

/** Варақаҳое, ки баннер доранд (мувофиқ ба HOME_TABS) */
export const BANNER_TABS: { id: string; label: string }[] = [
  { id: "men", label: "Мардона" },
  { id: "women", label: "Занона" },
  { id: "kids", label: "Кӯдакона" },
  { id: "shoes", label: "Пояфзол" },
];

const str = (v: unknown, max: number, fb = "") => (typeof v === "string" ? v.trim().slice(0, max) : fb);
const color = (v: unknown, fb: string) => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v : fb);
const idList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && /^[\w-]{1,30}$/.test(x)).slice(0, 6) : []);

/** Маълумоти аз база ё аз клиентро месанҷад: ҳар чизи нодуруст бо пешфарз иваз мешавад */
export function mergeSite(raw: unknown): SiteConfig {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<keyof SiteConfig, unknown>>;
  const banners: SiteConfig["banners"] = {};
  const rb = (r.banners && typeof r.banners === "object" ? r.banners : {}) as Record<string, unknown>;
  for (const t of BANNER_TABS) {
    const src = Array.isArray(rb[t.id]) ? (rb[t.id] as unknown[]) : null;
    if (!src) { banners[t.id] = DEFAULT_SITE.banners[t.id]; continue; }
    banners[t.id] = src.slice(0, 12).map((x, i) => {
      const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
      return {
        id: str(o.id, 20, `b${i}`) || `b${i}`, label: str(o.label, 24), title: str(o.title, 40), sub: str(o.sub, 50),
        from: color(o.from, "#333333"), to: color(o.to, "#111111"), q: str(o.q, 40).toLowerCase(), active: o.active !== false,
      };
    }).filter((b) => b.title || b.label);
  }
  const homeCats = Array.isArray(r.homeCats)
    ? (r.homeCats as unknown[]).slice(0, 24).map((x, i) => {
        const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
        return { id: str(o.id, 20, `c${i}`) || `c${i}`, name: str(o.name, 24), ids: idList(o.ids), q: str(o.q, 40).toLowerCase(), show: o.show !== false };
      }).filter((c) => c.name && c.ids.length)
    : DEFAULT_SITE.homeCats;
  const hiddenBrands = Array.isArray(r.hiddenBrands) ? (r.hiddenBrands as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 100) : [];
  const heroRaw = Array.isArray(r.hero) ? (r.hero as unknown[]) : null;
  const hero: HeroCfg[] = heroRaw
    ? heroRaw.slice(0, 10).map((x, i) => {
        const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
        const kind = (["discount", "global", "category", "custom"] as const).find((k) => k === o.kind) ?? "custom";
        const href = str(o.href, 120);
        return { id: str(o.id, 20, `h${i}`) || `h${i}`, kind, active: o.active !== false, tag: str(o.tag, 40), title: str(o.title, 90), sub: str(o.sub, 120), from: color(o.from, "#333333"), to: color(o.to, "#111111"), href: href.startsWith("/") || /^https?:\/\//.test(href) ? href : "", category: str(o.category, 30) };
      })
    : DEFAULT_SITE.hero;
  const rt = (r.texts && typeof r.texts === "object" ? r.texts : {}) as Record<string, unknown>;
  const texts: Record<string, string> = {};
  for (const f of TEXT_FIELDS) texts[f.key] = str(rt[f.key], 400, f.def) || f.def;
  const rl = (r.brandLogos && typeof r.brandLogos === "object" ? r.brandLogos : {}) as Record<string, unknown>;
  const brandLogos: Record<string, string> = {};
  for (const [k, v] of Object.entries(rl).slice(0, 60)) if (typeof v === "string" && /^data:image\/(png|webp|jpeg|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length <= 140_000) brandLogos[k.slice(0, 40)] = v;
  return { hero, texts, brandLogos, banners, homeCats, hiddenBrands };
}
