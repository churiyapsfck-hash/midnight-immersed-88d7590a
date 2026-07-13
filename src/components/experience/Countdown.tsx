import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * REFINED COUNTDOWN
 * ─────────────────
 * Editorial typography over machined chrome. Two large Anton digits
 * per unit with a soft red under-glow and a thin serif label — quiet,
 * confident, and paced with the rest of the site's vibe.
 */

function Unit({ value, label }: { value: number; label: string }) {
  const display = useMemo(() => value.toString().padStart(2, "0"), [value]);
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative h-[clamp(4.5rem,12vw,8.5rem)] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={display}
            initial={{ y: "60%", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-60%", opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="font-[Anton] leading-none tracking-[-0.02em]"
            style={{
              fontSize: "clamp(4.2rem, 11vw, 8rem)",
              color: "transparent",
              background:
                "linear-gradient(180deg, #ffffff 0%, #cfcfd4 35%, #7a7a80 65%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              textShadow: "0 0 32px rgba(220,20,40,0.22)",
            }}
          >
            {display}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-[oklch(0.55_0.24_25)] shadow-[0_0_8px_oklch(0.55_0.24_25)]" />
        <span className="font-mono text-[10px] tracking-[0.45em] text-white/55">{label}</span>
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
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-8 flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.5em] text-white/45">
        <span className="h-px w-8 bg-white/30" />
        <span>TIME UNTIL AWAKENING</span>
        <span className="h-px w-8 bg-white/30" />
      </div>
      <div className="flex items-start justify-center gap-6 md:gap-12">
        <Unit value={d} label="DAYS" />
        <span className="mt-4 font-[Anton] text-white/20" style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}>:</span>
        <Unit value={h} label="HOURS" />
        <span className="mt-4 font-[Anton] text-white/20" style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}>:</span>
        <Unit value={m} label="MINUTES" />
        <span className="mt-4 font-[Anton] text-white/20" style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}>:</span>
        <Unit value={s} label="SECONDS" />
      </div>
    </div>
  );
}