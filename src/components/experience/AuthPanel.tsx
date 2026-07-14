import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        : `/auth/callback?next=${encodeURIComponent(redirectTo)}`;
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

  const title =
    mode === "signup" ? "JOIN THE CIRCLE" : mode === "userid" ? "IDENTIFY YOURSELF" : "ENTER THE CIRCLE";
  const subtitle =
    mode === "signup"
      ? "A new soul steps into the light."
      : mode === "userid"
      ? "Use your ILL User ID and password."
      : "Sign in with your email and password.";

  const inputCls =
    "peer w-full rounded-none border-0 border-b border-white/20 bg-transparent px-0 py-3 font-mono text-sm tracking-[0.08em] text-white placeholder:text-white/25 focus:border-[oklch(0.6_0.24_25)] focus:outline-none focus:ring-0 transition-colors";

  const tabs: Array<{ id: typeof mode; label: string }> = [
    { id: "signin", label: "SIGN IN" },
    { id: "signup", label: "CREATE" },
    { id: "userid", label: "USER ID" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-md"
    >
      {/* Outer glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 30%, oklch(0.5 0.24 25 / 0.5), transparent 70%)",
        }}
      />
      {/* Corner brackets */}
      <span aria-hidden className="absolute -left-2 -top-2 h-6 w-6 border-l border-t border-[oklch(0.6_0.24_25)]" />
      <span aria-hidden className="absolute -right-2 -top-2 h-6 w-6 border-r border-t border-[oklch(0.6_0.24_25)]" />
      <span aria-hidden className="absolute -bottom-2 -left-2 h-6 w-6 border-b border-l border-[oklch(0.6_0.24_25)]" />
      <span aria-hidden className="absolute -bottom-2 -right-2 h-6 w-6 border-b border-r border-[oklch(0.6_0.24_25)]" />

      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl"
        style={{
          boxShadow:
            "0 40px 100px -30px oklch(0.4 0.24 25 / 0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
          }}
        />
        {/* Scanline */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-24"
          style={{
            background:
              "linear-gradient(180deg, transparent, oklch(0.6 0.24 25 / 0.18), transparent)",
          }}
          initial={{ y: "-30%" }}
          animate={{ y: "130%" }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-[oklch(0.6_0.24_25)]"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <span className="font-mono text-[10px] tracking-[0.4em] text-white/50">
                SECURE · CH.03
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.32em] text-white/30">
              {new Date().getFullYear()}
            </span>
          </div>

          <h2 className="mt-6 font-[Anton] text-[42px] leading-[0.95] tracking-tight text-white">
            {title.split(" ").map((w, i, arr) => (
              <span key={i}>
                {i === arr.length - 1 ? (
                  <span style={{ color: "oklch(0.6 0.24 25)" }}>{w}</span>
                ) : (
                  w
                )}
                {i < arr.length - 1 && " "}
              </span>
            ))}
          </h2>
          <p className="mt-2 font-serif text-sm italic text-white/50">{subtitle}</p>

          {/* Tabs */}
          <div className="mt-7 grid grid-cols-3 gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            {tabs.map((t) => {
              const active = mode === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setMode(t.id);
                    setError(null);
                    setNotice(null);
                  }}
                  className="relative rounded-full px-2 py-2 font-mono text-[10px] tracking-[0.28em] transition-colors"
                >
                  {active && (
                    <motion.span
                      layoutId="auth-tab-active"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.55 0.24 25), oklch(0.35 0.22 25))",
                        boxShadow: "0 8px 24px -8px oklch(0.55 0.24 25 / 0.8)",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className={`relative ${active ? "text-white" : "text-white/45 hover:text-white/80"}`}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Forms */}
          <div className="relative mt-7 min-h-[220px]">
            <AnimatePresence mode="wait">
              {mode === "signin" && (
                <motion.form
                  key="signin"
                  onSubmit={signInEmail}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-5"
                >
                  <FieldLabel label="EMAIL">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@circle.io" required className={inputCls} />
                  </FieldLabel>
                  <FieldLabel label="PASSWORD">
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className={inputCls} />
                  </FieldLabel>
                  <SubmitButton busy={busy} label="SIGN IN" />
                </motion.form>
              )}

              {mode === "signup" && (
                <motion.form
                  key="signup"
                  onSubmit={signUpEmail}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-5"
                >
                  <FieldLabel label="EMAIL">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@circle.io" required className={inputCls} />
                  </FieldLabel>
                  <FieldLabel label="PASSWORD">
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="minimum 8 characters" required minLength={8} className={inputCls} />
                  </FieldLabel>
                  <FieldLabel label="CONFIRM">
                    <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="repeat password" required minLength={8} className={inputCls} />
                  </FieldLabel>
                  <SubmitButton busy={busy} label="CREATE ACCOUNT" />
                </motion.form>
              )}

              {mode === "userid" && (
                <motion.form
                  key="userid"
                  onSubmit={signInWithUserCode}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-5"
                >
                  <FieldLabel label="USER ID">
                    <input value={userCode} onChange={(e) => setUserCode(e.target.value.toUpperCase())} placeholder="ILL-XXXXXX" className={`${inputCls} tracking-[0.24em]`} required />
                  </FieldLabel>
                  <FieldLabel label="PASSWORD">
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} required />
                  </FieldLabel>
                  <SubmitButton busy={busy} label="AUTHENTICATE" />
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {notice && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-md border border-white/15 bg-white/5 px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-white/70"
            >
              {notice}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: [0, -4, 4, -2, 0] }}
              transition={{ duration: 0.35 }}
              className="mt-5 rounded-md px-3 py-2 font-mono text-[10px] tracking-[0.2em]"
              style={{
                borderColor: "oklch(0.55 0.24 25 / 0.4)",
                borderWidth: 1,
                color: "oklch(0.78 0.22 25)",
                background: "oklch(0.3 0.15 25 / 0.18)",
              }}
            >
              {error}
            </motion.div>
          )}

          <div className="mt-6 flex items-center justify-between font-mono text-[9px] tracking-[0.32em] text-white/30">
            <span>END-TO-END ENCRYPTED</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[oklch(0.7_0.22_140)]" />
              LINK STABLE
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[9px] tracking-[0.4em] text-white/40">{label}</span>
      {children}
    </label>
  );
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="group relative mt-2 w-full overflow-hidden rounded-full px-5 py-3.5 font-mono text-[11px] tracking-[0.32em] text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
      style={{
        background: "linear-gradient(135deg, oklch(0.58 0.24 25), oklch(0.36 0.22 25))",
        boxShadow:
          "0 20px 40px -18px oklch(0.55 0.24 25 / 0.9), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      <span className="relative">{busy ? "TRANSMITTING…" : `${label} →`}</span>
    </button>
  );
}