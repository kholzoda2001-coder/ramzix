"use client";

import { useEffect, useState } from "react";
import { getCountry } from "./geo";
import type { ShipCountry } from "./phone";

/* Харидор дар куҷост (ба куҷо мерасонем): Тоҷикистон, Иморот ё дигар кишвар. Интихоби худи харидор нигоҳ дошта мешавад,
   вагарна аз рӯи кишвари IP (Иморот → ae, Тоҷикистон ё номаълум → tj, дигар → intl). Аз ин нархи расонидан вобаста аст. */
const KEY = "ramzix-dest";
const EVENT = "ramzix-dest-change";

export function setDest(c: ShipCountry) {
  try { localStorage.setItem(KEY, c); } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useDest(): ShipCountry {
  const [dest, setState] = useState<ShipCountry>("tj");
  useEffect(() => {
    let alive = true;
    const read = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem(KEY); } catch {}
      if (saved === "ae" || saved === "tj" || saved === "intl") return setState(saved);
      getCountry().then((c) => { if (alive) setState(c === "AE" ? "ae" : c && c !== "TJ" ? "intl" : "tj"); });
    };
    read();
    window.addEventListener(EVENT, read);
    return () => { alive = false; window.removeEventListener(EVENT, read); };
  }, []);
  return dest;
}
