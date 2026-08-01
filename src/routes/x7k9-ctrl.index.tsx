import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ClientOnly } from "@/components/experience/ClientOnly";
import {
  listBookings,
  setBookingStatus,
  getBookingStats,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/x7k9-ctrl/")({
  head: () => ({
    meta: [
      { title: "Admin — ILLUMINATI 3.0" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ClientOnly>
      <AdminPage />
    </ClientOnly>
  ),
});

type Row = {
  id: string;
  pass_type: string;
  category: string;
  full_name: string;
  phone: string;
  utr: string;
  purchase_id: string | null;
  status: string;
  ticket_token: string | null;
  checked_in_at: string | null;
  created_at: string;
  user_code: string | null;
  screenshot_url: string | null;
  coupon_code: string | null;
  discount_percent: number | null;
  final_amount: number | null;
};

type Stats = {
  total: number; pending: number; verified: number; declined: number;
  checked_in: number; vip: number; standard: number;
};

const BLOOD = "oklch(0.5 0.24 25)";
const BLOOD_DIM = "oklch(0.38 0.2 25)";
const BLOOD_GLOW = "oklch(0.65 0.26 25)";

function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "unauth" | "forbidden" | "ok">("loading");
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<string>("pending");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);

  const load = useCallback(async (accessToken: string, status: string, query: string) => {
    try {
      const [b, s] = await Promise.all([
        listBookings({ data: { accessToken, status, q: query || undefined } }),
        getBookingStats({ data: { accessToken } }),
      ]);
      setRows(b.rows as Row[]);
      setStats(s);
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
      await load(data.session.access_token, filter, q);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) return;
    const t = setTimeout(() => load(token, filter, q), 250);
    return () => clearTimeout(t);
  }, [filter, q, token, load]);

  // Realtime: auto-refresh whenever bookings change
  useEffect(() => {
    if (!token) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastRun = 0;
    let liveTimer: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      if (timer) return; // already queued in this window
      const now = Date.now();
      const sinceLast = now - lastRun;
      // Throttle: min 500ms between runs. Debounce: wait 200ms for burst to settle.
      const wait = Math.max(200, 500 - sinceLast);
      timer = setTimeout(() => {
        timer = null;
        lastRun = Date.now();
        load(token, filter, q);
      }, wait);
    };
    const channel = supabase
      .channel("admin-bookings-stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        (payload) => {
          setLive(true);
          if (liveTimer) clearTimeout(liveTimer);
          liveTimer = setTimeout(() => setLive(false), 1200);
          const changedId =
            (payload.new as { id?: string } | null)?.id ??
            (payload.old as { id?: string } | null)?.id ??
            null;
          if (changedId) {
            setFlashId(changedId);
            setTimeout(() => setFlashId((c) => (c === changedId ? null : c)), 1400);
          }
          schedule();
        },
      )
      .subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      if (liveTimer) clearTimeout(liveTimer);
      supabase.removeChannel(channel);
    };
  }, [token, filter, q, load]);

  const act = async (id: string, status: "verified" | "declined" | "pending") => {
    if (!token) return;
    setBusy(id);
    setErr(null);
    // Optimistic update — no wait for the round-trip.
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await setBookingStatus({ data: { accessToken: token, bookingId: id, status } });
      // Realtime subscription will refresh silently; no blocking reload.
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
      // Revert on error by forcing a reload.
      await load(token, filter, q);
    } finally {
      setBusy(null);
    }
  };

  const exportVerifiedToCSV = () => {
    const targetRows = filter === "all"
      ? rows
      : rows.filter((r) => {
          if (filter === "verified") return r.status === "verified" || r.status === "active";
          if (filter === "checked_in") return r.checked_in_at != null;
          if (filter === "pending") return r.status === "pending";
          if (filter === "declined") return r.status === "declined";
          return true;
        });

    if (!targetRows.length) {
      alert("No matching members found to export.");
      return;
    }

    const headers = [
      "Full Name",
      "Phone",
      "User Code",
      "Pass Type",
      "Category",
      "UTR / Ref",
      "Purchase ID",
      "Status",
      "Checked In",
      "Coupon Code",
      "Discount %",
      "Final Amount (INR)",
      "Ticket Token",
      "Submitted At"
    ];

    const escape = (val: string | number | null | undefined) => {
      if (val == null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvLines = [
      headers.join(","),
      ...targetRows.map((r) =>
        [
          escape(r.full_name),
          escape(r.phone),
          escape(r.user_code),
          escape(r.pass_type?.toUpperCase()),
          escape(r.category?.toUpperCase()),
          escape(r.utr),
          escape(r.purchase_id),
          escape(r.checked_in_at ? "CHECKED IN" : r.status?.toUpperCase()),
          escape(r.checked_in_at ? new Date(r.checked_in_at).toLocaleString("en-IN") : "NO"),
          escape(r.coupon_code),
          escape(r.discount_percent),
          escape(r.final_amount),
          escape(r.ticket_token),
          escape(new Date(r.created_at).toLocaleString("en-IN")),
        ].join(",")
      ),
    ];

    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `illuminati_members_${filter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filters = useMemo(() => [
    { key: "pending", label: "PENDING", n: stats?.pending },
    { key: "verified", label: "VERIFIED", n: stats?.verified },
    { key: "declined", label: "DECLINED", n: stats?.declined },
    { key: "checked_in", label: "CHECKED IN", n: stats?.checked_in },
    { key: "all", label: "ALL", n: stats?.total },
  ], [stats]);

  return (
    <main className="relative min-h-screen bg-black px-4 py-10 text-white md:px-10">
      {/* ambient blood grid */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-40"
        style={{
          background: `radial-gradient(circle at 20% 10%, ${BLOOD_DIM}22, transparent 40%), radial-gradient(circle at 90% 90%, ${BLOOD}22, transparent 40%), linear-gradient(#0a0000, #000)`,
        }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.3 0.15 25 / 0.08) 1px, transparent 1px), linear-gradient(90deg, oklch(0.3 0.15 25 / 0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at 50% 30%, black 20%, transparent 80%)",
        }}
      />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-white/40">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: BLOOD, boxShadow: `0 0 12px ${BLOOD_GLOW}` }} />
              CONTROL ROOM · ILLUMINATI 3.0
            </div>
            <h1 className="mt-3 font-[Anton] text-6xl leading-[0.85] tracking-tight md:text-7xl">
              BLOOD <span style={{ color: BLOOD, textShadow: `0 0 24px ${BLOOD_DIM}` }}>LEDGER.</span>
            </h1>
            <p className="mt-2 max-w-xl font-serif italic text-white/50">
              Verify payments. Mint passes. Watch the gate.
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[9px] tracking-[0.32em] transition-colors"
              style={{
                borderColor: live ? BLOOD : "rgba(255,255,255,0.12)",
                color: live ? BLOOD_GLOW : "rgba(255,255,255,0.4)",
              }}
              title="Live database stream"
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: live ? BLOOD_GLOW : "oklch(0.55 0.18 145)",
                  boxShadow: live ? `0 0 10px ${BLOOD_GLOW}` : "0 0 6px oklch(0.55 0.18 145)",
                  animation: "pulse 1.4s ease-in-out infinite",
                }}
              />
              {live ? "SYNCING" : "LIVE"}
            </span>
            <button
              onClick={exportVerifiedToCSV}
              className="rounded-full border border-emerald-500/40 bg-emerald-950/40 px-4 py-2 font-mono text-[10px] tracking-[0.32em] text-emerald-400 hover:bg-emerald-900/60 hover:text-white"
              title="Download Excel / CSV file"
            >
              EXPORT EXCEL ↓
            </button>
            <Link to="/x7k9-ctrl/roster" className="rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] tracking-[0.32em] text-white/70 hover:border-[oklch(0.55_0.24_25)] hover:text-white">
              STAFF →
            </Link>
            <Link to="/x7k9-ctrl/coupons" className="rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] tracking-[0.32em] text-white/70 hover:border-[oklch(0.55_0.24_25)] hover:text-white">
              COUPONS →
            </Link>
            <Link to="/z3n-scan" className="rounded-full px-4 py-2 font-mono text-[10px] tracking-[0.32em] text-white" style={{ backgroundColor: BLOOD }}>
              GATE →
            </Link>
          </div>
        </div>

        {/* States */}
        {state === "loading" && (
          <p className="mt-10 font-mono text-[11px] tracking-[0.32em] text-white/40">LOADING LEDGER…</p>
        )}
        {state === "unauth" && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-black/60 p-6">
            <Link to="/login" className="font-mono text-[11px] tracking-[0.32em]" style={{ color: BLOOD_GLOW }}>SIGN IN →</Link>
          </div>
        )}
        {state === "forbidden" && (
          <p className="mt-10 font-serif italic text-white/60">Admin only. Ask the ringleader to grant you the admin role.</p>
        )}

        {state === "ok" && (
          <>
            {/* Stats strip */}
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
              <StatCard label="TOTAL" value={stats?.total ?? 0} />
              <StatCard label="PENDING" value={stats?.pending ?? 0} accent />
              <StatCard label="VERIFIED" value={stats?.verified ?? 0} />
              <StatCard label="DECLINED" value={stats?.declined ?? 0} />
              <StatCard label="CHECKED IN" value={stats?.checked_in ?? 0} />
              <StatCard label="VIP" value={stats?.vip ?? 0} />
              <StatCard label="STANDARD" value={stats?.standard ?? 0} />
            </div>

            {/* Filters + search */}
            <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => {
                  const active = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className="rounded-full border px-4 py-2 font-mono text-[10px] tracking-[0.32em] transition-colors"
                      style={{
                        borderColor: active ? BLOOD : "rgba(255,255,255,0.12)",
                        backgroundColor: active ? BLOOD : "transparent",
                        color: active ? "white" : "rgba(255,255,255,0.6)",
                        boxShadow: active ? `0 0 20px ${BLOOD_DIM}` : undefined,
                      }}
                    >
                      {f.label}{typeof f.n === "number" ? ` · ${f.n}` : ""}
                    </button>
                  );
                })}
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="search name / phone / UTR / purchase ID"
                className="w-full rounded-full border border-white/15 bg-black/60 px-5 py-2.5 font-mono text-xs tracking-[0.1em] text-white placeholder:text-white/25 focus:border-[oklch(0.55_0.24_25)] focus:outline-none md:w-96"
              />
            </div>

            {err && <p className="mt-4 font-mono text-[10px] tracking-[0.3em]" style={{ color: BLOOD_GLOW }}>{err}</p>}

            {/* Table */}
            <div className="mt-6 space-y-3">
              {rows.length === 0 && (
                <p className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center font-serif italic text-white/40">
                  Nothing here yet.
                </p>
              )}
              {rows.map((r) => (
                <BookingCard
                  key={r.id}
                  row={r}
                  busy={busy === r.id}
                  flash={flashId === r.id}
                  onZoom={() => r.screenshot_url && setZoom(r.screenshot_url)}
                  onVerify={() => act(r.id, "verified")}
                  onDecline={() => act(r.id, "declined")}
                  onReset={() => act(r.id, "pending")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Screenshot zoom modal */}
      {zoom && (
        <button
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur"
        >
          <img src={zoom} alt="Payment proof" className="max-h-[90vh] max-w-full rounded-xl border border-[oklch(0.55_0.24_25)]/40 object-contain" style={{ boxShadow: `0 0 60px ${BLOOD_DIM}` }} />
        </button>
      )}
    </main>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border p-4"
      style={{
        borderColor: accent ? BLOOD : "rgba(255,255,255,0.1)",
        background: accent
          ? `linear-gradient(135deg, ${BLOOD_DIM}44, transparent)`
          : "linear-gradient(135deg, rgba(255,255,255,0.02), transparent)",
      }}
    >
      <div className="font-mono text-[9px] tracking-[0.32em] text-white/50">{label}</div>
      <div className="mt-2 font-[Anton] text-4xl leading-none" style={{ color: accent ? BLOOD_GLOW : "white" }}>
        {value}
      </div>
    </div>
  );
}

function BookingCard({
  row, busy, flash, onZoom, onVerify, onDecline, onReset,
}: {
  row: Row; busy: boolean; flash?: boolean;
  onZoom: () => void; onVerify: () => void; onDecline: () => void; onReset: () => void;
}) {
  const statusStyle = (() => {
    if (row.checked_in_at) return { c: "oklch(0.7 0.18 145)", t: "CHECKED IN" };
    if (row.status === "verified" || row.status === "active") return { c: "oklch(0.72 0.18 145)", t: "VERIFIED" };
    if (row.status === "declined") return { c: "oklch(0.6 0.05 25)", t: "DECLINED" };
    return { c: BLOOD_GLOW, t: "PENDING" };
  })();

  const waHref = (() => {
    const digits = (row.phone || "").replace(/\D/g, "");
    if (!digits) return null;
    const phone = digits.length === 10 ? `91${digits}` : digits;
    const isVerified = row.status === "verified" || row.status === "active";
    const isDeclined = row.status === "declined";
    if (!isVerified && !isDeclined) return null;
    const passLine = `${row.pass_type.toUpperCase()} · ${row.category.toUpperCase()}`;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const passUrl = isVerified && row.ticket_token ? `${origin}/p/${row.ticket_token}` : "";
    const archiveUrl = `${origin}/purchases`;
    const firstName = row.full_name.split(" ")[0] || row.full_name;
    const body = isVerified
      ? `Hey ${firstName} 👋\n\nYour ILLUMINATI 3.0 *${passLine}* pass is *APPROVED* ✅\n\nOpen your pass (QR + download): ${passUrl}\n\nAll your passes: ${archiveUrl}\n\nJust show the QR at the gate. See you on the floor.`
      : `Hey ${firstName} 👋\n\nYour ILLUMINATI 3.0 *${passLine}* booking couldn't be verified and has been *DECLINED*.\n\nStatus: ${archiveUrl}\n\nIf this is a mistake, reply with your payment proof and we'll re-check.`;
    const clean = body.replace(/\n{3,}/g, "\n\n");
    return `https://wa.me/${phone}?text=${encodeURIComponent(clean)}`;
  })();

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-black/50 backdrop-blur transition-all duration-500 hover:border-[oklch(0.5_0.24_25)]/60"
      style={{
        borderColor: flash ? BLOOD : "rgba(255,255,255,0.1)",
        boxShadow: flash ? `0 0 32px ${BLOOD_DIM}` : undefined,
      }}
    >
      <div className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: statusStyle.c, boxShadow: `0 0 12px ${statusStyle.c}` }} />
      <div className="grid gap-4 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
        {/* Screenshot thumb */}
        {row.screenshot_url ? (
          <button onClick={onZoom} className="group/thumb relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-white/15">
            <img src={row.screenshot_url} alt="proof" className="h-full w-full object-cover transition-transform group-hover/thumb:scale-110" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover/thumb:opacity-100">
              <span className="font-mono text-[9px] tracking-[0.32em] text-white">ZOOM</span>
            </div>
          </button>
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/10 font-mono text-[9px] tracking-[0.3em] text-white/25">
            NO PROOF
          </div>
        )}

        {/* Details */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-[Anton] text-2xl uppercase leading-none">{row.full_name}</span>
            <span className="font-mono text-[9px] tracking-[0.32em]" style={{ color: statusStyle.c }}>
              ● {statusStyle.t}
            </span>
          </div>
          <div className="mt-2 grid gap-x-6 gap-y-1 font-mono text-[10px] tracking-[0.24em] text-white/60 md:grid-cols-2">
            <div>CODE · <span className="text-white/90">{row.user_code ?? "—"}</span></div>
            <div>PHONE · <span className="text-white/90">{row.phone}</span></div>
            <div>PASS · <span style={{ color: row.pass_type === "vip" ? BLOOD_GLOW : "white" }}>{row.pass_type.toUpperCase()} · {row.category.toUpperCase()}</span></div>
            <div>UTR · <span className="text-white/90 break-all">{row.utr}</span></div>
            <div>SUBMITTED · <span className="text-white/90">{new Date(row.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span></div>
            {row.purchase_id && <div>ID · <span className="text-white/90">{row.purchase_id}</span></div>}
            {row.coupon_code && (
              <div>
                COUPON · <span style={{ color: BLOOD_GLOW }}>{row.coupon_code} · −{row.discount_percent}%</span>
                {row.final_amount != null && <span className="text-white/90"> · ₹{Number(row.final_amount).toLocaleString("en-IN")}</span>}
              </div>
            )}
            {row.ticket_token && <div>TOKEN · <span className="text-white/70 break-all">{row.ticket_token.slice(0, 12)}…</span></div>}
            {row.checked_in_at && <div>ENTERED · <span className="text-white/90">{new Date(row.checked_in_at).toLocaleString()}</span></div>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 md:flex-col md:items-stretch">
          {row.status === "pending" && (
            <>
              <button onClick={onVerify} disabled={busy}
                className="rounded-lg px-4 py-2 font-mono text-[10px] tracking-[0.32em] text-white transition-all hover:brightness-125 disabled:opacity-40"
                style={{ backgroundColor: BLOOD, boxShadow: `0 0 16px ${BLOOD_DIM}` }}>
                {busy ? "…" : "VERIFY →"}
              </button>
              <button onClick={onDecline} disabled={busy}
                className="rounded-lg border border-white/20 px-4 py-2 font-mono text-[10px] tracking-[0.32em] text-white/70 hover:border-white/40 hover:text-white disabled:opacity-40">
                DECLINE
              </button>
            </>
          )}
          {(row.status === "verified" || row.status === "active" || row.status === "declined") && (
            <>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-mono text-[10px] tracking-[0.32em] text-white transition-all hover:brightness-125"
                  style={{ backgroundColor: "oklch(0.55 0.18 145)", boxShadow: "0 0 16px oklch(0.4 0.18 145 / 0.5)" }}
                  title={`Message ${row.full_name} on WhatsApp`}
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                    <path d="M20.5 3.5A11 11 0 0 0 3.6 17.3L2 22l4.9-1.6A11 11 0 1 0 20.5 3.5Zm-8.5 18a9 9 0 0 1-4.6-1.3l-.3-.2-2.9.9.9-2.8-.2-.3A9 9 0 1 1 12 21.5Zm5-6.7c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6 0a7.4 7.4 0 0 1-2.2-1.4 8.3 8.3 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.4.3-.4c.1-.2 0-.3 0-.4l-.9-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4a2.9 2.9 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7s1.9 2.9 4.6 4a15.4 15.4 0 0 0 1.5.6 3.7 3.7 0 0 0 1.7.1 2.7 2.7 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c-.1-.2-.3-.3-.6-.4Z"/>
                  </svg>
                  NOTIFY
                </a>
              )}
              <button onClick={onReset} disabled={busy}
                className="rounded-lg border border-white/15 px-4 py-2 font-mono text-[9px] tracking-[0.32em] text-white/60 hover:border-white/40 hover:text-white disabled:opacity-40">
                RESET → PENDING
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}