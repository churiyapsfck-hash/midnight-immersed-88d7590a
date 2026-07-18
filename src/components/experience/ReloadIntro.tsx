import { useEffect, useState } from "react";

/**
 * Mobile-first 120 FPS intro:
 * - No framer-motion (avoids JS-driven per-frame work on the main thread)
 * - Animates only `opacity` (compositor-only, no layout / paint)
 * - No radial-gradient overlay (large-fill fragment cost on high-DPI mobile)
 * - Respects prefers-reduced-motion
 * - Unmounts intro after fade so it can't cost anything on subsequent frames
 */
export function ReloadIntro({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"in" | "out" | "done">("in");

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPhase("done");
      return;
    }
    const t1 = setTimeout(() => setPhase("out"), 2200);
    const t2 = setTimeout(() => setPhase("done"), 2200 + 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <>
      {phase !== "done" && (
        <div
          aria-hidden={phase === "out"}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black"
          style={{
            opacity: phase === "out" ? 0 : 1,
            transition: "opacity 400ms linear",
            willChange: "opacity",
            transform: "translateZ(0)",
            contain: "strict",
            pointerEvents: phase === "out" ? "none" : "auto",
          }}
        >
          <div
            className="font-[Anton] text-5xl tracking-tight text-white md:text-6xl"
            style={{ transform: "translateZ(0)" }}
          >
            ILLUMINATI <span style={{ color: "oklch(0.55 0.24 25)" }}>3.0</span>
          </div>
        </div>
      )}
      <div
        style={{
          opacity: phase === "in" ? 0 : 1,
          transition: "opacity 300ms linear",
          willChange: phase === "done" ? "auto" : "opacity",
        }}
      >
        {children}
      </div>
    </>
  );
}