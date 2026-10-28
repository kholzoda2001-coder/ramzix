"use client";

/* Фоизи фоидаи пешфарз барои POS (дар дастгоҳ нигоҳ дошта мешавад) */
const KEY = "ramzix-admin-markup";
export const getDefaultMarkup = (): number => {
  try { const v = Number(localStorage.getItem(KEY)); return Number.isFinite(v) && v > 0 ? v : 5; } catch { return 5; }
};
export const setDefaultMarkup = (v: number) => { try { localStorage.setItem(KEY, String(v)); } catch {} };
