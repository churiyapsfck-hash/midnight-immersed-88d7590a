import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function Ending() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.6, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.9, 1]);
  const bars = Array.from({ length: 42 });

  return (
    <section ref={ref} className="relative min-h-[110vh] overflow-hidden">
      <motion.div style={{ scale, opacity }} className="pointer-events-none absolute inset-0" >
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, oklch(0.4 0.22 25 / 0.5), transparent 55%)" }} />
      </motion.div>

      <div className="relative flex min-h-[110vh] flex-col items-center justify-center px-6 text-center">
        <div className="font-mono text-[10px] tracking-[0.5em] text-white/40">— END OF TRANSMISSION —</div>
        <h2 className="mt-10 font-[Anton] text-[clamp(4rem,17vw,16rem)] leading-[0.82] tracking-tighter">
          <span className="block text-chrome">THE EYE</span>
          <span className="mt-1 block italic text-blood">IS OPEN.</span>
        </h2>

        {/* Music-visualizer bars */}
        <div className="mt-16 flex h-24 items-end gap-1.5">
          {bars.map((_, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-[oklch(0.5_0.24_25)] to-white/70"
              animate={{ height: ["20%", `${30 + Math.random() * 70}%`, "20%"] }}
              transition={{
                duration: 1.2 + Math.random(),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.03,
              }}
              style={{ height: "20%" }}
            />
          ))}
        </div>

        <a
          href="#tickets"
          className="group relative mt-16 inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/20 bg-white/[0.03] px-8 py-4 font-mono text-xs tracking-[0.4em] text-white backdrop-blur transition-all hover:border-[oklch(0.55_0.24_25)] hover:shadow-[0_0_60px_oklch(0.5_0.24_25/0.5)]"
        >
          <span className="relative z-10">REQUEST INVITATION</span>
          <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-[oklch(0.35_0.2_25)] to-[oklch(0.5_0.24_25)] transition-transform duration-700 group-hover:translate-x-0" />
        </a>

        <div className="mt-24 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-[10px] tracking-[0.3em] text-white/30">
          <span>ILLUMINATI 3.0</span>
          <span>·</span>
          <span>MMXXVI</span>
          <span>·</span>
          <span>ALL RIGHTS SEALED</span>
          <span>·</span>
          <a href="#" className="hover:text-white/80">INSTAGRAM</a>
          <a href="#" className="hover:text-white/80">TELEGRAM</a>
          <a href="#" className="hover:text-white/80">PRESS</a>
        </div>
      </div>
    </section>
  );
}