import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthPanel } from "@/components/experience/AuthPanel";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ILLUMINATI 3.0" },
      { name: "description", content: "Sign in to view your passes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.href = "/purchases";
      } else {
        setChecking(false);
      }
    });
  }, []);
  if (checking) {
    return <div className="min-h-screen bg-black" />;
  }
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 20%, oklch(0.35 0.22 25 / 0.45), transparent 70%)",
        }}
      />
      <AuthPanel redirectTo="/purchases" />
    </main>
  );
}