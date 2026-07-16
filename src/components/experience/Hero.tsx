import { motion } from "framer-motion";
import { Countdown } from "./Countdown";

/**
 * Editorial title — heavy black ILLUMINATI with blood-red 3.0 on a cream
 * paper background. Extrusion is done with layered text-shadow.
 */
function MachinedTitle() {
  const chars = "ILLUMINATI".split("");
  const REVEAL_START = 7.6;
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: REVEAL_START, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: "transform, opacity" }}
    >
      <h1 className="relative flex flex-wrap justify-center pb-4 font-[Anton] text-[clamp(3.4rem,15.5vw,13.5rem)] leading-[0.82] tracking-[-0.02em]">
        {chars.map((c, i) => (
          <span
            key={i}
            className="relative inline-block"
            style={{
              color: "transparent",
              background:
                "linear-gradient(180deg, #2a2a2e 0%, #0a0a0c 30%, #1c1c1e 60%, #050506 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextStroke: "1px rgba(0,0,0,0.06)",
              textShadow:
                "0 1px 0 rgba(0,0,0,0.4), 0 2px 0 rgba(0,0,0,0.22), 0 10px 26px rgba(0,0,0,0.18)",
            }}
          >
            {c}
          </span>
        ))}
        {/* Version tag — blood red 3.0 */}
        <span
          className="relative ml-4 inline-block md:ml-6"
          style={{
            color: "transparent",
            background:
              "linear-gradient(180deg, #b31a22 0%, #7a0008 45%, #3a0003 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            textShadow:
              "0 1px 0 rgba(80,0,4,0.55), 0 2px 0 rgba(40,0,2,0.4), 0 10px 26px rgba(120,0,12,0.25)",
          }}
        >
          3.0
        </span>
      </h1>
    </motion.div>
  );
}

export function Hero() {
  const target = new Date(Date.now() + 27 * 86400000 + 14 * 3600000 + 33 * 60000);

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Matte light grey base */}
      <div className="absolute inset-0" style={{ background: "#d9d9dc" }} />

      {/* Foreground content */}
      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-start px-6 pb-10 pt-36 md:px-12 md:pt-44">
        {/* Title */}
        <div className="relative mx-auto w-full max-w-7xl text-center">
          <MachinedTitle />

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.9, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-4 flex flex-col items-center gap-1 md:mt-6"
          >
            <div className="font-[Anton] text-2xl tracking-[0.28em] text-black md:text-4xl">
              MARQUEE CLUB AND KITCHEN
            </div>
            <div
              className="mt-1 font-mono text-sm tracking-[0.5em] md:text-base"
              style={{ color: "oklch(0.5 0.24 25)" }}
            >
              AUG 3
            </div>
            <div className="mt-6 flex flex-col items-center gap-1">
              <div className="font-mono text-[11px] tracking-[0.5em] text-black/45">
                powered by
              </div>
              <a
                href="https://ironoak.site"
                target="_blank"
                rel="noopener noreferrer"
                className="font-[Anton] leading-none tracking-[0.18em] transition-opacity hover:opacity-80"
                style={{
                  fontSize: "clamp(2.6rem, 7vw, 5.5rem)",
                  color: "transparent",
                  background:
                    "linear-gradient(180deg, #2a2a2e 0%, #0a0a0c 50%, #1c1c1e 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  textShadow: "0 1px 0 rgba(0,0,0,0.15)",
                }}
              >
                IRONOAK
              </a>
            </div>
          </motion.div>
        </div>

        {/* Countdown + scroll hint */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5.4, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex flex-col items-center gap-6 md:mt-8"
        >
          <Countdown target={target} variant="light" />
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-black/45">
            <span className="inline-block h-px w-10 bg-black/40 animate-flicker" />
            <span>DESCEND</span>
            <span className="inline-block h-px w-10 bg-black/40 animate-flicker" />
          </div>
        </motion.div>

        {/* Mobile-only closer — fills the void below the countdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5.9, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex w-full max-w-sm flex-col items-stretch md:hidden"
        >
          <a
            href="#tickets"
            className="group relative block overflow-hidden border border-black/80 bg-black text-white"
            style={{
              boxShadow:
                "0 18px 40px -14px rgba(120,0,12,0.65), 0 0 0 1px rgba(179,26,34,0.35), inset 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* blood scan bar */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1"
              style={{
                background:
                  "linear-gradient(180deg, #b31a22 0%, #7a0008 60%, #3a0003 100%)",
                boxShadow: "0 0 18px 2px rgba(179,26,34,0.55)",
              }}
            />
            {/* diagonal noise */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-screen"
              style={{
                background:
                  "repeating-linear-gradient(135deg, transparent 0 6px, rgba(255,255,255,0.05) 6px 7px)",
              }}
            />
            {/* corner ticks */}
            <span aria-hidden className="pointer-events-none absolute left-1.5 top-1.5 h-2 w-2 border-l border-t border-white/40" />
            <span aria-hidden className="pointer-events-none absolute right-1.5 top-1.5 h-2 w-2 border-r border-t border-white/40" />
            <span aria-hidden className="pointer-events-none absolute left-1.5 bottom-1.5 h-2 w-2 border-l border-b border-white/40" />
            <span aria-hidden className="pointer-events-none absolute right-1.5 bottom-1.5 h-2 w-2 border-r border-b border-white/40" />

            <div className="relative flex items-center justify-between px-6 py-5 pl-8">
              <div className="flex flex-col items-start gap-1">
                <span
                  className="font-mono text-[9px] tracking-[0.5em]"
                  style={{ color: "#b31a22" }}
                >
                  ///  ACCESS
                </span>
                <span className="font-[Anton] text-2xl leading-none tracking-[0.14em] text-white">
                  VIEW PASSES
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: "#b31a22",
                    boxShadow: "0 0 10px 2px rgba(179,26,34,0.75)",
                  }}
                />
                <span className="font-mono text-[9px] tracking-[0.4em] text-white/70">
                  ENTER →
                </span>
              </div>
            </div>

            {/* bottom stripe */}
            <span
              aria-hidden
              className="relative block h-[3px] w-full"
              style={{
                background:
                  "linear-gradient(90deg, #3a0003 0%, #b31a22 50%, #3a0003 100%)",
              }}
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}