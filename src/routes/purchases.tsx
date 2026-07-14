import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ClientOnly } from "@/components/experience/ClientOnly";

type Booking = {
  id: string;
  pass_type: string;
  category: string;
  full_name: string;
  phone: string;
  utr: string;
  status: "pending" | "verified" | "declined" | "active";
  created_at: string;
  screenshot_path: string | null;
  purchase_id: string | null;
};

export const Route = createFileRoute("/purchases")({
  head: () => ({
    meta: [
      { title: "My Passes — ILLUMINATI 3.0" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ClientOnly>
      <PurchasesPage />
    </ClientOnly>
  ),
});

function PurchasesPage() {
  const [state, setState] = useState<
    { kind: "loading" } | { kind: "unauth" } | { kind: "ready"; rows: Booking[] }
  >({ kind: "loading" });

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        setState({ kind: "unauth" });
        return;
      }
      const { data } = await supabase
        .from("bookings")
        .select("id, pass_type, category, full_name, phone, utr, status, created_at, screenshot_path, purchase_id")
        .eq("user_id", sess.session.user.id)
        .order("created_at", { ascending: false });
      setState({ kind: "ready", rows: (data ?? []) as Booking[] });
    })();
  }, []);

  return (
    <main className="relative min-h-screen bg-black px-6 py-24 text-white md:px-12">
      <div aria-hidden className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.35 0.22 25 / 0.25), transparent 60%)" }} />
      <div className="relative mx-auto max-w-4xl">
        <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">— YOUR ARCHIVE</div>
        <h1 className="mt-3 font-[Anton] text-6xl leading-[0.9] tracking-tight md:text-8xl">
          Your <span style={{ color: "oklch(0.55 0.24 25)" }}>passes.</span>
        </h1>
        {state.kind === "loading" && (
          <p className="mt-10 font-mono text-[11px] tracking-[0.3em] text-white/40">LOADING…</p>
        )}
        {state.kind === "unauth" && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-black/50 p-8">
            <p className="font-serif text-lg italic text-white/60">You need to sign in to view your passes.</p>
            <Link to="/standard" className="mt-4 inline-block rounded-full px-5 py-2 font-mono text-[11px] tracking-[0.32em] text-white"
              style={{ backgroundColor: "oklch(0.55 0.24 25)" }}>SIGN IN →</Link>
          </div>
        )}
        {state.kind === "ready" && state.rows.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-black/50 p-8">
            <p className="font-serif text-lg italic text-white/60">No passes yet. Reserve one from the invitation section.</p>
            <Link to="/" hash="tickets"
              className="mt-4 inline-block rounded-full border border-white/15 px-5 py-2 font-mono text-[11px] tracking-[0.32em] text-white/80 hover:text-white">
              GO TO INVITATIONS →
            </Link>
          </div>
        )}
        {state.kind === "ready" && state.rows.length > 0 && (
          <div className="mt-10 space-y-4">
            {state.rows.map((b, i) => (
              <BookingRow key={b.id} b={b} i={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function BookingRow({ b, i }: { b: Booking; i: number }) {
  const color =
    b.status === "verified" || b.status === "active"
      ? "oklch(0.7 0.18 145)"
      : b.status === "declined"
        ? "oklch(0.55 0.24 25)"
        : "oklch(0.7 0.15 85)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/60 p-6 md:flex-row md:items-center"
    >
      <div>
        <div className="font-mono text-[9px] tracking-[0.4em] text-white/40">
          {new Date(b.created_at).toLocaleDateString()} · {b.category.toUpperCase()}
        </div>
        <div className="mt-2 font-[Anton] text-3xl uppercase tracking-tight">{b.pass_type} PASS</div>
        <div className="mt-1 font-serif text-[13px] italic text-white/50">
          {b.full_name} · UTR {b.utr.slice(0, 12)}{b.utr.length > 12 ? "…" : ""}
        </div>
        {b.purchase_id && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/50 px-2 py-1 font-mono text-[10px] tracking-[0.3em] text-white/70">
            <span className="text-white/40">PURCHASE ID</span>
            <span className="text-white">{b.purchase_id}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-start gap-2 md:items-end">
        <span className="rounded-full border px-3 py-1 font-mono text-[9px] tracking-[0.4em]"
          style={{ borderColor: color, color }}>
          {b.status.toUpperCase()}
        </span>
        {(b.status === "verified" || b.status === "active") && (
          <button onClick={() => alert("Pass download coming soon.")}
            className="rounded-full border border-white/15 px-3 py-1 font-mono text-[9px] tracking-[0.32em] text-white/70 hover:text-white">
            DOWNLOAD PASS
          </button>
        )}
      </div>
    </motion.div>
  );
}