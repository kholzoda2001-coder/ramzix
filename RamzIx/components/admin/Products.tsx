"use client";

import { useState } from "react";
import { useAdmin, type AdminProduct } from "@/lib/admin";
import { products as catalog } from "@/lib/catalog";
import { Sheet, money } from "./ui";
import { getDefaultMarkup } from "./settings-store";

type Admin = ReturnType<typeof useAdmin>;
const n = (s: string) => (Number.isFinite(parseFloat(s.replace(",", "."))) ? parseFloat(s.replace(",", ".")) : 0);

export default function Products({ admin }: { admin: Admin }) {
  const [edit, setEdit] = useState<AdminProduct | "new" | null>(null);
  const [form, setForm] = useState({ name: "", unit: "дона", unitCost: "", markup: "", note: "" });
  const [err, setErr] = useState("");

  const start = (p: AdminProduct | "new") => {
    setErr("");
    setForm(p === "new" ? { name: "", unit: "дона", unitCost: "", markup: String(getDefaultMarkup()), note: "" } : { name: p.name, unit: p.unit, unitCost: String(p.unitCost), markup: String(p.markupPct), note: p.note });
    setEdit(p);
  };
  const save = () => {
    if (form.name.trim().length < 2) return setErr("Номи маҳсулотро нависед");
    admin.saveProduct({ id: edit && edit !== "new" ? edit.id : undefined, name: form.name.trim(), unit: form.unit.trim() || "дона", unitCost: n(form.unitCost), markupPct: n(form.markup), note: form.note.trim() });
    setEdit(null);
  };

  return (
    <>
      <button className="ad-primary" onClick={() => start("new")}>+ Маҳсулоти нав</button>
      <p className="ad-hint">Маҳсулоти худи шумо барои POS: ном, воҳид, нархи харид ва фоиз. Ҳангоми сабти фармоиш худ пур мешавад.</p>

      {admin.products.length === 0 ? <p className="ad-empty">Ҳоло маҳсулот нест</p> : (
        <div className="ad-list">
          {admin.products.map((p) => (
            <button className="ad-order slim" key={p.id} onClick={() => start(p)}>
              <div className="ao-top"><b>{p.name}</b></div>
              <div className="ao-money"><span>Харид: <b>{money(p.unitCost)}</b>/{p.unit}</span><span>Фоида: <b>{p.markupPct}%</b></span><span className="g">Фурӯш: <b>{money(p.unitCost * (1 + p.markupPct / 100))}</b></span></div>
              {p.note && <small className="ao-date">{p.note}</small>}
            </button>
          ))}
        </div>
      )}

      <section className="ad-card">
        <h3>Каталоги сайт</h3>
        <p className="ad-hint">{catalog.length} маҳсулот дар сайт ҳаст ва ҳангоми POS ном ва нархи харид аз он пешниҳод мешавад (ном нависед).</p>
      </section>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit === "new" ? "Маҳсулоти нав" : "Таҳрири маҳсулот"}>
        <div className="ad-form">
          <label><span>Ном *</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <div className="ad-grid3">
            <label><span>Воҳид</span><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></label>
            <label><span>Харид, смн</span><input inputMode="decimal" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} /></label>
            <label><span>Фоида %</span><input inputMode="decimal" value={form.markup} onChange={(e) => setForm({ ...form, markup: e.target.value })} /></label>
          </div>
          {n(form.unitCost) > 0 && <p className="ad-calc"><span className="g">Нархи фурӯш: <b>{money(n(form.unitCost) * (1 + n(form.markup) / 100))} смн</b> / {form.unit}</span></p>}
          <label><span>Эзоҳ</span><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
          {err && <p className="ad-err">{err}</p>}
          <button className="ad-primary" onClick={save}>Нигоҳ доштан</button>
          {edit && edit !== "new" && <button className="ad-ghost red" onClick={() => { admin.deleteProduct(edit.id); setEdit(null); }}>Нест кардан</button>}
        </div>
      </Sheet>
    </>
  );
}
