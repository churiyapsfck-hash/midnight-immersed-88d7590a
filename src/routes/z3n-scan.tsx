import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ClientOnly } from "@/components/experience/ClientOnly";
import { checkInByToken, checkInByBookingId, searchBookings, getMyRoles, lookupByToken } from "@/lib/gate.functions";

export const Route = createFileRoute("/z3n-scan")({
  head: () => ({
    meta: [
      { title: "Gate — ILLUMINATI 3.0" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ClientOnly>
      <GatePage />
    </ClientOnly>
  ),
});

type CheckInResult =
  | { result: "verified"; booking: { full_name: string; pass_type: string; category: string; user_code: string | null; checked_in_at: string } }
  | { result: "already"; booking: { full_name: string; pass_type: string; category: string; checked_in_at: string | null }; byName: string | null }
  | { result: "invalid"; booking?: { status: string } };

type Preview = {
  token: string;
  booking: { full_name: string; pass_type: string; category: string; user_code: string | null; checked_in_at: string | null; status?: string };
  already: boolean;
  byName: string | null;
};

function GatePage() {
  const [ready, setReady] = useState<"loading" | "unauth" | "forbidden" | "ok">("loading");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tab, setTab] = useState<"scan" | "search">("scan");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setReady("unauth");
        return;
      }
      setAccessToken(data.session.access_token);
      const r = await getMyRoles({ data: { accessToken: data.session.access_token } });
      const staff = r.roles.some((x) => x === "gate" || x === "admin");
      setReady(staff ? "ok" : "forbidden");
    })();
  }, []);

  if (ready === "loading") {
    return <FullPage><p className="font-mono text-[11px] tracking-[0.3em] text-white/40">LOADING…</p></FullPage>;
  }
  if (ready === "unauth") {
    return (
      <FullPage>
        <div className="rounded-2xl border border-white/10 bg-black/50 p-8">
          <p className="font-serif text-lg italic text-white/60">Sign in required.</p>
          <Link to="/login" className="mt-4 inline-block rounded-full px-5 py-2 font-mono text-[11px] tracking-[0.32em] text-white" style={{ backgroundColor: "oklch(0.55 0.24 25)" }}>SIGN IN →</Link>
        </div>
      </FullPage>
    );
  }
  if (ready === "forbidden") {
    return (
      <FullPage>
        <div className="rounded-2xl border border-white/10 bg-black/50 p-8">
          <p className="font-serif text-lg italic text-white/60">You don't have gate access.</p>
          <Link to="/" className="mt-4 inline-block font-mono text-[11px] tracking-[0.32em] text-white/50 hover:text-white">← BACK</Link>
        </div>
      </FullPage>
    );
  }

  return (
    <FullPage>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">— DOOR</div>
          <h1 className="mt-1 font-[Anton] text-4xl leading-[0.9] tracking-tight">
            <span style={{ color: "oklch(0.55 0.24 25)" }}>GATE</span> CHECK-IN
          </h1>
        </div>
        <button
          onClick={() => supabase.auth.signOut().then(() => window.location.assign("/"))}
          className="font-mono text-[10px] tracking-[0.32em] text-white/40 hover:text-white"
        >
          SIGN OUT
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
        {(["scan", "search"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative rounded-full px-4 py-2 font-mono text-[10px] tracking-[0.32em] transition-colors ${
              tab === t ? "bg-[oklch(0.55_0.24_25)] text-white" : "text-white/50 hover:text-white"
            }`}
          >
            {t === "scan" ? "SCAN QR" : "SEARCH"}
          </button>
        ))}
      </div>

      {tab === "scan" && <ScannerTab accessToken={accessToken!} />}
      {tab === "search" && <SearchTab accessToken={accessToken!} />}
    </FullPage>
  );
}

function FullPage({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-black px-6 py-16 text-white md:px-12">
      <div aria-hidden className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.35 0.22 25 / 0.2), transparent 60%)" }} />
      <div className="relative mx-auto max-w-md">{children}</div>
    </main>
  );
}

function ScannerTab({ accessToken }: { accessToken: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const busyRef = useRef(false);
  const lastTokenRef = useRef<string>("");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        if (cancelled || !videoRef.current) return;
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          async (res) => {
            if (!res || busyRef.current) return;
            const token = res.getText().trim();
            if (!token || token === lastTokenRef.current) return;
            lastTokenRef.current = token;
            busyRef.current = true;
            try {
              const r = (await checkInByToken({ data: { accessToken, token } })) as CheckInResult;
              setResult(r);
              if ("vibrate" in navigator) navigator.vibrate?.(r.result === "verified" ? 80 : [40, 40, 40]);
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Scan failed");
            } finally {
              setTimeout(() => {
                busyRef.current = false;
                lastTokenRef.current = "";
              }, 2500);
            }
          },
        );
        controlsRef.current = controls;
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Camera unavailable. Use Search tab.");
      }
    })();
    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, [accessToken]);

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
        <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
        <div aria-hidden className="pointer-events-none absolute inset-6 rounded-xl border-2 border-white/30" />
      </div>
      {err && (
        <div className="mt-3 rounded-md border border-white/15 bg-white/5 px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-white/70">
          {err}
        </div>
      )}
      <AnimatePresence mode="wait">
        {result && <ResultCard key={JSON.stringify(result)} r={result} />}
      </AnimatePresence>
    </div>
  );
}

function SearchTab({ accessToken }: { accessToken: string }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Array<{ id: string; full_name: string; phone: string; pass_type: string; category: string; user_code: string | null; checked_in_at: string | null }>>([]);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const doSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 2) return;
    setBusy(true);
    setErr(null);
    setResult(null);
    try {
      const r = await searchBookings({ data: { accessToken, q: q.trim() } });
      setRows(r.matches);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Search failed");
    } finally {
      setBusy(false);
    }
  };

  const check = async (id: string) => {
    setBusy(true);
    setErr(null);
    try {
      const r = (await checkInByBookingId({ data: { accessToken, bookingId: id } })) as CheckInResult;
      setResult(r);
      setRows([]);
      setQ("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Check-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <form onSubmit={doSearch} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ILL- code, phone, or name"
          className="flex-1 rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-mono text-sm tracking-[0.1em] text-white placeholder:text-white/25 focus:outline-none"
        />
        <button type="submit" disabled={busy} className="rounded-xl px-5 font-mono text-[11px] tracking-[0.32em] text-white disabled:opacity-50"
          style={{ backgroundColor: "oklch(0.55 0.24 25)" }}>
          FIND
        </button>
      </form>
      {err && (
        <div className="mt-3 rounded-md border border-white/15 bg-white/5 px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-white/70">{err}</div>
      )}
      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/50 p-3">
            <div className="min-w-0">
              <div className="truncate font-[Anton] text-lg uppercase leading-tight">{r.full_name}</div>
              <div className="mt-0.5 font-mono text-[9px] tracking-[0.3em] text-white/50">
                {r.user_code ?? "—"} · {r.pass_type.toUpperCase()} · {r.category.toUpperCase()}
              </div>
              {r.checked_in_at && (
                <div className="mt-0.5 font-mono text-[9px] tracking-[0.3em]" style={{ color: "oklch(0.7 0.15 85)" }}>
                  ALREADY IN · {new Date(r.checked_in_at).toLocaleTimeString()}
                </div>
              )}
            </div>
            <button
              disabled={busy || !!r.checked_in_at}
              onClick={() => check(r.id)}
              className="rounded-full px-4 py-2 font-mono text-[10px] tracking-[0.32em] text-white disabled:opacity-40"
              style={{ backgroundColor: "oklch(0.55 0.24 25)" }}
            >
              CHECK IN
            </button>
          </div>
        ))}
      </div>
      <AnimatePresence>{result && <ResultCard r={result} />}</AnimatePresence>
    </div>
  );
}

function ResultCard({ r }: { r: CheckInResult }) {
  const color =
    r.result === "verified"
      ? "oklch(0.7 0.18 145)"
      : r.result === "already"
        ? "oklch(0.72 0.15 85)"
        : "oklch(0.6 0.24 25)";
  const label =
    r.result === "verified" ? "✓ VERIFIED · CHECKED IN"
      : r.result === "already" ? "⚠ ALREADY CHECKED IN"
      : "✕ INVALID PASS";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      className="mt-4 rounded-2xl border p-5"
      style={{ borderColor: color, background: "rgba(0,0,0,0.6)" }}
    >
      <div className="font-mono text-[10px] tracking-[0.4em]" style={{ color }}>{label}</div>
      {r.result !== "invalid" && (
        <>
          <div className="mt-2 font-[Anton] text-3xl uppercase leading-tight">{r.booking.full_name}</div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.3em] text-white/60">
            {"user_code" in r.booking && r.booking.user_code ? `${r.booking.user_code} · ` : ""}
            {r.booking.pass_type.toUpperCase()} · {r.booking.category.toUpperCase()}
          </div>
          {r.result === "verified" && (
            <div className="mt-2 font-mono text-[10px] tracking-[0.3em] text-white/50">
              ENTERED · {new Date(r.booking.checked_in_at).toLocaleTimeString()}
            </div>
          )}
          {r.result === "already" && r.booking.checked_in_at && (
            <div className="mt-2 font-mono text-[10px] tracking-[0.3em] text-white/50">
              FIRST SCAN · {new Date(r.booking.checked_in_at).toLocaleTimeString()}
              {r.byName ? ` · ${r.byName}` : ""}
            </div>
          )}
        </>
      )}
      {r.result === "invalid" && r.booking && (
        <div className="mt-2 font-mono text-[10px] tracking-[0.3em] text-white/50">
          STATUS · {r.booking.status.toUpperCase()}
        </div>
      )}
    </motion.div>
  );
}