import type { AdminProduct, Order } from "../admin-core";

/* Пайвастшавӣ ба Supabase (PostgREST) бо калиди service_role — ТАНҲО дар сервер. */
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const dbReady = () => !!URL_ && !!KEY;

export async function sb<T = unknown>(path: string, init: { method?: string; body?: unknown; prefer?: string } = {}): Promise<T> {
  const r = await fetch(`${URL_}/rest/v1/${path}`, {
    method: init.method ?? "GET",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...(init.prefer ? { Prefer: init.prefer } : {}) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`db ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const t = await r.text();
  return (t ? JSON.parse(t) : null) as T;
}

type Row = Record<string, unknown>;

export const productToRow = (p: AdminProduct): Row => ({
  id: p.id, slug: p.slug, name: p.name, subtitle: p.subtitle, brand: p.brand, category: p.category, country: p.country,
  cost: p.cost, cost_currency: p.costCurrency, weight_kg: p.weightKg, volume_m3: p.volumeM3, images: p.images, description: p.description,
  sizes: p.sizes, unit: p.unit, per: p.per, per_label: p.perLabel, min: p.min, step: p.step, markup_pct: p.markupPct, active: p.active, note: p.note, extra: p.extra ?? {},
  updated_at: new Date().toISOString(),
});
export const rowToProduct = (r: Row): AdminProduct => ({
  id: String(r.id), slug: String(r.slug), name: String(r.name), subtitle: String(r.subtitle ?? ""), brand: String(r.brand ?? ""), category: String(r.category),
  country: r.country as AdminProduct["country"], cost: Number(r.cost), costCurrency: r.cost_currency as AdminProduct["costCurrency"],
  weightKg: Number(r.weight_kg), volumeM3: Number(r.volume_m3), images: (r.images as string[]) ?? [], description: String(r.description ?? ""),
  sizes: (r.sizes as string[]) ?? [], unit: String(r.unit), per: Number(r.per), perLabel: String(r.per_label ?? ""), min: Number(r.min), step: Number(r.step),
  markupPct: Number(r.markup_pct), active: !!r.active, note: String(r.note ?? ""),
  extra: (r.extra as AdminProduct["extra"]) ?? undefined,
});

export const orderToRow = (o: Order): Row => ({
  id: o.id, code: o.code, type: o.type, date: o.date || new Date().toISOString(), customer: o.customer, items: o.items,
  shipping_charged: o.shippingCharged, shipping_cost: o.shippingCost, route_key: o.routeKey ?? null, status: o.status, payments: o.payments, note: o.note,
  updated_at: new Date().toISOString(),
});
export const rowToOrder = (r: Row): Order => ({
  id: String(r.id), code: String(r.code), type: r.type as Order["type"], date: String(r.date), customer: r.customer as Order["customer"],
  items: (r.items as Order["items"]) ?? [], shippingCharged: Number(r.shipping_charged), shippingCost: Number(r.shipping_cost),
  routeKey: (r.route_key as string | null) ?? undefined, status: r.status as Order["status"], payments: (r.payments as Order["payments"]) ?? [], note: String(r.note ?? ""),
});
