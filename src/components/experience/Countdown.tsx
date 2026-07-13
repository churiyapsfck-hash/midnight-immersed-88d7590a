import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * MECHANICAL COUNTDOWN
 * ────────────────────────────────────────────────────────────
 * Each digit is a physical sculpture built from horizontal metal
 * plates. On value change the plates fold/slide out from the center
 * with staggered inertia, revealing the next digit assembling from
 * the outside in — as if the number were being machined in real time.
 */

const DIGIT_SHAPES = [
  // rows: 5 tall × 3 wide, 1 = filled plate segment
  [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
  [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
] as const;

function DigitSculpture({ value }: { value: number }) {
  const shape = DIGIT_SHAPES[value] ?? DIGIT_SHAPES[0];
  return (
    <div className="relative grid grid-cols-3 grid-rows-5 gap-[3px] p-1.5 md:gap-[4px] md:p-2" style={{ width: "100%", height: "100%" }}>
      {shape.flatMap((row, y) =>
        row.map((cell, x) => {
          const key = `${value}-${y}-${x}`;
          const delay = (y * 3 + x) * 0.018;
          const fromX = (x - 1) * 40; // slide in horizontally
          return (
            <motion.span
              key={key}
              initial={{ opacity: 0, x: fromX, rotateY: 90, filter: "blur(6px)" }}
              animate={{ opacity: cell ? 1 : 0, x: 0, rotateY: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -fromX, rotateY: -90, filter: "blur(4px)" }}
              transition={{
                delay,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative"
              style={{
                background: cell
                  ? "linear-gradient(180deg, #f4f4f6 0%, #b8b8bc 30%, #4a4a4e 55%, #d0d0d4 78%, #2a2a2e 100%)"
                  : "transparent",
                boxShadow: cell
                  ? "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.6), 0 6px 12px rgba(0,0,0,0.7), 0 0 18px rgba(220,20,40,0.18)"
                  : "none",
                borderRadius: "1px",
                transformStyle: "preserve-3d",
              }}
            >
              {cell ? (
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)",
                    mixBlendMode: "overlay",
                    opacity: 0.4,
                  }}
                />
              ) : null}
            </motion.span>
          );
        }),
      )}
    </div>
  );
}

function Pillar({ digit, label }: { digit: number; label: string }) {
  const tens = Math.floor(digit / 10);
  const ones = digit % 10;
  const digits = useMemo(() => [tens, ones], [tens, ones]);

  return (
    <div className="group relative flex flex-col items-center">
      <div
        className="relative flex items-stretch overflow-hidden rounded-[3px] border border-white/10"
        style={{
          background:
            "linear-gradient(180deg, #0e0e0f 0%, #050506 50%, #0a0a0b 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.8), 0 40px 60px -20px rgba(0,0,0,0.9), 0 0 60px rgba(180,20,40,0.08)",
        }}
      >
        {/* Machined bezels */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="pointer-events-none absolute inset-y-2 left-0 w-px bg-gradient-to-b from-white/20 via-white/5 to-white/20" />
        <span className="pointer-events-none absolute inset-y-2 right-0 w-px bg-gradient-to-b from-white/20 via-white/5 to-white/20" />

        {/* Blood core glow */}
        <span
          className="pointer-events-none absolute inset-4 blur-2xl"
          style={{ background: "radial-gradient(ellipse at center, rgba(220,20,40,0.35), transparent 70%)" }}
        />

        {digits.map((d, i) => (
          <div
            key={i}
            className="relative flex items-center justify-center"
            style={{
              width: "clamp(3rem, 8.5vw, 6.2rem)",
              height: "clamp(5rem, 14vw, 10rem)",
              perspective: "800px",
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={d}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DigitSculpture value={d} />
              </motion.div>
            </AnimatePresence>
            {/* Vertical seam separating the two digits */}
            {i === 0 && (
              <span className="pointer-events-none absolute right-0 top-2 bottom-2 w-px bg-gradient-to-b from-white/5 via-white/20 to-white/5" />
            )}
            {/* Center red scan line */}
            <span
              className="pointer-events-none absolute inset-x-1 top-1/2 h-px -translate-y-1/2 opacity-40"
              style={{ background: "#e01822", boxShadow: "0 0 10px #e01822" }}
            />
          </div>
        ))}

        {/* Sweep highlight on hover */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      </div>

      {/* Base plate */}
      <div
        className="mt-2 flex w-full items-center justify-between rounded-[3px] border border-white/10 px-4 py-2"
        style={{ background: "linear-gradient(180deg, #0a0a0b, #050506)" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#e01822] shadow-[0_0_10px_#e01822] animate-breathe" />
        <span className="font-mono text-[9px] tracking-[0.4em] text-white/60 md:text-[10px]">{label}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
      </div>
    </div>
  );
}

export function Countdown({ target }: { target: Date }) {
  const [now, setNow] = useState(() => Date.now());
  const rafRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      setNow(Date.now());
      rafRef.current = window.setTimeout(tick, 1000) as unknown as number;
    };
    tick();
    return () => window.clearTimeout(rafRef.current);
  }, []);

  const diff = Math.max(0, target.getTime() - now);
  const d = Math.min(99, Math.floor(diff / 86400000));
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.5em] text-white/45">
        <span className="h-px w-8 bg-white/30" />
        <span>TIME UNTIL AWAKENING</span>
        <span className="h-px w-8 bg-white/30" />
      </div>
      <div className="grid grid-cols-4 gap-3 md:gap-6">
        <Pillar digit={d} label="DAYS" />
        <Pillar digit={h} label="HOURS" />
        <Pillar digit={m} label="MINUTES" />
        <Pillar digit={s} label="SECONDS" />
      </div>
    </div>
  );
}