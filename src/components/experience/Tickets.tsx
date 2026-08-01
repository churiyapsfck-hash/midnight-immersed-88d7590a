import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

type Pass = {
  id: "standard" | "vip";
  name: string;
  code: string;
  tagline: string;
  pricing: { label: string; price: string }[];
  perks: string[];
  cta: string;
};

const PASSES: Pass[] = [
  {
    id: "standard",
    name: "STANDARD",
    code: "INVITATION · 01",
    tagline: "The complete DAY. Nothing missing.",
    pricing: [
      { label: "Single", price: "₹ 1,400" },
      { label: "Couple", price: "₹ 2,400" },
    ],
    perks: [
      "Unlimited food",
      "Unlimited drinks",
      "Live DJ all DAY",
    ],
    cta: "Reserve Standard",
  },
  {
    id: "vip",
    name: "VIP",
    code: "INVITATION · 02 · ÉLITE",
    tagline: "Beyond the velvet rope.",
    pricing: [
      { label: "Single", price: "₹ 2,200" },
      { label: "Couple", price: "₹ 3,800" },
    ],
    perks: [
      "Separate top-floor lounge",
      "Table service",
      "Complimentary pack of cigarettes",
      "Personal bouncer",
      "Suggest your playlist to our DJ",
    ],
    cta: "Reserve VIP",
  },
];

function PassCard({ p, i }: { p: Pass; i: number }) {
  const isVip = p.id === "vip";
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 180, damping: 18 });
  const glareX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const surface = isVip
      ? "linear-gradient(140deg, #4a0308 0%, #b1141f 22%, #f26770 42%, #7a0006 62%, #2a0002 85%, #b1141f 100%)"
      : "linear-gradient(140deg, #b8bcc4 0%, #f4f5f7 20%, #7c8089 42%, #eef0f3 62%, #4a4d54 82%, #d8dade 100%)";

  const accent = isVip ? "#f26770" : "#f4f5f7";
  const ink = isVip ? "#fff5f5" : "#0a0a0c";
  const sub = isVip ? "rgba(255,240,240,0.75)" : "rgba(15,15,20,0.7)";

  return (
    <div style={{ perspective: 1200 }}>
    <motion.article
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: i * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[360px] overflow-hidden rounded-[36px] p-7"
      style={{
        background: surface,
        boxShadow: isVip
          ? "0 30px 60px -20px rgba(180,20,32,0.55), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.35)"
          : "0 30px 60px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.4)",
        color: ink,
        rotateX: rx,
        rotateY: ry,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Glossy highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-b-[80%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 60%, transparent 100%)",
          mixBlendMode: "overlay",
        }}
      />
      {/* Cursor-tracked glare */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: useTransform(
            [glareX, glareY] as any,
            ([x, y]: any) =>
              `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.55), transparent 55%)`,
          ),
          mixBlendMode: "overlay",
          opacity: 0.85,
        }}
      />

      <header className="relative flex items-center justify-between font-mono text-[9px] tracking-[0.32em]" style={{ color: sub }}>
        <span>{p.code}</span>
        <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-[8px] font-semibold text-red-400 tracking-[0.25em] border border-red-500/30">
          SOLD OUT
        </span>
      </header>

      <h3
        className="relative mt-5 font-[Anton] leading-[0.9] tracking-tight"
        style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)", color: ink }}
      >
        {p.name}
        <span className="block text-[0.32em] tracking-[0.4em]" style={{ color: sub }}>PASS</span>
      </h3>

      <p className="relative mt-3 max-w-[24ch] font-serif text-sm italic" style={{ color: sub }}>
        {p.tagline}
      </p>

      <div className="relative my-5 h-px" style={{ background: `linear-gradient(90deg, transparent, ${isVip ? "rgba(255,220,220,0.6)" : "rgba(0,0,0,0.35)"} 50%, transparent)` }} />

      <div className="relative space-y-1.5">
        {p.pricing.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between opacity-60">
            <span className="font-serif text-[13px] line-through" style={{ color: sub }}>{row.label}</span>
            <span className="font-[Anton] text-lg line-through" style={{ color: ink }}>{row.price}</span>
          </div>
        ))}
      </div>

      <ul className="relative mt-5 space-y-1.5">
        {p.perks.map((perk) => (
          <li key={perk} className="flex items-center gap-2 font-serif text-[12px]" style={{ color: sub }}>
            <span style={{ color: accent }}>◆</span>
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      <div
        className="relative mt-6 block w-full rounded-full py-3 text-center font-mono text-[10px] tracking-[0.4em] cursor-not-allowed select-none"
        style={{
          background: isVip
              ? "linear-gradient(180deg, #1a0002, #2a0004)"
              : "linear-gradient(180deg, #0a0a0c, #141418)",
          color: isVip ? "#f26770" : "#aaaaaa",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 20px -8px rgba(0,0,0,0.7)",
          border: isVip ? "1px solid rgba(242,103,112,0.3)" : "1px solid rgba(255,255,255,0.15)",
        }}
      >
        OUT OF STOCK
      </div>
    </motion.article>
    </div>
  );
}

export function Tickets() {
  const [active, setActive] = useState<"standard" | "vip">("vip");
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 1.4, 0.3]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.1, 0.95]);
  return (
    <section ref={sectionRef} id="tickets" className="relative px-6 py-32 md:px-12 md:py-48">
      <motion.div
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={{
          background: "radial-gradient(ellipse at top, oklch(0.4 0.24 25 / 0.28), transparent 60%)",
          opacity: glowOpacity,
          scale: glowScale,
          transformOrigin: "50% 20%",
        }}
      />
      <div className="relative mx-auto max-w-5xl">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.4em] text-white/40">— 01 / THE INVITATION</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/60 px-3 py-1 font-mono text-[9px] tracking-[0.3em] text-red-400 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                OUT OF STOCK
              </span>
            </div>
            <h2 className="mt-4 font-[Anton] text-6xl leading-[0.9] tracking-tight md:text-8xl">
              <span className="text-chrome">Two invitations.</span>
              <br />
              <span className="text-blood">One BOOM.</span>
            </h2>
          </div>
          <p className="max-w-sm font-serif text-[15px] italic leading-relaxed text-white/55">
            Bookings are officially closed. All passes for ILLUMINATI 3.0 are completely out of stock.
          </p>
        </div>

        <div
          onMouseLeave={() => setActive("vip")}
          className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-12"
        >
          {PASSES.map((p, i) => (
            <div
              key={p.id}
              onMouseEnter={() => setActive(p.id)}
              className={active === p.id ? "opacity-100" : "opacity-70 transition-opacity duration-500"}
            >
              <PassCard p={p} i={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
