import { COUNTRIES, fmtQty, unitOf } from "./catalog";
import { priceOrder } from "./pricing";

export type Buyer = { name: string; phone: string; address: string };

type Fmt = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  price: (tjs: number) => string;
  sum: (tjs: number) => string;
  label: string;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Матни дархост барои менеҷер (WhatsApp) */
export function buildOrderMessage(order: ReturnType<typeof priceOrder>, buyer: Buyer, id: string, { t, price, sum, label }: Fmt) {
  const rows: string[] = [`${t("Дархости нав аз RamzIx")} ${id}`, ""];
  rows.push(
    `${t("Харидор")}: ${buyer.name}`,
    `${t("Телефон")}: ${buyer.phone}`,
    `${t("Суроғаи пурра")}: ${buyer.address}`,
    "",
  );
  let n = 1;
  for (const g of order.groups) {
    rows.push(`📦 ${t(COUNTRIES[g.country].name)}:`);
    for (const l of g.lines) {
      rows.push(`${n++}) ${t(l.p.name)}${l.color ? `, ${t(l.color)}` : ""}${l.size ? `, ${l.size}` : ""} — ${fmtQty(l.qty)} ${t(unitOf(l.p))} × ${price(l.unit)} = ${sum(l.goods)} ${label}`);
    }
    rows.push(`   ${t("Расонидан")} (${t(g.shipping.mode.label)}, ${fmtQty(round2(g.kg))} ${t("кг")}): ${g.shipping.tjs > 0 ? sum(g.shipping.tjs) + " " + label : t("бо тасдиқ")}`, "");
  }
  rows.push(
    `${t("Нархи мол")}: ${sum(order.listGoods)} ${label}`,
    ...(order.discount > 0 ? [`${t("Тахфиф")} (−${order.discountPct}%): −${sum(order.discount)} ${label}`] : []),
    `${t("Расонидан")}: ${sum(order.shipping)} ${label}`,
    `${t("Ҷамъ")}: ${sum(order.total)} ${label}`,
  );
  return rows.join("\n");
}
