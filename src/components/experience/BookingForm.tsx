import { useState } from "react";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/hooks/useAuth";

const UPI_ID = "6300703253@ybl";
const UPI_PAYEE = "Z3N";
const PRICES = {
  standard: { single: 1400, couple: 2400 },
  vip: { single: 2200, couple: 3400 },
} as const;

export function BookingForm({
  passType,
  userId,
  profile,
}: {
  passType: "standard" | "vip";
  userId: string;
  profile: Profile;
}) {
  const navigate = useNavigate();
  const [category, setCategory] = useState<"single" | "couple">("single");
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone);
  const [utr, setUtr] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const amount = PRICES[passType][category];
  const upiLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: UPI_PAYEE,
      am: String(amount),
      cu: "INR",
      tn: `Z3N-${passType.toUpperCase()}-${category.toUpperCase()}`,
    });
    return `upi://pay?${params.toString()}`;
  }, [amount, passType, category]);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(upiLink, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
      color: { dark: "#000000", light: "#ffffff" },
    }).then((url) => { if (!cancelled) setQrDataUrl(url); }).catch(() => {});
    return () => { cancelled = true; };
  }, [upiLink]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErr("Please upload your payment screenshot.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const bookingId = crypto.randomUUID();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${userId}/${bookingId}.${ext}`;
      const up = await supabase.storage
        .from("payment-screenshots")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (up.error) throw up.error;
      const { error: insErr } = await supabase.from("bookings").insert({
        id: bookingId,
        user_id: userId,
        pass_type: passType,
        category,
        full_name: fullName,
        phone,
        utr,
        screenshot_path: path,
        status: "pending",
      });
      if (insErr) throw insErr;
      navigate({ to: "/booking/thankyou" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Booking failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg rounded-3xl border border-white/10 bg-black/70 p-8 backdrop-blur-xl"
      style={{ boxShadow: "0 30px 80px -30px oklch(0.4 0.24 25 / 0.55), inset 0 1px 0 rgba(255,255,255,0.05)" }}
    >
      <div className="font-mono text-[10px] tracking-[0.4em]" style={{ color: "oklch(0.7 0.22 25)" }}>
        — RESERVE · {passType.toUpperCase()}
      </div>
      <h2 className="mt-3 font-[Anton] text-4xl leading-[0.9] tracking-tight text-white">
        Book your <span style={{ color: "oklch(0.55 0.24 25)" }}>pass.</span>
      </h2>
      <div className="mt-6 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(["single", "couple"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-2 font-mono text-[10px] tracking-[0.32em] uppercase transition-colors ${
                category === c ? "text-white" : "border-white/15 text-white/60 hover:border-white/40"
              }`}
              style={category === c ? { backgroundColor: "oklch(0.55 0.24 25)", borderColor: "oklch(0.55 0.24 25)" } : undefined}
            >
              {c === "single" ? `Single · ₹${passType === "vip" ? "2,200" : "1,400"}` : `Couple · ₹${passType === "vip" ? "3,400" : "2,400"}`}
            </button>
          ))}
        </div>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" required
          className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-serif text-white placeholder:text-white/25 focus:outline-none" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Phone number" required
          className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-serif text-white placeholder:text-white/25 focus:outline-none" />
        <div className="rounded-xl border border-white/10 bg-black/50 p-4 text-center">
          <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">
            SCAN TO PAY · ₹{amount.toLocaleString("en-IN")}
          </div>
          <div className="mx-auto mt-3 h-44 w-44 overflow-hidden rounded-lg bg-white p-2">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`UPI QR for ₹${amount}`} className="h-full w-full" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-[10px] tracking-[0.2em] text-black/40">
                LOADING…
              </div>
            )}
          </div>
          <div className="mt-3 font-mono text-[10px] tracking-[0.3em] text-white/50">
            {UPI_ID}
          </div>
          <a
            href={upiLink}
            className="mt-2 inline-block font-mono text-[10px] tracking-[0.3em] text-white/70 underline decoration-white/30 underline-offset-4 md:hidden"
          >
            OPEN IN UPI APP →
          </a>
          <div className="mt-3 font-serif text-[12px] italic text-white/50">
            Amount is locked to ₹{amount.toLocaleString("en-IN")} — don't edit it. Paste your UTR below after paying.
          </div>
        </div>
        <input value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="UTR / Transaction number" required maxLength={64}
          className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-mono text-sm tracking-[0.15em] text-white placeholder:text-white/25 focus:outline-none" />
        <label className="flex cursor-pointer flex-col rounded-xl border border-dashed border-white/20 bg-black/40 p-4 text-center">
          <span className="font-mono text-[10px] tracking-[0.4em] text-white/50">
            {file ? "SELECTED" : "UPLOAD PAYMENT SCREENSHOT"}
          </span>
          <span className="mt-1 font-serif text-[12px] italic text-white/50">
            {file ? file.name : "PNG or JPG"}
          </span>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
        </label>
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
        {busy ? "SUBMITTING…" : "RESERVE →"}
      </button>
    </motion.form>
  );
}