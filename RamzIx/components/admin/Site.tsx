"use client";

import { useState } from "react";
import { FEATURED_BRANDS } from "@/lib/brands";
import { CATEGORIES } from "@/lib/catalog";
import { getBrands } from "@/lib/filters";
import { BANNER_TABS, DEFAULT_SITE, TEXT_FIELDS, type BannerCfg, type HeroCfg, type HeroKind, type HomeCatCfg, type SiteConfig } from "@/lib/site-config";
import { useCatalog } from "@/lib/useCatalog";
import { useSite } from "@/lib/useSite";
import BrandLogo from "../BrandLogo";

/* «Сайт»: баннерҳо, зеркатегорияҳо, нишонҳои категория ва брендҳо — ҳамааш аз ҳамин ҷо идора мешавад */

const CAT_OPTIONS = [
  ...CATEGORIES.filter((c) => c.id !== "all").map((c) => ({ value: c.id, label: c.name })),
  { value: "audio,phones", label: "Электронӣ (аудио + телефон)" },
];

function move<T>(list: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const out = [...list];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}
/* Акс → data URL: растр то 192px кам карда мешавад (WebP/PNG), SVG тавре ки ҳаст (то 100 КБ) */
async function fileToLogo(file: File): Promise<string | null> {
  if (file.type === "image/svg+xml") {
    if (file.size > 100_000) return null;
    return await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => ok(null); r.readAsDataURL(file); });
  }
  if (!file.type.startsWith("image/")) return null;
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return null;
  const k = Math.min(1, 192 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(bmp.width * k));
  c.height = Math.max(1, Math.round(bmp.height * k));
  c.getContext("2d")?.drawImage(bmp, 0, 0, c.width, c.height);
  const webp = c.toDataURL("image/webp", 0.9);
  return webp.startsWith("data:image/webp") ? webp : c.toDataURL("image/png");
}

const HERO_KINDS: { v: HeroKind; l: string }[] = [
  { v: "discount", l: "Тахфифи ҳаҷм" },
  { v: "global", l: "Таъминот (кишварҳо)" },
  { v: "category", l: "Категория" },
  { v: "custom", l: "Озод" },
];

const uid = () => Math.random().toString(36).slice(2, 8);

export default function Site() {
  const initial = useSite();
  const [site, setSite] = useState<SiteConfig>(initial);
  const [tab, setTab] = useState(BANNER_TABS[0].id);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const { products } = useCatalog();
  const [logoFilter, setLogoFilter] = useState("");
  const brandNames = [...new Set([...FEATURED_BRANDS, ...getBrands(products).map((b) => b.name), ...Object.keys(site.brandLogos)])];
  const setHero = (list: HeroCfg[]) => setSite({ ...site, hero: list });
  const patchHero = (i: number, p: Partial<HeroCfg>) => setHero(site.hero.map((h, k) => (k === i ? { ...h, ...p } : h)));
  const banners = site.banners[tab] ?? [];
  const setBanners = (list: BannerCfg[]) => setSite({ ...site, banners: { ...site.banners, [tab]: list } });
  const patchBanner = (i: number, p: Partial<BannerCfg>) => setBanners(banners.map((b, k) => (k === i ? { ...b, ...p } : b)));
  const setCats = (list: HomeCatCfg[]) => setSite({ ...site, homeCats: list });
  const patchCat = (i: number, p: Partial<HomeCatCfg>) => setCats(site.homeCats.map((c, k) => (k === i ? { ...c, ...p } : c)));

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/site", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(site) });
      if (r.ok) {
        window.dispatchEvent(new Event("ramzix-site-change"));
        setMsg({ ok: true, text: "Захира шуд — сайт нав шуд" });
      } else setMsg({ ok: false, text: r.status === 401 ? "Дубора ба админ ворид шавед (PIN)" : "Захира нашуд: база ҷавоб надод" });
    } catch { setMsg({ ok: false, text: "Захира нашуд: пайвастшавӣ нест" }); }
    setBusy(false);
  };

  return (
    <>
      <p className="ad-hint">Ҳар чизе, ки дар ин ҷо иваз мекунед, пас аз «Захира кардан» дар сайт пайдо мешавад. Тағйирот то захира кардан танҳо дар ҳамин саҳифа мемонад.</p>

      <section className="ad-card">
        <h3>Баннерҳои саҳифаи асосӣ (варақаи «Ҳама»)</h3>
        <p className="ad-hint">Ин баннерҳо дар болои саҳифаи асосӣ бо навбат иваз мешаванд. Дар сарлавҳаи «Таъминот» ва «Озод» қисми барҷастаро бо *ситора* нишон диҳед, масалан: Маҳсулот аз *Дубай, Чин* барои шумо.</p>
        {site.hero.map((h, i) => (
          <div key={h.id} className="ad-item">
            <div className="ad-row-h">
              <label className="ad-check"><input type="checkbox" checked={h.active} onChange={(e) => patchHero(i, { active: e.target.checked })} /> Фаъол</label>
              <div className="ad-actions tight">
                <button className="ad-mv" onClick={() => setHero(move(site.hero, i, -1))} disabled={i === 0} aria-label="Боло">↑</button>
                <button className="ad-mv" onClick={() => setHero(move(site.hero, i, 1))} disabled={i === site.hero.length - 1} aria-label="Поён">↓</button>
                <button className="ad-mv red" onClick={() => setHero(site.hero.filter((_, k) => k !== i))} aria-label="Нест кардан">✕</button>
              </div>
            </div>
            <label><span>Намуд</span>
              <select value={h.kind} onChange={(e) => patchHero(i, { kind: e.target.value as HeroKind })}>{HERO_KINDS.map((k) => <option key={k.v} value={k.v}>{k.l}</option>)}</select>
            </label>
            {h.kind === "category" && (
              <label><span>Категория</span>
                <select value={h.category} onChange={(e) => patchHero(i, { category: e.target.value })}>{CATEGORIES.filter((c) => c.id !== "all").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              </label>
            )}
            {(h.kind === "discount" || h.kind === "global" || h.kind === "custom") && <label><span>Нишонаи хурд</span><input value={h.tag} maxLength={40} onChange={(e) => patchHero(i, { tag: e.target.value })} /></label>}
            {h.kind !== "discount" && <label><span>Сарлавҳа</span><input value={h.title} maxLength={90} onChange={(e) => patchHero(i, { title: e.target.value })} /></label>}
            <label><span>{h.kind === "global" ? "Матни зер (холӣ бошад — нархи карго худаш менависад)" : "Матни зер"}</span><input value={h.sub} maxLength={120} onChange={(e) => patchHero(i, { sub: e.target.value })} /></label>
            <label><span>Пайванди тугма (масалан /catalog ё /catalog?category=home)</span><input value={h.href} maxLength={120} onChange={(e) => patchHero(i, { href: e.target.value })} placeholder="/catalog" /></label>
            {(h.kind === "category" || h.kind === "custom") && (
              <div className="ad-grid2 ad-colors">
                <label><span>Ранги аввал</span><input type="color" value={h.from} onChange={(e) => patchHero(i, { from: e.target.value })} /></label>
                <label><span>Ранги дуюм</span><input type="color" value={h.to} onChange={(e) => patchHero(i, { to: e.target.value })} /></label>
              </div>
            )}
          </div>
        ))}
        <button className="ad-add" onClick={() => setHero([...site.hero, { id: uid(), kind: "custom", active: true, tag: "", title: "", sub: "", from: "#1f3a5f", to: "#0d1b2e", href: "/catalog", category: "" }])}>+ Баннери нав</button>
      </section>

      <section className="ad-card">
        <h3>Баннерҳо ва зеркатегорияҳои варақаҳо</h3>
        <p className="ad-hint">Ҳар сатр ҳам як баннер ва ҳам як зеркатегория дар қатори болои он аст. Акс аз маҳсулоте мегирад, ки номаш калимаи ҷустуҷӯро дорад. Агар чунин мол набошад, баннер нишон дода намешавад.</p>
        <div className="ad-chips">
          {BANNER_TABS.map((t) => <button key={t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>{t.label}</button>)}
        </div>
        {banners.map((b, i) => (
          <div key={b.id} className="ad-item">
            <div className="ad-row-h">
              <label className="ad-check"><input type="checkbox" checked={b.active} onChange={(e) => patchBanner(i, { active: e.target.checked })} /> Фаъол</label>
              <div className="ad-actions tight">
                <button className="ad-mv" onClick={() => setBanners(move(banners, i, -1))} disabled={i === 0} aria-label="Боло">↑</button>
                <button className="ad-mv" onClick={() => setBanners(move(banners, i, 1))} disabled={i === banners.length - 1} aria-label="Поён">↓</button>
                <button className="ad-mv red" onClick={() => setBanners(banners.filter((_, k) => k !== i))} aria-label="Нест кардан">✕</button>
              </div>
            </div>
            <div className="ad-grid2">
              <label><span>Зеркатегория</span><input value={b.label} maxLength={24} onChange={(e) => patchBanner(i, { label: e.target.value })} /></label>
              <label><span>Калимаи ҷустуҷӯ</span><input value={b.q} maxLength={40} onChange={(e) => patchBanner(i, { q: e.target.value })} placeholder="курта" /></label>
            </div>
            <label><span>Сарлавҳаи баннер</span><input value={b.title} maxLength={40} onChange={(e) => patchBanner(i, { title: e.target.value })} /></label>
            <label><span>Ёддошти кӯтоҳ</span><input value={b.sub} maxLength={50} onChange={(e) => patchBanner(i, { sub: e.target.value })} /></label>
            <div className="ad-grid2 ad-colors">
              <label><span>Ранги аввал</span><input type="color" value={b.from} onChange={(e) => patchBanner(i, { from: e.target.value })} /></label>
              <label><span>Ранги дуюм</span><input type="color" value={b.to} onChange={(e) => patchBanner(i, { to: e.target.value })} /></label>
            </div>
            <div className="ad-preview" style={{ background: `linear-gradient(135deg, ${b.from}, ${b.to})` }}><b>{b.title || "—"}</b><small>{b.sub}</small></div>
          </div>
        ))}
        <button className="ad-add" onClick={() => setBanners([...banners, { id: uid(), label: "", title: "", sub: "", from: "#c2410c", to: "#6e2006", q: "", active: true }])}>+ Баннери нав</button>
      </section>

      <section className="ad-card">
        <h3>Нишонҳои категория дар саҳифаи асосӣ</h3>
        <p className="ad-hint">Тартиби нишонҳо ҳамон тавр аст, ки дар рӯйхат. Нишони бе мол дар сайт пинҳон мемонад.</p>
        {site.homeCats.map((c, i) => (
          <div key={c.id} className="ad-item">
            <div className="ad-row-h">
              <label className="ad-check"><input type="checkbox" checked={c.show} onChange={(e) => patchCat(i, { show: e.target.checked })} /> Нишон додан</label>
              <div className="ad-actions tight">
                <button className="ad-mv" onClick={() => setCats(move(site.homeCats, i, -1))} disabled={i === 0} aria-label="Боло">↑</button>
                <button className="ad-mv" onClick={() => setCats(move(site.homeCats, i, 1))} disabled={i === site.homeCats.length - 1} aria-label="Поён">↓</button>
                <button className="ad-mv red" onClick={() => setCats(site.homeCats.filter((_, k) => k !== i))} aria-label="Нест кардан">✕</button>
              </div>
            </div>
            <div className="ad-grid2">
              <label><span>Ном</span><input value={c.name} maxLength={24} onChange={(e) => patchCat(i, { name: e.target.value })} /></label>
              <label><span>Категория</span>
                <select value={c.ids.join(",")} onChange={(e) => patchCat(i, { ids: e.target.value.split(",") })}>
                  {!CAT_OPTIONS.some((o) => o.value === c.ids.join(",")) && <option value={c.ids.join(",")}>{c.ids.join(", ")}</option>}
                  {CAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            </div>
            <label><span>Калимаи ҷустуҷӯ (ихтиёрӣ: танҳо як қисми категория)</span><input value={c.q} maxLength={40} onChange={(e) => patchCat(i, { q: e.target.value })} placeholder="масалан: ошхона" /></label>
          </div>
        ))}
        <button className="ad-add" onClick={() => setCats([...site.homeCats, { id: uid(), name: "", ids: ["home"], q: "", show: true }])}>+ Нишони нав</button>
      </section>

      <section className="ad-card">
        <h3>Логои брендҳо</h3>
        <p className="ad-hint">Барои ҳар бренд логои худатонро (PNG, JPG, WebP ё SVG) боргирӣ кунед. Акс худаш хурд карда мешавад. Агар лого набошад, логои пешфарз ё ҳарфҳо нишон дода мешаванд.</p>
        <input className="ad-search" placeholder="Ҷустуҷӯи бренд" value={logoFilter} onChange={(e) => setLogoFilter(e.target.value)} />
        <div className="ad-logos">
          {brandNames.filter((n) => n.toLowerCase().includes(logoFilter.trim().toLowerCase())).map((n) => (
            <div key={n} className="ad-logo">
              <span className="ad-logo-img"><BrandLogo name={n} small /></span>
              <b>{n}</b>
              <label className="ad-up">Боргирӣ<input type="file" accept="image/*" hidden onChange={async (e) => {
                const file = e.target.files?.[0]; e.target.value = "";
                if (!file) return;
                const url = await fileToLogo(file);
                if (!url || url.length > 140_000) return setMsg({ ok: false, text: "Акс хонда нашуд ё хеле калон аст (то 100 КБ)" });
                setSite((s) => ({ ...s, brandLogos: { ...s.brandLogos, [n]: url } }));
              }} /></label>
              {site.brandLogos[n] && <button className="ad-mv red" onClick={() => setSite((s) => { const b = { ...s.brandLogos }; delete b[n]; return { ...s, brandLogos: b }; })} aria-label="Нест кардан">✕</button>}
            </div>
          ))}
        </div>
      </section>

      <section className="ad-card">
        <h3>Матнҳо: ваъдаҳо, қадамҳо, пардохт</h3>
        <p className="ad-hint">Ин матнҳо дар сайт нишон дода мешаванд. Матни тағйирёфта ба забонҳои русӣ ва англисӣ худаш тарҷума намешавад, ба ҷояш ҳамон матни тоҷикӣ намоён мешавад.</p>
        {[...new Set(TEXT_FIELDS.map((f) => f.group))].map((g) => (
          <details key={g} className="ad-fold">
            <summary>{g}</summary>
            <div className="ad-fold-body">
              {TEXT_FIELDS.filter((f) => f.group === g).map((f) => (
                <label key={f.key}><span>{f.label}</span>
                  {f.long
                    ? <textarea rows={3} maxLength={400} value={site.texts[f.key] ?? f.def} onChange={(e) => setSite({ ...site, texts: { ...site.texts, [f.key]: e.target.value } })} />
                    : <input maxLength={120} value={site.texts[f.key] ?? f.def} onChange={(e) => setSite({ ...site, texts: { ...site.texts, [f.key]: e.target.value } })} />}
                </label>
              ))}
              <button className="ad-ghost" onClick={() => setSite({ ...site, texts: { ...site.texts, ...Object.fromEntries(TEXT_FIELDS.filter((f) => f.group === g).map((f) => [f.key, f.def])) } })}>Ба матни аввала баргардондан</button>
            </div>
          </details>
        ))}
      </section>

      <section className="ad-card">
        <h3>Брендҳои ҷаҳонӣ</h3>
        <p className="ad-hint">Брендҳои ғайриинтихобшуда дар сайт нишон дода намешаванд (брендҳое, ки мол доранд, ҳамеша нишон дода мешаванд).</p>
        <div className="ad-chips wrap">
          {FEATURED_BRANDS.map((n) => {
            const hidden = site.hiddenBrands.includes(n);
            return <button key={n} className={hidden ? "" : "on"} onClick={() => setSite({ ...site, hiddenBrands: hidden ? site.hiddenBrands.filter((x) => x !== n) : [...site.hiddenBrands, n] })}>{n}</button>;
          })}
        </div>
        <div className="ad-actions">
          <button className="ad-ghost" onClick={() => setSite({ ...site, hiddenBrands: [] })}>Ҳамаро нишон додан</button>
          <button className="ad-ghost" onClick={() => setSite({ ...site, hiddenBrands: [...FEATURED_BRANDS] })}>Ҳамаро пинҳон кардан</button>
        </div>
      </section>

      <div className="ad-savebar">
        {msg && <span className={msg.ok ? "ad-msg" : "ad-err"}>{msg.text}</span>}
        <button className="ad-ghost" onClick={() => { if (confirm("Ҳамаи тағйирот ба ҳолати аввала бармегардад (то захира кардан дар сайт тағйир намеёбад). Идома?")) setSite(DEFAULT_SITE); }}>Аз нав</button>
        <button className="ad-primary" onClick={save} disabled={busy}>{busy ? "Захира мешавад…" : "Захира кардан"}</button>
      </div>
    </>
  );
}
