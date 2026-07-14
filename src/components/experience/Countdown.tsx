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
      <div
        className="relative h-[clamp(2rem,5vw,3.6rem)]"
        style={{
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 22%, black 78%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 22%, black 78%, transparent 100%)",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={display}
            initial={{ y: "60%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-60%", opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-[Anton] leading-none tracking-[-0.02em]"
            style={{
              fontSize: "clamp(1.9rem, 4.8vw, 3.4rem)",
              color: "transparent",
              background:
                "linear-gradient(180deg, #242428 0%, #050506 48%, #66666d 62%, #151518 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              textShadow: "0 8px 18px rgba(0,0,0,0.18)",
            }}
          >
            {display}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-1 flex items-center gap-1.5 md:mt-2 md:gap-2">
        <span className="h-1 w-1 rounded-full bg-[#8b0000] shadow-[0_0_8px_rgba(139,0,0,0.35)]" />
        <span
          className="font-mono text-[7px] font-semibold uppercase tracking-[0.28em] md:text-[9px] md:tracking-[0.38em]"
          style={{
            color: "rgba(0,0,0,0.48)",
          }}
        >
          {label}
        </span>
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
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-start justify-center gap-2 sm:gap-5 md:gap-8">
        <Unit value={d} label="DAYS" />
        <span className="mt-0 font-[Anton] text-black/18 md:mt-1" style={{ fontSize: "clamp(1.4rem, 4vw, 2.8rem)" }}>:</span>
        <Unit value={h} label="HOURS" />
        <span className="mt-0 font-[Anton] text-black/18 md:mt-1" style={{ fontSize: "clamp(1.4rem, 4vw, 2.8rem)" }}>:</span>
        <Unit value={m} label="MINUTES" />
        <span className="mt-0 font-[Anton] text-black/18 md:mt-1" style={{ fontSize: "clamp(1.4rem, 4vw, 2.8rem)" }}>:</span>
        <Unit value={s} label="SECONDS" />
      </div>
    </div>
  );
}