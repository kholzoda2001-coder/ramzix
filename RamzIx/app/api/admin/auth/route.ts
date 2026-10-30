import type { NextRequest } from "next/server";
import { checkPin, clearFails, clearTries, endSession, getPin, isAdmin, loginBlocked, recordFail, savePin, startSession, tooMany } from "@/lib/server/auth";
import { dbReady } from "@/lib/server/db";

export const dynamic = "force-dynamic";
const ipOf = (r: NextRequest) => r.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function GET() {
  if (!dbReady()) return fail("db", 503);
  try {
    if (await isAdmin()) return Response.json({ state: "open" });
    return Response.json({ state: (await getPin()) ? "locked" : "set" });
  } catch { return fail("db", 503); }
}

export async function POST(req: NextRequest) {
  if (!dbReady()) return fail("db", 503);
  const b = (await req.json().catch(() => ({}))) as { action?: string; pin?: string; old?: string };
  const pin = typeof b.pin === "string" ? b.pin : "";
  try {
    const rec = await getPin();
    switch (b.action) {
      case "setup": // танҳо вақте PIN ҳанӯз таъин нашудааст
        if (rec) return fail("exists", 403);
        if (pin.length < 6 || pin.length > 64) return fail("short");
        await savePin(pin); await startSession();
        return Response.json({ ok: true });
      case "login": {
        const ip = ipOf(req);
        if (tooMany(ip) || (await loginBlocked())) return fail("too-many", 429);
        if (!rec || !checkPin(pin, rec)) { await recordFail(); return fail("bad-pin", 401); }
        clearTries(ip); await clearFails(); await startSession();
        return Response.json({ ok: true });
      }
      case "change":
        if (!(await isAdmin()) || !rec || !checkPin(String(b.old ?? ""), rec)) return fail("bad-pin", 401);
        if (pin.length < 6 || pin.length > 64) return fail("short");
        await savePin(pin);
        return Response.json({ ok: true });
      case "logout":
        await endSession();
        return Response.json({ ok: true });
      default: return fail("action");
    }
  } catch { return fail("db", 503); }
}
