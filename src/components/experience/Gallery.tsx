import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import img1 from "@/assets/edition2/16.png.asset.json";
import img2 from "@/assets/edition2/17.png.asset.json";
import img3 from "@/assets/edition2/18.png.asset.json";
import img4 from "@/assets/edition2/19.png.asset.json";
import img5 from "@/assets/edition2/20.png.asset.json";

const FRAMES = [img1.url, img2.url, img3.url, img4.url, img5.url];

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
        {FRAMES.map((src, i) => (
          <div key={i} className="relative flex h-[70vh] w-[62vw] shrink-0 flex-col justify-between overflow-hidden rounded-xl border border-white/10 md:w-[36vw]">
            <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="relative mt-auto p-5 font-mono text-[10px] tracking-[0.28em] text-white/60 md:p-6">
              {String(i + 1).padStart(2, "0")} / {String(FRAMES.length).padStart(2, "0")}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}