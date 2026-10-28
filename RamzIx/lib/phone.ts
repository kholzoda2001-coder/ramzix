/* Кишвар ва рақами телефон бо коди кишвар */
export type ShipCountry = "tj" | "ae";

export const SHIP_COUNTRIES: { id: ShipCountry; name: string; code: string; digits: number }[] = [
  { id: "tj", name: "Тоҷикистон", code: "+992", digits: 9 },
  { id: "ae", name: "Иморот", code: "+971", digits: 9 },
];

export const codeOf = (c: ShipCountry) => SHIP_COUNTRIES.find((x) => x.id === c)!.code;
export const digitsOf = (c: ShipCountry) => SHIP_COUNTRIES.find((x) => x.id === c)!.digits;

/** Танҳо рақамҳои маҳаллӣ (бе код ва бе сифри аввал) */
export const localDigits = (v: string, c: ShipCountry) => {
  let d = v.replace(/\D/g, "");
  const code = codeOf(c).slice(1);
  if (d.startsWith(code)) d = d.slice(code.length);
  return d.replace(/^0+/, "").slice(0, digitsOf(c));
};

/** "+992 900123456" → { country, local } */
export function splitPhone(full: string, fallback: ShipCountry = "tj"): { country: ShipCountry; local: string } {
  const d = full.replace(/\D/g, "");
  const found = SHIP_COUNTRIES.find((c) => d.startsWith(c.code.slice(1)));
  const country = found?.id ?? fallback;
  return { country, local: localDigits(d, country) };
}

export const joinPhone = (c: ShipCountry, local: string) => (local ? `${codeOf(c)} ${local}` : "");
export const phoneValid = (c: ShipCountry, local: string) => local.length === digitsOf(c);
