import { motion } from "framer-motion";
import { ClientOnly } from "./ClientOnly";
import { HeroScene } from "./HeroScene";
import { Countdown } from "./Countdown";

/**
 * Machined title — ILLUMINATI 3.0 rendered with layered text-shadow
 * extrusion + metallic gradient. Each letter animates from behind
 * the darkness, as if pushed up from an obsidian floor.
 */
function MachinedTitle() {
  const chars = "ILLUMINATI".split("");
  return (
    <div className="relative">
      <h1 className="relative flex flex-wrap justify-center overflow-hidden pb-4 font-[Anton] text-[clamp(3.4rem,15.5vw,13.5rem)] leading-[0.82] tracking-[-0.02em]">
        {chars.map((c, i) => (
          <motion.span
            key={i}
            initial={{ y: "110%", opacity: 0, filter: "blur(12px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.5 + i * 0.08, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-block"
            style={{
              color: "transparent",
              background:
                "linear-gradient(180deg, #f4f4f6 0%, #a8a8ac 22%, #4a4a4e 42%, #d4d4d8 55%, #6a6a6e 78%, #26262a 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              textShadow:
                "0 1px 0 #4a4a4e, 0 2px 0 #383838, 0 3px 0 #2a2a2a, 0 4px 0 #1c1c1c, 0 6px 1px rgba(0,0,0,0.5), 0 0 40px rgba(180,20,32,0.25)",
              filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.9))",
            }}
          >
            {c}
          </motion.span>
        ))}
        {/* Version tag — blood red machined 3.0 */}
        <motion.span
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative ml-4 inline-block italic md:ml-6"
          style={{
            color: "transparent",
            background:
              "linear-gradient(180deg, #ffb0b6 0%, #d81a28 30%, #7a0006 55%, #b11226 80%, #400003 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            textShadow:
              "0 1px 0 #6a0008, 0 2px 0 #4a0006, 0 3px 0 #300004, 0 4px 0 #200002, 0 0 60px rgba(220,20,40,0.45)",
          }}
        >
          3.0
        </motion.span>
      </h1>

      {/* Horizontal light sweep across the letters */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          background:
            "linear-gradient(115deg, transparent 42%, rgba(255,255,255,0.55) 50%, transparent 58%)",
          WebkitMaskImage:
            "linear-gradient(180deg, black, black)",
          animation: "sweep 7s ease-in-out infinite",
        }}
      />
      <style>{`@keyframes sweep { 0%,100% { transform: translateX(-30%);} 50% { transform: translateX(30%);} }`}</style>
    </div>
  );
}

export function Hero() {
  const target = new Date(Date.now() + 27 * 86400000 + 14 * 3600000 + 33 * 60000);

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden grain">
      {/* Deep atmospheric base */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 30%, #120306 0%, #050405 55%, #020203 100%)" }} />
      {/* Volumetric top beam */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[70%]" style={{ background: "radial-gradient(ellipse 40% 100% at 50% 0%, oklch(0.35 0.22 25 / 0.5), transparent 65%)" }} />
      {/* Bottom vignette */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]" style={{ background: "linear-gradient(180deg, transparent, #030203 85%)" }} />

      {/* 3D monolith scene */}
      <div className="absolute inset-0">
        <ClientOnly>
          <HeroScene />
        </ClientOnly>
      </div>

      {/* Slow scanline */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
        <div
          className="absolute inset-x-0 h-48"
          style={{
            background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.035) 50%, transparent)",
            animation: "scanline 14s linear infinite",
          }}
        />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 pb-14 pt-28 md:px-12 md:pt-32">
        {/* Top rail */}
        <div className="flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="font-mono text-[10px] leading-relaxed tracking-[0.3em] text-white/45"
          >
            <div>LAT 40.7128 N</div>
            <div>LON 74.0060 W</div>
            <div className="mt-1 text-[oklch(0.7_0.2_25)]">// COORDINATES REDACTED</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-right font-mono text-[10px] tracking-[0.3em] text-white/45"
          >
            <div>PROTOCOL III</div>
            <div className="mt-1">MMXXVI</div>
          </motion.div>
        </div>

        {/* Title */}
        <div className="mx-auto w-full max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 1.4 }}
            className="mb-6 flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.5em] text-white/55"
          >
            <span className="h-px w-10 bg-white/30" />
            <span>BY INVITATION ONLY</span>
            <span className="h-px w-10 bg-white/30" />
          </motion.div>

          <MachinedTitle />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 1.2 }}
            className="mx-auto mt-6 max-w-md text-sm text-white/55 md:text-base"
          >
            Awareness. Precision. Anticipation. A cinematic gathering machined from obsidian and blood — assembled once, then dismantled.
          </motion.p>
        </div>

        {/* Countdown + scroll hint */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 1.4 }}
          className="flex flex-col items-center gap-8"
        >
          <Countdown target={target} />
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-white/40">
            <span className="inline-block h-px w-10 bg-white/40 animate-flicker" />
            <span>DESCEND</span>
            <span className="inline-block h-px w-10 bg-white/40 animate-flicker" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}