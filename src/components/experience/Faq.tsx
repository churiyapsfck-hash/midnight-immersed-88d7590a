import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const QA = [
  { q: "How do I get on the list?", a: "Referrals only. Existing key holders may vouch once per volume. All applications are reviewed by hand — expect silence or a black envelope." },
  { q: "Where is it?", a: "The address is delivered by encrypted courier 6 hours before doors. Transport is arranged for Crimson keys." },
  { q: "Dress protocol?", a: "Black. Chrome. Blood. No logos, no cameras. Guests visibly outside the aesthetic will be redirected." },
  { q: "Refunds?", a: "None. Tickets are machined metal objects — they retain value as artifacts even unused." },
  { q: "Age?", a: "21+. Photo ID + key required at the black door. No exceptions, no negotiations." },
];

function Row({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05, duration: 0.7 }}
      className="border-b border-white/10"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center justify-between gap-6 py-6 text-left md:py-8"
      >
        <span className="flex items-baseline gap-6">
          <span className="font-mono text-[10px] tracking-[0.3em] text-white/40">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="font-[Anton] text-2xl tracking-tight text-white transition-colors group-hover:text-[oklch(0.75_0.2_25)] md:text-4xl">
            {q}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.03] backdrop-blur"
        >
          <span className="absolute h-3 w-px bg-white" />
          <span className="absolute h-px w-3 bg-white" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="ml-16 max-w-2xl pb-8 text-sm text-white/60 md:text-base">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="relative px-6 py-32 md:px-12 md:py-48">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16">
          <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">— 04 / DECODE</div>
          <h2 className="mt-4 font-[Anton] text-6xl leading-[0.9] tracking-tight md:text-8xl">
            <span className="text-chrome">Ask,</span>{" "}
            <span className="italic text-blood">and know.</span>
          </h2>
        </div>
        <div className="border-t border-white/10">
          {QA.map((x, i) => (
            <Row key={x.q} q={x.q} a={x.a} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}