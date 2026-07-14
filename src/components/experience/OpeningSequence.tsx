import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import illuminatiEye from "@/assets/illuminati-eye-mono.png.asset.json";

/**
 * OPENING SEQUENCE
 * ────────────────────────────────────────────────────────────
 * A cinematic fade-in — not a loader. Pure matte black holds, then
 * dust, distant crimson haze, and a slow spotlight sweep reveal the
 * scene beneath. No progress bars, no spinners, no "loading" text.
 */

// Total sequence duration, seconds
const TOTAL = 8.0;

function Dust() {
  const motes = useMemo(
    () =>
      Array.from({ length: 42 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: 40 + Math.random() * 60,
        size: 0.6 + Math.random() * 1.6,
        drift: (Math.random() - 0.5) * 30,
        rise: 40 + Math.random() * 80,
        delay: Math.random() * 3,
        duration: 8 + Math.random() * 10,
        opacity: 0.08 + Math.random() * 0.22,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {motes.map((m) => (
        <motion.span
          key={m.id}
          className="absolute rounded-full"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
            background: "rgba(255,240,230,0.9)",
            filter: "blur(0.4px)",
            boxShadow: "0 0 6px rgba(255,220,200,0.35)",
          }}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{
            opacity: [0, m.opacity, m.opacity, 0],
            y: [-0, -m.rise],
            x: [0, m.drift],
          }}
          transition={{
            duration: m.duration,
            delay: 0.6 + m.delay,
            ease: "linear",
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}

export function OpeningSequence() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setGone(true), TOTAL * 1000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          key="opening"
          className="fixed inset-0 z-[80] overflow-hidden cursor-none"
          style={{ background: "#000" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.0, ease: [0.65, 0, 0.35, 1] }}
          aria-hidden
        >
          {/* Hide the custom cursor while the opening plays */}
          <style>{`.lovable-cursor{display:none!important} html,body{cursor:none!important}`}</style>
          {/* Held pure black — no gradients for the first ~450ms */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "#000" }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 0.45, duration: 1.2, ease: "easeOut" }}
          />

          {/* Subtle inner-camera breathing container */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.04 }}
            animate={{ scale: 1.0 }}
            transition={{ duration: TOTAL, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Distant crimson glow — synced to the sigil so it breathes in and out with it */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.45, 0.45, 0] }}
              transition={{
                delay: 1.0,
                duration: 6.5,
                times: [0, 0.22, 0.74, 1],
                ease: "easeInOut",
              }}
              style={{
                background:
                  "radial-gradient(38% 28% at 50% 78%, rgba(150,15,32,0.55) 0%, rgba(90,8,20,0.28) 32%, rgba(20,3,6,0) 70%)",
                filter: "blur(20px)",
                mixBlendMode: "screen",
              }}
            />

            {/* Volumetric haze — soft ambient */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ delay: 0.9, duration: 2.4, ease: "easeOut" }}
              style={{
                background:
                  "radial-gradient(120% 60% at 50% 100%, rgba(60,40,45,0.6), transparent 70%)",
                mixBlendMode: "screen",
              }}
            />

            {/* Floating dust */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.8, ease: "easeOut" }}
            >
              <Dust />
            </motion.div>

            {/* Late vignette that eases back to match Hero base */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(0,0,0,0.75) 100%)" }}
            />

            <motion.div
              className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2"
              initial={{ y: "60vh", rotate: -180, opacity: 0, scale: 0.6 }}
              animate={{
                y: ["60vh", "0vh", "0vh", "0vh"],
                rotate: [-180, 0, 0, 0],
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1, 1, 1],
              }}
              transition={{
                delay: 1.0,
                duration: 6.5,
                times: [0, 0.28, 0.72, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                width: "min(38vh, 34vw)",
                aspectRatio: "1 / 1",
              }}
            >
              {/* Red aura pulsing behind the sigil */}
              <motion.div
                className="absolute inset-[-40%]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0.7, 0] }}
                transition={{
                  delay: 1.0,
                  duration: 6.5,
                  times: [0, 0.28, 0.72, 1],
                  ease: "easeInOut",
                }}
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(255,40,55,0.75) 0%, rgba(200,15,30,0.5) 28%, rgba(120,5,15,0.25) 55%, rgba(0,0,0,0) 78%)",
                  filter: "blur(24px)",
                  mixBlendMode: "screen",
                }}
              />
              <img
                src={illuminatiEye.url}
                alt=""
                className="relative h-full w-full object-contain"
                style={{
                  mixBlendMode: "screen",
                  opacity: 0.95,
                  filter:
                    "drop-shadow(0 0 18px rgba(255,60,70,0.7)) drop-shadow(0 0 42px rgba(180,15,30,0.55))",
                }}
                draggable={false}
              />
            </motion.div>
          </motion.div>

          {/* Fine film grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>\")",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}