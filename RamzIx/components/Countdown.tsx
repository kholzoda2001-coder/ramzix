"use client";

import { useEffect, useState } from "react";

/* Ҳисобкунаки баръакс то нисфи шаб */
export default function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      setLeft(Math.floor((end.getTime() - now.getTime()) / 1000));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  const s = left ?? 0;
  return (
    <span className="countdown" suppressHydrationWarning>
      <b>{pad(Math.floor(s / 3600))}</b>:<b>{pad(Math.floor((s % 3600) / 60))}</b>:<b>{pad(s % 60)}</b>
    </span>
  );
}
