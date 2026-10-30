import type { NextRequest } from "next/server";
import { dbReady } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const MAX = 1_500_000; // 1,5 МБ: клиент аксро пеш аз фиристодан хурд мекунад
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/* Ҳадди оддии такрор: як IP дар як соат то 12 акс (дар хотираи сервер) */
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 3_600_000) { hits.set(ip, { n: 1, t: now }); return false; }
  h.n++;
  return h.n > 12;
}

/* Акси дархости харидор → Supabase Storage (bucket «requests»). Калиди сервер дар браузер намеравад. */
export async function POST(req: NextRequest) {
  if (!dbReady()) return Response.json({ error: "db" }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return Response.json({ error: "limit" }, { status: 429 });
  const type = (req.headers.get("content-type") ?? "").split(";")[0].trim();
  const ext = TYPES[type];
  if (!ext) return Response.json({ error: "type" }, { status: 415 });
  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length < 100 || buf.length > MAX) return Response.json({ error: "size" }, { status: 413 });
  const name = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  try {
    const r = await fetch(`${URL_}/storage/v1/object/requests/${name}`, {
      method: "POST",
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": type, "x-upsert": "false" },
      body: buf,
    });
    if (!r.ok) return Response.json({ error: "db" }, { status: 503 });
    return Response.json({ url: `${URL_}/storage/v1/object/public/requests/${name}` });
  } catch { return Response.json({ error: "db" }, { status: 503 }); }
}
