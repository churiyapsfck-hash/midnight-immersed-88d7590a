import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { MouseEvent } from "react";

type Tier = {
  name: string;
  code: string;
  price: string;
  perks: string[];
  accent: string;
  seal: string;
};

const TIERS: Tier[] = [
  {
    name: "INITIATE",
    code: "TIER 01 · GENERAL",
    price: "€ 140",
    perks: ["Standard entry after 23:00", "Access to main floor", "One welcome pour"],
    accent: "oklch(0.7 0.02 240)",
    seal: "IN-01",
  },
  {
    name: "OBSIDIAN",
    code: "TIER 02 · PRIORITY",
    price: "€ 320",
    perks: ["Priority entry from 22:00", "Mezzanine access", "Silver key + pour set"],
    accent: "oklch(0.55 0.24 25)",
    seal: "OB-02",
  },
  {
    name: "CRIMSON",
    code: "TIER 03 · INNER CIRCLE",
    price: "€ 780",
    perks: ["Private entrance", "Booth + host", "Signed metal key, numbered"],
    accent: "oklch(0.35 0.2 25)",
    seal: "CR-03",
  },
];

function TicketCard({ t, i }: { t: Tier; i: number }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 12 });
  const sry = useSpring(ry, { stiffness: 120, damping: 12 });
  const shineX = useTransform(sry, [-15, 15], ["0%", "100%"]);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 20);
    rx.set(-py * 20);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="[perspective:1600px]"
    >
      <motion.article
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        className="group relative aspect-[10/16] w-full overflow-hidden rounded-2xl border border-white/10"
      >
        {/* Metal base */}
        <div className="absolute inset-0" style={{ background: "var(--gradient-metal)" }} />
        {/* Blood sweep */}
        <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(ellipse at 70% 20%, ${t.accent}, transparent 60%)` }} />
        {/* Chrome edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />

        {/* Holo shine */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `linear-gradient(115deg, transparent 30%, oklch(1 0 0 / 0.15) 45%, oklch(0.7 0.2 25 / 0.15) 55%, transparent 70%)`,
            backgroundSize: "200% 200%",
            backgroundPositionX: shineX,
          }}
        />

        {/* Perforation */}
        <div className="absolute inset-x-6 top-[62%] flex justify-between">
          {Array.from({ length: 18 }).map((_, k) => (
            <span key={k} className="h-1 w-1 rounded-full bg-black/70 shadow-[0_1px_0_oklch(1_0_0/0.15)]" />
          ))}
        </div>

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-6 md:p-7" style={{ transform: "translateZ(30px)" }}>
          <div>
            <div className="flex items-start justify-between font-mono text-[10px] tracking-[0.28em] text-white/60">
              <span>{t.code}</span>
              <span>{t.seal}</span>
            </div>
            <h3 className="mt-6 font-[Anton] text-5xl leading-none tracking-tight text-chrome md:text-6xl">
              {t.name}
            </h3>
            <div className="mt-2 h-px w-16 bg-white/40" />
            <div className="mt-4 font-mono text-[11px] tracking-widest text-white/50">
              21 · 03 · MMXXVI · 22:00 → 06:00
            </div>
          </div>

          <div className="space-y-4">
            <ul className="space-y-2 font-mono text-xs text-white/70">
              {t.perks.map((p) => (
                <li key={p} className="flex gap-2">
                  <span style={{ color: t.accent }}>▸</span>
                  {p}
                </li>
              ))}
            </ul>
            <div className="flex items-end justify-between border-t border-white/10 pt-4">
              <div>
                <div className="font-mono text-[9px] tracking-[0.3em] text-white/40">FEE</div>
                <div className="font-[Anton] text-3xl text-white">{t.price}</div>
              </div>
              <button
                className="group/btn relative overflow-hidden rounded-full border border-white/20 px-4 py-2 font-mono text-[10px] tracking-[0.28em] text-white transition-colors hover:border-white"
                style={{ boxShadow: `0 0 0 1px ${t.accent} inset` }}
              >
                <span className="relative z-10">CLAIM →</span>
                <span
                  className="absolute inset-0 -translate-y-full transition-transform duration-500 group-hover/btn:translate-y-0"
                  style={{ background: t.accent }}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

export function Tickets() {
  return (
    <section id="tickets" className="relative px-6 py-32 md:px-12 md:py-48">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at top, oklch(0.35_0.2_25/0.15), transparent 60%)" }} />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col justify-between gap-6 md:mb-24 md:flex-row md:items-end">
          <div>
            <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">— 01 / ACCESS</div>
            <h2 className="mt-4 font-[Anton] text-6xl leading-[0.9] tracking-tight md:text-8xl">
              <span className="text-chrome">Three keys.</span>
              <br />
              <span className="italic text-blood">One night.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-white/50">
            Each ticket is machined, numbered and sealed. Non-transferable. No refunds. No exceptions.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {TIERS.map((t, i) => (
            <TicketCard key={t.name} t={t} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}