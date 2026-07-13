import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const FRAMES = [
  { title: "VOL. I · WAREHOUSE 07", tag: "ARCHIVE", tone: "oklch(0.4 0.22 25)" },
  { title: "VOL. II · SUBTERRA", tag: "ARCHIVE", tone: "oklch(0.3 0.02 240)" },
  { title: "VOL. III · CHROME ROOM", tag: "ARCHIVE", tone: "oklch(0.35 0.18 25)" },
  { title: "VOL. IV · TBD", tag: "SEALED", tone: "oklch(0.5 0.24 25)" },
];

export function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["10%", "-55%"]);

  return (
    <section id="gallery" ref={ref} className="relative overflow-hidden py-32 md:py-48">
      <div className="mx-auto mb-16 max-w-7xl px-6 md:px-12">
        <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">— 02 / VAULT</div>
        <h2 className="mt-4 font-[Anton] text-6xl leading-[0.9] tracking-tight md:text-8xl">
          <span className="text-chrome">Recovered</span>{" "}
          <span className="italic text-blood">frames.</span>
        </h2>
      </div>

      <motion.div style={{ x }} className="flex gap-6 pl-6 md:gap-10 md:pl-12">
        {FRAMES.map((f, i) => (
          <div key={i} className="relative flex h-[70vh] w-[62vw] shrink-0 flex-col justify-between overflow-hidden rounded-xl border border-white/10 md:w-[36vw]">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 40%, ${f.tone}, transparent 70%), linear-gradient(180deg, oklch(0.15 0.005 20), oklch(0.05 0.005 20))` }} />
            <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 3px, oklch(1 0 0 / 0.12) 3px 4px)" }} />
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 bg-[oklch(1_0_0/0.05)] blur-2xl" />

            <div className="relative flex items-start justify-between p-6 font-mono text-[10px] tracking-[0.28em] text-white/70 md:p-8">
              <span>NO. {String(i + 1).padStart(3, "0")}</span>
              <span className="rounded border border-white/20 px-2 py-0.5">{f.tag}</span>
            </div>
            <div className="relative p-6 md:p-8">
              <div className="font-[Anton] text-3xl leading-none tracking-tight text-white md:text-5xl">
                {f.title}
              </div>
              <div className="mt-3 h-px w-12 bg-white/40" />
              <div className="mt-3 font-mono text-[10px] tracking-[0.3em] text-white/50">
                CAM · 35MM · CLASSIFIED
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}