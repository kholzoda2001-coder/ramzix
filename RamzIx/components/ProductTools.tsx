"use client";

import { useState } from "react";
import { fmtQty, type Product } from "@/lib/catalog";
import { shownTiers } from "@/lib/pricing";
import { useMoney } from "./Currency";
import Icon from "./Icon";
import { T, useT } from "./Lang";

/* Абзорҳои мағозадор дар саҳифаи маҳсулот: зинаи навбатӣ, ҳисоби фоида ва фиристодан ба мизоҷон (бе нархи мо) */

/** «То нархи арзонтар: боз N дона» — бо як зарба миқдор ба зинаи навбатӣ мегузарад */
export function NextTier({ p, qty, unit, onPick }: { p: Product; qty: number; unit: string; onPick: (q: number) => void }) {
  const { price, label } = useMoney();
  const { t } = useT();
  const next = shownTiers(p).find((x) => x.minQty > qty);
  if (!next) return null;
  return (
    <button type="button" className="pt-next" onClick={() => onPick(next.minQty)}>
      <Icon name="tag" size={15} />
      <span>{t("Боз {n}: нарх {u} мешавад", { n: `${fmtQty(Math.round((next.minQty - qty) * 100) / 100)} ${unit}`, u: `${price(next.unit)} ${label}` })}</span>
      <b><T>Гузаштан</T></b>
    </button>
  );
}

/** Ҳисобкунаки фоида: мағозадор нархи фурӯши худро менависад; нархи тавсиявӣ намедиҳем, чунки онро намедонем */
export function ProfitCalc({ goods, qty, unit }: { goods: number; qty: number; unit: string }) {
  const { conv, label } = useMoney();
  const { t } = useT();
  const [sell, setSell] = useState("");
  const per = parseFloat(sell.replace(",", "."));
  const cost = conv(goods);
  const ok = Number.isFinite(per) && per > 0 && qty > 0;
  const revenue = ok ? per * qty : 0;
  const profit = revenue - cost;
  // Ҳамон қоидаи «Нархи мол»: аз 1000 боло бе тийин, вагарна бо ду рақами баъди вергул
  const fmt = (n: number) => (Math.abs(n) >= 1000 ? Math.round(n).toLocaleString("ru-RU") : n.toFixed(2).replace(".", ","));
  return (
    <section className="pt-calc">
      <div className="pt-head"><Icon name="card" size={16} /><b><T>Фоидаи шумо</T></b></div>
      <label className="pt-in">
        <span>{t("Шумо 1 {u} ба чанд мефурӯшед?", { u: unit })}</span>
        <span className="pt-field">
          <input inputMode="decimal" placeholder="0" value={sell} onChange={(e) => setSell(e.target.value.replace(/[^\d.,]/g, ""))} />
          <i>{label}</i>
        </span>
      </label>
      {ok && (
        <div className="pt-res">
          <span><small><T>Харид</T></small><b>{fmt(cost)}</b></span>
          <span><small><T>Фурӯш</T></small><b>{fmt(revenue)}</b></span>
          <span className={profit >= 0 ? "good" : "bad"}><small><T>Фоида</T></small><b>{fmt(profit)}</b><em>{revenue > 0 ? `${Math.round((profit / revenue) * 100)}%` : ""}</em></span>
        </div>
      )}
      <p className="pt-note">{ok ? t("Барои {q} {u}, бе расонидан", { q: fmtQty(qty), u: unit }) : t("Нархи худро нависед, фоида фавран ҳисоб мешавад")}</p>
    </section>
  );
}

/** Фиристодан ба мизоҷон: акс, ном ва тавсиф бе нархи оптом ва бе пайванд ба сайт */
export function ShareToClient({ p }: { p: Product }) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const text = [t(p.name), p.subtitle ? t(p.subtitle) : "", p.nameOriginal ? `${t("Модел")}: ${p.nameOriginal}` : ""].filter(Boolean).join("\n");
  const share = async () => {
    setBusy(true);
    try {
      const src = p.images[0] ? new URL(p.images[0], location.origin).href : "";
      if (src && navigator.canShare) {
        const blob = await (await fetch(src)).blob();
        const file = new File([blob], `${p.slug}.${blob.type.includes("png") ? "png" : "jpg"}`, { type: blob.type || "image/jpeg" });
        if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; }
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(src ? `${text}\n${src}` : text)}`, "_blank");
    } catch {
      // Харидор фиристоданро бекор кард ё браузер файлро нагирифт — чизе намекунем
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" className="pt-share" onClick={share} disabled={busy}>
      <Icon name="share" size={17} />
      <span><b><T>Ба мизоҷатон фиристед</T></b><small><T>Акс ва тавсиф, бе нархи оптом</T></small></span>
    </button>
  );
}
