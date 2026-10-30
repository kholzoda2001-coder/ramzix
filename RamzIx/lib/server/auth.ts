import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { sb } from "./db";

/* PIN-и admin дар сервер (admin_settings.pin = {salt, hash}); сессия — cookie-и имзошудаи httpOnly. */
const COOKIE = "rx_admin";
const TTL = 12 * 3600; // сония
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const hash = (pin: string, salt: string) => scryptSync(pin, salt, 32).toString("hex");
const sign = (exp: number) => createHmac("sha256", SECRET).update(`admin.${exp}`).digest("hex");
const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

type PinRec = { salt: string; hash: string };
export async function getPin(): Promise<PinRec | null> {
  const rows = await sb<{ value: PinRec }[]>("admin_settings?key=eq.pin&select=value");
  return rows[0]?.value ?? null;
}
export async function savePin(pin: string) {
  const salt = randomBytes(16).toString("hex");
  await sb("admin_settings?on_conflict=key", { method: "POST", body: { key: "pin", value: { salt, hash: hash(pin, salt) } }, prefer: "resolution=merge-duplicates,return=minimal" });
}
export const checkPin = (pin: string, rec: PinRec) => same(hash(pin, rec.salt), rec.hash);

export async function startSession() {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: TTL });
}
export async function endSession() { (await cookies()).delete(COOKIE); }
export async function isAdmin(): Promise<boolean> {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v || !SECRET) return false;
  const [e, sig] = v.split(".");
  const exp = Number(e);
  return Number.isFinite(exp) && exp > Date.now() / 1000 && !!sig && same(sig, sign(exp));
}

/* Ҳифз аз ҳадси PIN: ҳадди 8 кӯшиш дар 10 дақиқа барои ҳар IP */
const tries = new Map<string, { n: number; t: number }>();
export function tooMany(ip: string): boolean {
  const now = Date.now(), r = tries.get(ip);
  if (!r || now - r.t > 600_000) { tries.set(ip, { n: 1, t: now }); return false; }
  r.n++; return r.n > 8;
}
export const clearTries = (ip: string) => tries.delete(ip);

/* Қуфли умумӣ дар база (admin_settings.pin_tries): баъди 8 кӯшиши нодуруст воридшавӣ 10 дақиқа баста мешавад,
   новобаста аз IP ва сервер — чунин ҳадси PIN-ро дар Vercel (бисёр серверҳо) ҳам манъ мекунад. */
type Tries = { n: number; t: number };
const WINDOW = 600_000, LIMIT = 8;
const readTries = async (): Promise<Tries | null> => (await sb<{ value: Tries }[]>("admin_settings?key=eq.pin_tries&select=value"))[0]?.value ?? null;
export async function loginBlocked(): Promise<boolean> {
  const r = await readTries();
  return !!r && Date.now() - r.t <= WINDOW && r.n >= LIMIT;
}
export async function recordFail() {
  const r = await readTries();
  const fresh = r && Date.now() - r.t <= WINDOW;
  const value: Tries = { n: fresh ? r.n + 1 : 1, t: fresh ? r.t : Date.now() };
  await sb("admin_settings?on_conflict=key", { method: "POST", body: { key: "pin_tries", value }, prefer: "resolution=merge-duplicates,return=minimal" });
}
export async function clearFails() { await sb("admin_settings?key=eq.pin_tries", { method: "DELETE" }); }
