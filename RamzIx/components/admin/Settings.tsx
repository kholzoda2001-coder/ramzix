"use client";

import { useRef, useState } from "react";
import { lock, changePin as changePinApi, useAdmin } from "@/lib/admin";
import { getDefaultMarkup, setDefaultMarkup } from "./settings-store";
import Pricing from "./Pricing";

type Admin = ReturnType<typeof useAdmin>;

export default function Settings({ admin, onLock }: { admin: Admin; onLock: () => void }) {
  const [markup, setMarkup] = useState(String(getDefaultMarkup()));
  const [pins, setPins] = useState({ old: "", next: "" });
  const [msg, setMsg] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const saveMarkup = () => {
    const v = parseFloat(markup.replace(",", "."));
    if (v > 0) { setDefaultMarkup(v); setMsg("Фоизи пешфарз нигоҳ дошта шуд"); }
  };
  const changePin = async () => {
    if (pins.next.length < 4) return setMsg("PIN камаш 4 рақам бошад");
    if (!(await changePinApi(pins.old, pins.next))) return setMsg("PIN-и кӯҳна нодуруст аст");
    setPins({ old: "", next: "" });
    setMsg("PIN иваз шуд");
  };
  const download = () => {
    const blob = new Blob([admin.exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ramzix-admin-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const upload = async (f?: File) => {
    if (!f) return;
    setMsg(admin.importJson(await f.text()) ? "Маълумот барқарор шуд" : "Файл нодуруст аст");
  };

  return (
    <>
      <Pricing />

      <section className="ad-card">
        <h3>Фоизи фоидаи пешфарз (POS)</h3>
        <div className="ad-grid2">
          <label><span>Фоида, %</span><input inputMode="decimal" value={markup} onChange={(e) => setMarkup(e.target.value)} /></label>
          <button className="ad-ghost" onClick={saveMarkup}>Нигоҳ доштан</button>
        </div>
      </section>

      <section className="ad-card">
        <h3>Нусхаи эҳтиётӣ</h3>
        <p className="ad-hint">Маҳсулот ва фармоишҳо дар база нигоҳ дошта мешаванд. Ин нусха барои эҳтиёт аст.</p>
        <div className="ad-actions">
          <button className="ad-ghost" onClick={download}>⬇ Боргирӣ (JSON)</button>
          <button className="ad-ghost" onClick={() => file.current?.click()}>⬆ Барқарор кардан</button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
      </section>

      <section className="ad-card">
        <h3>Иваз кардани PIN</h3>
        <div className="ad-grid2">
          <label><span>PIN-и ҳозира</span><input type="password" inputMode="numeric" value={pins.old} onChange={(e) => setPins({ ...pins, old: e.target.value })} /></label>
          <label><span>PIN-и нав</span><input type="password" inputMode="numeric" value={pins.next} onChange={(e) => setPins({ ...pins, next: e.target.value })} /></label>
        </div>
        <button className="ad-ghost" onClick={changePin}>Иваз кардан</button>
        <p className="ad-hint">PIN дар сервер санҷида мешавад ва дар база ҳеш карда нигоҳ дошта мешавад.</p>
      </section>

      {msg && <p className="ad-msg">{msg}</p>}
      <button className="ad-ghost red" onClick={() => { lock(); onLock(); }}>Баромадан</button>
    </>
  );
}
