import { useState } from "react";
import { motion } from "framer-motion";
import { completeSignup } from "@/lib/user.functions";

export function ProfileSetupForm({
  userId,
  onDone,
}: {
  userId: string;
  onDone: (creds: { userCode: string; password: string | null; fullName: string; phone: string }) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await completeSignup({ data: { userId, fullName, phone } });
      if (res.alreadyRegistered) {
        onDone({ userCode: res.userCode, password: null, fullName, phone });
      } else {
        onDone({ userCode: res.userCode, password: res.password, fullName, phone });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md rounded-3xl border border-white/10 bg-black/70 p-8 backdrop-blur-xl"
      style={{ boxShadow: "0 30px 80px -30px oklch(0.4 0.24 25 / 0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}
    >
      <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">— DETAILS</div>
      <h2 className="mt-3 font-[Anton] text-4xl leading-[0.9] tracking-tight text-white">
        Complete your <span style={{ color: "oklch(0.55 0.24 25)" }}>profile.</span>
      </h2>
      <div className="mt-6 space-y-3">
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" required maxLength={80}
          className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-serif text-white placeholder:text-white/25 focus:outline-none" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Phone number" required maxLength={20}
          className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-serif text-white placeholder:text-white/25 focus:outline-none" />
      </div>
      {err && (
        <div className="mt-4 rounded-lg px-3 py-2 font-mono text-[10px] tracking-[0.2em]"
          style={{ borderColor: "oklch(0.55 0.24 25 / 0.4)", borderWidth: 1, color: "oklch(0.7 0.22 25)", background: "oklch(0.3 0.15 25 / 0.15)" }}>
          {err}
        </div>
      )}
      <button type="submit" disabled={busy}
        className="mt-5 w-full rounded-full px-5 py-3 font-mono text-[11px] tracking-[0.32em] text-white transition-transform hover:scale-[1.01] disabled:opacity-50"
        style={{ backgroundColor: "oklch(0.55 0.24 25)" }}>
        {busy ? "…" : "GENERATE MY ACCESS →"}
      </button>
    </motion.form>
  );
}