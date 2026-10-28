"use client";

import { SHIP_COUNTRIES, codeOf, digitsOf, localDigits, type ShipCountry } from "@/lib/phone";
import Flag from "./Flag";
import { T, useT } from "./Lang";

export type ContactValue = { country: ShipCountry; local: string; address: string };
type Errs = Partial<Record<"phone" | "address", boolean>>;

/* Кишвар → рақами телефон бо код → суроғаи пурра */
export default function ContactFields({ value, onChange, errors = {}, required, simple }: { value: ContactValue; onChange: (v: ContactValue) => void; errors?: Errs; required?: boolean; simple?: boolean }) {
  const { t } = useT();
  return (
    <>
      {!simple && <div className="ck-field">
        <span>{t("Кишвар")}{required && <i>*</i>}</span>
        <div className="ck-seg">
          {SHIP_COUNTRIES.map((c) => (
            <button key={c.id} type="button" className={value.country === c.id ? "on" : ""} onClick={() => onChange({ ...value, country: c.id, local: localDigits(value.local, c.id) })}>
              <Flag code={c.id} className="seg-flag" /> {t(c.name)}
            </button>
          ))}
        </div>
      </div>}

      <label className={`ck-field ${errors.phone ? "bad" : ""}`}>
        <span>{t("Рақами телефон")}{required && <i>*</i>}</span>
        {simple ? (
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="ck-plain"
            placeholder="000 000 00 00"
            value={value.local}
            maxLength={20}
            onChange={(e) => onChange({ ...value, local: e.target.value.replace(/[^\d+\s()-]/g, "") })}
          />
        ) : (
        <div className="ck-phone">
          <b>{codeOf(value.country)}</b>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder={"9".repeat(digitsOf(value.country)).replace(/(\d{3})(?=\d)/g, "$1 ").replace(/9/g, "0")}
            value={value.local}
            onChange={(e) => onChange({ ...value, local: localDigits(e.target.value, value.country) })}
          />
        </div>
        )}
        {errors.phone && <em><T>Ин майдонро дуруст пур кунед</T></em>}
      </label>

      <label className={`ck-field ${errors.address ? "bad" : ""}`}>
        <span>{t("Суроғаи пурра")}{required && <i>*</i>}</span>
        <textarea
          rows={2}
          maxLength={200}
          autoComplete="street-address"
          placeholder={t("Шаҳр, ноҳия, кӯча, хона")}
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
        {errors.address && <em><T>Ин майдонро дуруст пур кунед</T></em>}
      </label>
    </>
  );
}
