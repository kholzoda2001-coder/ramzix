"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, fmt, fmtPrice, fmtQty, unitOf, waLink, type Product } from "@/lib/catalog";
import { defaultMode, listUnitPrice, modesFor, rfqFromOf, shippingCost, volumeOf, weightOf, wholesalePrices } from "@/lib/pricing";
import { QUOTE_VALID_HOURS, SHIPPING } from "@/lib/pricing-config";
import { CartBadge, useCart } from "./Cart";
import Icon from "./Icon";
import ProductCard from "./ProductCard";
import ProductImage from "./ProductImage";

const QUICK = [4, 10, 20, 50, 100];
const round2 = (n: number) => Math.round(n * 100) / 100;

export default function ProductView({ p, related, other }: { p: Product; related: Product[]; other: Product[] }) {
  const router = useRouter();
  const { add, modes, ready, setMode } = useCart();
  const sale = p.sale;
  const unit = unitOf(p);
  const step = sale?.step ?? 1;
  const minQty = sale?.min ?? 1;
  const [qty, setQty] = useState(minQty);
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string | null>(p.sizes?.[2] ?? p.sizes?.[0] ?? null);
  const [modeId, setModeId] = useState(defaultMode(p.country));
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

  // Намуди расонидан, ки пештар дар сабад интихоб шудааст
  useEffect(() => {
    const saved = modes[p.country];
    if (ready && saved) setModeId(saved);
  }, [ready, modes, p.country]);

  const unitPrice = listUnitPrice(p);
  const wholesale = wholesalePrices(p);
  const whLow = Math.min(...wholesale.map((w) => w.unit));
  const whHigh = Math.max(...wholesale.map((w) => w.unit));
  const goods = unitPrice * qty;
  const pieces = sale?.per ? qty * sale.per : null;
  const weight = round2(weightOf(p, qty));
  const ship = shippingCost(p.country, modeId, weight, volumeOf(p, qty));
  const shipPerUnit = ship.tjs / qty;
  const total = goods + ship.tjs;
  const bigOrder = qty >= rfqFromOf(p);
  const country = COUNTRIES[p.country];
  const modeList = modesFor(p.country);
  const points = useMemo(() => splitDescription(p.description), [p.description]);

  const setQ = (v: number) => setQty(Math.min(99999, Math.max(minQty, round2(Math.round((v || minQty) / step) * step))));
  const goImg = (k: number) => track.current?.scrollTo({ left: k * track.current.clientWidth, behavior: "smooth" });

  const waText = `Салом! Маҳсулот: ${p.name}${size ? `, андоза ${size}` : ""}. Миқдор: ${fmtQty(qty)} ${unit}${pieces ? ` (${pieces} ${sale?.perLabel})` : ""}. Нархи оптовиро гуфта метавонед?`;
  const wholesaleLink = waLink(waText);

  const addToCart = () => {
    setMode(p.country, modeId);
    add({ slug: p.slug, qty }, `${fmtQty(qty)} ${unit} ба сабад илова шуд`);
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
        <Link href="/cart" className="ic-round" aria-label="Сабад"><Icon name="cart" size={21} /><CartBadge /></Link>
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
          <span className="g-badge">{sale ? `Фурӯш бо ${unit}` : "Нархи миқдорӣ"}</span>
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
            <div className="pb-label">Нархи асосӣ</div>
            <div className="pb-main">
              <b>{fmtPrice(unitPrice)}</b><span>смн / {unit}</span>
            </div>
            <div className="pb-note">
              Барои як {unit}{ship.tjs > 0 && <> · расонидан: <b>{fmtPrice(shipPerUnit)} смн</b> / {unit}</>}
            </div>

            <div className="wh-range">
              <span className="wh-tag"><Icon name="tag" size={14} /> Оптом</span>
              <span className="wh-val"><b>{fmtPrice(whLow)}–{fmtPrice(whHigh)}</b> смн / {unit}</span>
            </div>
            <p className="wh-sub">
              Аз {fmt(wholesale[0].from)} то {fmt(wholesale[wholesale.length - 1].from)}+ смн фармоиш. Нарх дар сабад худкор арзон мешавад.
            </p>

            <a className="wa-cta" href={wholesaleLink} target="_blank" rel="noreferrer">
              <span className="wa-ic"><Icon name="wa" size={24} /></span>
              <span className="wa-txt"><b>Дар WhatsApp пурсед</b><small>Барои миқдори калон нархи махсус</small></span>
              <Icon name="chevron" size={18} stroke={2.4} />
            </a>
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
            <div className="opt-label">Миқдор <span>Ҳадди ақал: {fmtQty(minQty)} {unit}</span></div>
            {sale && (
              <div className="pack-info">
                {sale.per && <span>📦 1 {unit} = <b>{sale.per} {sale.perLabel}</b></span>}
                {!sale.per && <span>⚖️ Қадам: <b>{fmtQty(step)} {unit}</b></span>}
                {sale.note && <span>ℹ️ {sale.note}</span>}
              </div>
            )}
            <div className="qty-row">
              <div className="qty">
                <button onClick={() => setQ(qty - step)} aria-label="Кам" disabled={qty <= minQty}><Icon name="minus" size={18} stroke={2.4} /></button>
                <input
                  value={qty}
                  aria-label="Миқдор"
                  inputMode={sale?.decimals ? "decimal" : "numeric"}
                  onChange={(e) => setQty(parseFloat(e.target.value.replace(",", ".").replace(/[^\d.]/g, "")) || minQty)}
                  onBlur={() => setQ(qty)}
                />
                <button onClick={() => setQ(qty + step)} aria-label="Зиёд"><Icon name="plus" size={18} stroke={2.4} /></button>
                <span className="unit-badge">{unit}</span>
              </div>
              <div className="sum">
                <span>Нархи мол</span>
                <b>{fmt(goods)} смн</b>
              </div>
            </div>
            <div className="quick">
              {(sale?.quick ?? QUICK).map((q) => (
                <button key={q} className={qty === q ? "on" : ""} onClick={() => setQ(q)}>{!sale && q === 100 ? "100+" : fmtQty(q)}</button>
              ))}
            </div>
            {(pieces || sale) && (
              <div className="pack-info">
                {pieces && <span>Ҳамагӣ: <b>{fmt(pieces)} {sale?.perLabel}</b></span>}
                <span>Вазн: <b>{fmtQty(weight)} кг</b></span>
                {pieces && <span>1 {sale?.perLabel}: <b>{fmtPrice(unitPrice / sale!.per!)} смн</b></span>}
              </div>
            )}
          </div>

          {bigOrder && (
            <div className="big-note">Миқдори калон: нархи оптовиро дархост кунед, менеҷер нархи беҳтарро мегӯяд.</div>
          )}

          {/* Расонидан */}
          <div className="est">
            <div className="est-head"><b>Расонидан аз {country.short}</b><span>барои {fmtQty(qty)} {unit}</span></div>
            {modeList.length > 1 && (
              <div className="modes">
                {modeList.map((m) => (
                  <button key={m.id} className={m.id === ship.mode.id ? "on" : ""} onClick={() => setModeId(m.id)}>
                    <b>{m.label}</b>
                    <small>{m.daysMin}–{m.daysMax} рӯз</small>
                  </button>
                ))}
              </div>
            )}
            <div className="est-row"><span>Нархи мол</span><b>{fmt(goods)} смн</b></div>
            <div className="est-row">
              <span>
                Расонидан · вазн {fmtQty(weight)} кг
                <small>{ship.mode.label}, {ship.mode.daysMin}–{ship.mode.daysMax} рӯз{ship.basis === "m3" ? ", аз рӯи ҳаҷм" : ""}</small>
              </span>
              <b>{ship.tjs > 0 ? `${fmt(ship.tjs)} смн` : "бо тасдиқ"}</b>
            </div>
            <div className="est-total"><span>Ҷамъ</span><b>{fmt(total)} смн</b></div>
            <p className="est-note">
              Дар сабад бо харид зиёд нархи мол арзонтар мешавад.
              {ship.mode.assumed && " Нархи расонидан ҳанӯз тасдиқ нашудааст."} Нарх {QUOTE_VALID_HOURS} соат дуруст аст.
            </p>
          </div>

          <div className="card-list">
            <div className="cl-row">
              <span className="cl-ic"><Icon name="truck" size={20} /></span>
              <span className="cl-txt"><b>Фармоиш аз {country.short}</b><small>{ship.mode.daysMin}–{ship.mode.daysMax} рӯз, гумрук аз мо</small></span>
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
                  {sale ? (
                    <>
                      <tr><td>Воҳиди фурӯш</td><td>{sale.per ? `${sale.unit} (${sale.per} ${sale.perLabel})` : sale.unit}</td></tr>
                      <tr><td>Вазни 1 {sale.unit}</td><td>{fmtQty(p.weightKg)} кг</td></tr>
                      {sale.shelfLife && <tr><td>Мӯҳлати истифода</td><td>{sale.shelfLife}</td></tr>}
                      {sale.storage && <tr><td>Нигоҳдорӣ</td><td>{sale.storage}</td></tr>}
                    </>
                  ) : (
                    <tr><td>Вазн (бо қуттӣ)</td><td>{p.weightKg} кг</td></tr>
                  )}
                  {p.sizes && <tr><td>Андозаҳо</td><td>{p.sizes.join(", ")}</td></tr>}
                  <tr><td>Кафолат</td><td>{sale ? "Бо сана ва сертификат" : p.category === "audio" ? "12 моҳ" : "Ивази нуқсон 14 рӯз"}</td></tr>
                  <tr><td>Артикул</td><td>{p.slug.toUpperCase().slice(0, 18)}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {tab === "terms" && (
            <div className="pane terms">
              <div><Icon name="box" size={20} /><span><b>Ҳадди ақал</b>{sale ? `Аз ${fmtQty(minQty)} ${unit}. Нарх бо ${unit} ҳисоб мешавад` : "Чакана аз 1 дона, нархи оптовӣ аз 10 дона"}</span></div>
              <div><Icon name="doc" size={20} /><span><b>Фактура ва ҳуҷҷат</b>Барои ҳисоби бизнес: фактура, шартнома, ҳуҷҷатҳои гумрукӣ</span></div>
              <div><Icon name="card" size={20} /><span><b>Пардохт бо мӯҳлат</b>Барои мизоҷони доимӣ: 30% пешпардохт, боқимонда то 14 рӯз</span></div>
              <div><Icon name="tag" size={20} /><span><b>Нархи оптовӣ</b>Барои миқдори калон нархи махсус: дар WhatsApp пурсед, ҷавоб то 2 соат</span></div>
            </div>
          )}

          {tab === "ship" && (
            <div className="pane">
              <table className="spec">
                <tbody>
                  {SHIPPING[p.country].map((m) => (
                    <tr key={m.id}>
                      <td>{m.label}</td>
                      <td>
                        {m.daysMin}–{m.daysMax} рӯз
                        {m.perKgUsd > 0 && <> · ${m.perKgUsd}/кг{m.perM3Usd ? ` ё $${m.perM3Usd}/м³` : ""}</>}
                        {m.assumed && " (тахминӣ)"}
                      </td>
                    </tr>
                  ))}
                  <tr><td>Худ гирифтан</td><td>Анбори Душанбе</td></tr>
                </tbody>
              </table>
              <p className="est-note" style={{ marginTop: 10 }}>Расонидан аз рӯи вазн ҳисоб мешавад ва аз ҷониби харидор пардохта мешавад. Нарх дар сабад нишон дода мешавад.</p>
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
          <span className="bb-l"><Icon name="cart" size={20} /> Ба сабад</span>
          <span className="bb-r">{fmt(goods)} смн</span>
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
