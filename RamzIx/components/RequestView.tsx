"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { waLink } from "@/lib/catalog";
import { SHIP_COUNTRIES, nameOf, type ShipCountry } from "@/lib/phone";
import { SETTINGS } from "@/lib/pricing-config";
import { saveProfile, useProfile } from "@/lib/profile";
import { setDest, useDest } from "@/lib/useDest";
import { useMoney } from "./Currency";
import Flag from "./Flag";
import Icon from "./Icon";
import { T, useT } from "./Lang";

type Photo = { id: string; blob: Blob; url: string };
type Item = { id: string; link: string; photos: Photo[]; title: string; qty: string; unit: string; price: string };
type Errors = { items: Record<string, Partial<Record<"source" | "title" | "qty", boolean>>>; name?: boolean; phone?: boolean; city?: boolean };
type Done = { code: string; phone: string; link: string };

const MAX_PHOTOS = 3;
const MAX_ITEMS = 10;
const UNITS = ["дона", "картон"];
const uid = () => Math.random().toString(36).slice(2, 8);
const blank = (): Item => ({ id: uid(), link: "", photos: [], title: "", qty: "", unit: "дона", price: "" });
const linkOk = (s: string) => /^https?:\/\/\S{4,}/i.test(s.trim());

/* Акс дар телефон калон аст: пеш аз фиристодан то 1280px ва JPEG мекунем (одатан 150–300 КБ) */
async function shrink(file: File): Promise<Blob | null> {
  if (!file.type.startsWith("image/")) return null;
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return null;
  const k = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(bmp.width * k));
  c.height = Math.max(1, Math.round(bmp.height * k));
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  return await new Promise((ok) => c.toBlob(ok, "image/jpeg", 0.8));
}

/* Дархости ёфтани мол: харидор як ё якчанд мол (пайванд, акс ё ном) бо миқдор мефиристад, мо меёбем ва нарх мегӯем.
   Суроғаи пурра лозим нест: кишвар ва шаҳр барои нархи расонидан бас аст. Дархост ба фармоишҳои админ (type = request) меравад. */
export default function RequestView() {
  const { t } = useT();
  const { label } = useMoney();
  const { profile, ready } = useProfile();
  const dest = useDest();
  const [items, setItems] = useState<Item[]>([blank()]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [filled, setFilled] = useState(false);
  const [errors, setErrors] = useState<Errors>({ items: {} });
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const pick = useRef<HTMLInputElement>(null);
  const pickFor = useRef<string>("");
  const urls = useRef<string[]>([]);
  const hours = SETTINGS.quoteHours;

  // Маълумоти профилро як бор ба шакл меорем
  useEffect(() => {
    if (!ready || filled) return;
    setName(profile.name);
    setPhone(profile.phone || "");
    setCity(profile.address);
    setFilled(true);
  }, [ready, filled, profile]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const patch = (id: string, p: Partial<Item>) => setItems((l) => l.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const unbad = (id: string, k: "source" | "title" | "qty") => setErrors((e) => (e.items[id]?.[k] ? { ...e, items: { ...e.items, [id]: { ...e.items[id], [k]: false } } } : e));

  const addPhotos = async (id: string, files: FileList | null) => {
    const it = items.find((x) => x.id === id);
    if (!files || !it) return;
    const out: Photo[] = [];
    for (const f of Array.from(files).slice(0, MAX_PHOTOS - it.photos.length)) {
      const blob = await shrink(f);
      if (!blob) continue;
      const url = URL.createObjectURL(blob);
      urls.current.push(url);
      out.push({ id: uid(), blob, url });
    }
    if (out.length) { setItems((l) => l.map((x) => (x.id === id ? { ...x, photos: [...x.photos, ...out].slice(0, MAX_PHOTOS) } : x))); unbad(id, "source"); }
  };

  const submit = async () => {
    const err: Errors = { items: {} };
    for (const it of items) {
      // Мол бояд бо чизе муайян шавад: пайванд, акс ё номи равшан
      const e = { source: !linkOk(it.link) && !it.photos.length && it.title.trim().length < 3, title: it.title.trim().length < 2, qty: !(parseFloat(it.qty) > 0) };
      if (e.source || e.title || e.qty) err.items[it.id] = e;
    }
    err.name = name.trim().length < 2;
    err.phone = phone.replace(/\D/g, "").length < 7;
    err.city = city.trim().length < 2;
    setErrors(err);
    if (Object.keys(err.items).length || err.name || err.phone || err.city) {
      requestAnimationFrame(() => document.querySelector(".ck-field.bad, .rq-source.bad")?.scrollIntoView({ block: "center" }));
      return;
    }
    setBusy(true);
    setFail("");
    try {
      // Аксҳо ба сервер (Supabase Storage) мераванд, баъд дархост бо пайвандҳои аксҳо
      const lines = [];
      for (const it of items) {
        const images: string[] = [];
        for (const p of it.photos) {
          const r = await fetch("/api/request-upload", { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: p.blob });
          if (!r.ok) throw new Error(r.status === 429 ? "limit" : "upload");
          images.push((await r.json()).url as string);
        }
        const target = parseFloat(it.price.replace(",", "."));
        const title = `${it.title.trim()}${target > 0 ? ` · ${t("нархи мақсад")}: ${target} ${label}` : ""}`;
        lines.push({ id: `rq${lines.length}`, name: `${t("Дархост")}: ${title}`.slice(0, 150), qty: parseFloat(it.qty), unit: it.unit, costTotal: 0, markupPct: 0, link: linkOk(it.link) ? it.link.trim() : undefined, images, title, raw: it });
      }
      const code = `RQ-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const where = `${t(nameOf(dest))}, ${city.trim()}`;
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
          code,
          customer: { name: name.trim(), phone: phone.trim(), address: where },
          items: lines.map(({ title: _t, raw: _r, ...l }) => l),
          shippingCharged: 0,
          shippingCost: 0,
        }),
      });
      if (!r.ok) throw new Error("order");
      saveProfile({ ...profile, country: dest, name: name.trim(), phone: phone.trim(), address: profile.address || city.trim() });
      const text = [
        `${t("Дархости нав аз RamzIx")} ${code}`,
        ...lines.map((l, k) => `${k + 1}) ${l.title} — ${l.qty} ${t(l.unit)}${l.link ? `\n   ${l.link}` : ""}`),
        `${t("Расонидан")}: ${where}`,
        `${t("Харидор")}: ${name.trim()}, ${phone.trim()}`,
      ].join("\n");
      setDone({ code, phone: phone.trim(), link: waLink(text) });
      window.scrollTo(0, 0);
    } catch (e) {
      setFail(e instanceof Error && e.message === "limit" ? t("Аксҳо хеле зиёд фиристода шуд. Баъд аз як соат кӯшиш кунед.") : t("Дархост фиристода нашуд. Пайвастшавиро санҷед ва дубора кӯшиш кунед."));
    }
    setBusy(false);
  };

  if (done) {
    return (
      <div className="ck-done">
        <span className="ck-done-ic"><Icon name="check" size={34} stroke={2.6} /></span>
        <h2><T>Дархост қабул шуд</T></h2>
        <div className="ck-code">{done.code}</div>
        <p>{t("Мо молро меёбем ва то {h} соат бо нарх ба рақами {p} ҷавоб медиҳем.", { h: hours, p: done.phone })}</p>
        <a className="btn btn-orange" href={done.link} target="_blank" rel="noreferrer"><Icon name="wa" size={18} /> <T>Навиштан дар WhatsApp</T></a>
        <Link className="ck-home" href="/"><T>Ба саҳифаи асосӣ</T></Link>
      </div>
    );
  }

  return (
    <>
      <section className="rq-hero">
        <h2><T>Мол наёфтед? Мо онро аз Дубай меёбем.</T></h2>
        <p>{t("Ҷавоб бо нарх то {h} соат", { h: hours })}</p>
        <ol>
          <li><b>1</b><T>Фиристед</T></li>
          <li><b>2</b><T>Нарх мегиред</T></li>
          <li><b>3</b><T>Тасдиқ мекунед</T></li>
        </ol>
      </section>

      {items.map((it, k) => {
        const e = errors.items[it.id] ?? {};
        return (
          <section className="ck-card" key={it.id}>
            <h2>
              <span className="ck-n">{k + 1}</span>{items.length > 1 ? t("Мол {n}", { n: k + 1 }) : t("Мол")}
              {items.length > 1 && <button type="button" className="rq-del" onClick={() => setItems((l) => l.filter((x) => x.id !== it.id))} aria-label={t("Нест кардан")}><Icon name="close" size={16} /></button>}
            </h2>
            <label className={`ck-field ${e.title ? "bad" : ""}`}>
              <span>{t("Номи мол ё модел")}<i>*</i></span>
              <input maxLength={100} placeholder={t("Масалан: блендер Bergamo SB3114DSB")} value={it.title} onChange={(ev) => { patch(it.id, { title: ev.target.value }); unbad(it.id, "title"); unbad(it.id, "source"); }} />
              {e.title && <em><T>Ин майдонро дуруст пур кунед</T></em>}
            </label>
            <div className={`rq-source ${e.source ? "bad" : ""}`}>
              <label className="ck-field">
                <span>{t("Пайванд (ихтиёрӣ)")}</span>
                <input type="url" inputMode="url" maxLength={400} placeholder="https://" value={it.link} onChange={(ev) => { patch(it.id, { link: ev.target.value }); unbad(it.id, "source"); }} />
              </label>
              <div className="ck-field">
                <span>{t("Акс (то 3, ихтиёрӣ)")}</span>
                <div className="rq-photos">
                  {it.photos.map((p) => (
                    <div key={p.id} className="rq-th">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt="" />
                      <button type="button" className="rq-x" aria-label={t("Нест кардан")} onClick={() => patch(it.id, { photos: it.photos.filter((x) => x.id !== p.id) })}>✕</button>
                    </div>
                  ))}
                  {it.photos.length < MAX_PHOTOS && (
                    <button type="button" className="rq-th rq-add" onClick={() => { pickFor.current = it.id; pick.current?.click(); }} aria-label={t("Иловаи акс")}>
                      <Icon name="plus" size={22} />
                    </button>
                  )}
                </div>
              </div>
              {e.source && <em className="rq-err"><T>Номи пурра, пайванд ё акси молро илова кунед</T></em>}
            </div>
            <div className="rq-row">
              <label className={`ck-field ${e.qty ? "bad" : ""}`}>
                <span>{t("Миқдор")}<i>*</i></span>
                <span className="rq-qty">
                  <input inputMode="decimal" placeholder="100" value={it.qty} onChange={(ev) => { patch(it.id, { qty: ev.target.value.replace(/[^\d.,]/g, "").replace(",", ".") }); unbad(it.id, "qty"); }} />
                  <select value={it.unit} onChange={(ev) => patch(it.id, { unit: ev.target.value })} aria-label={t("Воҳид")}>
                    {UNITS.map((u) => <option key={u} value={u}>{t(u)}</option>)}
                  </select>
                </span>
              </label>
              <label className="ck-field">
                <span>{t("Нархи мақсад (1 {u})", { u: t(it.unit) })}</span>
                <span className="rq-qty">
                  <input inputMode="decimal" placeholder={t("ихтиёрӣ")} value={it.price} onChange={(ev) => patch(it.id, { price: ev.target.value.replace(/[^\d.,]/g, "") })} />
                  <i>{label}</i>
                </span>
              </label>
            </div>
          </section>
        );
      })}

      {items.length < MAX_ITEMS && (
        <button type="button" className="rq-more" onClick={() => setItems((l) => [...l, blank()])}><Icon name="plus" size={18} /> <T>Боз як мол</T></button>
      )}
      <input ref={pick} type="file" accept="image/*" multiple hidden onChange={(e) => { addPhotos(pickFor.current, e.target.files); e.target.value = ""; }} />

      <section className="ck-card">
        <h2><span className="ck-n"><Icon name="truck" size={14} /></span><T>Расонидан ва тамос</T></h2>
        <div className="ck-field">
          <span>{t("Кишвар")}<i>*</i></span>
          <div className="ck-seg">
            {SHIP_COUNTRIES.map((c) => (
              <button key={c.id} type="button" className={dest === c.id ? "on" : ""} onClick={() => setDest(c.id as ShipCountry)}>
                <Flag code={c.id} className="seg-flag" /> {t(c.name)}
              </button>
            ))}
          </div>
        </div>
        <label className={`ck-field ${errors.city ? "bad" : ""}`}>
          <span>{t("Шаҳр")}<i>*</i></span>
          <input autoComplete="address-level2" maxLength={80} placeholder={t("Масалан: Душанбе")} value={city} onChange={(e) => { setCity(e.target.value); setErrors((x) => ({ ...x, city: false })); }} />
          {errors.city && <em><T>Ин майдонро дуруст пур кунед</T></em>}
        </label>
        <label className={`ck-field ${errors.name ? "bad" : ""}`}>
          <span>{t("Ном ва насаб")}<i>*</i></span>
          <input autoComplete="name" maxLength={120} value={name} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: false })); }} />
          {errors.name && <em><T>Ин майдонро дуруст пур кунед</T></em>}
        </label>
        <label className={`ck-field ${errors.phone ? "bad" : ""}`}>
          <span>{t("Рақами WhatsApp")}<i>*</i></span>
          <input type="tel" inputMode="tel" autoComplete="tel" className="ck-plain" placeholder={dest === "intl" ? "+49 123 456 7890" : "000 000 00 00"} maxLength={20} value={phone} onChange={(e) => { setPhone(e.target.value.replace(/[^\d+\s()-]/g, "")); setErrors((x) => ({ ...x, phone: false })); }} />
          {errors.phone && <em><T>Ин майдонро дуруст пур кунед</T></em>}
        </label>
      </section>

      {fail && <p className="rq-fail">{fail}</p>}

      <div className="cart-bar">
        <button className="cb-btn rq-send" onClick={submit} disabled={busy}>
          <Icon name="check" size={20} stroke={2.6} /> {busy ? t("Фиристода мешавад…") : items.length > 1 ? t("Фиристодани {n} мол", { n: items.length }) : t("Дархост равон кардан")}
        </button>
      </div>
    </>
  );
}
