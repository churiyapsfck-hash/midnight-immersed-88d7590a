import { motion } from "framer-motion";
import { Countdown } from "./Countdown";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Mechanical panel reveal (mobile only). Text sits behind a black shutter
 * that snaps open horizontally; the text then slides up into place with a
 * short settle. Base delay lets it sequence after the ILLUMINATI title.
 */
function PanelReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Text — slides up + fades in */}
      <motion.div
        initial={{ y: "105%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{
          delay: delay + 0.28,
          duration: 0.55,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
      {/* Shutter — snaps open left→right, then right edge closes */}
      <motion.div
        aria-hidden
        className="absolute inset-0 origin-left"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{
          delay,
          duration: 0.42,
          ease: [0.85, 0, 0.15, 1],
        }}
        style={{ background: "#0a0a0c" }}
      />
      {/* Red seam flash at the trailing edge */}
      <motion.div
        aria-hidden
        className="absolute inset-y-0 right-0 w-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          delay: delay + 0.05,
          duration: 0.38,
          times: [0, 0.5, 1],
        }}
        style={{ background: "#b31a22", boxShadow: "0 0 10px #b31a22" }}
      />
    </div>
  );
}

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
  const target = new Date("2026-08-03T00:00:00+05:30");
  const isMobile = useIsMobile();

  // Sequence AFTER the ILLUMINATI title reveal on mobile.
  const BASE = 5.2;

  const marquee = (
    <div className="font-[Anton] text-5xl tracking-[0.28em] text-black md:text-4xl">
      MARQUEE CLUB AND KITCHEN
    </div>
  );
  const aug3 = (
    <div
      className="font-mono text-xl tracking-[0.5em] md:text-sm"
      style={{ color: "oklch(0.5 0.24 25)" }}
    >
      AUG 3
    </div>
  );
  const ironoakBlock = (
    <div className="flex flex-col items-center gap-1">
      <div className="font-mono text-[11px] tracking-[0.5em] text-black/45">
        powered by
      </div>
      <a
        href="https://ironoak.site"
        target="_blank"
        rel="noopener noreferrer"
        className="font-[Anton] leading-none tracking-[0.18em] transition-opacity hover:opacity-80"
        style={{
          fontSize: "clamp(4.5rem, 14vw, 5rem)",
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
  );

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Matte light grey base */}
      <div className="absolute inset-0" style={{ background: "#d9d9dc" }} />

      {/* Foreground content */}
      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-between px-6 pb-16 pt-36 md:px-12 md:pt-44 md:pb-24">
        {/* Title */}
        <div className="relative mx-auto w-full max-w-7xl text-center">
          <MachinedTitle />

          {isMobile ? (
            <div className="mx-auto mt-10 flex flex-col items-center gap-1">
              <PanelReveal delay={BASE} className="px-2 py-1">
                {marquee}
              </PanelReveal>
              <PanelReveal delay={BASE + 0.45} className="mt-4 px-2 py-1">
                {aug3}
              </PanelReveal>
              <PanelReveal delay={BASE + 0.95} className="mt-16 px-2 py-1">
                {ironoakBlock}
              </PanelReveal>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.9, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-16 flex flex-col items-center gap-1"
            >
              {marquee}
              <div className="mt-2">{aug3}</div>
              <div className="mt-10">{ironoakBlock}</div>
            </motion.div>
          )}
        </div>

        {/* Countdown + scroll hint */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5.4, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 flex flex-col items-center gap-6 md:mt-24"
        >
          <Countdown target={target} variant="light" />
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-black/45">
            <span className="inline-block h-px w-10 bg-black/40 animate-flicker" />
            <span>DESCEND</span>
            <span className="inline-block h-px w-10 bg-black/40 animate-flicker" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}