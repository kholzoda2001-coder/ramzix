"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fmtQty, getProduct, unitOf, waLink } from "@/lib/catalog";
import { buildOrderMessage, type Buyer } from "@/lib/orderMessage";
import { priceOrder } from "@/lib/pricing";
import { addOrder, orderCode, saveProfile, useProfile } from "@/lib/profile";
import { useCart } from "./Cart";
import { useMoney } from "./Currency";
import Icon from "./Icon";
import { T, useT } from "./Lang";
import ProductImage from "./ProductImage";
import ContactFields from "./ContactFields";
import { joinPhone, phoneValid, splitPhone, type ShipCountry } from "@/lib/phone";

const CONTACTS = ["WhatsApp", "Занг"] as const;
type Errors = Partial<Record<"name" | "phone" | "address", boolean>>;
type Done = { code: string; link: string };

export default function CheckoutView() {
  const { t } = useT();
  const { price, sum, label } = useMoney();
  const { profile, ready: profileReady } = useProfile();
  const { lines, modes, ready, clear } = useCart();
  const order = useMemo(() => priceOrder(lines, modes, getProduct), [lines, modes]);

  const [form, setForm] = useState<Buyer>({ name: "", phone: "", shop: "", country: "tj", address: "", comment: "", contact: "WhatsApp" });
  const [local, setLocal] = useState("");
  const [filledFromProfile, setFilled] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<Done | null>(null);

  // Маълумоти профилро як бор ба шакл меорем
  useEffect(() => {
    if (!profileReady || filledFromProfile) return;
    const ph = splitPhone(profile.phone, profile.country);
    setForm((f) => ({ ...f, name: profile.name, shop: profile.shop, country: ph.country, address: profile.address }));
    setLocal(ph.local);
    setFilled(true);
  }, [profileReady, filledFromProfile, profile]);

  const set = (k: keyof Buyer, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: false }));
  };

  const submit = () => {
    const err: Errors = { name: form.name.trim().length < 2, phone: !phoneValid(form.country, local), address: form.address.trim().length < 5 };
    setErrors(err);
    if (err.name || err.phone || err.address) {
      document.querySelector(".ck-field.bad")?.scrollIntoView({ block: "center" });
      return;
    }
    const buyer: Buyer = { ...form, name: form.name.trim(), phone: joinPhone(form.country, local), shop: form.shop.trim(), address: form.address.trim(), comment: form.comment.trim() };
    const id = addOrder({ count: lines.length, totalTjs: order.total, lines: lines.map(({ slug, qty, size, color }) => ({ slug, qty, size, color })) });
    const code = orderCode(id);
    const link = waLink(buildOrderMessage(order, buyer, code, { t, price, sum, label }));
    saveProfile({ name: buyer.name, phone: buyer.phone, shop: buyer.shop, country: buyer.country, address: buyer.address });
    clear();
    setDone({ code, link });
    window.scrollTo(0, 0);
    if (!window.open(link, "_blank")) window.location.href = link;
  };

  if (done) {
    return (
      <div className="ck-done">
        <span className="ck-done-ic"><Icon name="check" size={34} stroke={2.6} /></span>
        <h2><T>Дархост қабул шуд</T></h2>
        <div className="ck-code">{done.code}</div>
        <p><T>Менеҷер бо шумо тамос мегирад, фармоишро тасдиқ мекунад ва тарзи пардохтро мегӯяд. Баъди пардохт маҳсулот равон карда мешавад.</T></p>
        <p className="ck-hint"><T>Агар WhatsApp кушода нашуд ё паём фиристода нашуд, тугмаи поёнро пахш кунед ва паёмро фиристед.</T></p>
        <a className="btn btn-orange" href={done.link} target="_blank" rel="noreferrer"><Icon name="wa" size={18} /> <T>Паёмро дар WhatsApp фиристодан</T></a>
        <Link className="btn btn-ghost" href="/profile"><T>Фармоишҳои ман</T></Link>
        <Link className="ck-home" href="/"><T>Ба саҳифаи асосӣ</T></Link>
      </div>
    );
  }

  if (!ready) return <div className="cart-empty" />;

  if (order.groups.length === 0) {
    return (
      <div className="cart-empty">
        <span className="cart-empty-ic"><Icon name="cart" size={34} stroke={1.5} /></span>
        <b><T>Сабад холӣ аст</T></b>
        <span><T>Маҳсулотро интихоб кунед ва ба сабад илова намоед</T></span>
        <Link href="/catalog" className="btn btn-orange" style={{ marginTop: 14 }}><T>Ба каталог</T></Link>
      </div>
    );
  }

  const field = (k: "name" | "shop", labelKey: string, opts: { req?: boolean; type?: string; mode?: "tel"; auto?: string } = {}) => (
    <label className={`ck-field ${errors[k as keyof Errors] ? "bad" : ""}`}>
      <span>{t(labelKey)}{opts.req && <i>*</i>}</span>
      <input type={opts.type ?? "text"} inputMode={opts.mode} autoComplete={opts.auto} maxLength={120} value={form[k]} onChange={(e) => set(k, e.target.value)} />
      {errors[k as keyof Errors] && <em><T>Ин майдонро дуруст пур кунед</T></em>}
    </label>
  );

  return (
    <>
      <section className="ck-card">
        <h2><span className="ck-n">1</span><T>Маълумоти шумо</T></h2>
        {field("name", "Ном ва насаб", { req: true, auto: "name" })}
        {field("shop", "Номи мағоза / ширкат")}
      </section>

      <section className="ck-card">
        <h2><span className="ck-n">2</span><T>Расонидан</T></h2>
        <ContactFields
          required
          value={{ country: form.country as ShipCountry, local, address: form.address }}
          errors={errors}
          onChange={(v) => {
            setForm((f) => ({ ...f, country: v.country, address: v.address }));
            setLocal(v.local);
            setErrors((e) => ({ ...e, phone: false, address: false }));
          }}
        />
        <label className="ck-field">
          <span><T>Эзоҳ барои менеҷер</T></span>
          <textarea rows={3} maxLength={400} value={form.comment} onChange={(e) => set("comment", e.target.value)} />
        </label>
      </section>

      <section className="ck-card">
        <h2><span className="ck-n">3</span><T>Тарзи тамос</T></h2>
        <div className="ck-seg">
          {CONTACTS.map((c) => (
            <button key={c} className={form.contact === c ? "on" : ""} onClick={() => set("contact", c)}>
              {c === "WhatsApp" && <Icon name="wa" size={16} />}{c === "Занг" && <Icon name="phone" size={16} />} {t(c)}
            </button>
          ))}
        </div>
        <p className="ck-note"><Icon name="shield" size={14} /> <T>Пардохт онлайн нест: менеҷер бо шумо тамос мегирад, фармоишро тасдиқ мекунад ва тарзи пардохтро (Алиф, DC, бонк, нақд) мегӯяд. Баъди пардохт маҳсулот равон карда мешавад.</T></p>
      </section>

      <section className="ck-card">
        <h2><span className="ck-n">4</span><T>Фармоиши шумо</T></h2>
        <div className="ck-lines">
          {order.groups.flatMap((g) => g.lines).map((l) => (
            <div className="ck-line" key={l.key}>
              <span className="ck-img"><ProductImage src={l.p.images[0]} alt={t(l.p.name)} /></span>
              <span className="ck-info">
                <b>{t(l.p.name)}</b>
                <small>
                  {[l.color && t(l.color), l.size].filter(Boolean).join(" · ")}
                  {(l.color || l.size) && " · "}{fmtQty(l.qty)} {t(unitOf(l.p))} × {price(l.unit)} {label}
                </small>
              </span>
              <b className="ck-sum">{sum(l.goods)}</b>
            </div>
          ))}
        </div>
        <div className="est-row"><span><T>Нархи мол</T></span><b>{sum(order.listGoods)} {label}</b></div>
        {order.discount > 0 && <div className="est-row disc"><span><T>Тахфиф</T><small>−{order.discountPct}%</small></span><b>−{sum(order.discount)} {label}</b></div>}
        <div className="est-row"><span><T>Расонидан</T></span><b>{order.shipping > 0 ? `${sum(order.shipping)} ${label}` : t("бо тасдиқ")}</b></div>
        <div className="est-total"><span><T>Ҷамъ</T></span><b>{sum(order.total)} {label}</b></div>
      </section>

      <div className="cart-bar">
        <div className="cb-total"><small><T>Ҷамъ</T></small><b>{sum(order.total)} {label}</b></div>
        <button className="cb-btn" onClick={submit}><Icon name="check" size={20} stroke={2.6} /> <T>Дархост фиристодан</T></button>
      </div>
    </>
  );
}
