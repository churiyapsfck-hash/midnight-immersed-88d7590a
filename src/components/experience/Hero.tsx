import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
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
          className="mt-8 flex w-full max-w-sm flex-col items-stretch gap-6 md:hidden"
        >
          {/* CTAs */}
          <div className="flex flex-col gap-2">
            <Link
              to="/standard"
              className="group relative flex items-center justify-between overflow-hidden rounded-full px-6 py-4 font-mono text-[11px] tracking-[0.32em] text-white"
              style={{
                background:
                  "linear-gradient(180deg, #b31a22 0%, #7a0008 60%, #4a0004 100%)",
                boxShadow:
                  "0 10px 24px -8px rgba(120,0,12,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span>RESERVE PASS</span>
              <span className="font-serif text-[13px] italic tracking-normal text-white/80">
                from ₹1,400
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{ boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.35)" }}
              />
            </Link>
            <Link
              to="/vip"
              className="flex items-center justify-between rounded-full border border-black/30 bg-black/[0.03] px-6 py-3.5 font-mono text-[11px] tracking-[0.32em] text-black/80 hover:bg-black/5"
            >
              <span>VIP EXPERIENCE</span>
              <span className="font-serif text-[13px] italic tracking-normal text-black/50">
                ₹2,200+
              </span>
            </Link>
          </div>

          {/* Meta strip */}
          <div className="grid grid-cols-3 divide-x divide-black/15 rounded-2xl border border-black/15 bg-black/[0.03] py-3">
            {[
              { k: "VENUE", v: "MARQUEE", s: "MUMBAI" },
              { k: "DRESS", v: "STRICT", s: "ALL BLACK" },
              { k: "AGE", v: "21+", s: "ID REQUIRED" },
            ].map((m) => (
              <div key={m.k} className="flex flex-col items-center gap-0.5 px-2 text-center">
                <div className="font-mono text-[8px] tracking-[0.4em] text-black/40">{m.k}</div>
                <div className="font-[Anton] text-base leading-none tracking-[0.05em] text-black">
                  {m.v}
                </div>
                <div className="font-mono text-[8px] tracking-[0.32em] text-black/45">{m.s}</div>
              </div>
            ))}
          </div>

          {/* Rotating seal */}
          <div className="relative mx-auto mt-2 h-32 w-32">
            <motion.svg
              viewBox="0 0 200 200"
              className="absolute inset-0 h-full w-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 26, ease: "linear", repeat: Infinity }}
              aria-hidden
            >
              <defs>
                <path
                  id="seal-arc"
                  d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
                />
              </defs>
              <text
                fill="oklch(0.5 0.24 25)"
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: "11px",
                  letterSpacing: "0.52em",
                }}
              >
                <textPath href="#seal-arc" startOffset="0">
                  ILLUMINATI · EDITION III · MUMBAI · AUG 3 ·&nbsp;
                </textPath>
              </text>
            </motion.svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full font-[Anton] text-2xl leading-none text-white"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, #b31a22 0%, #7a0008 55%, #3a0003 100%)",
                  boxShadow:
                    "0 8px 22px -6px rgba(120,0,12,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                III
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}