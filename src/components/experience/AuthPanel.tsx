import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { resolveEmailByUserCode } from "@/lib/user.functions";

export function AuthPanel({ redirectTo }: { redirectTo: string }) {
  const [mode, setMode] = useState<"signin" | "userid">("signin");
  const [userCode, setUserCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signInGoogle = async () => {
    setBusy(true);
    setError(null);
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        : redirectTo;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });
    if (error) setError(error.message);
    setBusy(false);
  };

  const signInWithUserCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { email } = await resolveEmailByUserCode({ data: { userCode } });
      if (!email) throw new Error("No account found with that User ID.");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = redirectTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md rounded-3xl border border-white/10 bg-black/70 p-8 backdrop-blur-xl"
      style={{
        boxShadow:
          "0 30px 80px -30px oklch(0.4 0.24 25 / 0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">— ACCESS</div>
      <h2 className="mt-3 font-[Anton] text-4xl leading-[0.9] tracking-tight text-white">
        Enter the <span style={{ color: "oklch(0.55 0.24 25)" }}>circle.</span>
      </h2>
      <p className="mt-2 font-serif text-sm italic text-white/50">
        Sign in with Google, or use your User ID.
      </p>

      {mode === "signin" ? (
        <div className="mt-6 space-y-3">
          <button
            onClick={signInGoogle}
            disabled={busy}
            className="w-full rounded-full border border-white/15 bg-white px-5 py-3 font-mono text-[11px] tracking-[0.32em] text-black transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            CONTINUE WITH GOOGLE →
          </button>
          <button
            onClick={() => setMode("userid")}
            className="w-full rounded-full border border-white/15 bg-transparent px-5 py-3 font-mono text-[11px] tracking-[0.32em] text-white/70 transition-colors hover:text-white"
          >
            I HAVE A USER ID
          </button>
        </div>
      ) : (
        <form onSubmit={signInWithUserCode} className="mt-6 space-y-3">
          <input
            value={userCode}
            onChange={(e) => setUserCode(e.target.value.toUpperCase())}
            placeholder="ILL-XXXXXX"
            className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-mono text-sm tracking-[0.2em] text-white placeholder:text-white/25 focus:outline-none"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-mono text-sm text-white placeholder:text-white/25 focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full px-5 py-3 font-mono text-[11px] tracking-[0.32em] text-white transition-transform hover:scale-[1.01] disabled:opacity-50"
            style={{ backgroundColor: "oklch(0.55 0.24 25)" }}
          >
            {busy ? "…" : "SIGN IN →"}
          </button>
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="w-full font-mono text-[10px] tracking-[0.32em] text-white/40 hover:text-white/70"
          >
            ← BACK TO GOOGLE
          </button>
        </form>
      )}

      {error && (
        <div className="mt-4 rounded-lg px-3 py-2 font-mono text-[10px] tracking-[0.2em]" style={{ borderColor: "oklch(0.55 0.24 25 / 0.4)", borderWidth: 1, color: "oklch(0.7 0.22 25)", background: "oklch(0.3 0.15 25 / 0.15)" }}>
          {error}
        </div>
      )}
    </motion.div>
  );
}