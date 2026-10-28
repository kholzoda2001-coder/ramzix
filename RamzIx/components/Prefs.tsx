"use client";

import { useState } from "react";
import { CURRENCIES } from "@/lib/currency";
import { LANGS } from "@/lib/i18n";
import { useMoney } from "./Currency";
import Icon from "./Icon";
import { useT } from "./Lang";

/* Тугмаи якҷоя: забон ва асъор */
export default function Prefs({ light }: { light?: boolean }) {
  const { cur, setCur } = useMoney();
  const { lang, setLang, t } = useT();
  const [open, setOpen] = useState(false);
  const now = LANGS.find((l) => l.id === lang)!;
  return (
    <span className={`cur ${light ? "light" : ""}`}>
      <button className="hh-lang" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={t("Забон ва асъор")}>
        {now.label} · {CURRENCIES.find((c) => c.id === cur)?.label} <Icon name="down" size={12} stroke={2.4} />
      </button>
      {open && (
        <>
          <span className="cur-back" onClick={() => setOpen(false)} />
          <span className="cur-menu" role="menu">
            <em>{t("Забон")}</em>
            <span className="cur-seg">
              {LANGS.map((l) => (
                <button key={l.id} className={l.id === lang ? "on" : ""} onClick={() => setLang(l.id)}>{l.name}</button>
              ))}
            </span>
            <em>{t("Асъор")}</em>
            <span className="cur-seg">
              {CURRENCIES.map((c) => (
                <button key={c.id} className={c.id === cur ? "on" : ""} onClick={() => { setCur(c.id); setOpen(false); }} aria-label={c.id}>{c.label}</button>
              ))}
            </span>
          </span>
        </>
      )}
    </span>
  );
}
