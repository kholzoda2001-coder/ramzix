import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { clean } from "@/lib/admin-core";
import { isAdmin } from "@/lib/server/auth";
import { orderToRow, productToRow, sb } from "@/lib/server/db";

export const dynamic = "force-dynamic";
type Part = { upsert?: unknown[]; remove?: unknown[] };
const ids = (a?: unknown[]) => (Array.isArray(a) ? a.filter((x): x is string => typeof x === "string" && /^[\w-]{1,40}$/.test(x)) : []);

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "auth" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { products?: Part; orders?: Part };
  // Ҳамон тозакунӣ/санҷиши маълумот, ки дар клиент буд
  const c = clean({ products: b.products?.upsert ?? [], orders: b.orders?.upsert ?? [] });
  const merge = "resolution=merge-duplicates,return=minimal";
  try {
    if (c.products.length) await sb("products?on_conflict=id", { method: "POST", body: c.products.map(productToRow), prefer: merge });
    if (c.orders.length) await sb("orders?on_conflict=id", { method: "POST", body: c.orders.map(orderToRow), prefer: merge });
    const dp = ids(b.products?.remove), dord = ids(b.orders?.remove);
    if (dp.length) await sb(`products?id=in.(${dp.join(",")})`, { method: "DELETE" });
    if (dord.length) await sb(`orders?id=in.(${dord.join(",")})`, { method: "DELETE" });
    // Каталоги сайт фавран нав мешавад (маҳсулоти нав дарҳол кушода мешавад, на баъд аз 30 сония)
    if (c.products.length || dp.length) revalidateTag("catalog", { expire: 0 });
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "db" }, { status: 503 }); }
}
