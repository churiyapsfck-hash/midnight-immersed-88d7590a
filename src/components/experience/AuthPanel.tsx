import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { resolveEmailByUserCode } from "@/lib/user.functions";

export function AuthPanel({ redirectTo }: { redirectTo: string }) {
  const [mode, setMode] = useState<"signin" | "signup" | "userid">("signin");
  const [email, setEmail] = useState("");
  const [userCode, setUserCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signInEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else window.location.href = redirectTo;
    setBusy(false);
  };

  const signUpEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setBusy(false);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }
    const emailRedirectTo =
      typeof window !== "undefined" ? `${window.location.origin}${redirectTo}` : redirectTo;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });
    if (error) {
      setError(error.message);
    } else if (data.session) {
      window.location.href = redirectTo;
    } else {
      setNotice("Check your email to confirm your account, then sign in.");
      setMode("signin");
    }
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
        {mode === "signup" ? (
          <>Join the <span style={{ color: "oklch(0.55 0.24 25)" }}>circle.</span></>
        ) : (
          <>Enter the <span style={{ color: "oklch(0.55 0.24 25)" }}>circle.</span></>
        )}
      </h2>
      <p className="mt-2 font-serif text-sm italic text-white/50">
        {mode === "signup"
          ? "Create an account with your email."
          : mode === "userid"
          ? "Use your ILL User ID and password."
          : "Sign in with your email and password."}
      </p>

      {mode === "signin" && (
        <form onSubmit={signInEmail} className="mt-6 space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
            className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-serif text-white placeholder:text-white/25 focus:outline-none" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required
            className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-mono text-sm text-white placeholder:text-white/25 focus:outline-none" />
          <button type="submit" disabled={busy}
            className="w-full rounded-full px-5 py-3 font-mono text-[11px] tracking-[0.32em] text-white transition-transform hover:scale-[1.01] disabled:opacity-50"
            style={{ backgroundColor: "oklch(0.55 0.24 25)" }}>
            {busy ? "…" : "SIGN IN →"}
          </button>
          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={() => { setMode("signup"); setError(null); }}
              className="font-mono text-[10px] tracking-[0.32em] text-white/50 hover:text-white">
              CREATE ACCOUNT
            </button>
            <button type="button" onClick={() => { setMode("userid"); setError(null); }}
              className="font-mono text-[10px] tracking-[0.32em] text-white/50 hover:text-white">
              USE USER ID
            </button>
          </div>
        </form>
      )}

      {mode === "signup" && (
        <form onSubmit={signUpEmail} className="mt-6 space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
            className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-serif text-white placeholder:text-white/25 focus:outline-none" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8 chars)" required minLength={8}
            className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-mono text-sm text-white placeholder:text-white/25 focus:outline-none" />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" required minLength={8}
            className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-mono text-sm text-white placeholder:text-white/25 focus:outline-none" />
          <button type="submit" disabled={busy}
            className="w-full rounded-full px-5 py-3 font-mono text-[11px] tracking-[0.32em] text-white transition-transform hover:scale-[1.01] disabled:opacity-50"
            style={{ backgroundColor: "oklch(0.55 0.24 25)" }}>
            {busy ? "…" : "CREATE ACCOUNT →"}
          </button>
          <button type="button" onClick={() => { setMode("signin"); setError(null); }}
            className="w-full font-mono text-[10px] tracking-[0.32em] text-white/40 hover:text-white/70">
            ← ALREADY HAVE AN ACCOUNT
          </button>
        </form>
      )}

      {mode === "userid" && (
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
            ← BACK TO EMAIL
          </button>
        </form>
      )}

      {notice && (
        <div className="mt-4 rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-white/70">
          {notice}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-lg px-3 py-2 font-mono text-[10px] tracking-[0.2em]" style={{ borderColor: "oklch(0.55 0.24 25 / 0.4)", borderWidth: 1, color: "oklch(0.7 0.22 25)", background: "oklch(0.3 0.15 25 / 0.15)" }}>
          {error}
        </div>
      )}
    </motion.div>
  );
}