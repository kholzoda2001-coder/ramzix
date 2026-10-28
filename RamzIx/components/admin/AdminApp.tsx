"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasPin, isUnlocked, lock, setPin, unlock, useAdmin } from "@/lib/admin";
import Icon from "../Icon";
import Dashboard from "./Dashboard";
import OrderForm from "./OrderForm";
import Orders from "./Orders";
import Products from "./Products";
import Settings from "./Settings";
import { useFx } from "./fx";
import { CURRENCIES } from "@/lib/currency";

type Tab = "dash" | "pos" | "orders" | "products" | "settings";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "dash", label: "Дашборд", icon: "grid" },
  { id: "pos", label: "POS", icon: "plus" },
  { id: "orders", label: "Фармоишҳо", icon: "doc" },
  { id: "products", label: "Маҳсулот", icon: "box" },
  { id: "settings", label: "Танзимот", icon: "shield" },
];

export default function AdminApp() {
  const [gate, setGate] = useState<"loading" | "set" | "locked" | "open">("loading");
  useEffect(() => { setGate(isUnlocked() ? "open" : hasPin() ? "locked" : "set"); }, []);

  if (gate === "loading") return <div className="ad-gate" />;
  if (gate !== "open") return <Gate mode={gate} onOpen={() => setGate("open")} />;
  return <Panel onLock={() => { lock(); setGate("locked"); }} />;
}

function Gate({ mode, onOpen }: { mode: "set" | "locked"; onOpen: () => void }) {
  const [pin, setP] = useState("");
  const [pin2, setP2] = useState("");
  const [err, setErr] = useState("");
  const submit = async () => {
    if (mode === "set") {
      if (pin.length < 4) return setErr("PIN камаш 4 рақам бошад");
      if (pin !== pin2) return setErr("PIN-ҳо як хел нестанд");
      await setPin(pin);
      onOpen();
    } else if (await unlock(pin)) onOpen();
    else setErr("PIN нодуруст аст");
  };
  return (
    <div className="ad-gate">
      <span className="ad-gate-ic"><Icon name="shield" size={32} /></span>
      <h1>RamzIx Админ</h1>
      <p>{mode === "set" ? "Аввал PIN-и худро таъин кунед (камаш 4 рақам)" : "PIN-ро ворид кунед"}</p>
      <input type="password" inputMode="numeric" autoFocus placeholder="PIN" value={pin} onChange={(e) => { setP(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && mode === "locked" && submit()} />
      {mode === "set" && <input type="password" inputMode="numeric" placeholder="PIN-ро такрор кунед" value={pin2} onChange={(e) => { setP2(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && submit()} />}
      {err && <em>{err}</em>}
      <button className="ad-primary" onClick={submit}>{mode === "set" ? "Таъин кардан" : "Даромадан"}</button>
      <Link href="/" className="ad-back">← Ба сайт</Link>
    </div>
  );
}

function Panel({ onLock }: { onLock: () => void }) {
  const admin = useAdmin();
  const fx = useFx();
  const [tab, setTab] = useState<Tab>("dash");
  const [openId, setOpenId] = useState<string | null>(null);
  const go = (t: Tab) => { setTab(t); setOpenId(null); window.scrollTo(0, 0); };
  const open = (id: string | null) => { setTab("orders"); setOpenId(id); };

  return (
    <>
      <header className="ad-top">
        <h1>{TABS.find((x) => x.id === tab)?.label}</h1>
        <div className="ad-cur" role="group" aria-label="Асъор">
          {CURRENCIES.map((c) => <button key={c.id} className={fx.cur === c.id ? "on" : ""} onClick={() => fx.setCur(c.id)} aria-label={c.id}>{c.label}</button>)}
        </div>
        <Link href="/" className="ad-site">Сайт ↗</Link>
        <button onClick={onLock} aria-label="Қулф" className="ad-lock"><Icon name="shield" size={18} /></button>
      </header>
      <main className="ad-main">
        {tab === "dash" && <Dashboard admin={admin} onOpen={open} />}
        {tab === "pos" && <OrderForm key={"new-" + fx.cur} onDone={(id) => open(id)} />}
        {tab === "orders" && <Orders admin={admin} openId={openId} onOpen={setOpenId} />}
        {tab === "products" && <Products admin={admin} />}
        {tab === "settings" && <Settings admin={admin} onLock={onLock} />}
      </main>
      <nav className="ad-nav">
        {TABS.map((x) => (
          <button key={x.id} className={`${tab === x.id ? "on" : ""} ${x.id === "pos" ? "pos" : ""}`} onClick={() => go(x.id)}>
            <span><Icon name={x.icon} size={x.id === "pos" ? 22 : 21} stroke={x.id === "pos" ? 2.6 : 2} /></span>{x.label}
          </button>
        ))}
      </nav>
    </>
  );
}
