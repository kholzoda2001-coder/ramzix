"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, fmt, fmtPrice, fmtQty, unitOf, waLink, type Product } from "@/lib/catalog";
import { defaultMode, feeFor, feePctFor, modesFor, priceTiers, shippingCost, unitCost, volumeOf, weightOf } from "@/lib/pricing";
import { FEE_TIERS, MIN_FEE, QUOTE_VALID_HOURS, SHIPPING } from "@/lib/pricing-config";
import { CartBadge, useCart } from "./Cart";
import Flag from "./Flag";
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
  const tiers = useMemo(() => priceTiers(p), [p]);
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

  const tier = tiers.find((t) => qty >= t.min && qty <= t.max) ?? tiers[tiers.length - 1];
  const next = tiers[tiers.indexOf(tier) + 1];
  const rfq = tier.unit === null;
  const unitPrice = rfq ? null : unitCost(p, qty);
  const goods = unitPrice ? unitPrice * qty : 0;
  const pieces = sale?.per ? qty * sale.per : null;
  const weight = round2(weightOf(p, qty));
  const feePct = feePctFor(goods);
  const fee = feeFor(goods);
  const ship = shippingCost(p.country, modeId, weight, volumeOf(p, qty));
  const estTotal = goods + fee + ship.tjs;
  const country = COUNTRIES[p.country];
  const modeList = modesFor(p.country);
  const points = useMemo(() => splitDescription(p.description), [p.description]);

  const setQ = (v: number) => setQty(Math.min(99999, Math.max(minQty, round2(Math.round((v || minQty) / step) * step))));
  const goImg = (k: number) => track.current?.scrollTo({ left: k * track.current.clientWidth, behavior: "smooth" });

  const waText = `Салом! Маҳсулот: ${p.name}${size ? `, андоза ${size}` : ""}. Миқдор: ${fmtQty(qty)} ${unit}${pieces ? ` (${pieces} ${sale?.perLabel})` : ""}. Нархи оптовиро гуфта метавонед?`;

  const addToCart = () => {
    if (rfq) { window.location.href = waLink(waText); return; }
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
              {unitPrice ? <><b>{fmtPrice(unitPrice)}</b><span>смн / {unit}</span></> : <b className="rfq">Нарх бо дархост</b>}
              {tier.off > 0 && <span className="pill pill-green">−{tier.off}%</span>}
            </div>
            <div className="pb-hint">
              {next?.unit
                ? <><Icon name="bolt" size={14} /> Боз {fmtQty(round2(next.min - qty))} {unit} илова кунед: <b>{fmtPrice(next.unit)} смн</b> / {unit}</>
                : next ? <><Icon name="bolt" size={14} /> Аз {fmtQty(next.min)} {unit} нархи махсус</> : "Барои ин миқдор менеҷер нарх медиҳад"}
            </div>
            <div className="pb-note">Нархи мол. Ҳаққи хизмат ва расонидан ҷудо ҳисоб мешаванд.</div>
          </div>

          <div className="tiers">
            <div className="tiers-head"><span>Нархи мол аз рӯи миқдор</span><span>барои 1 {unit}</span></div>
            {tiers.map((t) => (
              <button key={t.label} className={`tier ${t === tier ? "on" : ""}`} onClick={() => setQ(t.min)}>
                <span className="t-q">{t.label}</span>
                <span className="t-p">{t.unit !== null ? `${fmtPrice(t.unit)} смн` : "Бо дархост"}</span>
                <span className="t-o">{t.unit !== null ? (t.off ? <em>−{t.off}%</em> : "") : <em className="o">RFQ</em>}</span>
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
                <b>{goods ? `${fmt(goods)} смн` : "—"}</b>
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
                {unitPrice && pieces && <span>1 {sale?.perLabel}: <b>{fmtPrice(unitPrice / sale!.per!)} смн</b></span>}
              </div>
            )}
          </div>

          {/* Ҳисоби тахминӣ */}
          {goods > 0 && (
            <div className="est">
              <div className="est-head"><b>Ҳисоби тахминӣ</b><span>барои {fmtQty(qty)} {unit}</span></div>
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
                <span>Ҳаққи хизмат ({feePct}%){fee > (goods * feePct) / 100 && <small>Ҳадди ақал {MIN_FEE} смн барои фармоиш</small>}</span>
                <b>{fmt(fee)} смн</b>
              </div>
              <div className="est-row">
                <span>
                  Расонидан · {fmtQty(weight)} кг
                  <small>{ship.mode.label}, {ship.mode.daysMin}–{ship.mode.daysMax} рӯз{ship.basis === "m3" ? ", аз рӯи ҳаҷм" : ""}</small>
                </span>
                <b>{ship.tjs > 0 ? `${fmt(ship.tjs)} смн` : "бо тасдиқ"}</b>
              </div>
              <div className="est-total"><span>Ҷамъ (тахминӣ)</span><b>{fmt(estTotal)} смн</b></div>
              <p className="est-note">
                Ҳаққи хизмат ҳангоми зиёд шудани маблағи сабад кам мешавад (то {FEE_TIERS[FEE_TIERS.length - 1].pct}%).
                {ship.mode.assumed && " Нархи расонидан ҳанӯз тасдиқ нашудааст."} Нарх {QUOTE_VALID_HOURS} соат дуруст аст.
              </p>
            </div>
          )}

          <a className="rfq-btn" href={waLink(waText)} target="_blank" rel="noreferrer">
            <span className="rfq-ic"><Icon name="doc" size={20} /></span>
            <span><b>Дархости нархи оптовӣ</b><small>Ҷавоби менеҷер то 1 соат</small></span>
            <Icon name="chevron" size={18} stroke={2.2} />
          </a>

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
              <div><Icon name="tag" size={20} /><span><b>Ҳаққи хизмат</b>{FEE_TIERS.map((t) => `${t.pct}% аз ${fmt(t.from)}`).join(" · ")} смн. Ҳадди ақал {MIN_FEE} смн</span></div>
              <div><Icon name="doc" size={20} /><span><b>Нархи махсус</b>Аз {fmtQty(tiers[tiers.length - 1].min)} {unit} ё омехта: ҷавоб то 2 соат</span></div>
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
          <span className="bb-l"><Icon name="cart" size={20} /> {rfq ? "Дархости нарх" : "Ба сабад"}</span>
          <span className="bb-r">{goods ? `${fmt(goods)} смн` : `${fmtQty(qty)} ${unit}`}</span>
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
