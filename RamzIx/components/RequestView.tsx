"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { waLink } from "@/lib/catalog";
import { saveProfile, useProfile } from "@/lib/profile";
import Icon from "./Icon";
import { T, useT } from "./Lang";

type Errors = Partial<Record<"source" | "title" | "name" | "phone" | "address", boolean>>;
type Photo = { id: string; blob: Blob; url: string };
type Done = { code: string; phone: string; link: string };

const MAX_PHOTOS = 3;

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

/* Дархости мол: харидор пайванд ё акс медиҳад, ном ва суроғаашро менависад — менеҷер занг мезанад.
   Дархост ба рӯйхати фармоишҳои админ (type = request) меравад. Нарх ва пардохт дар сайт нест. */
export default function RequestView() {
  const { t } = useT();
  const { profile, ready } = useProfile();
  const [link, setLink] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [filled, setFilled] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const pick = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  // Маълумоти профилро як бор ба шакл меорем
  useEffect(() => {
    if (!ready || filled) return;
    setName(profile.name);
    setPhone(profile.phone || "");
    setAddress(profile.address);
    setFilled(true);
  }, [ready, filled, profile]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const clear = (k: keyof Errors) => errors[k] && setErrors((e) => ({ ...e, [k]: false }));
  const linkOk = /^https?:\/\/\S{4,}/i.test(link.trim());

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    const out: Photo[] = [];
    for (const f of Array.from(files).slice(0, MAX_PHOTOS - photos.length)) {
      const blob = await shrink(f);
      if (!blob) continue;
      const url = URL.createObjectURL(blob);
      urls.current.push(url);
      out.push({ id: Math.random().toString(36).slice(2, 8), blob, url });
    }
    if (out.length) { setPhotos((p) => [...p, ...out].slice(0, MAX_PHOTOS)); clear("source"); }
  };

  const submit = async () => {
    const err: Errors = {
      source: !linkOk && photos.length === 0,
      title: title.trim().length < 2,
      name: name.trim().length < 2,
      phone: phone.replace(/\D/g, "").length < 9,
      address: address.trim().length < 5,
    };
    setErrors(err);
    if (Object.values(err).some(Boolean)) {
      document.querySelector(".ck-field.bad, .rq-source.bad")?.scrollIntoView({ block: "center" });
      return;
    }
    setBusy(true);
    setFail("");
    try {
      // Аксҳо ба сервер (Supabase Storage) мераванд, баъд дархост бо пайвандҳои аксҳо
      const images: string[] = [];
      for (const p of photos) {
        const r = await fetch("/api/request-upload", { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: p.blob });
        if (!r.ok) throw new Error(r.status === 429 ? "limit" : "upload");
        images.push((await r.json()).url as string);
      }
      const code = `RQ-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
          code,
          customer: { name: name.trim(), phone: phone.trim(), address: address.trim() },
          items: [{ id: "rq0", name: `${t("Дархост")}: ${title.trim()}`, qty: 1, unit: "дона", costTotal: 0, markupPct: 0, link: linkOk ? link.trim() : undefined, images }],
          shippingCharged: 0,
          shippingCost: 0,
        }),
      });
      if (!r.ok) throw new Error("order");
      saveProfile({ ...profile, name: name.trim(), phone: phone.trim(), address: address.trim() });
      const text = [`${t("Дархости нав аз RamzIx")} ${code}`, `${t("Мол")}: ${title.trim()}`, linkOk && link.trim(), `${t("Харидор")}: ${name.trim()}, ${phone.trim()}`].filter(Boolean).join("\n");
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
        <p>{t("Менеҷер ба рақами {p} занг мезанад ва нархро мегӯяд.", { p: done.phone })}</p>
        <a className="btn btn-orange" href={done.link} target="_blank" rel="noreferrer"><Icon name="wa" size={18} /> <T>Навиштан дар WhatsApp</T></a>
        <Link className="ck-home" href="/"><T>Ба саҳифаи асосӣ</T></Link>
      </div>
    );
  }

  return (
    <>
      <p className="rq-lead"><T>Мол дар сайти дигар ёфтед? Пайванд ё акси онро фиристед, менеҷер занг мезанад ва нархро мегӯяд.</T></p>

      <section className="ck-card">
        <h2><span className="ck-n">1</span><T>Мол</T></h2>
        <div className={`rq-source ${errors.source ? "bad" : ""}`}>
          <label className="ck-field">
            <span>{t("Пайванд аз сайти дигар")}</span>
            <input type="url" inputMode="url" maxLength={400} placeholder="https://" value={link} onChange={(e) => { setLink(e.target.value); clear("source"); }} />
          </label>
          <div className="ck-field">
            <span>{t("Ё акс аз телефон (то 3)")}</span>
            <div className="rq-photos">
              {photos.map((p) => (
                <div key={p.id} className="rq-th">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" />
                  <button type="button" className="rq-x" aria-label={t("Нест кардан")} onClick={() => setPhotos((l) => l.filter((x) => x.id !== p.id))}>✕</button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button type="button" className="rq-th rq-add" onClick={() => pick.current?.click()} aria-label={t("Иловаи акс")}>
                  <Icon name="plus" size={22} />
                </button>
              )}
            </div>
            <input ref={pick} type="file" accept="image/*" multiple hidden onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
          </div>
          {errors.source && <em className="rq-err"><T>Пайванд ё акси молро илова кунед</T></em>}
        </div>
        <label className={`ck-field ${errors.title ? "bad" : ""}`}>
          <span>{t("Номи мол")}<i>*</i></span>
          <input maxLength={120} placeholder={t("Масалан: куртаи зимистона, сиёҳ")} value={title} onChange={(e) => { setTitle(e.target.value); clear("title"); }} />
          {errors.title && <em><T>Ин майдонро дуруст пур кунед</T></em>}
        </label>
      </section>

      <section className="ck-card">
        <h2><span className="ck-n">2</span><T>Тамос ва суроға</T></h2>
        <label className={`ck-field ${errors.name ? "bad" : ""}`}>
          <span>{t("Ном ва насаб")}<i>*</i></span>
          <input autoComplete="name" maxLength={120} value={name} onChange={(e) => { setName(e.target.value); clear("name"); }} />
          {errors.name && <em><T>Ин майдонро дуруст пур кунед</T></em>}
        </label>
        <label className={`ck-field ${errors.phone ? "bad" : ""}`}>
          <span>{t("Рақами телефон")}<i>*</i></span>
          <input type="tel" inputMode="tel" autoComplete="tel" className="ck-plain" placeholder="000 000 00 00" maxLength={20} value={phone} onChange={(e) => { setPhone(e.target.value.replace(/[^\d+\s()-]/g, "")); clear("phone"); }} />
          {errors.phone && <em><T>Ин майдонро дуруст пур кунед</T></em>}
        </label>
        <label className={`ck-field ${errors.address ? "bad" : ""}`}>
          <span>{t("Суроғаи пурра")}<i>*</i></span>
          <textarea rows={2} maxLength={200} autoComplete="street-address" placeholder={t("Шаҳр, ноҳия, кӯча, хона")} value={address} onChange={(e) => { setAddress(e.target.value); clear("address"); }} />
          {errors.address && <em><T>Ин майдонро дуруст пур кунед</T></em>}
        </label>
      </section>

      {fail && <p className="rq-fail">{fail}</p>}

      <div className="cart-bar">
        <button className="cb-btn rq-send" onClick={submit} disabled={busy}>
          <Icon name="check" size={20} stroke={2.6} /> {busy ? t("Фиристода мешавад…") : t("Дархост равон кардан")}
        </button>
      </div>
    </>
  );
}
