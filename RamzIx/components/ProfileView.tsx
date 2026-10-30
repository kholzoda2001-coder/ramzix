"use client";

import Link from "next/link";
import { useState } from "react";
import { waLink } from "@/lib/catalog";
import { CONTACT } from "@/lib/pricing-config";
import { useCatalog } from "@/lib/useCatalog";
import { CURRENCIES } from "@/lib/currency";
import { LANGS } from "@/lib/i18n";
import { clearProfile, saveProfile, useProfile, type Order, type Profile } from "@/lib/profile";
import { useCart } from "./Cart";
import { useMoney } from "./Currency";
import Icon from "./Icon";
import ContactFields from "./ContactFields";
import { joinPhone, splitPhone } from "@/lib/phone";
import { T, useT } from "./Lang";


export default function ProfileView() {
  const { t, lang, setLang } = useT();
  const { getProduct } = useCatalog();
  const { cur, setCur, sum, label } = useMoney();
  const { profile, orders, ready } = useProfile();
  const { lines, add } = useCart();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile>(profile);
  const [local, setLocal] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const filled = Object.values(profile).some(Boolean);
  const initials = (profile.name || profile.shop || "").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const spent = orders.reduce((a, o) => a + o.totalTjs, 0);

  const startEdit = () => { setDraft(profile); setLocal(splitPhone(profile.phone, profile.country).local); setEditing(true); };
  const save = () => { saveProfile({ ...draft, phone: joinPhone(draft.country, local) }); setEditing(false); };

  const repeat = (o: Order) => {
    const ok = o.lines.filter((l) => getProduct(l.slug));
    ok.forEach((l, i) => add(l, i === ok.length - 1 ? t("Фармоиш ба сабад илова шуд") : ""));
  };

  return (
    <>
      <section className="pf-hero">
        <span className="pf-avatar">{initials || <Icon name="user" size={30} stroke={1.8} />}</span>
        <div className="pf-who">
          <b>{ready && profile.name ? profile.name : t("Меҳмон")}</b>
          <span>{profile.phone || profile.shop || t("Маълумоти худро илова кунед")}</span>
        </div>
        {!editing && <button className="pf-edit" onClick={startEdit}>{filled ? t("Таҳрир") : t("Пур кардан")}</button>}
      </section>

      <div className="pf-stats">
        <div><b>{orders.length}</b><span><T>Фармоишҳо</T></span></div>
        <Link href="/cart"><b>{lines.length}</b><span><T>Дар сабад</T></span></Link>
        <div><b>{sum(spent)}</b><span><T>Маблағ</T>, {label}</span></div>
      </div>

      {editing && (
        <section className="pf-card pf-form">
          <h2><T>Маълумоти ман</T></h2>
          <label className="ck-field">
            <span>{t("Ном ва насаб")}</span>
            <input value={draft.name} maxLength={120} autoComplete="name" onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </label>
          <label className="ck-field">
            <span>{t("Номи мағоза / ширкат")}</span>
            <input value={draft.shop} maxLength={120} onChange={(e) => setDraft({ ...draft, shop: e.target.value })} />
          </label>
          <ContactFields
            value={{ country: draft.country, local, address: draft.address }}
            onChange={(v) => { setDraft({ ...draft, country: v.country, address: v.address }); setLocal(v.local); }}
          />
          <div className="pf-actions">
            <button className="btn btn-orange" onClick={save}><T>Нигоҳ доштан</T></button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}><T>Бекор кардан</T></button>
          </div>
        </section>
      )}

      {!editing && filled && (
        <section className="pf-card pf-info">
          {profile.shop && <div><Icon name="store" size={18} /><span>{profile.shop}</span></div>}
          {profile.phone && <div><Icon name="phone" size={18} /><span>{profile.phone}</span></div>}
          {profile.address && <div><Icon name="pin" size={18} /><span>{t(profile.country === "ae" ? "Иморот" : "Тоҷикистон")}, {profile.address}</span></div>}
        </section>
      )}

      <section className="pf-card">
        <h2><T>Фармоишҳои ман</T></h2>
        {orders.length === 0 ? (
          <div className="pf-empty">
            <Icon name="doc" size={30} stroke={1.5} />
            <b><T>Ҳоло фармоиш нест</T></b>
            <span><T>Баъди фиристодани фармоиш аз сабад, ин ҷо пайдо мешавад</T></span>
            <Link href="/catalog" className="btn btn-orange btn-sm"><T>Ба каталог</T></Link>
          </div>
        ) : (
          <div className="pf-orders">
            {orders.map((o, i) => (
              <div className="pf-order" key={o.id}>
                <div className="po-top">
                  <b><T vars={{ n: orders.length - i }}>{"Фармоиш № {n}"}</T></b>
                  <span className="po-chip"><T>Фиристода шуд</T></span>
                </div>
                <div className="po-meta">
                  {new Date(o.date).toLocaleDateString(lang === "tg" ? "ru-RU" : lang === "ru" ? "ru-RU" : "en-GB")} · {t("{n} маҳсулот", { n: o.count })}
                </div>
                <div className="po-bottom">
                  <b>{sum(o.totalTjs)} {label}</b>
                  <button onClick={() => repeat(o)}><T>Такрор кардан</T></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="pf-card">
        <h2><T>Танзимот</T></h2>
        <div className="pf-row"><span><Icon name="globe" size={18} /><T>Забон</T></span></div>
        <div className="pf-seg">
          {LANGS.map((l) => <button key={l.id} className={l.id === lang ? "on" : ""} onClick={() => setLang(l.id)}>{l.name}</button>)}
        </div>
        <div className="pf-row"><span><Icon name="card" size={18} /><T>Асъор</T></span></div>
        <div className="pf-seg">
          {CURRENCIES.map((c) => <button key={c.id} className={c.id === cur ? "on" : ""} onClick={() => setCur(c.id)}>{c.label}</button>)}
        </div>
      </section>

      <section className="pf-card pf-links">
        <a href={waLink(t("Салом! Савол дорам."))} target="_blank" rel="noreferrer">
          <span className="pl-ic wa"><Icon name="wa" size={20} /></span>
          <span><b><T>Менеҷер дар WhatsApp</T></b><small>+{CONTACT.whatsapp}</small></span>
          <Icon name="chevron" size={16} stroke={2.4} />
        </a>
        <Link href="/cart">
          <span className="pl-ic"><Icon name="cart" size={20} /></span>
          <span><b><T>Сабад</T></b><small><T vars={{ n: lines.length }}>{"{n} маҳсулот"}</T></small></span>
          <Icon name="chevron" size={16} stroke={2.4} />
        </Link>
        <Link href="/brands">
          <span className="pl-ic"><Icon name="tag" size={20} /></span>
          <span><b><T>Брендҳо</T></b></span>
          <Icon name="chevron" size={16} stroke={2.4} />
        </Link>
      </section>

      <p className="pf-note"><Icon name="shield" size={14} /> <T>Маълумот танҳо дар ин дастгоҳ нигоҳ дошта мешавад. Баъди пайвастани сервер ҳисоби шумо дар ҳамаи дастгоҳҳо кор мекунад.</T></p>

      {(filled || orders.length > 0) && (
        confirmClear ? (
          <div className="pf-confirm">
            <span><T>Профил ва таърихи фармоишҳо нест мешавад. Идома медиҳед?</T></span>
            <button className="btn btn-sm btn-orange" onClick={() => { clearProfile(); setConfirmClear(false); setEditing(false); }}><T>Ҳа, нест кардан</T></button>
            <button className="btn btn-sm btn-ghost" onClick={() => setConfirmClear(false)}><T>Не</T></button>
          </div>
        ) : (
          <button className="pf-clear" onClick={() => setConfirmClear(true)}><T>Тоза кардани маълумоти ман</T></button>
        )
      )}
    </>
  );
}
