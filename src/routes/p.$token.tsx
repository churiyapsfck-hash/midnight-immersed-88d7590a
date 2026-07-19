import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getPassByToken, getPassInfoByToken } from "@/lib/pass.functions";
import { ClientOnly } from "@/components/experience/ClientOnly";

export const Route = createFileRoute("/p/$token")({
  head: () => ({
    meta: [
      { title: "Your Pass — ILLUMINATI 3.0" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ClientOnly>
      <PassView />
    </ClientOnly>
  ),
});

type Info =
  | { kind: "loading" }
  | { kind: "error"; msg: string }
  | { kind: "ready"; full_name: string; pass_type: string; category: string; user_code: string | null; ticket_token: string };

function PassView() {
  const { token } = Route.useParams();
  const [info, setInfo] = useState<Info>({ kind: "loading" });
  const [dl, setDl] = useState<"idle" | "busy" | "done" | "err">("idle");
  const [dlErr, setDlErr] = useState<string | null>(null);
  const autoTried = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await getPassInfoByToken({ data: { token } });
        if (!r.ok) {
          setInfo({
            kind: "error",
            msg: r.reason === "not_found" ? "Pass not found. Check your link." : "This pass isn't verified yet.",
          });
          return;
        }
        setInfo({ kind: "ready", ...r });
      } catch (e) {
        setInfo({ kind: "error", msg: e instanceof Error ? e.message : "Something went wrong." });
      }
    })();
  }, [token]);

  const download = async () => {
    setDl("busy");
    setDlErr(null);
    try {
      const res = await getPassByToken({ data: { token } });
      const bytes = Uint8Array.from(atob(res.base64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDl("done");
    } catch (e) {
      setDl("err");
      setDlErr(e instanceof Error ? e.message : "Download failed.");
    }
  };

  // Auto-trigger download once info is ready (best-effort; some mobile browsers require a tap).
  useEffect(() => {
    if (info.kind === "ready" && !autoTried.current) {
      autoTried.current = true;
      void download();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.kind]);

  const qrSrc = info.kind === "ready"
    ? `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=10&data=${encodeURIComponent(info.ticket_token)}`
    : "";

  return (
    <main className="relative min-h-screen bg-black px-6 py-16 text-white">
      <div aria-hidden className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.35 0.22 25 / 0.25), transparent 60%)" }} />
      <div className="relative mx-auto max-w-md">
        <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">— YOUR PASS</div>
        <h1 className="mt-2 font-[Anton] text-5xl leading-[0.9] tracking-tight">
          ILLUMINATI <span style={{ color: "oklch(0.55 0.24 25)" }}>3.0</span>
        </h1>

        {info.kind === "loading" && (
          <p className="mt-10 font-mono text-[11px] tracking-[0.3em] text-white/40">LOADING PASS…</p>
        )}

        {info.kind === "error" && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/50 p-6">
            <p className="font-serif text-lg italic text-white/70">{info.msg}</p>
          </div>
        )}

        {info.kind === "ready" && (
          <>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/60 p-6">
              <div className="mx-auto grid h-64 w-64 place-items-center rounded-lg bg-white p-3">
                <img src={qrSrc} alt="Entry QR" className="h-full w-full object-contain" />
              </div>

              <div className="mt-6 space-y-3 font-mono text-[10px] tracking-[0.28em] text-white/60">
                <div>NAME · <span className="text-white">{info.full_name.toUpperCase()}</span></div>
                <div>ID · <span className="text-white">{info.user_code ?? "—"}</span></div>
                <div>PASS · <span style={{ color: info.pass_type === "vip" ? "oklch(0.7 0.22 25)" : "white" }}>
                  {info.pass_type.toUpperCase()} · {info.category.toUpperCase()}
                </span></div>
                <div>GATE · <span className="text-white">AUG 3 · MARQUEE CLUB</span></div>
              </div>

              <button
                onClick={download}
                disabled={dl === "busy"}
                className="mt-6 w-full rounded-full px-5 py-3 font-mono text-[11px] tracking-[0.32em] text-white transition-all hover:brightness-110 disabled:opacity-50"
                style={{ backgroundColor: "oklch(0.55 0.24 25)", boxShadow: "0 0 24px oklch(0.55 0.24 25 / 0.35)" }}
              >
                {dl === "busy" ? "PREPARING PDF…" : dl === "done" ? "DOWNLOAD AGAIN" : "DOWNLOAD PASS PDF"}
              </button>
              {dlErr && (
                <p className="mt-3 font-mono text-[9px] tracking-[0.24em]" style={{ color: "oklch(0.7 0.22 25)" }}>
                  {dlErr}
                </p>
              )}
            </div>

            <p className="mt-6 text-center font-serif text-[13px] italic text-white/40">
              Show this QR at the gate. One-time entry.
            </p>
          </>
        )}
      </div>
    </main>
  );
}