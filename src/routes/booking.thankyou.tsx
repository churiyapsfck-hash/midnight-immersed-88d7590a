import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/booking/thankyou")({
  head: () => ({
    meta: [
      { title: "Reservation received — ILLUMINATI 3.0" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/" }), 3500);
    return () => clearTimeout(t);
  }, [navigate]);
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, oklch(0.4 0.24 25 / 0.35), transparent 60%)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="font-mono text-[10px] tracking-[0.4em]" style={{ color: "oklch(0.7 0.22 25)" }}>— RECEIVED</div>
        <h1 className="mt-4 font-[Anton] text-6xl leading-[0.9] tracking-tight md:text-8xl">
          Thank <span style={{ color: "oklch(0.55 0.24 25)" }}>you.</span>
        </h1>
        <p className="mt-4 font-serif text-lg italic text-white/60">
          Your reservation is being reviewed. You'll see the status in your Passes.
        </p>
      </motion.div>
    </main>
  );
}