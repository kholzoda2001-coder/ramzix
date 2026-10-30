import { loadPricing } from "@/lib/server/pricing";

export const dynamic = "force-dynamic";

/* Танзимоти ошкори нарх (қурб, зинаҳои фоида, расонидан) — барои нав кардани саҳифа баъди тағйироти admin */
export async function GET() {
  return Response.json(await loadPricing());
}
