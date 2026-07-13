import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Location display — replaces the ceremony timeline. Centered,
 * aesthetic reveal of the club location with MARQUEE in caps below.
 */
export function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 1.4, 0.3]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.15, 0.95]);
  return (
    <section ref={sectionRef} id="timeline" className="relative px-6 py-32 md:px-12 md:py-48">
      <motion.div
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, oklch(0.4 0.24 25 / 0.28), transparent 65%)",
          opacity: glowOpacity,
          scale: glowScale,
          transformOrigin: "50% 50%",
        }}
      />
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
          className="mt-8 font-mono text-xs leading-loose tracking-[0.3em] text-white/85 md:text-sm"
        >
          <div>4<span className="text-[oklch(0.7_0.2_25)]">TH</span> &amp; 5<span className="text-[oklch(0.7_0.2_25)]">TH</span> FLOOR · TIME SQUARE BUILDING</div>
          <div className="mt-2">2-37/9 TO 11 &amp; 16 TO 18 · VINAYAK NAGAR</div>
          <div className="mt-2">INDIRA NAGAR · GACHIBOWLI</div>
          <div className="mt-2">HYDERABAD · TELANGANA 500032</div>
        </motion.div>

        <motion.a
          href="https://share.google/VTOBW8QuDIWATMYex"
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/20 px-5 py-2 font-mono text-[10px] tracking-[0.4em] text-white/70 transition-colors hover:border-[oklch(0.55_0.24_25)] hover:text-white"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.55_0.24_25)] shadow-[0_0_10px_oklch(0.55_0.24_25)]" />
          OPEN IN MAPS →
        </motion.a>

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