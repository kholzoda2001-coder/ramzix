import { RU } from "./i18n-ru";
import { EN } from "./i18n-en";

export type Lang = "tg" | "ru" | "en";

export const LANGS: { id: Lang; label: string; name: string }[] = [
  { id: "tg", label: "ТҶ", name: "Тоҷикӣ" },
  { id: "ru", label: "РУ", name: "Русский" },
  { id: "en", label: "EN", name: "English" },
];

export const DEFAULT_LANG: Lang = "tg";

/* Калид — матни тоҷикӣ. Агар тарҷума набошад, худи матни тоҷикӣ нишон дода мешавад. */
const DICT: Record<Lang, Record<string, string>> = { tg: {}, ru: RU, en: EN };

export function tr(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let s = DICT[lang][key] ?? key;
  if (vars) for (const k of Object.keys(vars)) s = s.split(`{${k}}`).join(String(vars[k]));
  return s;
}
