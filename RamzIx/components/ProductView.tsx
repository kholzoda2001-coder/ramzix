"use client";

import { useMoney } from "./Currency";
import { T, useT } from "./Lang";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, fmt, fmtQty, unitOf, waLink, type Product } from "@/lib/catalog";
import { defaultMode, listUnitPrice, modesFor, rfqFromOf, shippingCost, volumeOf, weightOf, wholesalePrices } from "@/lib/pricing";
import { QUOTE_VALID_HOURS, SHIPPING } from "@/lib/pricing-config";
import { CartBadge, useCart } from "./Cart";
import Icon from "./Icon";
import ProductCard from "./ProductCard";
import ProductImage from "./ProductImage";
import useDragScroll from "./useDragScroll";
import Lightbox from "./Lightbox";
import BrandLogo from "./BrandLogo";

const round2 = (n: number) => Math.round(n * 100) / 100;

export default function ProductView({ p, related, other }: { p: Product; related: Product[]; other: Product[] }) {
  const { price, sum, label } = useMoney();
  const { t } = useT();
  const router = useRouter();
  const { add, modes, ready, setMode } = useCart();
  const sale = p.sale;
  const unit = t(unitOf(p));
  const step = sale?.step ?? 1;
  const minQty = sale?.min ?? 1;
  const [qty, setQty] = useState(minQty);
  const [img, setImg] = useState(0);
  const [colorName, setColorName] = useState<string | null>(p.colors?.[0]?.name ?? null);
  const [size, setSize] = useState<string | null>(p.sizes?.[2] ?? p.sizes?.[0] ?? null);
  const [modeId, setModeId] = useState(defaultMode(p.country));
  const [tab, setTab] = useState<"desc" | "terms" | "ship">("desc");
  const [more, setMore] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [solid, setSolid] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  useDragScroll(track);
  // Ҳангоми кашидани галерея ба акси ранги интихобшуда, номи ранг аз рӯи аксҳои «роҳ» иваз нашавад
  const colorLock = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const goods = unitPrice * qty;
  const pieces = sale?.per ? qty * sale.per : null;
  const weight = round2(weightOf(p, qty));
  const ship = shippingCost(p.country, modeId, weight, volumeOf(p, qty));
  const total = goods + ship.tjs;
  const bigOrder = qty >= rfqFromOf(p);
  const country = COUNTRIES[p.country];
  const modeList = modesFor(p.country);
  // Мӯҳлати расонидан як бор нишон дода мешавад: дар тугмаи интихоб (агар якчанд намуд бошад), вагарна дар сатр
  const shipNote = [
    modeList.length === 1 ? `${t(ship.mode.label)}, ${t("{a}–{b} рӯз", { a: ship.mode.daysMin, b: ship.mode.daysMax })}` : null,
    ship.basis === "m3" ? t("аз рӯи ҳаҷм") : null,
  ].filter(Boolean).join(", ");
  const points = useMemo(() => splitDescription(t(p.description ?? "")), [p.description, t]);

  const setQ = (v: number) => setQty(Math.min(99999, Math.max(minQty, round2(Math.round((v || minQty) / step) * step))));
  const goImg = (k: number) => track.current?.scrollTo({ left: k * track.current.clientWidth, behavior: "smooth" });

  const waText = `${t("Салом! Маҳсулот:")} ${t(p.name)}${colorName ? `, ${t("ранг")} ${t(colorName)}` : ""}${size ? `, ${t("андоза")} ${size}` : ""}. ${t("Миқдор:")} ${fmtQty(qty)} ${unit}${pieces ? ` (${pieces} ${t(sale?.perLabel ?? "")})` : ""}. ${t("Нархи оптовиро гуфта метавонед?")}`;
  const wholesaleLink = waLink(waText);

  const addToCart = () => {
    setMode(p.country, modeId);
    add({ slug: p.slug, qty, size: size ?? undefined, color: colorName ?? undefined }, t("{q} ба сабад илова шуд", { q: `${fmtQty(qty)} ${unit}` }));
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: t(p.name), url: location.href });
      else await navigator.clipboard.writeText(location.href);
    } catch {}
  };

  return (
    <>
      {/* Сарлавҳаи болоӣ */}
      <header className={`pd-top ${solid ? "solid" : ""}`}>
        <button className="ic-round" onClick={() => (history.length > 1 ? router.back() : router.push("/"))} aria-label={t("Бозгашт")}>
          <Icon name="back" stroke={2.2} />
        </button>
        <span className="pd-top-title">{t(p.name)}</span>
        <button className="ic-round" onClick={share} aria-label={t("Фиристодан")}><Icon name="share" size={20} /></button>
        <Link href="/cart" className="ic-round" aria-label={t("Сабад")}><Icon name="cart" size={21} /><CartBadge /></Link>
      </header>

      <main className="pd">
        {/* Галерея */}
        {zoom && <Lightbox images={p.images} name={t(p.name)} start={img} onClose={(k) => { setZoom(false); setImg(k); requestAnimationFrame(() => { const t = track.current; if (t) { t.style.scrollBehavior = "auto"; t.scrollLeft = k * t.clientWidth; t.style.scrollBehavior = ""; } }); }} />}
        <div className="gallery">
          <div
            className="g-track"
            ref={track}
            onScroll={(e) => {
              const k = Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth);
              setImg(k);
              // Агар акс ба ранг тааллуқ дорад, ранг ҳам иваз мешавад
              if (colorLock.current) {
                // Гузариши худкор идома дорад: қуфл то 140 мс пас аз охирин ҳаракат
                clearTimeout(colorLock.current);
                colorLock.current = setTimeout(() => { colorLock.current = null; }, 140);
                return;
              }
              const c = p.colors?.find((x, i) => (x.image ?? i) === k);
              if (c) setColorName(c.name);
            }}
          >
            {p.images.map((src, k) => (
              <div className={`g-slide ${src.endsWith(".svg") ? "art" : ""}`} key={src} onClick={() => setZoom(true)}><ProductImage src={src} alt={`${t(p.name)} — ${k + 1}`} eager={k === 0} /></div>
            ))}
          </div>
          {p.images.length > 1 && (
            <div className="g-dots" role="tablist" aria-label={t("Расмҳо")}>
              {p.images.map((src, k) => (
                <button key={src} role="tab" aria-selected={k === img} className={k === img ? "on" : ""} onClick={() => goImg(k)} aria-label={t("Сурати {n}", { n: k + 1 })} />
              ))}
            </div>
          )}
        </div>

        <div className="pd-body">
          {/* Рангҳо (вариатсия) */}
          {p.colors && p.colors.length > 0 && (
            <div className="colors">
              <span className="colors-label"><T>Ранг:</T> <b>{colorName ? t(colorName) : ""}</b></span>
              <div className="swatches">
                {p.colors.map((c, k) => {
                  const src = p.images[c.image ?? k];
                  return (
                    <button
                      key={c.name}
                      className={`swatch ${src ? "photo" : ""} ${c.name === colorName ? "on" : ""}`}
                      style={{ ["--c" as string]: c.hex }}
                      onClick={() => {
                        setColorName(c.name);
                        if (colorLock.current) clearTimeout(colorLock.current);
                        colorLock.current = setTimeout(() => { colorLock.current = null; }, 700);
                        goImg(c.image ?? k);
                      }}
                      aria-label={t(c.name)}
                      title={t(c.name)}
                    >
                      {src && <ProductImage src={src} alt={t(c.name)} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Номи маҳсулот */}
          {p.brand && <div className="pd-brand">{p.brand}</div>}
          <h1 className="pd-title">{t(p.name)}</h1>
          {p.subtitle && <p className="pd-sub">{t(p.subtitle)}</p>}
          {p.rating && (
            <div className="pd-rating">
              <span className="stars">{[1, 2, 3, 4, 5].map((s) => <Icon key={s} name="star" size={14} className={s <= Math.round(p.rating!) ? "" : "dim"} />)}</span>
              <b>{p.rating}</b><span>({t("{n} баррасӣ", { n: p.reviews })})</span>
            </div>
          )}

          {/* Нарх */}
          <div className="price-box">
            <div className="price-row">
              <div className="pr-base">
                <div><b>{price(unitPrice)}</b><span>{label}</span></div>
              </div>
              <div className="pr-wh">
                <span className="wh-tag"><T>Оптом</T></span>
                <span className="pr-wh-vals">
                  {wholesale.map((w, i) => (
                    <span key={w.pct}>{i > 0 && <i>·</i>}<b>{price(w.unit)}</b></span>
                  ))}
                  <em>{label}</em>
                </span>
              </div>
            </div>

            <a className="wa-cta" href={wholesaleLink} target="_blank" rel="noreferrer">
              <span className="wa-ic"><Icon name="wa" size={24} /></span>
              <span className="wa-txt"><b><T>Дар WhatsApp пурсед</T></b><small><T>Барои миқдори калон нархи махсус</T></small></span>
              <Icon name="chevron" size={18} stroke={2.4} />
            </a>
          </div>

          {/* Андоза */}
          {p.sizes && (
            <div className="opt">
              <div className="opt-label"><T>Андоза:</T> <b>{size}</b></div>
              <div className="chips">
                {p.sizes.map((s) => (
                  <button key={s} className={`chip ${s === size ? "on" : ""}`} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Миқдор */}
          <div className="opt">
            <div className="opt-label"><T>Миқдор</T> <span>{t("Ҳадди ақал: {q}", { q: `${fmtQty(minQty)} ${unit}` })}</span></div>
            {sale && (
              <div className="pack-info">
                {sale.per && <span>📦 1 {unit} = <b>{sale.per} {t(sale.perLabel ?? "")}</b></span>}
                {!sale.per && <span><T>⚖️ Қадам:</T> <b>{fmtQty(step)} {unit}</b></span>}
                {sale.note && <span>ℹ️ {t(sale.note)}</span>}
              </div>
            )}
            <div className="qty-row">
              <div className="qty">
                <button onClick={() => setQ(qty - step)} aria-label={t("Кам")} disabled={qty <= minQty}><Icon name="minus" size={18} stroke={2.4} /></button>
                <input
                  value={qty}
                  aria-label={t("Миқдор")}
                  inputMode={sale?.decimals ? "decimal" : "numeric"}
                  onChange={(e) => setQty(parseFloat(e.target.value.replace(",", ".").replace(/[^\d.]/g, "")) || minQty)}
                  onBlur={() => setQ(qty)}
                />
                <button onClick={() => setQ(qty + step)} aria-label={t("Зиёд")}><Icon name="plus" size={18} stroke={2.4} /></button>
              </div>
              <div className="sum">
                <span><T>Нархи мол</T></span>
                <b>{sum(goods)} {label}</b>
              </div>
            </div>
            {(pieces || sale) && (
              <div className="pack-info">
                {pieces && <span><T>Ҳамагӣ:</T> <b>{fmt(pieces)} {t(sale?.perLabel ?? "")}</b></span>}
                <span><T>Вазн:</T> <b>{fmtQty(weight)} {t("кг")}</b></span>
                {pieces && <span>1 {t(sale?.perLabel ?? "")}: <b>{price(unitPrice / sale!.per!)} {label}</b></span>}
              </div>
            )}
          </div>

          {bigOrder && (
            <div className="big-note"><T>Миқдори калон: нархи оптовиро дархост кунед, менеҷер нархи беҳтарро мегӯяд.</T></div>
          )}

          {/* Расонидан */}
          <div className="est">
            <div className="est-head"><b>{t("Расонидан аз {c}", { c: t(country.short) })}</b><span>{t("барои {q}", { q: `${fmtQty(qty)} ${unit}` })}</span></div>
            {modeList.length > 1 && (
              <div className="modes">
                {modeList.map((m) => (
                  <button key={m.id} className={m.id === ship.mode.id ? "on" : ""} onClick={() => setModeId(m.id)}>
                    <b>{t(m.label)}</b>
                    <small>{t("{a}–{b} рӯз", { a: m.daysMin, b: m.daysMax })}</small>
                  </button>
                ))}
              </div>
            )}
            <div className="est-row"><span><T>Нархи мол</T></span><b>{sum(goods)} {label}</b></div>
            <div className="est-row">
              <span>
                {t("Расонидан · вазн {w} кг", { w: fmtQty(weight) })}
                {shipNote && <small>{shipNote}</small>}
              </span>
              <b>{ship.tjs > 0 ? `${sum(ship.tjs)} ${label}` : t("бо тасдиқ")}</b>
            </div>
            <div className="est-total"><span><T>Ҷамъ</T></span><b>{sum(total)} {label}</b></div>
            <p className="est-note">
              {t("Дар сабад бо харид зиёд нархи мол арзонтар мешавад.")}
              {ship.mode.assumed && " " + t("Нархи расонидан ҳанӯз тасдиқ нашудааст.")} {t("Нарх {h} соат дуруст аст.", { h: QUOTE_VALID_HOURS })}
            </p>
          </div>

          {/* Табҳо */}
          <div className="tabs" role="tablist">
            {([["desc", "Тавсиф"], ["terms", "Шартҳои оптовӣ"], ["ship", "Расонидан"]] as const).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{t(l)}</button>
            ))}
          </div>

          {tab === "desc" && (
            <div className="pane">
              {points.length > 0 && (
                <div className={`desc ${more ? "open" : ""}`}>
                  {points.map((pt, k) => (
                    <p key={k}>{pt.head && <b>{pt.head}. </b>}{pt.text}</p>
                  ))}
                  {!more && points.length > 2 && <button className="more" onClick={() => setMore(true)}><T>Бештар хондан</T> <Icon name="down" size={14} /></button>}
                </div>
              )}
              <table className="spec">
                <tbody>
                  {p.brand && <tr><td><T>Бренд</T></td><td>{p.brand}</td></tr>}
                  <tr><td><T>Таъминот аз</T></td><td>{t(country.name)}</td></tr>
                  {sale ? (
                    <>
                      <tr><td><T>Воҳиди фурӯш</T></td><td>{sale.per ? `${t(sale.unit)} (${sale.per} ${t(sale.perLabel ?? "")})` : t(sale.unit)}</td></tr>
                      <tr><td>{t("Вазни 1 {u}", { u: t(sale.unit) })}</td><td>{fmtQty(p.weightKg)} {t("кг")}</td></tr>
                      {sale.shelfLife && <tr><td><T>Мӯҳлати истифода</T></td><td>{t(sale.shelfLife)}</td></tr>}
                      {sale.storage && <tr><td><T>Нигоҳдорӣ</T></td><td>{t(sale.storage)}</td></tr>}
                    </>
                  ) : (
                    <tr><td><T>Вазн (бо қуттӣ)</T></td><td>{p.weightKg} {t("кг")}</td></tr>
                  )}
                  {p.sizes && <tr><td><T>Андозаҳо</T></td><td>{p.sizes.join(", ")}</td></tr>}
                  <tr><td><T>Кафолат</T></td><td>{t(sale ? "Бо сана ва сертификат" : p.category === "audio" ? "12 моҳ" : "Ивази нуқсон 14 рӯз")}</td></tr>
                  <tr><td><T>Артикул</T></td><td>{p.slug.toUpperCase().slice(0, 18)}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {tab === "terms" && (
            <div className="pane terms">
              <div><Icon name="box" size={20} /><span><b><T>Ҳадди ақал</T></b>{sale ? t("Аз {q}. Нарх бо {u} ҳисоб мешавад", { q: `${fmtQty(minQty)} ${unit}`, u: unit }) : t("Чакана аз 1 дона, нархи оптовӣ аз 10 дона")}</span></div>
              <div><Icon name="doc" size={20} /><span><b><T>Фактура ва ҳуҷҷат</T></b><T>Барои ҳисоби бизнес: фактура, шартнома, ҳуҷҷатҳои гумрукӣ</T></span></div>
              <div><Icon name="card" size={20} /><span><b><T>Пардохт бо мӯҳлат</T></b><T>Барои мизоҷони доимӣ: 30% пешпардохт, боқимонда то 14 рӯз</T></span></div>
              <div><Icon name="tag" size={20} /><span><b><T>Нархи оптовӣ</T></b><T>Барои миқдори калон нархи махсус: дар WhatsApp пурсед, ҷавоб то 2 соат</T></span></div>
            </div>
          )}

          {tab === "ship" && (
            <div className="pane">
              <table className="spec">
                <tbody>
                  {SHIPPING[p.country].map((m) => (
                    <tr key={m.id}>
                      <td>{t(m.label)}</td>
                      <td>
                        {t("{a}–{b} рӯз", { a: m.daysMin, b: m.daysMax })}
                        {m.perKgUsd > 0 && <> · ${m.perKgUsd}/{t("кг")}{m.perM3Usd ? ` ${t("ё")} $${m.perM3Usd}/${t("м³")}` : ""}</>}
                        {m.assumed && ` (${t("тахминӣ")})`}
                      </td>
                    </tr>
                  ))}
                  <tr><td><T>Худ гирифтан</T></td><td><T>Анбори Душанбе</T></td></tr>
                </tbody>
              </table>
              <p className="est-note" style={{ marginTop: 10 }}><T>Расонидан аз рӯи вазн ҳисоб мешавад ва аз ҷониби харидор пардохта мешавад. Нарх дар сабад нишон дода мешавад.</T></p>
            </div>
          )}

          {/* Фурӯшанда */}
          <div className="seller">
            <BrandLogo name={p.brand ?? "RamzIx"} small />
            <span className="seller-txt">
              <b>{p.brand ?? "RamzIx"} · {t(country.short)}</b>
              <small><Icon name="shield" size={13} /> <T>Санҷидашуда · Ҷавоб &lt; 1 соат</T></small>
            </span>
            <a href={waLink(waText)} className="seller-btn"><T>Пурсиш</T></a>
          </div>
        </div>

        {related.length > 0 && (
          <section className="block">
            <div className="sec-head"><h2><T>Маҳсулоти монанд</T></h2></div>
            <div className="hscroll">{related.map((x) => <ProductCard key={x.slug} p={x} compact />)}</div>
          </section>
        )}
        {other.length > 0 && (
          <section className="block">
            <div className="sec-head"><h2><T>Шояд ба шумо писанд ояд</T></h2></div>
            <div className="grid2">{other.map((x) => <ProductCard key={x.slug} p={x} />)}</div>
          </section>
        )}
      </main>

      {/* Тугмаҳои поён */}
      <div className="buy-bar">
        <a href={waLink(waText)} className="bb-wa" aria-label="WhatsApp" target="_blank" rel="noreferrer"><Icon name="wa" size={24} /></a>
        <button className="bb-add" onClick={addToCart}>
          <span className="bb-l"><Icon name="cart" size={20} /> <T>Ба сабад</T></span>
          <span className="bb-r">{sum(goods)} {label}</span>
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
