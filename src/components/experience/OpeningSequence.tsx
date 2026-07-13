import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import illuminatiEye from "@/assets/illuminati-eye.png.asset.json";

/**
 * OPENING SEQUENCE
 * ────────────────────────────────────────────────────────────
 * A cinematic fade-in — not a loader. Pure matte black holds, then
 * dust, distant crimson haze, and a slow spotlight sweep reveal the
 * scene beneath. No progress bars, no spinners, no "loading" text.
 */

// Total sequence duration, seconds
const TOTAL = 6.4;

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
          className="fixed inset-0 z-[80] overflow-hidden"
          style={{ background: "#000" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
          aria-hidden
        >
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
            {/* Distant crimson glow — deep, low, off-center */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.55, 0.7] }}
              transition={{ delay: 1.2, duration: 3.2, ease: "easeOut", times: [0, 0.6, 1] }}
              style={{
                background:
                  "radial-gradient(60% 45% at 50% 62%, rgba(180,20,40,0.55) 0%, rgba(120,10,25,0.28) 30%, rgba(20,3,6,0) 68%)",
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

            {/* Slow moving spotlight beam — cold cinema key light travelling L→R */}
            <motion.div
              className="absolute -inset-x-1/2 -top-[20%] bottom-0"
              initial={{ x: "-30%", opacity: 0 }}
              animate={{ x: ["-30%", "35%"], opacity: [0, 0.9, 0.4] }}
              transition={{ delay: 1.8, duration: 3.0, ease: [0.22, 1, 0.36, 1], times: [0, 0.55, 1] }}
              style={{
                background:
                  "conic-gradient(from 178deg at 50% -10%, transparent 0deg, transparent 168deg, rgba(255,240,220,0.14) 175deg, rgba(255,240,220,0.32) 180deg, rgba(255,240,220,0.14) 185deg, transparent 192deg, transparent 360deg)",
                filter: "blur(14px)",
                mixBlendMode: "screen",
              }}
            />

            {/* Second, tighter spotlight — warm crimson kiss late in the sequence */}
            <motion.div
              className="absolute -inset-x-1/2 -top-[20%] bottom-0"
              initial={{ x: "40%", opacity: 0 }}
              animate={{ x: ["40%", "-10%"], opacity: [0, 0.5, 0] }}
              transition={{ delay: 3.0, duration: 2.2, ease: [0.22, 1, 0.36, 1], times: [0, 0.5, 1] }}
              style={{
                background:
                  "conic-gradient(from 178deg at 50% -10%, transparent 0deg, transparent 172deg, rgba(220,60,60,0.18) 180deg, transparent 188deg, transparent 360deg)",
                filter: "blur(20px)",
                mixBlendMode: "screen",
              }}
            />

            {/* Late vignette that eases back to match Hero base */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(0,0,0,0.75) 100%)" }}
            />

            {/* Illuminati sigil — rises above the crimson glow, rotates, then descends */}
            <motion.div
              className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2"
              initial={{ y: "60vh", rotate: -180, opacity: 0, scale: 0.6 }}
              animate={{
                y: ["60vh", "0vh", "0vh", "60vh"],
                rotate: [-180, 0, 360, 540],
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1, 1, 0.6],
              }}
              transition={{
                delay: 1.0,
                duration: 5.0,
                times: [0, 0.32, 0.68, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                width: "min(38vh, 34vw)",
                aspectRatio: "1 / 1",
                filter:
                  "drop-shadow(0 0 30px rgba(220,40,50,0.55)) drop-shadow(0 0 60px rgba(140,10,20,0.35))",
              }}
            >
              <img
                src={illuminatiEye.url}
                alt=""
                className="h-full w-full object-contain"
                style={{ mixBlendMode: "screen", opacity: 0.95 }}
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