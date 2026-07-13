import { motion } from "framer-motion";

/**
 * Location display — replaces the ceremony timeline. Centered,
 * aesthetic reveal of the club location with MARQUEE in caps below.
 */
export function Timeline() {
  return (
    <section id="timeline" className="relative px-6 py-32 md:px-12 md:py-48">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, oklch(0.35 0.22 25 / 0.18), transparent 65%)" }} />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-mono text-[10px] tracking-[0.5em] text-white/40"
        >
          — 03 / LOCATION
        </motion.div>

        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.05em" }}
          whileInView={{ opacity: 1, letterSpacing: "0.18em" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 font-serif text-lg italic text-white/70 md:text-xl"
        >
          the address for the descent
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 font-mono text-sm leading-loose tracking-[0.35em] text-white/85 md:text-base"
        >
          <div>3<span className="text-[oklch(0.7_0.2_25)]">RD</span> FLOOR · OBSIDIAN WING</div>
          <div className="mt-2">SECTOR 07 · NIGHT DISTRICT</div>
          <div className="mt-2">— coordinates released to invited only —</div>
        </motion.div>

        {/* ornamental divider */}
        <div className="mt-14 flex w-full items-center justify-center gap-4">
          <span className="h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent md:w-40" />
          <span className="text-[oklch(0.55_0.24_25)]" style={{ textShadow: "0 0 12px oklch(0.55 0.24 25 / 0.7)" }}>◆</span>
          <span className="h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent md:w-40" />
        </div>

        {/* MARQUEE monumental name */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 font-[Anton] leading-[0.9] tracking-[0.02em]"
          style={{
            fontSize: "clamp(3.6rem, 14vw, 12rem)",
            color: "transparent",
            background:
              "linear-gradient(180deg, #ffffff 0%, #d0d0d4 22%, #6a6a70 45%, #ececef 60%, #808086 82%, #2a2a2e 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            textShadow:
              "0 1px 0 #4a4a4e, 0 2px 0 #383838, 0 3px 0 #2a2a2a, 0 4px 0 #1c1c1c, 0 6px 12px rgba(0,0,0,0.85), 0 0 60px rgba(220,20,40,0.25)",
          }}
        >
          MARQUEE
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.7 }}
          className="mt-6 font-mono text-[10px] tracking-[0.5em] text-white/40"
        >
          CLUB · KITCHEN · SANCTUM
        </motion.div>
      </div>
    </section>
  );
}