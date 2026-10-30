import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { mergeSite } from "@/lib/site-config";
import { isAdmin } from "@/lib/server/auth";
import { sb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/* Захираи мундариҷаи сайт аз admin. Маълумот дар сервер аз нав тоза карда мешавад. */
export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "auth" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const site = mergeSite(body);
  try {
    await sb("admin_settings?on_conflict=key", { method: "POST", body: { key: "site", value: site }, prefer: "resolution=merge-duplicates,return=minimal" });
    revalidateTag("site", { expire: 0 });
    return Response.json({ ok: true, site });
  } catch { return Response.json({ error: "db" }, { status: 503 }); }
}
