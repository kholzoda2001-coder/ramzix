"use client";

import { useSyncExternalStore } from "react";
import { T, useT } from "./Lang";

/* Тарзи нишон додани нарх дар тамоми сайт: «Чакана» (нархи 1 дона) ё «Оптом» (нархи ҳаҷм).
   Дар браузер нигоҳ дошта мешавад; ҳамаи тугмаҳо ва кортҳо якбора нав мешаванд. */
export type PriceMode = "retail" | "whole";

const KEY = "ramzix-price-mode";
const listeners = new Set<() => void>();

const read = (): PriceMode => {
  try { return localStorage.getItem(KEY) === "whole" ? "whole" : "retail"; } catch { return "retail"; }
};
export function setPriceMode(m: PriceMode) {
  try { localStorage.setItem(KEY, m); } catch {}
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => e.key === KEY && l();
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
};

export const usePriceMode = () => useSyncExternalStore(subscribe, read, () => "retail" as PriceMode);

/** Тугмаи «Чакана / Оптом» */
export default function ModeSwitch({ light }: { light?: boolean }) {
  const mode = usePriceMode();
  const { t } = useT();
  return (
    <div className={`mode-switch ${light ? "light" : ""}`} role="group" aria-label={t("Тарзи нарх")}>
      <button type="button" aria-pressed={mode === "retail"} className={mode === "retail" ? "on" : ""} onClick={() => setPriceMode("retail")}>
        <T>Чакана</T> <small><T>аз 1 дона</T></small>
      </button>
      <button type="button" aria-pressed={mode === "whole"} className={mode === "whole" ? "on" : ""} onClick={() => setPriceMode("whole")}>
        <T>Оптом</T> <small><T>нархи ҳаҷм</T></small>
      </button>
    </div>
  );
}
