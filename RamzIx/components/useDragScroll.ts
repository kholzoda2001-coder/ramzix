"use client";

import { useEffect, type RefObject } from "react";

/**
  Дар компютер ба муш имкони кашида гузаштанро медиҳад (дар телефон бо ангушт худаш кор мекунад).
  Пешфарз: баъди раҳо кардан ба наздиктарин слайд мечаспад.
  free: бе часпидан — бо суръати даст ҳамвор идома меёбад ва оҳиста меистад (инерсия).
  Пайванд дар слайд пас аз кашидан намекушояд.
*/
export default function useDragScroll(ref: RefObject<HTMLElement | null>, opts: { free?: boolean } = {}) {
  const free = !!opts.free;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let down = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0; // px/ms
    let raf = 0;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      cancelAnimationFrame(raf);
      down = true;
      moved = false;
      startX = lastX = e.clientX;
      lastT = performance.now();
      vel = 0;
      startLeft = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        el.classList.add("dragging");
      }
      if (!moved) return;
      el.scrollLeft = startLeft - dx;
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) vel = 0.8 * ((lastX - e.clientX) / dt) + 0.2 * vel;
      lastX = e.clientX;
      lastT = now;
    };
    const glide = () => {
      let prev = performance.now();
      const step = (now: number) => {
        const dt = Math.min(32, now - prev);
        prev = now;
        el.scrollLeft += vel * dt;
        vel *= Math.pow(0.95, dt / 16);
        const atEdge = el.scrollLeft <= 0 || el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
        if (Math.abs(vel) > 0.02 && !atEdge) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (!moved) return;
      el.classList.remove("dragging");
      if (free) {
        // Агар даст пеш аз раҳо кардан истода бошад — инерсия нест
        if (performance.now() - lastT > 80) vel = 0;
        glide();
        return;
      }
      const w = el.clientWidth;
      el.scrollTo({ left: Math.round(el.scrollLeft / w) * w, behavior: "smooth" });
    };
    // Пас аз кашидан клик набояд пайвандро кушояд
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    const noDrag = (e: Event) => e.preventDefault();

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", noDrag);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", noDrag);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [ref, free]);
}
