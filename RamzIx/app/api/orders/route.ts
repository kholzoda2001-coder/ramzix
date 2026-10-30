import type { NextRequest } from "next/server";
import { clean } from "@/lib/admin-core";
import { orderToRow, sb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/* Чекаути сайт: ҳар кас метавонад танҳо фармоиши НАВ илова кунад (type=request, status=new, бе пардохт). */
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 3_600_000) { hits.set(ip, { n: 1, t: now }); return false; }
  h.n++;
  return h.n > 20;
}

export async function POST(req: NextRequest) {
  if (limited(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local")) return Response.json({ error: "limit" }, { status: 429 });
  const raw = await req.text();
  if (raw.length > 100_000) return Response.json({ error: "big" }, { status: 413 });
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return Response.json({ error: "json" }, { status: 400 }); }
  // Аксҳо танҳо аз bucket-и худамон қабул мешаванд
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/requests/`;
  if (Array.isArray(body.items)) body.items = (body.items as Record<string, unknown>[]).map((i) => ({ ...i, images: Array.isArray(i.images) ? (i.images as unknown[]).filter((u) => typeof u === "string" && u.startsWith(base)) : undefined }));
  const [o] = clean({ orders: [{ ...body, type: "request", status: "new", payments: [], note: "", date: new Date().toISOString() }] }).orders;
  if (!o || !o.code || !o.items.length || o.items.length > 100) return Response.json({ error: "invalid" }, { status: 400 });
  try {
    await sb("orders?on_conflict=code", { method: "POST", body: [orderToRow(o)], prefer: "resolution=ignore-duplicates,return=minimal" });
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "db" }, { status: 503 }); }
}
