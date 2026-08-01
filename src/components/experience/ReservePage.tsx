import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ClientOnly } from "@/components/experience/ClientOnly";
import { ReloadIntro } from "@/components/experience/ReloadIntro";
import { SmoothScroll } from "@/components/experience/SmoothScroll";

export function ReservePage({ passType }: { passType: "standard" | "vip" }) {
  const isVip = passType === "vip";
  return (
    <main className="relative min-h-screen bg-black text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(180,20,32,0.12), transparent 60%), radial-gradient(ellipse at bottom, rgba(255,255,255,0.03), transparent 55%)",
        }}
      />
      <ClientOnly>
        <SmoothScroll />
        <ReloadIntro>
          <div className="relative flex min-h-screen items-center justify-center px-6 py-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-black p-8 text-center"
              style={{ boxShadow: "0 30px 80px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)" }}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/60 px-3 py-1 font-mono text-[9px] tracking-[0.3em] text-red-400 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  OUT OF STOCK
                </span>
              </div>
              <div className="mt-4 font-mono text-[10px] tracking-[0.4em] text-white/40">
                — {passType.toUpperCase()} PASS
              </div>
              <h1 className="mt-3 font-[Anton] text-4xl leading-[0.9] tracking-tight text-white md:text-5xl">
                BOOKINGS <span className="text-red-500">CLOSED.</span>
              </h1>
              <p className="mt-4 font-serif text-sm italic leading-relaxed text-white/60">
                All {isVip ? "VIP" : "Standard"} pass allocations for ILLUMINATI 3.0 have been completely sold out. No further bookings are being accepted at this time.
              </p>
              <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <Link
                to="/"
                className="inline-block w-full rounded-full border border-white bg-white px-5 py-3 font-mono text-[11px] tracking-[0.32em] text-black transition-transform hover:scale-[1.01]"
              >
                RETURN TO HOME →
              </Link>
            </motion.div>
          </div>
        </ReloadIntro>
      </ClientOnly>
    </main>
  );
}