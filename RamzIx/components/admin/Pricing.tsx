"use client";

import { useState } from "react";
import { COUNTRIES } from "@/lib/catalog";
import { DEFAULT_PRICING, applyPricing, snapshotPricing, type CountryKey, type PricingConfig, type ShippingMode } from "@/lib/pricing-config";

/* «Нарх ва расонидан»: қурби асъор, зинаҳои фоида, тарифи карго ва рақами WhatsApp — ҳамааш аз ҳамин ҷо */

const COUNTRY_KEYS: CountryKey[] = ["ae", "cn", "tr", "tj"];
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

function Num({ value, onChange, label, hint }: { value: number; onChange: (n: number) => void; label: string; hint?: string }) {
  const [t, setT] = useState(String(value));
  return (
    <label><span>{label}</span>
      <input inputMode="decimal" value={t} onChange={(e) => { setT(e.target.value); const n = parseFloat(e.target.value.replace(",", ".")); if (Number.isFinite(n)) onChange(n); }} />
      {hint && <small className="ad-opt">{hint}</small>}
    </label>
  );
}

export default function Pricing() {
  const [cfg, setCfg] = useState<PricingConfig>(() => snapshotPricing());
  const [gen, setGen] = useState(0); // барои аз нав сохтани майдонҳо баъди «Аз нав»
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const up = (p: Partial<PricingConfig>) => setCfg({ ...cfg, ...p });

  const setMode = (c: CountryKey, i: number, p: Partial<ShippingMode>) => up({ shipping: { ...cfg.shipping, [c]: cfg.shipping[c].map((m, k) => (k === i ? { ...m, ...p } : m)) } });
  const pcts = [...new Set(cfg.markupTiers.map((t) => t.pct))];

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/pricing", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg) });
      if (r.ok) {
        const d = (await r.json()) as { pricing: PricingConfig };
        applyPricing(d.pricing);
        window.dispatchEvent(new Event("ramzix-pricing-change"));
        setCfg(d.pricing);
        setGen((g) => g + 1);
        setMsg({ ok: true, text: "Захира шуд — нархҳои сайт нав шуданд" });
      } else setMsg({ ok: false, text: r.status === 401 ? "Дубора ба админ ворид шавед (PIN)" : "Захира нашуд: база ҷавоб надод" });
    } catch { setMsg({ ok: false, text: "Захира нашуд: пайвастшавӣ нест" }); }
    setBusy(false);
  };

  return (
    <div key={gen} style={{ display: "contents" }}>
      <section className="ad-card">
        <h3>Қурби асъор</h3>
        <p className="ad-hint">Ҳамаи нархҳои сайт аз ҳамин қурб ҳисоб мешаванд. 1 доллар = …</p>
        <div className="ad-grid2">
          <Num label="Сомонӣ (смн)" value={cfg.usdToTjs} onChange={(n) => up({ usdToTjs: n })} hint="Қурби расмии БМТ" />
          <Num label="Дирҳам (AED)" value={cfg.aedPerUsd} onChange={(n) => up({ aedPerUsd: n })} hint="Ба доллар баста шудааст" />
          <Num label="Риёл (SAR)" value={cfg.sarPerUsd} onChange={(n) => up({ sarPerUsd: n })} />
          <Num label="Юан (CNY)" value={cfg.cnyPerUsd} onChange={(n) => up({ cnyPerUsd: n })} hint="Қурби воқеиро гузоред" />
        </div>
        <label><span>Санаи қурб</span><input value={cfg.ratesDate} maxLength={20} onChange={(e) => up({ ratesDate: e.target.value })} /></label>
      </section>

      <section className="ad-card">
        <h3>Зинаҳои фоида (аз маблағи сабад)</h3>
        <p className="ad-hint">Аз «Аз» сомонӣ сар карда фоидаи шумо ҳамин фоиз болои нархи харид аст. Зинаи якум ҳамеша аз 0 сар мешавад ва нархи асосии корт аст. Ҳар қадар сабад калон, фоида камтар.</p>
        {cfg.markupTiers.map((t, i) => (
          <div key={i} className="ad-grid2 ad-tier">
            <Num label={i === 0 ? "Аз (смн)" : "Аз (смн)"} value={t.from} onChange={(n) => up({ markupTiers: cfg.markupTiers.map((x, k) => (k === i ? { ...x, from: i === 0 ? 0 : n } : x)) })} />
            <div className="ad-row-h" style={{ alignItems: "end" }}>
              <Num label="Фоида, %" value={t.pct} onChange={(n) => up({ markupTiers: cfg.markupTiers.map((x, k) => (k === i ? { ...x, pct: n } : x)) })} />
              {i > 0 && <button className="ad-mv red" onClick={() => up({ markupTiers: cfg.markupTiers.filter((_, k) => k !== i) })} aria-label="Нест кардан">✕</button>}
            </div>
          </div>
        ))}
        <button className="ad-add" onClick={() => up({ markupTiers: [...cfg.markupTiers, { from: (cfg.markupTiers.at(-1)?.from ?? 0) + 10000, pct: Math.max(1, (cfg.markupTiers.at(-1)?.pct ?? 5) - 1) }] })}>+ Зинаи нав</button>
        <div>
          <p className="ad-hint">Кадом зинаҳо дар саҳифаи маҳсулот ҳамчун «нархи оптовӣ» нишон дода мешаванд:</p>
          <div className="ad-chips wrap">
            {pcts.map((p) => {
              const on = cfg.shownWholesalePcts.includes(p);
              return <button key={p} className={on ? "on" : ""} onClick={() => up({ shownWholesalePcts: on ? cfg.shownWholesalePcts.filter((x) => x !== p) : [...cfg.shownWholesalePcts, p] })}>{p}%</button>;
            })}
          </div>
        </div>
      </section>

      <section className="ad-card">
        <h3>Тамос ва шартҳо</h3>
        <label><span>Рақами WhatsApp-и корхона (бе «+», бо рамзи кишвар)</span><input inputMode="numeric" value={cfg.whatsapp} maxLength={20} onChange={(e) => up({ whatsapp: e.target.value.replace(/\D/g, "") })} /></label>
        <div className="ad-grid2">
          <Num label="Нархи оптовӣ дархост шавад аз (дона)" value={cfg.rfqFrom} onChange={(n) => up({ rfqFrom: n })} />
          <Num label="Нарх чанд соат дуруст аст" value={cfg.quoteHours} onChange={(n) => up({ quoteHours: n })} />
        </div>
      </section>

      <section className="ad-card">
        <h3>Расонидан (карго)</h3>
        <p className="ad-hint">Нарх — доллар барои 1 кг. Агар «м³» пур бошад, аз вазн ва ҳаҷм кадомаш зиёд бошад, ҳамон ҳисоб мешавад. Дар сайт ва сабад танҳо намуди аввали ҳар кишвар истифода мешавад.</p>
        {COUNTRY_KEYS.map((c) => (
          <div key={c} className="ad-ship">
            <b>{COUNTRIES[c].short}</b>
            {cfg.shipping[c].map((m, i) => (
              <div key={m.id + i} className="ad-item">
                <div className="ad-row-h">
                  <label className="ad-check"><input type="checkbox" checked={!!m.assumed} onChange={(e) => setMode(c, i, { assumed: e.target.checked })} /> Нарх тахминӣ аст</label>
                  {cfg.shipping[c].length > 1 && <button className="ad-mv red" onClick={() => up({ shipping: { ...cfg.shipping, [c]: cfg.shipping[c].filter((_, k) => k !== i) } })} aria-label="Нест кардан">✕</button>}
                </div>
                <label><span>Ном</span><input value={m.label} maxLength={40} onChange={(e) => setMode(c, i, { label: e.target.value })} /></label>
                <div className="ad-grid2">
                  <Num label="$ / кг" value={m.perKgUsd} onChange={(n) => setMode(c, i, { perKgUsd: n })} />
                  <Num label="$ / м³ (ихтиёрӣ)" value={m.perM3Usd ?? 0} onChange={(n) => setMode(c, i, { perM3Usd: n > 0 ? n : undefined })} />
                  <Num label="Рӯз аз" value={m.daysMin} onChange={(n) => setMode(c, i, { daysMin: n })} />
                  <Num label="Рӯз то" value={m.daysMax} onChange={(n) => setMode(c, i, { daysMax: n })} />
                </div>
              </div>
            ))}
            <button className="ad-add" onClick={() => up({ shipping: { ...cfg.shipping, [c]: [...cfg.shipping[c], { id: "m" + Math.random().toString(36).slice(2, 6), label: "Намуди нав", perKgUsd: 1, daysMin: 10, daysMax: 20 }] } })}>+ Намуди расонидан</button>
          </div>
        ))}
      </section>

      <div className="ad-savebar">
        {msg && <span className={msg.ok ? "ad-msg" : "ad-err"}>{msg.text}</span>}
        <button className="ad-ghost" onClick={() => { if (confirm("Ҳамаи қиматҳо ба пешфарз бармегарданд (то захира кардан дар сайт тағйир намеёбад). Идома?")) { setCfg(clone(DEFAULT_PRICING)); setGen((g) => g + 1); } }}>Аз нав</button>
        <button className="ad-primary" onClick={save} disabled={busy}>{busy ? "Захира мешавад…" : "Захира кардан"}</button>
      </div>
    </div>
  );
}
