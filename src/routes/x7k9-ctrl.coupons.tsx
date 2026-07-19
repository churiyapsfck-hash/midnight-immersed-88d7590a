import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ClientOnly } from "@/components/experience/ClientOnly";
import {
  listCoupons,
  createCoupon,
  toggleCoupon,
  deleteCoupon,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/x7k9-ctrl/coupons")({
  head: () => ({
    meta: [
      { title: "Coupons — ILLUMINATI 3.0" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ClientOnly>
      <CouponsPage />
    </ClientOnly>
  ),
});

type Coupon = {
  id: string;
  code: string;
  percent_off: number;
  pass_type: "standard" | "vip" | "all";
  active: boolean;
  created_at: string;
};

const BLOOD = "oklch(0.5 0.24 25)";
const BLOOD_DIM = "oklch(0.38 0.2 25)";
const BLOOD_GLOW = "oklch(0.65 0.26 25)";

function CouponsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "unauth" | "forbidden" | "ok">("loading");
  const [rows, setRows] = useState<Coupon[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("20");
  const [passType, setPassType] = useState<"standard" | "vip" | "all">("all");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (accessToken: string) => {
    try {
      const res = await listCoupons({ data: { accessToken } });
      setRows(res.rows as Coupon[]);
      setState("ok");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.toLowerCase().includes("admin")) setState("forbidden");
      else setErr(msg || "Failed to load");
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return setState("unauth");
      setToken(data.session.access_token);
      await load(data.session.access_token);
    })();
  }, [load]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const pct = parseInt(percent, 10);
    if (!Number.isFinite(pct) || pct < 1 || pct > 100) {
      setErr("Percent must be 1–100.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await createCoupon({
        data: { accessToken: token, code: code.trim(), percentOff: pct, passType },
      });
      setCode("");
      setPercent("20");
      setPassType("all");
      await load(token);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create coupon.");
    } finally {
      setBusy(false);
    }
  };

  const onToggle = async (c: Coupon) => {
    if (!token) return;
    setRows((prev) => prev.map((r) => (r.id === c.id ? { ...r, active: !c.active } : r)));
    try {
      await toggleCoupon({ data: { accessToken: token, couponId: c.id, active: !c.active } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed.");
      await load(token);
    }
  };

  const onDelete = async (c: Coupon) => {
    if (!token) return;
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    setRows((prev) => prev.filter((r) => r.id !== c.id));
    try {
      await deleteCoupon({ data: { accessToken: token, couponId: c.id } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed.");
      await load(token);
    }
  };

  return (
    <main className="relative min-h-screen bg-black px-4 py-10 text-white md:px-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-40"
        style={{
          background: `radial-gradient(circle at 20% 10%, ${BLOOD_DIM}22, transparent 40%), radial-gradient(circle at 90% 90%, ${BLOOD}22, transparent 40%), linear-gradient(#0a0000, #000)`,
        }}
      />
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between border-b border-white/5 pb-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">
              — COUPON FORGE
            </div>
            <h1 className="mt-3 font-[Anton] text-5xl leading-[0.85] tracking-tight md:text-6xl">
              CUT <span style={{ color: BLOOD, textShadow: `0 0 24px ${BLOOD_DIM}` }}>THE PRICE.</span>
            </h1>
          </div>
          <Link
            to="/x7k9-ctrl"
            className="rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] tracking-[0.32em] text-white/70 hover:border-white/40 hover:text-white"
          >
            ← LEDGER
          </Link>
        </div>

        {state === "loading" && (
          <p className="mt-10 font-mono text-[11px] tracking-[0.32em] text-white/40">LOADING…</p>
        )}
        {state === "unauth" && (
          <Link to="/login" className="mt-10 inline-block font-mono text-[11px] tracking-[0.32em]" style={{ color: BLOOD_GLOW }}>
            SIGN IN →
          </Link>
        )}
        {state === "forbidden" && (
          <p className="mt-10 font-serif italic text-white/60">Admin only.</p>
        )}

        {state === "ok" && (
          <>
            {/* Create form */}
            <form
              onSubmit={onCreate}
              className="mt-8 rounded-2xl border border-white/10 bg-black/60 p-6"
              style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)` }}
            >
              <div className="font-mono text-[10px] tracking-[0.4em] text-white/50">
                — NEW COUPON
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="CODE (e.g. VIP20)"
                  required
                  maxLength={64}
                  className="rounded-lg border border-white/15 bg-black px-4 py-2.5 font-mono text-sm tracking-[0.2em] text-white placeholder:text-white/25 focus:border-[oklch(0.55_0.24_25)] focus:outline-none"
                />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  required
                  className="w-24 rounded-lg border border-white/15 bg-black px-4 py-2.5 text-center font-mono text-sm text-white focus:border-[oklch(0.55_0.24_25)] focus:outline-none"
                />
                <select
                  value={passType}
                  onChange={(e) => setPassType(e.target.value as "standard" | "vip" | "all")}
                  className="rounded-lg border border-white/15 bg-black px-4 py-2.5 font-mono text-xs tracking-[0.2em] text-white focus:border-[oklch(0.55_0.24_25)] focus:outline-none"
                >
                  <option value="all">ALL PASSES</option>
                  <option value="standard">STANDARD ONLY</option>
                  <option value="vip">VIP ONLY</option>
                </select>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg px-4 py-2.5 font-mono text-[10px] tracking-[0.32em] text-white disabled:opacity-40"
                  style={{ backgroundColor: BLOOD, boxShadow: `0 0 16px ${BLOOD_DIM}` }}
                >
                  {busy ? "MINTING…" : "MINT →"}
                </button>
              </div>
              <p className="mt-2 font-serif text-[11px] italic text-white/40">
                Percent-off gets applied on the base price. Restrict to a pass type or leave open.
              </p>
            </form>

            {err && (
              <p className="mt-4 font-mono text-[10px] tracking-[0.3em]" style={{ color: BLOOD_GLOW }}>
                {err}
              </p>
            )}

            {/* List */}
            <div className="mt-8 space-y-3">
              {rows.length === 0 && (
                <p className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center font-serif italic text-white/40">
                  No coupons yet.
                </p>
              )}
              {rows.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-black/50 p-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-[Anton] text-3xl uppercase leading-none tracking-tight">
                        {c.code}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 font-mono text-[9px] tracking-[0.32em]"
                        style={{
                          backgroundColor: c.active ? BLOOD : "rgba(255,255,255,0.08)",
                          color: c.active ? "white" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {c.active ? "ACTIVE" : "PAUSED"}
                      </span>
                    </div>
                    <div className="mt-2 font-mono text-[10px] tracking-[0.24em] text-white/60">
                      −{c.percent_off}% · {c.pass_type === "all" ? "ANY PASS" : `${c.pass_type.toUpperCase()} ONLY`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggle(c)}
                      className="rounded-lg border border-white/20 px-3 py-2 font-mono text-[10px] tracking-[0.32em] text-white/70 hover:border-white/40 hover:text-white"
                    >
                      {c.active ? "PAUSE" : "ACTIVATE"}
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      className="rounded-lg border border-white/15 px-3 py-2 font-mono text-[10px] tracking-[0.32em] text-white/50 hover:border-[oklch(0.55_0.24_25)] hover:text-white"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}