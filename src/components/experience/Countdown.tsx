import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Architectural countdown — each digit is a tall obsidian pillar with a
 * chrome-beveled window. Value changes rotate a vertical drum of digits
 * with heavy inertia (spring), casting realistic shadows.
 */
function DigitDrum({ value }: { value: number }) {
  // Vertical drum: 10 digits stacked; translate to the current one.
  return (
    <div
      className="relative h-[1.15em] w-[0.75em] overflow-hidden"
      style={{ perspective: "600px" }}
    >
      <motion.div
        animate={{ y: `-${value * 100}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 22, mass: 1.3 }}
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {Array.from({ length: 10 }).map((_, n) => (
          <div
            key={n}
            className="flex h-[1.15em] w-full items-center justify-center text-chrome"
            style={{
              textShadow:
                "0 1px 0 #666, 0 2px 0 #444, 0 3px 0 #333, 0 4px 0 #222, 0 6px 12px oklch(0 0 0 / 0.9), 0 0 30px oklch(0.5 0.24 25 / 0.15)",
            }}
          >
            {n}
          </div>
        ))}
      </motion.div>

      {/* Top/bottom shadow gradients — sculpts drum feel */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-black via-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-black via-black/60 to-transparent" />
      {/* Center scan glow */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[oklch(0.6_0.24_25)] opacity-40 shadow-[0_0_12px_oklch(0.55_0.24_25)]" />
    </div>
  );
}

function Pillar({ digit, label }: { digit: number; label: string }) {
  const tens = Math.floor(digit / 10);
  const ones = digit % 10;
  return (
    <div className="group relative flex flex-col items-center">
      {/* Pillar body */}
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-sm border border-white/10 px-5 pb-6 pt-5 md:px-7 md:pb-8 md:pt-6"
        style={{
          background:
            "linear-gradient(180deg, #0d0d0e 0%, #050506 45%, #0a0a0b 100%)",
          boxShadow:
            "inset 0 1px 0 oklch(1 0 0 / 0.12), inset 0 -1px 0 oklch(0 0 0 / 0.8), 0 40px 60px -20px oklch(0 0 0 / 0.9), 0 0 60px oklch(0.4 0.22 25 / 0.08)",
        }}
      >
        {/* Machined chrome bezel edges */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="pointer-events-none absolute inset-y-2 left-0 w-px bg-gradient-to-b from-white/20 via-white/5 to-white/20" />
        <span className="pointer-events-none absolute inset-y-2 right-0 w-px bg-gradient-to-b from-white/20 via-white/5 to-white/20" />

        {/* Blood core glow behind digits */}
        <span
          className="pointer-events-none absolute inset-6 blur-2xl"
          style={{ background: "radial-gradient(ellipse at center, oklch(0.5 0.24 25 / 0.4), transparent 70%)" }}
        />

        {/* Digits */}
        <div className="relative flex font-[Anton] text-[6.5rem] leading-none tracking-tight md:text-[9rem]">
          <DigitDrum value={tens} />
          <DigitDrum value={ones} />
        </div>

        {/* Light sweep on hover */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      </div>

      {/* Base plate */}
      <div
        className="mt-2 flex w-full items-center justify-between rounded-sm border border-white/10 px-4 py-2"
        style={{ background: "linear-gradient(180deg, #0a0a0b, #050506)" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.55_0.24_25)] shadow-[0_0_10px_oklch(0.55_0.24_25)] animate-breathe" />
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