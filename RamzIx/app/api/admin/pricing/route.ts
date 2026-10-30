import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { mergePricing } from "@/lib/pricing-config";
import { isAdmin } from "@/lib/server/auth";
import { sb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/* Захираи танзимоти нарх аз admin. Маълумот дар сервер аз нав тоза карда мешавад. */
export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "auth" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const pricing = mergePricing(body);
  try {
    await sb("admin_settings?on_conflict=key", { method: "POST", body: { key: "pricing", value: pricing }, prefer: "resolution=merge-duplicates,return=minimal" });
    revalidateTag("pricing", { expire: 0 });
    return Response.json({ ok: true, pricing });
  } catch { return Response.json({ error: "db" }, { status: 503 }); }
}
