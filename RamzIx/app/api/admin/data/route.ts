import { isAdmin } from "@/lib/server/auth";
import { rowToOrder, rowToProduct, sb } from "@/lib/server/db";

export const dynamic = "force-dynamic";
const LIMIT = 5000;

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "auth" }, { status: 401 });
  try {
    const [p, o] = await Promise.all([
      sb<Record<string, unknown>[]>(`products?select=*&order=created_at.desc&limit=${LIMIT}`),
      sb<Record<string, unknown>[]>(`orders?select=*&order=date.desc&limit=${LIMIT}`),
    ]);
    const orders = o.map(rowToOrder);
    return Response.json({ products: p.map(rowToProduct), orders, seq: orders.length });
  } catch { return Response.json({ error: "db" }, { status: 503 }); }
}
