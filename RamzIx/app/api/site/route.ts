import { loadSite } from "@/lib/server/site";

export const dynamic = "force-dynamic";

/* Мундариҷаи ошкори сайт (баннерҳо ва нишонҳо) — барои нав кардани саҳифа баъди тағйироти admin */
export async function GET() {
  return Response.json(await loadSite());
}
