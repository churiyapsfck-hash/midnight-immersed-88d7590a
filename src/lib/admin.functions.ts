import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function requireAdmin(accessToken: string) {
  const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
  const admin = getSupabaseAdmin();
  const { data: u, error } = await admin.auth.getUser(accessToken);
  if (error || !u.user) throw new Error("Not signed in.");
  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", u.user.id);
  if (!(roles ?? []).some((r) => r.role === "admin")) {
    throw new Error("Not authorized. Admin only.");
  }
  return { admin, userId: u.user.id };
}

// ------------ bookings admin ------------

export const listBookings = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; status?: string; q?: string }) =>
    z.object({
      accessToken: z.string().min(10),
      status: z.enum(["all", "pending", "verified", "declined", "active", "checked_in"]).optional(),
      q: z.string().trim().max(64).optional(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin } = await requireAdmin(data.accessToken);
    let query = admin
      .from("bookings")
      .select("id, user_id, pass_type, category, full_name, phone, utr, screenshot_path, purchase_id, status, ticket_token, checked_in_at, created_at, coupon_code, discount_percent, final_amount")
      .order("created_at", { ascending: false })
      .limit(200);

    if (data.status && data.status !== "all") {
      if (data.status === "checked_in") {
        query = query.not("checked_in_at", "is", null);
      } else {
        query = query.eq("status", data.status);
      }
    }
    if (data.q && data.q.length >= 2) {
      const q = data.q;
      query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,utr.ilike.%${q}%,purchase_id.ilike.%${q}%`);
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    // Attach user_code + email
    const uids = [...new Set((rows ?? []).map((r) => r.user_id as string))];
    const codeMap = new Map<string, string>();
    if (uids.length) {
      const { data: profs } = await admin.from("profiles").select("id, user_code").in("id", uids);
      for (const p of profs ?? []) codeMap.set(p.id as string, p.user_code as string);
    }

    // Sign screenshots
    const withUrls = await Promise.all(
      (rows ?? []).map(async (r) => {
        let screenshot_url: string | null = null;
        if (r.screenshot_path) {
          const { data: signed } = await admin.storage
            .from("payment-screenshots")
            .createSignedUrl(r.screenshot_path as string, 60 * 30);
          screenshot_url = signed?.signedUrl ?? null;
        }
        return { ...r, user_code: codeMap.get(r.user_id as string) ?? null, screenshot_url };
      }),
    );

    return { rows: withUrls };
  });

export const setBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; bookingId: string; status: string }) =>
    z.object({
      accessToken: z.string().min(10),
      bookingId: z.string().uuid(),
      status: z.enum(["pending", "verified", "declined", "active"]),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin } = await requireAdmin(data.accessToken);
    const { error } = await admin
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.bookingId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const getBookingStats = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string }) =>
    z.object({ accessToken: z.string().min(10) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin } = await requireAdmin(data.accessToken);
    const { data: rows } = await admin
      .from("bookings")
      .select("status, checked_in_at, pass_type");
    const stats = {
      total: 0,
      pending: 0,
      verified: 0,
      declined: 0,
      checked_in: 0,
      vip: 0,
      standard: 0,
    };
    for (const r of rows ?? []) {
      stats.total++;
      if (r.status === "pending") stats.pending++;
      else if (r.status === "verified" || r.status === "active") stats.verified++;
      else if (r.status === "declined") stats.declined++;
      if (r.checked_in_at) stats.checked_in++;
      if (r.pass_type === "vip") stats.vip++;
      else if (r.pass_type === "standard") stats.standard++;
    }
    return stats;
  });

export const listStaff = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string }) =>
    z.object({ accessToken: z.string().min(10) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin } = await requireAdmin(data.accessToken);
    const { data: roles } = await admin
      .from("user_roles")
      .select("id, user_id, role, created_at")
      .order("created_at", { ascending: false });
    const rows: Array<{
      id: string;
      user_id: string;
      role: string;
      created_at: string;
      email: string | null;
      user_code: string | null;
      full_name: string | null;
    }> = [];
    for (const r of roles ?? []) {
      const { data: u } = await admin.auth.admin.getUserById(r.user_id);
      const { data: prof } = await admin
        .from("profiles")
        .select("user_code, full_name")
        .eq("id", r.user_id)
        .maybeSingle();
      rows.push({
        id: r.id,
        user_id: r.user_id,
        role: r.role,
        created_at: r.created_at,
        email: u.user?.email ?? null,
        user_code: prof?.user_code ?? null,
        full_name: prof?.full_name ?? null,
      });
    }
    return { rows };
  });

export const grantGateRole = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; identifier: string }) =>
    z.object({
      accessToken: z.string().min(10),
      identifier: z.string().trim().min(3).max(120),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin } = await requireAdmin(data.accessToken);
    const id = data.identifier.trim();

    let targetUserId: string | null = null;

    // Try user_code first
    if (id.toUpperCase().startsWith("ILL-")) {
      const { data: prof } = await admin
        .from("profiles")
        .select("id")
        .eq("user_code", id.toUpperCase())
        .maybeSingle();
      targetUserId = prof?.id ?? null;
    }

    // Fall back to email lookup
    if (!targetUserId && id.includes("@")) {
      // Auth admin doesn't have a direct email search; page through the first 200 users.
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const match = list.users.find((u) => u.email?.toLowerCase() === id.toLowerCase());
      targetUserId = match?.id ?? null;
    }

    if (!targetUserId) throw new Error("No user found for that ID or email.");

    const { error } = await admin
      .from("user_roles")
      .upsert({ user_id: targetUserId, role: "gate" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true as const, userId: targetUserId };
  });

export const revokeGateRole = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; userId: string }) =>
    z.object({
      accessToken: z.string().min(10),
      userId: z.string().uuid(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin } = await requireAdmin(data.accessToken);
    const { error } = await admin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", "gate");
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ------------ coupons admin ------------

export const listCoupons = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string }) =>
    z.object({ accessToken: z.string().min(10) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin } = await requireAdmin(data.accessToken);
    const { data: rows, error } = await admin
      .from("coupons")
      .select("id, code, percent_off, pass_type, active, created_at, max_uses")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    // Attach current used count per coupon (pending/verified/active bookings).
    const withUsed = await Promise.all(
      (rows ?? []).map(async (c) => {
        const { count } = await admin
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("coupon_code", c.code as string)
          .in("status", ["pending", "verified", "active"]);
        return { ...c, used_count: count ?? 0 };
      }),
    );
    return { rows: withUsed };
  });

export const createCoupon = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; code: string; percentOff: number; passType: "standard" | "vip" | "all"; maxUses: number | null }) =>
    z.object({
      accessToken: z.string().min(10),
      code: z.string().trim().min(2).max(64).regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, - and _ only."),
      percentOff: z.number().int().min(1).max(100),
      passType: z.enum(["standard", "vip", "all"]),
      maxUses: z.number().int().min(1).max(100000).nullable(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin } = await requireAdmin(data.accessToken);
    const code = data.code.trim().toUpperCase();
    const { data: row, error } = await admin
      .from("coupons")
      .insert({ code, percent_off: data.percentOff, pass_type: data.passType, active: true, max_uses: data.maxUses })
      .select("id, code, percent_off, pass_type, active, created_at, max_uses")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("A coupon with that code already exists.");
      throw new Error(error.message);
    }
    return { ...row, used_count: 0 };
  });

export const toggleCoupon = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; couponId: string; active: boolean }) =>
    z.object({
      accessToken: z.string().min(10),
      couponId: z.string().uuid(),
      active: z.boolean(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin } = await requireAdmin(data.accessToken);
    const { error } = await admin
      .from("coupons")
      .update({ active: data.active })
      .eq("id", data.couponId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; couponId: string }) =>
    z.object({
      accessToken: z.string().min(10),
      couponId: z.string().uuid(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin } = await requireAdmin(data.accessToken);
    const { error } = await admin
      .from("coupons")
      .delete()
      .eq("id", data.couponId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });