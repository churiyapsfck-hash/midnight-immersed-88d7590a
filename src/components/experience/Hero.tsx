import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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
  // Title is visible from mount — the OpeningSequence overlay handles the
  // intro reveal. (Long-delay framer-motion transitions don't reliably fire
  // in framer-motion 12 + React 19 concurrent mode.)
  return (
    <div className="relative">
      <h1 className="relative flex flex-wrap justify-center pb-4 font-[Anton] text-[clamp(3.4rem,15.5vw,13.5rem)] leading-[0.82] tracking-[-0.02em]">
        {chars.map((c, i) => (
          <span
            key={i}
            className="relative inline-block"
            style={{
              color: "transparent",
              background:
                "linear-gradient(180deg, #ffffff 0%, #d0d0d4 18%, #6a6a70 40%, #ececef 55%, #808086 78%, #2a2a2e 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextStroke: "1px rgba(255,255,255,0.05)",
              textShadow:
                "0 1px 0 #2a2a2e, 0 2px 0 #1a1a1c, 0 4px 10px rgba(0,0,0,0.55), 0 0 40px rgba(180,20,32,0.18)",
            }}
          >
            {c}
          </span>
        ))}
        {/* Version tag — blood red machined 3.0 */}
        <span
          className="relative ml-4 inline-block md:ml-6"
          style={{
            color: "transparent",
            background:
              "linear-gradient(180deg, #ffb0b6 0%, #d81a28 30%, #7a0006 55%, #b11226 80%, #400003 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            textShadow:
              "0 1px 0 #4a0006, 0 2px 0 #2a0004, 0 4px 10px rgba(0,0,0,0.55), 0 0 40px rgba(220,20,40,0.3)",
          }}
        >
          3.0
        </span>
      </h1>

    </div>
  );
}

export function Hero() {
  const target = new Date(Date.now() + 27 * 86400000 + 14 * 3600000 + 33 * 60000);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // Beam intensifies briefly then dies as you leave the hero
  const beamOpacity = useTransform(scrollYProgress, [0, 0.35, 1], [1, 1.35, 0]);
  const beamScale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);
  const beamY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const vignetteOpacity = useTransform(scrollYProgress, [0, 1], [1, 1.8]);
  const grainDrift = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section ref={sectionRef} id="top" className="relative min-h-[100svh] w-full overflow-hidden grain">
      {/* Deep atmospheric base */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 30%, #120306 0%, #050405 55%, #020203 100%)" }} />
      {/* Volumetric top beam — scroll-linked intensity + drift */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%] will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse 40% 100% at 50% 0%, oklch(0.35 0.22 25 / 0.5), transparent 65%)",
          opacity: beamOpacity,
          scale: beamScale,
          y: beamY,
          transformOrigin: "50% 0%",
        }}
      />
      {/* Bottom vignette — deepens as you scroll */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background: "linear-gradient(180deg, transparent, #030203 85%)",
          opacity: vignetteOpacity,
        }}
      />
      {/* Drifting particle field — light and scroll-linked */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          y: grainDrift,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), radial-gradient(rgba(220,20,40,0.25) 1px, transparent 1px)",
          backgroundSize: "140px 140px, 220px 220px",
          backgroundPosition: "0 0, 70px 90px",
          maskImage: "radial-gradient(ellipse at 50% 40%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, black, transparent 75%)",
        }}
      />

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
        <div />

        {/* Title */}
        <div className="relative mx-auto w-full max-w-7xl text-center">
          {/* Soft dark halo behind title to lift it off the monolith */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[110%] -translate-x-1/2 -translate-y-1/2 blur-2xl"
            style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 45%, transparent 75%)" }}
          />
          <MachinedTitle />

          <div className="mx-auto mt-8 flex flex-col items-center gap-2">
            <div className="font-[Anton] text-2xl tracking-[0.28em] text-white/90 md:text-4xl">
              MARQUEE CLUB AND KITCHEN
            </div>
            <div className="font-mono text-sm tracking-[0.5em] text-[oklch(0.7_0.2_25)] md:text-base">
              AUG 3
            </div>
            <div className="mt-6 flex flex-col items-center gap-1">
              <div className="font-mono text-[10px] tracking-[0.5em] text-white/40">
                powered by
              </div>
              <div
                className="font-[Anton] leading-none tracking-[0.18em]"
               style={{
                  fontSize: "clamp(2rem, 5.5vw, 4rem)",
                  color: "transparent",
                  background:
                    "linear-gradient(180deg, #4a4a4e 0%, #2a2a2e 40%, #0f0f11 70%, #333338 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  textShadow: "0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                IRONOAK
              </div>
            </div>
          </div>
        </div>

        {/* Countdown + scroll hint */}
        <div className="flex flex-col items-center gap-8">
          <Countdown target={target} />
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-white/40">
            <span className="inline-block h-px w-10 bg-white/40 animate-flicker" />
            <span>DESCEND</span>
            <span className="inline-block h-px w-10 bg-white/40 animate-flicker" />
          </div>
        </div>
      </div>
    </section>
  );
}