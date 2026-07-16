import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import img1 from "@/assets/edition2/16.png.asset.json";
import img2 from "@/assets/edition2/17.png.asset.json";
import img3 from "@/assets/edition2/18.png.asset.json";
import img4 from "@/assets/edition2/19.png.asset.json";
import img5 from "@/assets/edition2/20.png.asset.json";

const FRAMES = [
  { title: "FLOOR · UNCHAINED", tag: "ARCHIVE", src: img1.url },
  { title: "MEZZANINE · 02:14", tag: "ARCHIVE", src: img2.url },
  { title: "THE WALL · LIT UP", tag: "ARCHIVE", src: img3.url },
  { title: "HANDS UP · PEAK", tag: "ARCHIVE", src: img4.url },
  { title: "AFTERGLOW", tag: "ARCHIVE", src: img5.url },
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
          <span className="text-chrome">EDITION</span>{" "}
          <span className="text-blood">2</span>
        </h2>
      </div>

      <motion.div style={{ x }} className="flex gap-6 pl-6 md:gap-10 md:pl-12">
        {FRAMES.map((f, i) => (
          <div key={i} className="relative flex h-[70vh] w-[62vw] shrink-0 flex-col justify-between overflow-hidden rounded-xl border border-white/10 md:w-[36vw]">
            <img src={f.src} alt={f.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/60" />
            <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 3px, oklch(1 0 0 / 0.12) 3px 4px)" }} />

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