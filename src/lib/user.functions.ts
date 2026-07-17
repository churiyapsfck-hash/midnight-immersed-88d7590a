import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomCode(len: number) {
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

// Indian mobile: 10 digits starting 6-9, optionally +91/91/0 prefix.
// Rejects obvious dummies: all-same, sequential ascending/descending.
export function validateIndianPhone(raw: string): { ok: true; normalized: string } | { ok: false; reason: string } {
  const digits = raw.replace(/\D/g, "");
  let ten = digits;
  if (ten.length === 12 && ten.startsWith("91")) ten = ten.slice(2);
  else if (ten.length === 11 && ten.startsWith("0")) ten = ten.slice(1);
  if (ten.length !== 10) return { ok: false, reason: "Enter a valid 10-digit Indian mobile number." };
  if (!/^[6-9]/.test(ten)) return { ok: false, reason: "Indian mobile numbers start with 6, 7, 8 or 9." };
  if (/^(\d)\1{9}$/.test(ten)) return { ok: false, reason: "That number looks fake." };
  const asc = "0123456789";
  const desc = "9876543210";
  if (asc.includes(ten) || desc.includes(ten)) return { ok: false, reason: "That number looks fake." };
  return { ok: true, normalized: "+91" + ten };
}

export const completeSignup = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; fullName: string; phone: string; email: string }) =>
    z
      .object({
        userId: z.string().uuid(),
        fullName: z.string().trim().min(1).max(80),
        phone: z.string().trim().min(6).max(20),
        email: z.string().trim().email().max(255),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const check = validateIndianPhone(data.phone);
    if (!check.ok) throw new Error(check.reason);
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    const existing = await admin
      .from("profiles")
      .select("user_code")
      .eq("id", data.userId)
      .maybeSingle();
    if (existing.data) {
      return { alreadyRegistered: true as const, userCode: existing.data.user_code };
    }
    let userCode = "";
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate = "ILL-" + randomCode(6);
      const clash = await admin
        .from("profiles")
        .select("id")
        .eq("user_code", candidate)
        .maybeSingle();
      if (!clash.data) {
        userCode = candidate;
        break;
      }
    }
    if (!userCode) throw new Error("Could not allocate a user code, try again.");
    const { error: insErr } = await admin.from("profiles").insert({
      id: data.userId,
      user_code: userCode,
      full_name: data.fullName,
      phone: check.normalized,
      email: data.email.toLowerCase(),
    });
    if (insErr) throw new Error(insErr.message);
    return { alreadyRegistered: false as const, userCode, password: null as string | null };
  });

export const resolveEmailByUserCode = createServerFn({ method: "POST" })
  .inputValidator((data: { userCode: string }) =>
    z.object({ userCode: z.string().trim().min(3).max(20) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    const { data: prof } = await admin
      .from("profiles")
      .select("id")
      .eq("user_code", data.userCode.toUpperCase())
      .maybeSingle();
    if (!prof) return { email: null as string | null };
    const { data: u } = await admin.auth.admin.getUserById(prof.id);
    return { email: u.user?.email ?? null };
  });