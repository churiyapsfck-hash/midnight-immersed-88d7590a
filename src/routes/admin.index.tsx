import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ClientOnly } from "@/components/experience/ClientOnly";
import {
  listBookings,
  setBookingStatus,
  getBookingStats,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
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

  const act = async (id: string, status: "verified" | "declined" | "pending") => {
    if (!token) return;
    setBusy(id);
    setErr(null);
    try {
      await setBookingStatus({ data: { accessToken: token, bookingId: id, status } });
      await load(token, filter, q);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
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
          <div className="hidden gap-2 md:flex">
            <Link to="/admin/staff" className="rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] tracking-[0.32em] text-white/70 hover:border-[oklch(0.55_0.24_25)] hover:text-white">
              STAFF →
            </Link>
            <Link to="/gate" className="rounded-full px-4 py-2 font-mono text-[10px] tracking-[0.32em] text-white" style={{ backgroundColor: BLOOD }}>
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
  row, busy, onZoom, onVerify, onDecline, onReset,
}: {
  row: Row; busy: boolean;
  onZoom: () => void; onVerify: () => void; onDecline: () => void; onReset: () => void;
}) {
  const statusStyle = (() => {
    if (row.checked_in_at) return { c: "oklch(0.7 0.18 145)", t: "CHECKED IN" };
    if (row.status === "verified" || row.status === "active") return { c: "oklch(0.72 0.18 145)", t: "VERIFIED" };
    if (row.status === "declined") return { c: "oklch(0.6 0.05 25)", t: "DECLINED" };
    return { c: BLOOD_GLOW, t: "PENDING" };
  })();

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 backdrop-blur transition-colors hover:border-[oklch(0.5_0.24_25)]/60">
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
            {row.purchase_id && <div>ID · <span className="text-white/90">{row.purchase_id}</span></div>}
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
            <button onClick={onReset} disabled={busy}
              className="rounded-lg border border-white/15 px-4 py-2 font-mono text-[9px] tracking-[0.32em] text-white/60 hover:border-white/40 hover:text-white disabled:opacity-40">
              RESET → PENDING
            </button>
          )}
        </div>
      </div>
    </div>
  );
}