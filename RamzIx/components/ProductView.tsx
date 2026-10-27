"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, fmt, tiersFor, waLink, type Product } from "@/lib/catalog";
import { CartBadge, useCart } from "./Cart";
import Flag from "./Flag";
import Icon from "./Icon";
import ProductCard from "./ProductCard";
import ProductImage from "./ProductImage";

const CITIES = [
  { name: "Душанбе", extra: 0 },
  { name: "Хуҷанд", extra: 2 },
  { name: "Бохтар", extra: 1 },
  { name: "Кӯлоб", extra: 2 },
  { name: "Истаравшан", extra: 2 },
  { name: "Хоруғ", extra: 4 },
];
const QUICK = [4, 10, 20, 50, 100];

export default function ProductView({ p, related, other }: { p: Product; related: Product[]; other: Product[] }) {
  const router = useRouter();
  const { add } = useCart();
  const tiers = useMemo(() => tiersFor(p.price), [p.price]);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string | null>(p.sizes?.[2] ?? p.sizes?.[0] ?? null);
  const [city, setCity] = useState(0);
  const [tab, setTab] = useState<"desc" | "terms" | "ship">("desc");
  const [more, setMore] = useState(false);
  const [solid, setSolid] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tier = tiers.find((t) => qty >= t.min && qty <= t.max)!;
  const next = tiers[tiers.indexOf(tier) + 1];
  const unit = tier.price;
  const total = unit ? unit * qty : null;
  const saved = unit ? (p.price - unit) * qty : 0;
  const country = COUNTRIES[p.country];
  const points = useMemo(() => splitDescription(p.description), [p.description]);

  const setQ = (v: number) => setQty(Math.min(9999, Math.max(1, Math.round(v) || 1)));
  const goImg = (k: number) => track.current?.scrollTo({ left: k * track.current.clientWidth, behavior: "smooth" });

  const waText = `Салом! Маҳсулот: ${p.name}${size ? `, андоза ${size}` : ""}. Миқдор: ${qty} дона. Нархи оптовиро гуфта метавонед?`;

  const addToCart = () => {
    if (!unit) { window.location.href = waLink(waText); return; }
    add({ slug: p.slug, qty, unit }, `${qty} дона ба сабад илова шуд`);
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: p.name, url: location.href });
      else await navigator.clipboard.writeText(location.href);
    } catch {}
  };

  return (
    <>
      {/* Сарлавҳаи болоӣ */}
      <header className={`pd-top ${solid ? "solid" : ""}`}>
        <button className="ic-round" onClick={() => (history.length > 1 ? router.back() : router.push("/"))} aria-label="Бозгашт">
          <Icon name="back" stroke={2.2} />
        </button>
        <span className="pd-top-title">{p.name}</span>
        <button className="ic-round" onClick={share} aria-label="Фиристодан"><Icon name="share" size={20} /></button>
        <Link href="/#cart" className="ic-round" aria-label="Сабад"><Icon name="cart" size={21} /><CartBadge /></Link>
      </header>

      <main className="pd">
        {/* Галерея */}
        <div className="gallery">
          <div
            className="g-track"
            ref={track}
            onScroll={(e) => setImg(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          >
            {p.images.map((src, k) => (
              <div className="g-slide" key={src}><ProductImage src={src} alt={`${p.name} — ${k + 1}`} eager={k === 0} /></div>
            ))}
          </div>
          <span className="g-count">{img + 1} / {p.images.length}</span>
          <span className="g-badge">Оптовӣ аз 10 дона</span>
        </div>
        <div className="thumbs">
          {p.images.map((src, k) => (
            <button key={src} className={k === img ? "on" : ""} onClick={() => goImg(k)} aria-label={`Сурати ${k + 1}`}>
              <ProductImage src={src} alt="" />
            </button>
          ))}
        </div>

        <div className="pd-body">
          {/* Номи маҳсулот */}
          <div className="pd-badges">
            <span className="pill pill-navy"><Flag code={p.country} className="pill-flag" /> Аз {country.short}</span>
            <span className="pill pill-green"><i className="live" /> Дар анбор</span>
          </div>
          {p.brand && <div className="pd-brand">{p.brand}</div>}
          <h1 className="pd-title">{p.name}</h1>
          {p.subtitle && <p className="pd-sub">{p.subtitle}</p>}
          <div className="pd-rating">
            {p.rating ? (
              <>
                <span className="stars">{[1, 2, 3, 4, 5].map((s) => <Icon key={s} name="star" size={14} className={s <= Math.round(p.rating!) ? "" : "dim"} />)}</span>
                <b>{p.rating}</b><span>({p.reviews} баррасӣ)</span>
              </>
            ) : (
              <span className="pill pill-orange">Маҳсулоти нав</span>
            )}
          </div>

          {/* Нарх */}
          <div className="price-box">
            <div className="pb-main">
              {unit ? <><b>{fmt(unit)}</b><span>смн / дона</span></> : <b className="rfq">Нарх бо дархост</b>}
              {p.listPrice && tier.off === 0 && <s>{fmt(p.listPrice)}</s>}
              {tier.off > 0 && <span className="pill pill-green">−{Math.round(tier.off * 100)}%</span>}
            </div>
            <div className="pb-hint">
              {next?.price
                ? <><Icon name="bolt" size={14} /> Боз {next.min - qty} дона илова кунед: <b>{fmt(next.price)} смн</b> / дона</>
                : next ? <><Icon name="bolt" size={14} /> Аз {next.min} дона нархи махсус</> : "Барои ин миқдор менеҷер нарх медиҳад"}
            </div>
          </div>

          <div className="tiers">
            <div className="tiers-head"><span>Нарх аз рӯи миқдор</span><span>барои 1 дона</span></div>
            {tiers.map((t) => (
              <button key={t.label} className={`tier ${t === tier ? "on" : ""}`} onClick={() => setQ(t.min)}>
                <span className="t-q">{t.label}</span>
                <span className="t-p">{t.price ? `${fmt(t.price)} смн` : "Бо дархост"}</span>
                <span className="t-o">{t.price ? (t.off ? <em>−{Math.round(t.off * 100)}%</em> : "") : <em className="o">RFQ</em>}</span>
              </button>
            ))}
          </div>

          {/* Андоза */}
          {p.sizes && (
            <div className="opt">
              <div className="opt-label">Андоза: <b>{size}</b></div>
              <div className="chips">
                {p.sizes.map((s) => (
                  <button key={s} className={`chip ${s === size ? "on" : ""}`} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Миқдор */}
          <div className="opt">
            <div className="opt-label">Миқдор <span>Ҳадди ақал: 1 дона</span></div>
            <div className="qty-row">
              <div className="qty">
                <button onClick={() => setQ(qty - 1)} aria-label="Кам" disabled={qty <= 1}><Icon name="minus" size={18} stroke={2.4} /></button>
                <input
                  value={qty}
                  inputMode="numeric"
                  aria-label="Миқдор"
                  onChange={(e) => setQ(parseInt(e.target.value.replace(/\D/g, "")))}
                />
                <button onClick={() => setQ(qty + 1)} aria-label="Зиёд"><Icon name="plus" size={18} stroke={2.4} /></button>
              </div>
              <div className="sum">
                <span>Ҳамагӣ</span>
                <b>{total ? `${fmt(total)} смн` : "—"}</b>
                {saved > 0 && <em>Сарфа {fmt(saved)} смн</em>}
              </div>
            </div>
            <div className="quick">
              {QUICK.map((q) => (
                <button key={q} className={qty === q ? "on" : ""} onClick={() => setQ(q)}>{q === 100 ? "100+" : q}</button>
              ))}
            </div>
          </div>

          <a className="rfq-btn" href={waLink(waText)} target="_blank" rel="noreferrer">
            <span className="rfq-ic"><Icon name="doc" size={20} /></span>
            <span><b>Дархости нархи оптовӣ</b><small>Ҷавоби менеҷер то 1 соат</small></span>
            <Icon name="chevron" size={18} stroke={2.2} />
          </a>

          {/* Расонидан */}
          <div className="card-list">
            <label className="cl-row">
              <span className="cl-ic"><Icon name="pin" size={20} /></span>
              <span className="cl-txt">
                <small>Расонидан ба</small>
                <b>{CITIES[city].name}</b>
                <small>Аз анбор: {1 + CITIES[city].extra}–{2 + CITIES[city].extra} рӯз · ройгон аз 3 000 смн</small>
              </span>
              <Icon name="down" size={18} />
              <select value={city} onChange={(e) => setCity(+e.target.value)} aria-label="Шаҳр">
                {CITIES.map((c, k) => <option key={c.name} value={k}>{c.name}</option>)}
              </select>
            </label>
            <div className="cl-row">
              <span className="cl-ic"><Icon name="truck" size={20} /></span>
              <span className="cl-txt"><b>Фармоиш аз {country.short}</b><small>Агар дар анбор набошад: {country.days}, гумрук аз мо</small></span>
            </div>
            <div className="cl-row">
              <span className="cl-ic"><Icon name="card" size={20} /></span>
              <span className="cl-txt"><b>Пардохт</b><small>Алиф, DC, корт, интиқоли бонкӣ, нақд</small></span>
            </div>
            <div className="cl-row">
              <span className="cl-ic"><Icon name="return" size={20} /></span>
              <span className="cl-txt"><b>Бозгашт 14 рӯз</b><small>Маҳсулоти нуқсондор ройгон иваз мешавад</small></span>
            </div>
          </div>

          {/* Табҳо */}
          <div className="tabs" role="tablist">
            {([["desc", "Тавсиф"], ["terms", "Шартҳои оптовӣ"], ["ship", "Расонидан"]] as const).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          {tab === "desc" && (
            <div className="pane">
              {points.length > 0 && (
                <div className={`desc ${more ? "open" : ""}`}>
                  {points.map((pt, k) => (
                    <p key={k}>{pt.head && <b>{pt.head}. </b>}{pt.text}</p>
                  ))}
                  {!more && points.length > 2 && <button className="more" onClick={() => setMore(true)}>Бештар хондан <Icon name="down" size={14} /></button>}
                </div>
              )}
              <table className="spec">
                <tbody>
                  {p.brand && <tr><td>Бренд</td><td>{p.brand}</td></tr>}
                  <tr><td>Таъминот аз</td><td>{country.name}</td></tr>
                  <tr><td>Вазн (бо қуттӣ)</td><td>{p.weightKg} кг</td></tr>
                  {p.sizes && <tr><td>Андозаҳо</td><td>{p.sizes.join(", ")}</td></tr>}
                  <tr><td>Кафолат</td><td>{p.category === "audio" ? "12 моҳ" : "Ивази нуқсон 14 рӯз"}</td></tr>
                  <tr><td>Артикул</td><td>{p.slug.toUpperCase().slice(0, 18)}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {tab === "terms" && (
            <div className="pane terms">
              <div><Icon name="box" size={20} /><span><b>Ҳадди ақал</b>Чакана аз 1 дона, нархи оптовӣ аз 10 дона</span></div>
              <div><Icon name="doc" size={20} /><span><b>Фактура ва ҳуҷҷат</b>Барои ҳисоби бизнес: фактура, шартнома, ҳуҷҷатҳои гумрукӣ</span></div>
              <div><Icon name="card" size={20} /><span><b>Пардохт бо мӯҳлат</b>Барои мизоҷони доимӣ: 30% пешпардохт, боқимонда то 14 рӯз</span></div>
              <div><Icon name="tag" size={20} /><span><b>Нархи махсус</b>Аз 100 дона ё омехтаи моделҳо: ҷавоб то 2 соат</span></div>
            </div>
          )}

          {tab === "ship" && (
            <div className="pane">
              <table className="spec">
                <tbody>
                  <tr><td>Душанбе</td><td>1–2 рӯз · 25 смн</td></tr>
                  <tr><td>Хуҷанд, Бохтар, Кӯлоб</td><td>2–4 рӯз · 45 смн</td></tr>
                  <tr><td>Дигар шаҳру ноҳияҳо</td><td>3–6 рӯз · аз 60 смн</td></tr>
                  <tr><td>Худ гирифтан</td><td>Анбори Душанбе · ройгон</td></tr>
                  <tr><td>Аз {country.short}</td><td>{country.days}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Фурӯшанда */}
          <div className="seller">
            <span className="seller-av">{(p.brand ?? "R").slice(0, 2).toUpperCase()}</span>
            <span className="seller-txt">
              <b>{p.brand ?? "RamzIx"} · {country.short}</b>
              <small><Icon name="shield" size={13} /> Санҷидашуда · Ҷавоб &lt; 1 соат</small>
            </span>
            <a href={waLink(waText)} className="seller-btn">Пурсиш</a>
          </div>
        </div>

        {related.length > 0 && (
          <section className="block">
            <div className="sec-head"><h2>Маҳсулоти монанд</h2></div>
            <div className="hscroll">{related.map((x) => <ProductCard key={x.slug} p={x} compact />)}</div>
          </section>
        )}
        {other.length > 0 && (
          <section className="block">
            <div className="sec-head"><h2>Шояд ба шумо писанд ояд</h2></div>
            <div className="grid2">{other.map((x) => <ProductCard key={x.slug} p={x} />)}</div>
          </section>
        )}
      </main>

      {/* Тугмаҳои поён */}
      <div className="buy-bar">
        <a href={waLink(waText)} className="bb-wa" aria-label="WhatsApp" target="_blank" rel="noreferrer"><Icon name="wa" size={24} /></a>
        <button className="bb-add" onClick={addToCart}>
          <span className="bb-l"><Icon name="cart" size={20} /> {unit ? "Ба сабад" : "Дархости нарх"}</span>
          <span className="bb-r">{total ? `${fmt(total)} смн` : `${qty} дона`}</span>
        </button>
      </div>
    </>
  );
}

/* Тавсифи таъминкунандаро ба бандҳо ҷудо мекунад: "Сарлавҳа: матн. Сарлавҳа: матн." */
function splitDescription(text: string | null) {
  if (!text) return [];
  return text
    .split(/(?<=[.!])\s+(?=[A-Z][^.:!]{2,60}:\s)/)
    .map((part) => {
      const m = part.match(/^([^:]{2,60}):\s+([\s\S]*)$/);
      return m ? { head: m[1].trim(), text: m[2].trim() } : { head: null, text: part.trim() };
    })
    .filter((x) => x.text);
}
