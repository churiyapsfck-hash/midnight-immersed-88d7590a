import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, type MouseEvent } from "react";

type PriceRow = { label: string; price: string };
type Pass = {
  id: "standard" | "vip";
  name: string;
  code: string;
  tagline: string;
  pricing: PriceRow[];
  perks: string[];
  vipExtras?: string[];
  seal: string;
  cta: string;
};

const PASSES: Pass[] = [
  {
    id: "standard",
    name: "STANDARD",
    code: "INVITATION · 01",
    tagline: "The complete night. Nothing missing.",
    pricing: [
      { label: "Girls", price: "₹ 1,499" },
      { label: "Boys", price: "₹ 1,999" },
      { label: "Couples", price: "₹ 2,999" },
    ],
    perks: [
      "Entry to the main floor",
      "Full show & sound experience",
      "Access to bar & lounge",
      "One welcome pour on arrival",
    ],
    seal: "STD · MMXXVI",
    cta: "Reserve Standard",
  },
  {
    id: "vip",
    name: "VIP",
    code: "INVITATION · 02 · ÉLITE",
    tagline: "Everything in Standard — and beyond the velvet rope.",
    pricing: [
      { label: "Girls", price: "₹ 3,499" },
      { label: "Boys", price: "₹ 4,499" },
      { label: "Couples", price: "₹ 6,499" },
    ],
    perks: ["Includes all Standard benefits"],
    vipExtras: [
      "Priority entrance · no queue",
      "VIP lounge & elevated deck",
      "Reserved premium seating",
      "Numbered VIP wristband",
      "Complimentary welcome service",
      "Closer stage & booth access",
    ],
    seal: "VIP · MMXXVI",
    cta: "Reserve VIP",
  },
];

function GlyphIcon({ variant }: { variant: "diamond" | "star" }) {
  return (
    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="0.8">
      {variant === "diamond" ? (
        <path d="M6 1 L11 6 L6 11 L1 6 Z" />
      ) : (
        <path d="M6 1 L7.2 4.8 L11 6 L7.2 7.2 L6 11 L4.8 7.2 L1 6 L4.8 4.8 Z" />
      )}
    </svg>
  );
}

function PassCard({ p, i, active }: { p: Pass; i: number; active: boolean }) {
  const isVip = p.id === "vip";
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 90, damping: 14 });
  const sry = useSpring(ry, { stiffness: 90, damping: 14 });
  const shineX = useTransform(sry, [-12, 12], ["0%", "100%"]);
  const shineY = useTransform(srx, [-12, 12], ["100%", "0%"]);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 12);
    rx.set(-py * 10);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  const foil = isVip ? "oklch(0.55 0.24 25)" : "oklch(0.82 0.02 240)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 80, rotateX: -8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: i * 0.18, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="[perspective:2000px]"
    >
      <motion.article
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        animate={{ y: active ? -8 : 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="group relative aspect-[9/13] w-full overflow-hidden rounded-[4px] border border-white/10"
      >
        {/* Matte black paper base */}
        <div className="absolute inset-0 bg-[oklch(0.08_0.005_20)]" />
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>\")",
          }}
        />
        {/* Corner vignette */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 120%, oklch(0.14 0.02 25 / 0.7), transparent 60%)" }} />
        {isVip && (
          <div className="absolute inset-0 opacity-70" style={{ background: "radial-gradient(ellipse at 80% 0%, oklch(0.4 0.22 25 / 0.55), transparent 55%)" }} />
        )}

        {/* Inner luxury border */}
        <div className="pointer-events-none absolute inset-3 rounded-[2px] border border-white/8" />
        <div className="pointer-events-none absolute inset-[14px] rounded-[1px] border border-white/[0.04]" />

        {/* Light sweep */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(115deg, transparent 35%, oklch(1 0 0 / 0.10) 48%, oklch(0.75 0.22 25 / 0.10) 52%, transparent 68%)",
            backgroundSize: "220% 220%",
            backgroundPositionX: shineX,
            backgroundPositionY: shineY,
          }}
        />

        {/* Content */}
        <div className="relative flex h-full flex-col p-7 md:p-9" style={{ transform: "translateZ(40px)" }}>
          <header className="flex items-start justify-between font-mono text-[9px] tracking-[0.36em] text-white/45">
            <span>{p.code}</span>
            <span className="flex items-center gap-1.5" style={{ color: foil }}>
              <GlyphIcon variant={isVip ? "star" : "diamond"} />
              {p.seal}
            </span>
          </header>

          <div className="mt-10">
            <h3
              className="font-[Anton] leading-[0.88] tracking-tight"
              style={{
                fontSize: "clamp(3.2rem, 6vw, 5.5rem)",
                background: isVip
                  ? "linear-gradient(180deg, oklch(0.78 0.2 25), oklch(0.35 0.22 25))"
                  : "var(--gradient-chrome)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: isVip
                  ? "drop-shadow(0 0 24px oklch(0.5 0.24 25 / 0.45))"
                  : "drop-shadow(0 2px 8px oklch(1 0 0 / 0.14))",
              }}
            >
              {p.name}
              <span className="block text-[0.4em] tracking-[0.4em] text-white/40" style={{ WebkitTextFillColor: "oklch(0.7 0 0 / 0.5)" }}>
                PASS
              </span>
            </h3>
            <p className="mt-5 max-w-[22ch] font-serif text-[15px] italic leading-snug text-white/60">
              {p.tagline}
            </p>
          </div>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${foil} 50%, transparent)` }} />
            <span className="font-mono text-[9px] tracking-[0.4em]" style={{ color: foil }}>◆</span>
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${foil} 50%, transparent)` }} />
          </div>

          {/* Pricing */}
          <div className="space-y-2.5">
            <div className="font-mono text-[9px] tracking-[0.36em] text-white/35">— ENTRY</div>
            {p.pricing.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between border-b border-white/[0.06] pb-2 last:border-none">
                <span className="font-serif text-[13px] tracking-wide text-white/70">{row.label}</span>
                <span className="font-[Anton] text-xl tracking-tight text-white">{row.price}</span>
              </div>
            ))}
          </div>

          {/* Perks */}
          <div className="mt-7 flex-1 space-y-3">
            {isVip && (
              <div className="mb-4 rounded-[2px] border-l-2 pl-3" style={{ borderColor: foil }}>
                <div className="font-mono text-[9px] tracking-[0.36em]" style={{ color: foil }}>◆ INCLUDES ALL STANDARD BENEFITS</div>
                <div className="mt-1 font-serif text-[12px] italic text-white/55">Plus exclusive VIP privileges below</div>
              </div>
            )}
            <ul className="space-y-2.5">
              {(isVip ? p.vipExtras! : p.perks).map((perk, k) => (
                <motion.li
                  key={perk}
                  initial={{ opacity: 0, x: -6 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + k * 0.06, duration: 0.6 }}
                  className="flex items-center gap-3 font-serif text-[13px] leading-snug text-white/75"
                >
                  <span style={{ color: foil }}><GlyphIcon variant={isVip ? "star" : "diamond"} /></span>
                  <span className="flex-1">{perk}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <button
            className="group/btn relative mt-8 overflow-hidden rounded-[2px] border py-3.5 font-mono text-[10px] tracking-[0.4em] text-white transition-all"
            style={{ borderColor: foil, boxShadow: `inset 0 0 0 1px oklch(1 0 0 / 0.04)` }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {p.cta.toUpperCase()}
              <span aria-hidden>→</span>
            </span>
            <span
              className="absolute inset-0 -translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0"
              style={{ background: `linear-gradient(90deg, transparent, ${foil} 50%, transparent)`, opacity: 0.35 }}
            />
          </button>
        </div>
      </motion.article>
    </motion.div>
  );
}

export function Tickets() {
  const [active, setActive] = useState<"standard" | "vip">("vip");
  return (
    <section id="tickets" className="relative px-6 py-32 md:px-12 md:py-48">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at top, oklch(0.35 0.2 25 / 0.14), transparent 60%)" }} />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-16 flex flex-col justify-between gap-6 md:mb-24 md:flex-row md:items-end">
          <div>
            <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">— 01 / THE INVITATION</div>
            <h2 className="mt-4 font-[Anton] text-6xl leading-[0.9] tracking-tight md:text-8xl">
              <span className="text-chrome">Two invitations.</span>
              <br />
              <span className="italic text-blood">One night.</span>
            </h2>
          </div>
          <p className="max-w-sm font-serif text-[15px] italic leading-relaxed text-white/55">
            Each invitation is embossed, numbered and sealed by hand. Non-transferable. No refunds. No exceptions.
          </p>
        </div>

        {/* Toggle */}
        <div className="mb-12 flex justify-center md:mb-16">
          <div className="relative inline-flex rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur">
            {PASSES.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className="relative z-10 px-6 py-2.5 font-mono text-[10px] tracking-[0.36em] text-white/80 transition-colors md:px-9"
              >
                {active === p.id && (
                  <motion.span
                    layoutId="pass-toggle"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: p.id === "vip"
                        ? "linear-gradient(135deg, oklch(0.35 0.22 25), oklch(0.55 0.24 25))"
                        : "linear-gradient(135deg, oklch(0.35 0.005 240), oklch(0.55 0.01 240))",
                      boxShadow: p.id === "vip"
                        ? "0 0 24px oklch(0.5 0.24 25 / 0.4)"
                        : "0 0 16px oklch(1 0 0 / 0.08)",
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  />
                )}
                <span className="relative">{p.name} PASS</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cards: on desktop, both side-by-side with active highlighted. On mobile, show only active. */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-10">
          {PASSES.map((p, i) => (
            <div key={p.id} onMouseEnter={() => setActive(p.id)} className={active === p.id ? "opacity-100" : "opacity-55 transition-opacity duration-700"}>
              <PassCard p={p} i={i} active={active === p.id} />
            </div>
          ))}
        </div>

        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 40, rotateY: -8 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -40, rotateY: 8 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="[perspective:1600px]"
            >
              <PassCard p={PASSES.find((p) => p.id === active)!} i={0} active />
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 text-center font-mono text-[10px] tracking-[0.36em] text-white/35">
            SWIPE · TAP · SWITCH INVITATION
          </div>
        </div>

        <div className="mt-16 flex items-center justify-center gap-4 font-mono text-[9px] tracking-[0.4em] text-white/35 md:mt-24">
          <div className="h-px w-16 bg-white/15" />
          VIP INCLUDES EVERYTHING IN STANDARD
          <div className="h-px w-16 bg-white/15" />
        </div>
      </div>
    </section>
  );
}