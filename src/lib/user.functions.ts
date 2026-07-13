import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomCode(len: number) {
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}
function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export const completeSignup = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; fullName: string; phone: string }) =>
    z
      .object({
        userId: z.string().uuid(),
        fullName: z.string().trim().min(1).max(80),
        phone: z.string().trim().min(6).max(20),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
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
      const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const candidate = "ILL-" + randomCode(6);
      void alpha;
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
    const password = randomPassword();
    const { error: passErr } = await admin.auth.admin.updateUserById(data.userId, { password });
    if (passErr) throw new Error(passErr.message);
    const { error: insErr } = await admin.from("profiles").insert({
      id: data.userId,
      user_code: userCode,
      full_name: data.fullName,
      phone: data.phone,
    });
    if (insErr) throw new Error(insErr.message);
    return { alreadyRegistered: false as const, userCode, password };
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