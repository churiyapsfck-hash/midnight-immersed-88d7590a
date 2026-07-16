import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ClientOnly } from "@/components/experience/ClientOnly";
import { listStaff, grantGateRole, revokeGateRole } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({
    meta: [
      { title: "Admin · Staff — ILLUMINATI 3.0" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ClientOnly>
      <StaffPage />
    </ClientOnly>
  ),
});

type Row = {
  id: string;
  user_id: string;
  role: string;
  email: string | null;
  user_code: string | null;
  full_name: string | null;
};

function StaffPage() {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "unauth" | "forbidden" | "ok">("loading");
  const [rows, setRows] = useState<Row[]>([]);
  const [identifier, setIdentifier] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async (accessToken: string) => {
    try {
      const res = await listStaff({ data: { accessToken } });
      setRows(res.rows);
      setState("ok");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.toLowerCase().includes("admin")) setState("forbidden");
      else setErr(msg || "Failed to load");
    }
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setState("unauth");
        return;
      }
      setToken(data.session.access_token);
      await refresh(data.session.access_token);
    })();
  }, []);

  const grant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    setErr(null);
    setNotice(null);
    try {
      await grantGateRole({ data: { accessToken: token, identifier } });
      setNotice(`Granted gate role to ${identifier}.`);
      setIdentifier("");
      await refresh(token);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (userId: string) => {
    if (!token) return;
    setBusy(true);
    setErr(null);
    try {
      await revokeGateRole({ data: { accessToken: token, userId } });
      await refresh(token);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black px-6 py-24 text-white md:px-12">
      <div className="relative mx-auto max-w-3xl">
        <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">— ADMIN</div>
        <h1 className="mt-3 font-[Anton] text-5xl leading-[0.9] tracking-tight">
          Staff <span style={{ color: "oklch(0.55 0.24 25)" }}>access.</span>
        </h1>

        {state === "loading" && <p className="mt-8 font-mono text-[11px] tracking-[0.3em] text-white/40">LOADING…</p>}
        {state === "unauth" && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/50 p-6">
            <Link to="/login" className="font-mono text-[11px] tracking-[0.32em]" style={{ color: "oklch(0.7 0.22 25)" }}>SIGN IN →</Link>
          </div>
        )}
        {state === "forbidden" && (
          <p className="mt-8 font-serif italic text-white/60">Admin only.</p>
        )}
        {state === "ok" && (
          <>
            <form onSubmit={grant} className="mt-8 flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/50 p-5 md:flex-row">
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ILL-XXXXXX or email"
                required
                className="flex-1 rounded-xl border border-white/15 bg-black/60 px-4 py-3 font-mono text-sm tracking-[0.1em] text-white placeholder:text-white/25 focus:outline-none"
              />
              <button type="submit" disabled={busy}
                className="rounded-xl px-5 py-3 font-mono text-[11px] tracking-[0.32em] text-white disabled:opacity-50"
                style={{ backgroundColor: "oklch(0.55 0.24 25)" }}>
                GRANT GATE →
              </button>
            </form>
            {notice && <p className="mt-3 font-mono text-[10px] tracking-[0.3em]" style={{ color: "oklch(0.7 0.18 145)" }}>{notice}</p>}
            {err && <p className="mt-3 font-mono text-[10px] tracking-[0.3em]" style={{ color: "oklch(0.7 0.22 25)" }}>{err}</p>}

            <div className="mt-8 space-y-2">
              {rows.length === 0 && (
                <p className="font-serif italic text-white/50">No staff yet.</p>
              )}
              {rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/50 p-4">
                  <div>
                    <div className="font-[Anton] text-xl uppercase leading-tight">{r.full_name ?? "—"}</div>
                    <div className="mt-0.5 font-mono text-[10px] tracking-[0.3em] text-white/50">
                      {r.user_code ?? "—"} · {r.email ?? "—"} · <span style={{ color: r.role === "admin" ? "oklch(0.7 0.18 145)" : "oklch(0.7 0.22 25)" }}>{r.role.toUpperCase()}</span>
                    </div>
                  </div>
                  {r.role === "gate" && (
                    <button
                      onClick={() => revoke(r.user_id)}
                      disabled={busy}
                      className="rounded-full border border-white/15 px-3 py-1 font-mono text-[9px] tracking-[0.32em] text-white/70 hover:border-[oklch(0.55_0.24_25)] hover:text-white disabled:opacity-40"
                    >
                      REVOKE
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}