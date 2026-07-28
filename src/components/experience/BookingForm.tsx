import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/hooks/useAuth";
import { validateIndianPhone } from "@/lib/user.functions";
import { validateCoupon } from "@/lib/coupon.functions";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
};

const UPI_ID = "6300703253@ybl";
const UPI_PAYEE = "Divyansh Goyal";
const PRICES = {
  standard: { single: 1400, couple: 2400 },
  vip: { single: 2200, couple: 3800 },
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
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; percent_off: number } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  const baseAmount = PRICES[passType][category];
  const amount = coupon
    ? Math.max(1, Math.round((baseAmount * (100 - coupon.percent_off)) / 100))
    : baseAmount;
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
      setErr(getErrorMessage(e, "Could not save your details."));
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
        .update({
          utr: utr.trim(),
          screenshot_path: path,
          coupon_code: coupon?.code ?? null,
          discount_percent: coupon?.percent_off ?? null,
          final_amount: amount,
        })
        .eq("id", bookingId)
        .eq("user_id", userId);
      if (updErr) throw updErr;
      navigate({ to: "/booking/thankyou" });
    } catch (e) {
      setErr(getErrorMessage(e, "Booking failed."));
    } finally {
      setBusy(false);
    }
  };

  const applyCoupon = async () => {
    setCouponMsg(null);
    const raw = couponInput.trim();
    if (!raw) {
      setCoupon(null);
      return;
    }
    setCouponBusy(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Sign in to apply a coupon.");
      const res = await validateCoupon({
        data: { accessToken: token, code: raw, passType },
      });
      setCoupon({ code: res.code, percent_off: res.percent_off });
      setCouponMsg(`${res.code} applied · ${res.percent_off}% off`);
    } catch (e) {
      setCoupon(null);
      setCouponMsg(getErrorMessage(e, "Invalid coupon."));
    } finally {
      setCouponBusy(false);
    }
  };

  const clearCoupon = () => {
    setCoupon(null);
    setCouponInput("");
    setCouponMsg(null);
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
        — {step === "details" ? "STEP 1 · YOUR DETAILS" : "STEP 2 · PAYMENT"} · {passType.toUpperCase()}
      </div>
      <h2 className="mt-3 font-[Anton] text-4xl leading-[0.9] tracking-tight text-white">
        {step === "details" ? (
          <>Book your <span className="text-white/50">pass.</span></>
        ) : (
          <>Pay & <span className="text-white/50">confirm.</span></>
        )}
      </h2>
      {step === "details" ? (
      <div className="mt-6 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(["single", "couple"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-2 font-mono text-[10px] tracking-[0.32em] uppercase transition-colors ${
                category === c ? "border-white bg-white text-black" : "border-white/15 text-white/60 hover:border-white/40"
              }`}
            >
              {c === "single" ? `Single · ₹${passType === "vip" ? "2,200" : "1,400"}` : `Couple · ₹${passType === "vip" ? "3,800" : "2,400"}`}
            </button>
          ))}
        </div>
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
            <span className="text-white">
              {coupon ? (
                <>
                  <span className="mr-2 text-white/40 line-through">₹{displayAmount(baseAmount)}</span>
                  ₹{displayAmount(amount)}
                </>
              ) : (
                <>₹{displayAmount(amount)}</>
              )}
            </span>
          </div>
          <div className="mt-1 font-serif text-[12px] italic normal-case tracking-normal text-white/50">
            {fullName} · {phone}
          </div>
          {coupon && (
            <div className="mt-1 font-mono text-[9px] tracking-[0.32em] text-white/70">
              COUPON · {coupon.code} · −{coupon.percent_off}%
            </div>
          )}
        </div>

        {/* Coupon input */}
        <div className="rounded-xl border border-white/10 bg-black p-3">
          <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">HAVE A COUPON?</div>
          <div className="mt-2 flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              disabled={!!coupon || couponBusy}
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black px-3 py-2 font-mono text-xs tracking-[0.2em] text-white placeholder:text-white/25 focus:border-white/40 focus:outline-none disabled:opacity-50"
            />
            {coupon ? (
              <button
                type="button"
                onClick={clearCoupon}
                className="rounded-lg border border-white/20 px-3 py-2 font-mono text-[10px] tracking-[0.32em] text-white/70 hover:border-white/40 hover:text-white"
              >
                REMOVE
              </button>
            ) : (
              <button
                type="button"
                onClick={applyCoupon}
                disabled={couponBusy || !couponInput.trim()}
                className="rounded-lg border border-white bg-white px-3 py-2 font-mono text-[10px] tracking-[0.32em] text-black disabled:opacity-40"
              >
                {couponBusy ? "…" : "APPLY"}
              </button>
            )}
          </div>
          {couponMsg && (
            <div
              className={`mt-2 font-mono text-[9px] tracking-[0.28em] ${
                coupon ? "text-white/80" : "text-white/50"
              }`}
            >
              {couponMsg}
            </div>
          )}
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
            className="mt-3 inline-block w-full rounded-full border border-white bg-white px-4 py-2.5 font-mono text-[11px] tracking-[0.32em] text-black"
          >
            PAY DIRECTLY IN PHONEPE →
          </a>
          <div className="mt-3 font-serif text-[12px] italic text-white/50">
            On mobile, tap <b className="not-italic">PAY DIRECTLY IN PHONEPE</b> — this bypasses the ₹2,000 scanner limit. On desktop, scan the QR from your phone's PhonePe. Amount is locked. Paste your UTR below after paying.
          </div>
          <div className="mt-3 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-left font-serif text-[12px] italic text-white/70">
            Pay from a <b className="not-italic text-white">bank-linked UPI app</b> (GPay / PhonePe / Paytm). <b className="not-italic text-white">FamX, Slice, Jupiter and other prepaid wallets are blocked by UPI</b> — they will fail. If your payment doesn't go through, tap the WhatsApp button below.
          </div>
          <a
            href={`https://api.whatsapp.com/send?phone=916300703253&text=${encodeURIComponent(`Hey, my UPI payment failed for ILLUMINATI 3.0.\n\nName: ${fullName}\nPhone: ${phone}\nPass: ${passType.toUpperCase()} · ${category.toUpperCase()}\nAmount: ₹${displayAmount(amount)}\nBooking ID: ${bookingId}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block w-full rounded-full border border-white/25 bg-transparent px-4 py-2 font-mono text-[10px] tracking-[0.32em] text-white/80 hover:border-white/60"
          >
            PAYMENT FAILING? WHATSAPP US →
          </a>
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