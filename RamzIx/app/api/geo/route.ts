export const dynamic = "force-dynamic";

/* Кишвари харидор аз сарлавҳаи IP-и платформа (Vercel); дар компютери маҳаллӣ ё бе платформа холӣ */
export async function GET(req: Request) {
  const c = (req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? "").toUpperCase();
  return Response.json({ country: /^[A-Z]{2}$/.test(c) ? c : null }, { headers: { "Cache-Control": "private, no-store" } });
}
