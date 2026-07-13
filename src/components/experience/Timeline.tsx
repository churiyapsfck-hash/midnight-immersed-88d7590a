import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const STEPS = [
  { t: "22:00", h: "GATES OPEN", d: "Key verification at the black door. No phones past the threshold." },
  { t: "23:30", h: "FIRST SIGNAL", d: "Opening set. Chrome room activates. Fog level rising." },
  { t: "01:00", h: "MAIN CEREMONY", d: "Headliner unveiled. Blood room unlocks for Crimson keys only." },
  { t: "03:30", h: "MECHANICAL HOUR", d: "Live modular set. Strobe protocol engaged." },
  { t: "05:30", h: "ASHES", d: "Final descent. One last pour. The doors seal at sunrise." },
];

export function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 40%"] });
  const lineH = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="timeline" ref={ref} className="relative px-6 py-32 md:px-12 md:py-48">
      <div className="mx-auto max-w-6xl">
        <div className="mb-20 max-w-2xl">
          <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">— 03 / PROTOCOL</div>
          <h2 className="mt-4 font-[Anton] text-6xl leading-[0.9] tracking-tight md:text-8xl">
            <span className="text-chrome">Ceremony</span>{" "}
            <span className="italic text-blood">timeline.</span>
          </h2>
        </div>

        <div className="relative pl-12 md:pl-24">
          <div className="absolute left-4 top-2 h-full w-px bg-white/10 md:left-8" />
          <motion.div
            style={{ height: lineH }}
            className="absolute left-4 top-2 w-px bg-gradient-to-b from-[oklch(0.7_0.22_25)] via-[oklch(0.5_0.24_25)] to-transparent shadow-[0_0_20px_oklch(0.5_0.24_25/0.8)] md:left-8"
          />

          <div className="space-y-14 md:space-y-20">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.t}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <span className="absolute -left-[38px] top-3 flex h-3 w-3 items-center justify-center md:-left-[66px]">
                  <span className="absolute h-3 w-3 rounded-full bg-[oklch(0.55_0.24_25)] shadow-[0_0_16px_oklch(0.55_0.24_25)]" />
                  <span className="absolute h-6 w-6 rounded-full border border-white/20" />
                </span>
                <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-8">
                  <div className="font-mono text-sm tracking-[0.3em] text-white/60">{s.t}</div>
                  <div className="flex-1">
                    <h3 className="font-[Anton] text-3xl tracking-tight text-white md:text-5xl">{s.h}</h3>
                    <p className="mt-2 max-w-lg text-sm text-white/50">{s.d}</p>
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.3em] text-white/30">
                    {String(i + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}