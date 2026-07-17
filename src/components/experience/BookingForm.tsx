import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/hooks/useAuth";
import { validateIndianPhone } from "@/lib/user.functions";

const UPI_ID = "6300703253@ybl";
const UPI_PAYEE = "Z3N";
const PRICES = {
  standard: { single: 1400, couple: 2400 },
  vip: { single: 2200, couple: 3400 },
  host: { single: 6.7, couple: 6.7 },
} as const;

export function BookingForm({
  passType,
  userId,
  profile,
}: {
  passType: "standard" | "vip" | "host";
  userId: string;
  profile: Profile;
}) {
  const navigate = useNavigate();
  const isHost = passType === "host";
  const [step, setStep] = useState<"details" | "pay">("details");
  const [bookingId, setBookingId] = useState<string>("");
  const [category, setCategory] = useState<"single" | "couple">("single");
  const displayAmount = (n: number) =>
    Number.isInteger(n) ? n.toLocaleString("en-IN") : n.toFixed(2);
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

  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErr("Name and phone are required.");
      return;
    }
    const check = validateIndianPhone(phone);
    if (!check.ok) {
      setErr(check.reason);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const id = crypto.randomUUID();
      const { error: insErr } = await supabase.from("bookings").insert({
        id,
        user_id: userId,
        pass_type: passType,
        category,
        full_name: fullName.trim(),
        phone: check.normalized,
        status: "pending",
      });
      if (insErr) throw insErr;
      setBookingId(id);
      setStep("pay");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save your details.");
    } finally {
      setBusy(false);
    }
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErr("Please upload your payment screenshot.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${userId}/${bookingId}.${ext}`;
      const up = await supabase.storage
        .from("payment-screenshots")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (up.error) throw up.error;
      const { error: updErr } = await supabase
        .from("bookings")
        .update({ utr: utr.trim(), screenshot_path: path })
        .eq("id", bookingId)
        .eq("user_id", userId);
      if (updErr) throw updErr;
      navigate({ to: "/booking/thankyou" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Booking failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.form
      onSubmit={step === "details" ? submitDetails : submitPayment}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg rounded-3xl border border-white/10 bg-black p-8"
      style={{ boxShadow: "0 30px 80px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)" }}
    >
      <div className="font-mono text-[10px] tracking-[0.4em] text-white/50">
        — {step === "details" ? "STEP 1 · YOUR DETAILS" : "STEP 2 · PAYMENT"} · {passType.toUpperCase()}{isHost ? " · HOSTS ONLY" : ""}
      </div>
      <h2 className="mt-3 font-[Anton] text-4xl leading-[0.9] tracking-tight text-white">
        {step === "details" ? (
          isHost ? (
            <>Request <span className="text-white/50">host access.</span></>
          ) : (
            <>Book your <span className="text-white/50">pass.</span></>
          )
        ) : (
          <>Pay & <span className="text-white/50">confirm.</span></>
        )}
      </h2>
      {step === "details" ? (
      <div className="mt-6 space-y-3">
        {!isHost && <div className="grid grid-cols-2 gap-2">
          {(["single", "couple"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-2 font-mono text-[10px] tracking-[0.32em] uppercase transition-colors ${
                category === c ? "border-white bg-white text-black" : "border-white/15 text-white/60 hover:border-white/40"
              }`}
            >
              {c === "single" ? `Single · ₹${passType === "vip" ? "2,200" : "1,400"}` : `Couple · ₹${passType === "vip" ? "3,400" : "2,400"}`}
            </button>
          ))}
        </div>}
        {isHost && (
          <div className="rounded-xl border border-white/10 bg-black px-4 py-3 font-serif text-[12px] italic text-white/60">
            Hosts only — ₹6.70 to submit your request. Our team reviews every application; not everyone will be approved. You'll be notified once your access is confirmed.
          </div>
        )}
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" required
          className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 font-serif text-white placeholder:text-white/25 focus:border-white/40 focus:outline-none" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Phone number" required
          className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 font-serif text-white placeholder:text-white/25 focus:border-white/40 focus:outline-none" />
      </div>
      ) : (
      <div className="mt-6 space-y-3">
        <div className="rounded-xl border border-white/10 bg-black px-4 py-3 font-mono text-[10px] tracking-[0.3em] text-white/60">
          <div className="flex items-center justify-between">
            <span>{category.toUpperCase()} · {passType.toUpperCase()}</span>
            <span className="text-white">₹{displayAmount(amount)}</span>
          </div>
          <div className="mt-1 font-serif text-[12px] italic normal-case tracking-normal text-white/50">
            {fullName} · {phone}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black p-4 text-center">
          <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">
            SCAN TO PAY · ₹{displayAmount(amount)}
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
            Amount is locked to ₹{displayAmount(amount)} — don't edit it. Paste your UTR below after paying.
          </div>
        </div>
        <input value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="UTR / Transaction number" required maxLength={64}
          className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 font-mono text-sm tracking-[0.15em] text-white placeholder:text-white/25 focus:border-white/40 focus:outline-none" />
        <label className="flex cursor-pointer flex-col rounded-xl border border-dashed border-white/20 bg-black p-4 text-center">
          <span className="font-mono text-[10px] tracking-[0.4em] text-white/50">
            {file ? "SELECTED" : "UPLOAD PAYMENT SCREENSHOT"}
          </span>
          <span className="mt-1 font-serif text-[12px] italic text-white/50">
            {file ? file.name : "PNG or JPG"}
          </span>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
        </label>
      </div>
      )}
      {err && (
        <div className="mt-4 rounded-lg border border-white/20 bg-white/5 px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-white/80">
          {err}
        </div>
      )}
      <button type="submit" disabled={busy}
        className="mt-5 w-full rounded-full border border-white bg-white px-5 py-3 font-mono text-[11px] tracking-[0.32em] text-black transition-transform hover:scale-[1.01] disabled:opacity-50">
        {busy
          ? "SUBMITTING…"
          : step === "details"
            ? "CONTINUE TO PAYMENT →"
            : "SUBMIT PAYMENT →"}
      </button>
    </motion.form>
  );
}