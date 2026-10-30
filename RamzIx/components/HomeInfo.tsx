"use client";

import Icon from "./Icon";
import { T, useT } from "./Lang";
import { useText } from "@/lib/useSite";
import { useSite } from "@/lib/useSite";

/* Қисмҳои матнии саҳифаи асосӣ: ваъдаҳо, қадамҳо ва усулҳои пардохт. Матнҳо аз admin (Сайт → Матнҳо) меоянд */
const TRUST_ICONS = ["card", "home", "doc", "headset"];
const STEP_ICONS = ["search", "doc", "card", "truck"];

export function TrustRow() {
  const tx = useText();
  return (
    <section className="trust-row">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="trust">
          <span className="trust-ic"><Icon name={TRUST_ICONS[n - 1]} size={20} /></span>
          <div><b>{tx(`trust${n}Title`)}</b><span>{tx(`trust${n}Text`)}</span></div>
        </div>
      ))}
    </section>
  );
}

export function HowSteps() {
  const tx = useText();
  return (
    <section className="block">
      <div className="sec-head"><h2><T>Чӣ тавр кор мекунем</T></h2></div>
      <div className="steps">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="step">
            <span className="step-ic"><Icon name={STEP_ICONS[n - 1]} size={20} /><i>{n}</i></span>
            <b>{tx(`step${n}Title`)}</b>
            <span>{tx(`step${n}Text`)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PayList() {
  const { texts } = useSite();
  const { t } = useT();
  return (
    <div className="pay">
      {texts.payments.split(",").map((x) => x.trim()).filter(Boolean).map((x) => <span key={x}>{t(x)}</span>)}
    </div>
  );
}
