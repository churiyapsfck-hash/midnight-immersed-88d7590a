import { useState } from "react";
import { motion } from "framer-motion";

export function CredentialsCard({
  userCode,
  password,
  onContinue,
}: {
  userCode: string;
  password: string | null;
  onContinue: () => void;
}) {
  const [copiedField, setCopiedField] = useState<"id" | "pw" | null>(null);
  const [ack, setAck] = useState(false);
  const copy = (value: string, field: "id" | "pw") => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1400);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md rounded-3xl border border-white/15 bg-black p-8"
      style={{
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div className="font-mono text-[10px] tracking-[0.4em] text-white/60">— YOUR CREDENTIALS</div>
      <h2 className="mt-3 font-[Anton] text-4xl leading-[0.9] tracking-tight text-white">
        Save these <span className="text-white/50">now.</span>
      </h2>
      <p className="mt-2 font-serif text-sm italic text-white/60">
        {password ? "The password is shown once — write it down." : "This is your access ID for the circle."}
      </p>

      <div className="mt-6 space-y-3">
        <Field label="USER ID" value={userCode} copied={copiedField === "id"} onCopy={() => copy(userCode, "id")} />
        {password && (
          <Field label="PASSWORD" value={password} copied={copiedField === "pw"} onCopy={() => copy(password, "pw")} mono />
        )}
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 font-serif text-[13px] text-white/70">
        <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-1 h-4 w-4" />
        <span>{password ? "I've saved my User ID and password." : "I've saved my User ID."}</span>
      </label>

      <button
        onClick={onContinue}
        disabled={!ack}
        className="mt-5 w-full rounded-full border border-white bg-white px-5 py-3 font-mono text-[11px] tracking-[0.32em] text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
      >
        CONTINUE →
      </button>
    </motion.div>
  );
}

function Field({ label, value, copied, onCopy, mono }: { label: string; value: string; copied: boolean; onCopy: () => void; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black p-4">
      <div className="font-mono text-[9px] tracking-[0.4em] text-white/40">{label}</div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className={mono ? "font-mono text-lg text-white break-all" : "font-[Anton] text-2xl tracking-wider text-white"}>{value}</div>
        <button onClick={onCopy} className="shrink-0 rounded-full border border-white/15 px-3 py-1 font-mono text-[9px] tracking-[0.32em] text-white/70 hover:text-white">
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
    </div>
  );
}