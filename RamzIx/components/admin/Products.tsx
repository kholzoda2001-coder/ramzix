"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { adminCostTjs, toStorefront, useAdmin, type AdminProduct } from "@/lib/admin";
import { CATEGORIES, COUNTRIES, type CountryCode } from "@/lib/catalog";
import { listUnitPrice } from "@/lib/pricing";
import type { Currency } from "@/lib/pricing-config";
import ProductImage from "../ProductImage";
import { getDefaultMarkup } from "./settings-store";
import { useFx } from "./fx";
import { Sheet } from "./ui";

type Admin = ReturnType<typeof useAdmin>;
const n = (s: string) => (Number.isFinite(parseFloat(s.replace(",", "."))) ? parseFloat(s.replace(",", ".")) : 0);
const CURS: Currency[] = ["USD", "AED", "CNY", "TJS"];
const UNITS = ["дона", "картон", "кг"];

/** extra бо аломати «нархи оптовӣ нест»; агар хол бошад — ҳеҷ чиз нигоҳ дошта намешавад */
const withWholesale = (extra: AdminProduct["extra"], wholesale: boolean): AdminProduct["extra"] => {
  const { noWholesale: _drop, ...rest } = extra ?? {};
  void _drop;
  const out = wholesale ? rest : { ...rest, noWholesale: true };
  return Object.keys(out).length ? out : undefined;
};

type Form = {
  id?: string; slug?: string; name: string; subtitle: string; brand: string; category: string; country: CountryCode;
  cost: string; costCurrency: Currency; weight: string; vol: string; images: string[]; description: string; sizes: string;
  unit: string; per: string; perLabel: string; min: string; step: string; markup: string; active: boolean; note: string;
  /** false — нархи оптовӣ надорад */
  wholesale: boolean;
  /** Майдонҳои иловагии маҳсулот (рейтинг, рангҳо…) — ҳангоми таҳрир гум намешаванд */
  extra?: AdminProduct["extra"];
};
const blank = (): Form => ({ name: "", subtitle: "", brand: "", category: "home", country: "ae", cost: "", costCurrency: "AED", weight: "", vol: "", images: [], description: "", sizes: "", unit: "дона", per: "", perLabel: "дона", min: "", step: "", markup: String(getDefaultMarkup()), active: true, note: "", wholesale: true });
const fromProduct = (p: AdminProduct): Form => ({
  id: p.id, slug: p.slug, name: p.name, subtitle: p.subtitle, brand: p.brand, category: p.category, country: p.country,
  cost: String(p.cost), costCurrency: p.costCurrency, weight: p.weightKg ? String(p.weightKg) : "", vol: p.volumeM3 ? String(p.volumeM3) : "",
  images: p.images, description: p.description, sizes: p.sizes.join(", "), unit: p.unit, per: p.per ? String(p.per) : "", perLabel: p.perLabel || "дона",
  min: p.min ? String(p.min) : "", step: p.step ? String(p.step) : "", markup: String(p.markupPct), active: p.active, note: p.note,
  wholesale: !p.extra?.noWholesale, extra: p.extra,
});

/* Акс аз дастгоҳ: хурд карда мешавад, то хотира пур нашавад */
async function shrink(file: File, max = 900, quality = 0.8): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", quality);
  } finally { URL.revokeObjectURL(url); }
}

export default function Products({ admin }: { admin: Admin }) {
  const { m, label, cur } = useFx();
  const [form, setForm] = useState<Form | null>(null);
  const [err, setErr] = useState("");
  const [url, setUrl] = useState("");
  const [q, setQ] = useState("");
  const [fCat, setFCat] = useState("");
  const [fCountry, setFCountry] = useState("");
  const [fState, setFState] = useState("");
  useEffect(() => setForm(null), [cur]);

  const set = (patch: Partial<Form>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const list = useMemo(() => admin.products.filter((p) =>
    (!q.trim() || `${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase())) &&
    (!fCat || p.category === fCat) &&
    (!fCountry || p.country === fCountry) &&
    (!fState || (fState === "on" ? p.active : fState === "off" ? !p.active : fState === "whole" ? !p.extra?.noWholesale : !!p.extra?.noWholesale))),
  [admin.products, q, fCat, fCountry, fState]);
  const toggleWholesale = (p: AdminProduct) => admin.saveProduct({ ...p, extra: withWholesale(p.extra, !!p.extra?.noWholesale) });

  const toAdmin = (f: Form): Omit<AdminProduct, "id" | "slug"> => ({
    name: f.name.trim(), subtitle: f.subtitle.trim(), brand: f.brand.trim(), category: f.category, country: f.country,
    cost: n(f.cost), costCurrency: f.costCurrency, weightKg: n(f.weight), volumeM3: n(f.vol), images: f.images,
    description: f.description.trim(), sizes: f.sizes.split(",").map((x) => x.trim()).filter(Boolean),
    unit: f.unit, per: f.unit === "картон" ? n(f.per) : 0, perLabel: f.unit === "картон" ? f.perLabel.trim() || "дона" : "",
    min: n(f.min), step: n(f.step), markupPct: n(f.markup), active: f.active, note: f.note.trim(),
    extra: withWholesale(f.extra, f.wholesale),
  });

  const save = () => {
    if (!form) return;
    if (form.name.trim().length < 2) return setErr("Номи маҳсулотро нависед");
    if (!(n(form.cost) > 0)) return setErr("Нархи харидро ворид кунед");
    setErr("");
    admin.saveProduct({ ...toAdmin(form), id: form.id, slug: form.slug });
    setForm(null);
  };

  const addFiles = async (files: FileList | null) => {
    if (!files || !form) return;
    const out: string[] = [];
    for (const f of Array.from(files).slice(0, 8 - form.images.length)) {
      try { out.push(await shrink(f)); } catch {}
    }
    set({ images: [...form.images, ...out] });
  };

  // Нархи ҳисобшудаи сайт барои пешнамоиш
  const preview = form && n(form.cost) > 0 ? listUnitPrice(toStorefront({ ...toAdmin(form), id: "", slug: "x" })) : 0;

  return (
    <>
      <button className="ad-primary" onClick={() => { setErr(""); setForm(blank()); }}>+ Маҳсулоти нав</button>
      <p className="ad-hint">Маҳсулоте, ки илова мекунед ва «Фаъол» аст, баъди захира дар сайт барои ҳама пайдо мешавад.</p>

      {admin.products.length > 4 && (
        <>
          <input className="ad-search" placeholder="Ҷустуҷӯ" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="ad-grid2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <select value={fCat} onChange={(e) => setFCat(e.target.value)} aria-label="Категория"><option value="">Ҳама категорияҳо</option>{CATEGORIES.filter((c) => c.id !== "all").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select value={fCountry} onChange={(e) => setFCountry(e.target.value)} aria-label="Кишвар"><option value="">Ҳама кишварҳо</option>{(Object.keys(COUNTRIES) as CountryCode[]).map((c) => <option key={c} value={c}>{COUNTRIES[c].short}</option>)}</select>
            <select value={fState} onChange={(e) => setFState(e.target.value)} aria-label="Ҳолат">
              <option value="">Ҳама</option><option value="on">Дар сайт</option><option value="off">Пинҳон</option><option value="whole">Бо нархи оптом</option><option value="nowhole">Бе нархи оптом</option>
            </select>
          </div>
          <p className="ad-hint">{list.length} аз {admin.products.length} мол</p>
        </>
      )}

      {admin.products.length === 0 ? <p className="ad-empty">Ҳоло маҳсулот нест</p> : (
        <div className="ad-list">
          {list.map((p) => (
            <div className={`ad-prod ${p.active ? "" : "off"}`} key={p.id}>
              <button className="ap-main" onClick={() => { setErr(""); setForm(fromProduct(p)); }}>
                <span className="ap-img">{p.images[0] ? <ProductImage src={p.images[0]} alt="" sizes="96px" /> : "📦"}</span>
                <span className="ap-t">
                  <b>{p.name}</b>
                  {p.extra?.sku && <small>{p.extra.sku}</small>}
                  <small>{COUNTRIES[p.country].short} · {CATEGORIES.find((c) => c.id === p.category)?.name} · {p.unit}</small>
                  <small>Харид: <b>{m(adminCostTjs(p))}</b> {label} · фоидаи POS {p.markupPct}%</small>
                </span>
              </button>
              <div className="ap-act">
                <button className={p.active ? "on" : ""} onClick={() => admin.toggleProduct(p.id)}>{p.active ? "● Дар сайт" : "○ Пинҳон"}</button>
                <button className={p.extra?.noWholesale ? "" : "on"} onClick={() => toggleWholesale(p)}>{p.extra?.noWholesale ? "○ Бе оптом" : "● Оптом"}</button>
                {p.active && <Link href={`/product/${p.slug}`} target="_blank">Дидан ↗</Link>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={!!form} onClose={() => setForm(null)} title={form?.id ? "Таҳрири маҳсулот" : "Маҳсулоти нав"}>
        {form && (
          <div className="ad-form">
            <section className="ad-card">
              <h3>Аксҳо</h3>
              <div className="ad-imgs">
                {form.images.map((src, i) => (
                  <span className="ad-img" key={i}>
                    <ProductImage src={src} alt="" sizes="96px" />
                    <button onClick={() => set({ images: form.images.filter((_, k) => k !== i) })} aria-label="Хориҷ">✕</button>
                    {i === 0 && <em>Асосӣ</em>}
                  </span>
                ))}
                {form.images.length < 8 && (
                  <label className="ad-img add">
                    <span>＋<small>Акс</small></span>
                    <input type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                  </label>
                )}
              </div>
              <div className="ad-grid2" style={{ gridTemplateColumns: "1fr auto" }}>
                <label><span>ё пайванди акс (URL)</span><input value={url} placeholder="https://…" onChange={(e) => setUrl(e.target.value)} /></label>
                <button className="ad-ghost" onClick={() => { if (/^https?:\/\//.test(url.trim())) { set({ images: [...form.images, url.trim()] }); setUrl(""); } }}>Илова</button>
              </div>
            </section>

            <section className="ad-card">
              <h3>Асосӣ</h3>
              <label><span>Ном *</span><input value={form.name} onChange={(e) => set({ name: e.target.value })} /></label>
              {form.extra?.sku && <label><span>Артикул (худкор, тағйир намеёбад)</span><input value={form.extra.sku} readOnly disabled /></label>}
              <label><span>Тавсифи кӯтоҳ</span><input value={form.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></label>
              <div className="ad-grid2">
                <label><span>Бренд</span><input value={form.brand} onChange={(e) => set({ brand: e.target.value })} /></label>
                <label><span>Категория</span>
                  <select value={form.category} onChange={(e) => set({ category: e.target.value })}>{CATEGORIES.filter((c) => c.id !== "all").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                </label>
              </div>
              <label><span>Аз кадом кишвар меояд *</span>
                <select value={form.country} onChange={(e) => set({ country: e.target.value as CountryCode })}>
                  {(Object.keys(COUNTRIES) as CountryCode[]).map((c) => <option key={c} value={c}>{COUNTRIES[c].name}</option>)}
                </select>
              </label>
              <label><span>Тавсиф</span><textarea rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} /></label>
              <label><span>Андозаҳо (бо вергул): S, M, L</span><input value={form.sizes} onChange={(e) => set({ sizes: e.target.value })} /></label>
            </section>

            <section className="ad-card">
              <h3>Нарх</h3>
              <div className="ad-grid2">
                <label><span>Нархи харид барои 1 {form.unit} *</span><input inputMode="decimal" value={form.cost} onChange={(e) => set({ cost: e.target.value })} /></label>
                <label><span>Асъори харид</span><select value={form.costCurrency} onChange={(e) => set({ costCurrency: e.target.value as Currency })}>{CURS.map((c) => <option key={c}>{c}</option>)}</select></label>
              </div>
              <label><span>Фоидаи пешфарз дар POS, %</span><input inputMode="decimal" value={form.markup} onChange={(e) => set({ markup: e.target.value })} /></label>
              {preview > 0 && <p className="ad-calc"><span className="g">Нархи асосии сайт: <b>{m(preview)} {label}</b> / {form.unit}</span></p>}
            </section>

            <section className="ad-card">
              <h3>Воҳиди фурӯш, вазн ва ҳаҷм</h3>
              <div className="ad-seg">{UNITS.map((u) => <button key={u} className={form.unit === u ? "on" : ""} onClick={() => set({ unit: u })}>{u}</button>)}</div>
              {form.unit === "картон" && (
                <div className="ad-grid2">
                  <label><span>Дар як картон</span><input inputMode="numeric" value={form.per} onChange={(e) => set({ per: e.target.value })} /></label>
                  <label><span>Чӣ (банка, шиша…)</span><input value={form.perLabel} onChange={(e) => set({ perLabel: e.target.value })} /></label>
                </div>
              )}
              <div className="ad-grid2">
                <label><span>Миқдори ҳадди ақал</span><input inputMode="decimal" value={form.min} placeholder="1" onChange={(e) => set({ min: e.target.value })} /></label>
                {form.unit === "кг" && <label><span>Қадам (кг)</span><input inputMode="decimal" value={form.step} placeholder="1" onChange={(e) => set({ step: e.target.value })} /></label>}
              </div>
              <div className="ad-grid2">
                <label><span>Вазни 1 {form.unit}, кг</span><input inputMode="decimal" value={form.weight} onChange={(e) => set({ weight: e.target.value })} /></label>
                <label><span>Ҳаҷми 1 {form.unit}, м³</span><input inputMode="decimal" value={form.vol} onChange={(e) => set({ vol: e.target.value })} /></label>
              </div>
              <p className="ad-hint">Вазн ва ҳаҷм барои ҳисоби расонидан лозим аст.</p>
            </section>

            <label className="ad-toggle"><input type="checkbox" checked={form.active} onChange={(e) => set({ active: e.target.checked })} /> <span>Дар сайт нишон дода шавад</span></label>
            <label className="ad-toggle"><input type="checkbox" checked={form.wholesale} onChange={(e) => set({ wholesale: e.target.checked })} /> <span>Нархи оптовӣ дорад (аз ҳисоби зинаҳои 13% · 8% · 5%). Хомӯш бошад — ҳамеша нархи дона, ба тахфифи сабад ҳисоб намешавад</span></label>
            <label><span>Эзоҳи дохилӣ (барои худатон)</span><input value={form.note} onChange={(e) => set({ note: e.target.value })} /></label>

            {err && <p className="ad-err">{err}</p>}
            <button className="ad-primary" onClick={save}>Нигоҳ доштан</button>
            {form.id && <button className="ad-ghost red" onClick={() => { admin.deleteProduct(form.id!); setForm(null); }}>Нест кардан</button>}
          </div>
        )}
      </Sheet>
    </>
  );
}
