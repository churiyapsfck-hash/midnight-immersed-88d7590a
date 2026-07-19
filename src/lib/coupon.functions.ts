import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Validate a coupon code for a specific pass type. Used by the booking form.
// Requires a signed-in user's access token to prevent brute-force / scraping.
export const validateCoupon = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; code: string; passType: "standard" | "vip" }) =>
    z.object({
      accessToken: z.string().min(10),
      code: z.string().trim().min(1).max(64),
      passType: z.enum(["standard", "vip"]),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    const { data: u, error: uerr } = await admin.auth.getUser(data.accessToken);
    if (uerr || !u.user) throw new Error("Sign in to apply a coupon.");

    const code = data.code.trim().toUpperCase();
    const { data: row, error } = await admin
      .from("coupons")
      .select("code, percent_off, pass_type, active")
      .eq("code", code)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Invalid coupon code.");
    if (!row.active) throw new Error("This coupon is no longer active.");
    if (row.pass_type !== "all" && row.pass_type !== data.passType) {
      throw new Error(`This coupon only works on ${String(row.pass_type).toUpperCase()} passes.`);
    }
    return {
      code: row.code as string,
      percent_off: row.percent_off as number,
      pass_type: row.pass_type as "standard" | "vip" | "all",
    };
  });