import type { NextRequest } from "next/server";
import { clean } from "@/lib/admin-core";
import { orderToRow, sb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/* Чекаути сайт: ҳар кас метавонад танҳо фармоиши НАВ илова кунад (type=request, status=new, бе пардохт). */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > 100_000) return Response.json({ error: "big" }, { status: 413 });
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return Response.json({ error: "json" }, { status: 400 }); }
  const [o] = clean({ orders: [{ ...body, type: "request", status: "new", payments: [], note: "", date: new Date().toISOString() }] }).orders;
  if (!o || !o.code || !o.items.length || o.items.length > 100) return Response.json({ error: "invalid" }, { status: 400 });
  try {
    await sb("orders?on_conflict=code", { method: "POST", body: [orderToRow(o)], prefer: "resolution=ignore-duplicates,return=minimal" });
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "db" }, { status: 503 }); }
}
