import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ClientOnly } from "@/components/experience/ClientOnly";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : "/",
  }),
  head: () => ({
    meta: [
      { title: "Signing you in — ILLUMINATI 3.0" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ClientOnly>
      <Callback />
    </ClientOnly>
  ),
});

function Callback() {
  const { next } = useSearch({ from: "/auth/callback" });
  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) break;
        await new Promise((r) => setTimeout(r, 150));
      }
      if (cancelled) return;
      const safe = next.startsWith("/") ? next : "/";
      navigate({ to: safe });
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [next, navigate]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="font-mono text-[11px] tracking-[0.4em] text-white/40">SIGNING YOU IN…</div>
    </main>
  );
}