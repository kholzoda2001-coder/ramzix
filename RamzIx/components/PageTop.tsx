"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartBadge } from "./Cart";
import Icon from "./Icon";
import { useT, T } from "./Lang";

export default function PageTop({ title, sub }: { title: string; sub?: string }) {
  const { t } = useT();
  const router = useRouter();
  return (
    <header className="cart-top">
      <button className="ic-round" onClick={() => (history.length > 1 ? router.back() : router.push("/"))} aria-label={t("Бозгашт")}>
        <Icon name="back" stroke={2.2} />
      </button>
      <h1>{t(title)}{sub && <small>{sub}</small>}</h1>
      <Link href="/catalog" className="ic-round" aria-label={t("Ҷустуҷӯ")}><Icon name="search" size={20} /></Link>
      <Link href="/cart" className="ic-round" aria-label={t("Сабад")}><Icon name="cart" size={21} /><CartBadge /></Link>
    </header>
  );
}
