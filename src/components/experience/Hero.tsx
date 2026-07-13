import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClientOnly } from "./ClientOnly";
import { HeroScene } from "./HeroScene";

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
}

function Stagger({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className="inline-flex overflow-hidden align-baseline">
      {text.split("").map((c, i) => (
        <motion.span
          key={i}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: delay + i * 0.03, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          {c === " " ? "\u00A0" : c}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero() {
  const { d, h, m, s } = useCountdown(new Date(Date.now() + 12 * 86400000 + 3 * 3600000));

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden grain">
      {/* Volumetric blood glow */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-blood)" }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,oklch(0.1_0.02_25/0.9),transparent_70%)]" />

      {/* 3D scene */}
      <div className="absolute inset-0">
        <ClientOnly>
          <HeroScene />
        </ClientOnly>
      </div>

      {/* Scanline sweep */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent"
             style={{ animation: "scanline 8s linear infinite" }} />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 pb-10 pt-28 md:px-12 md:pt-32">
        <div className="flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9 }}
            className="font-mono text-[10px] leading-relaxed tracking-[0.3em] text-white/50"
          >
            <div>N 40°42′46″</div>
            <div>W 74°00′21″</div>
            <div className="mt-1 text-[oklch(0.7_0.2_25)]">// SECTOR 07 — CLASSIFIED</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-right font-mono text-[10px] tracking-[0.3em] text-white/50"
          >
            <div>VOL. IV</div>
            <div className="mt-1">MMXXVI</div>
          </motion.div>
        </div>

        <div className="mx-auto w-full max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 font-mono text-[10px] tracking-[0.5em] text-white/60"
          >
            — INVITATION ONLY —
          </motion.div>
          <h1 className="font-[Anton] text-[clamp(4rem,15vw,13rem)] leading-[0.85] tracking-tighter">
            <span className="block text-chrome">
              <Stagger text="OBSIDIAN" delay={0.1} />
            </span>
            <span className="mt-1 block text-blood italic">
              <Stagger text="SESSIONS" delay={0.35} />
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mx-auto mt-8 max-w-xl text-sm text-white/60 md:text-base"
          >
            One night. One key. No repeats. A cinematic underground rendered in chrome, blood and bass — for those who never RSVP twice.
          </motion.p>
        </div>

        <div className="flex flex-col-reverse items-end justify-between gap-6 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="flex items-end gap-4 font-mono text-white"
          >
            {[
              { v: d, l: "DAYS" },
              { v: h, l: "HRS" },
              { v: m, l: "MIN" },
              { v: s, l: "SEC" },
            ].map((x) => (
              <div key={x.l} className="glass-panel rounded-md px-3 py-2 text-center">
                <div className="text-2xl font-light tabular-nums md:text-4xl">
                  {String(x.v).padStart(2, "0")}
                </div>
                <div className="mt-1 text-[9px] tracking-[0.3em] text-white/50">{x.l}</div>
              </div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
            className="flex flex-col items-end font-mono text-[10px] tracking-[0.3em] text-white/50"
          >
            <div className="flex items-center gap-2">
              <span className="inline-block h-1 w-8 bg-white/50 animate-flicker" />
              <span>SCROLL</span>
            </div>
            <div className="mt-1 text-white/30">TO ENTER</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}