import { rowToProduct, sb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/* Каталоги ошкор: танҳо маҳсулоти фаъол; ёддошт ва фоидаи дохилӣ намеравад */
export async function GET() {
  try {
    const rows = await sb<Record<string, unknown>[]>("products?select=*&active=eq.true&cost=gt.0&order=created_at.desc&limit=5000");
    return Response.json({ products: rows.map(rowToProduct).map((p) => ({ ...p, note: "", markupPct: 0 })) });
  } catch { return Response.json({ products: [] }); }
}
