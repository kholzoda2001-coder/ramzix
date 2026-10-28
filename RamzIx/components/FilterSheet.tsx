"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, COUNTRIES, type CountryCode } from "@/lib/catalog";
import { useCatalog } from "@/lib/useCatalog";
import { EMPTY_FILTERS, UNITS, filterProducts, getBrands, type Filters } from "@/lib/filters";
import { useMoney } from "./Currency";
import Flag from "./Flag";
import { T, useT } from "./Lang";
import Icon from "./Icon";

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function FilterSheet({
  open,
  initial,
  onClose,
  onApply,
}: {
  open: boolean;
  initial: Filters;
  onClose: () => void;
  onApply: (f: Filters) => void;
}) {
  const { cur, label, conv, toTjs } = useMoney();
  const { t } = useT();
  const { products } = useCatalog();
  const [draft, setDraft] = useState<Filters>(initial);
  const [minTxt, setMinTxt] = useState("");
  const [maxTxt, setMaxTxt] = useState("");
  const brands = useMemo(() => getBrands(products), [products]);
  const cats = CATEGORIES.filter((c) => c.id !== "all");

  // Ҳар дафъаи кушодан аз филтрҳои ҷорӣ оғоз мекунем
  useEffect(() => {
    if (!open) return;
    setDraft(initial);
    setMinTxt(initial.min !== undefined ? String(Math.round(conv(initial.min))) : "");
    setMaxTxt(initial.max !== undefined ? String(Math.round(conv(initial.max))) : "");
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, cur]);

  const withPrice: Filters = {
    ...draft,
    min: minTxt.trim() === "" ? undefined : Math.floor(toTjs(Number(minTxt))),
    max: maxTxt.trim() === "" ? undefined : Math.ceil(toTjs(Number(maxTxt))),
  };
  const count = useMemo(() => filterProducts(products, withPrice).length, [products, withPrice.q, withPrice.category, withPrice.brand, withPrice.country, withPrice.unit, withPrice.min, withPrice.max]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = {
    country: (c: CountryCode) => products.filter((p) => p.country === c).length,
    category: (id: string) => products.filter((p) => p.category === id).length,
  };

  return (
    <div className={`sheet-wrap ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={t("Филтрҳо")}>
        <div className="sheet-head">
          <b><T>Филтрҳо</T></b>
          <button className="sheet-x" onClick={onClose} aria-label={t("Пӯшидан")}><Icon name="close" size={20} /></button>
        </div>

        <div className="sheet-body">
          <section>
            <h3><T>Кишвар</T></h3>
            <div className="fchips">
              {(Object.keys(COUNTRIES) as CountryCode[]).map((c) => (
                <button key={c} className={draft.country.includes(c) ? "on" : ""} onClick={() => setDraft({ ...draft, country: toggle(draft.country, c) })}>
                  <Flag code={c} className="fc-flag" />{t(COUNTRIES[c].short)}<em>{counts.country(c)}</em>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3><T>Категория</T></h3>
            <div className="fchips">
              {cats.map((c) => {
                const n = counts.category(c.id);
                return (
                  <button key={c.id} disabled={n === 0} className={draft.category.includes(c.id) ? "on" : ""} onClick={() => setDraft({ ...draft, category: toggle(draft.category, c.id) })}>
                    {t(c.name)}<em>{n}</em>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3><T>Бренд</T></h3>
            <div className="fchips">
              {brands.map((b) => (
                <button key={b.slug} className={draft.brand.includes(b.slug) ? "on" : ""} onClick={() => setDraft({ ...draft, brand: toggle(draft.brand, b.slug) })}>
                  {b.name}<em>{b.count}</em>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3><T>Воҳиди фурӯш</T></h3>
            <div className="fchips">
              {UNITS.map((u) => (
                <button key={u} className={draft.unit.includes(u) ? "on" : ""} onClick={() => setDraft({ ...draft, unit: toggle(draft.unit, u) })}>
                  {t(u === "дона" ? "Бо дона" : u === "картон" ? "Бо картон" : "Бо кило")}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3><T>Нарх</T> <small>{t("{c} барои 1 воҳид", { c: label })}</small></h3>
            <div className="price-inputs">
              <input inputMode="numeric" placeholder={t("Аз")} value={minTxt} onChange={(e) => setMinTxt(e.target.value.replace(/[^\d]/g, ""))} aria-label={t("Нархи ҳадди ақал")} />
              <span>—</span>
              <input inputMode="numeric" placeholder={t("То")} value={maxTxt} onChange={(e) => setMaxTxt(e.target.value.replace(/[^\d]/g, ""))} aria-label={t("Нархи ҳадди аксар")} />
            </div>
          </section>
        </div>

        <div className="sheet-foot">
          <button className="sf-reset" onClick={() => { setDraft({ ...EMPTY_FILTERS, q: draft.q, sort: draft.sort }); setMinTxt(""); setMaxTxt(""); }}><T>Тоза кардан</T></button>
          <button className="sf-apply" onClick={() => onApply(withPrice)}>
            {count > 0 ? <><T>Нишон додан</T> <b>{count}</b></> : "Ҳеҷ чиз ёфт нашуд"}
          </button>
        </div>
      </div>
    </div>
  );
}
