import { useEffect, useRef, useState } from "react";

export function CustomCursor({ delay = 9800 }: { delay?: number } = {}) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait (by default for the opening sequence) before showing the custom cursor.
    const t = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!ready) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let hovering = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, [data-cursor='hover'], input, textarea, select");
      hovering = !!interactive;
      ring.dataset.hover = hovering ? "true" : "false";
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      const scale = hovering ? 2.2 : 1;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="lovable-cursor pointer-events-none fixed left-0 top-0 z-[9999] h-10 w-10 rounded-full border border-white/40 mix-blend-difference transition-[border-color,background-color] duration-200 data-[hover=true]:border-[oklch(0.6_0.22_25)] data-[hover=true]:bg-[oklch(0.6_0.22_25/0.15)]"
        style={{ willChange: "transform" }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="lovable-cursor pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
        style={{ willChange: "transform" }}
      />
    </>
  );
}