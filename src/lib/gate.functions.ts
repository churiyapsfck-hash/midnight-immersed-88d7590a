import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ------------ helpers ------------

async function requireStaff(accessToken: string) {
  const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
  const admin = getSupabaseAdmin();
  const { data: u, error } = await admin.auth.getUser(accessToken);
  if (error || !u.user) throw new Error("Not signed in.");
  const uid = u.user.id;
  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);
  const has = (r: string) => (roles ?? []).some((x) => x.role === r);
  if (!has("gate") && !has("admin")) {
    throw new Error("Not authorized. You need the gate role.");
  }
  return { admin, userId: uid, isAdmin: has("admin") };
}

// ------------ checkInByToken ------------

// ------------ lookupByToken (preview only, no check-in) ------------

export const lookupByToken = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; token: string }) =>
    z.object({
      accessToken: z.string().min(10),
      token: z.string().trim().min(4).max(64),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin } = await requireStaff(data.accessToken);
    const { data: found } = await admin
      .from("bookings")
      .select("id, status, checked_in_at, checked_in_by, full_name, phone, pass_type, category, user_id, purchase_id")
      .eq("ticket_token", data.token)
      .maybeSingle();
    if (!found) return { result: "invalid" as const };
    if (found.status !== "verified" && found.status !== "active") {
      return { result: "invalid" as const, booking: found };
    }
    const { data: prof } = await admin
      .from("profiles")
      .select("user_code")
      .eq("id", found.user_id)
      .maybeSingle();
    let byName: string | null = null;
    if (found.checked_in_at && found.checked_in_by) {
      const { data: staff } = await admin.auth.admin.getUserById(found.checked_in_by);
      byName = staff.user?.email ?? null;
    }
    return {
      result: (found.checked_in_at ? "already" : "pending") as "already" | "pending",
      booking: { ...found, user_code: prof?.user_code ?? null },
      byName,
    };
  });

export const checkInByToken = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; token: string }) =>
    z.object({
      accessToken: z.string().min(10),
      token: z.string().trim().min(4).max(64),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin, userId } = await requireStaff(data.accessToken);

    const { data: found } = await admin
      .from("bookings")
      .select("id, status, checked_in_at, checked_in_by, full_name, phone, pass_type, category, user_id, purchase_id")
      .eq("ticket_token", data.token)
      .maybeSingle();

    if (!found) return { result: "invalid" as const };
    if (found.status !== "verified" && found.status !== "active") {
      return { result: "invalid" as const, booking: found };
    }
    if (found.checked_in_at) {
      let byName: string | null = null;
      if (found.checked_in_by) {
        const { data: staff } = await admin.auth.admin.getUserById(found.checked_in_by);
        byName = staff.user?.email ?? null;
      }
      return { result: "already" as const, booking: found, byName };
    }

    // Atomic: only wins if checked_in_at is still null.
    const { data: updated } = await admin
      .from("bookings")
      .update({ checked_in_at: new Date().toISOString(), checked_in_by: userId })
      .eq("id", found.id)
      .is("checked_in_at", null)
      .select("id, checked_in_at, full_name, phone, pass_type, category, purchase_id")
      .maybeSingle();

    if (!updated) {
      // Someone else beat us to it — re-read and report already.
      const { data: reread } = await admin
        .from("bookings")
        .select("id, status, checked_in_at, checked_in_by, full_name, phone, pass_type, category, user_id, purchase_id")
        .eq("id", found.id)
        .maybeSingle();
      return { result: "already" as const, booking: reread ?? found, byName: null };
    }

    // Fetch guest user_code for display.
    const { data: prof } = await admin
      .from("profiles")
      .select("user_code")
      .eq("id", found.user_id)
      .maybeSingle();

    return {
      result: "verified" as const,
      booking: { ...found, ...updated, user_code: prof?.user_code ?? null },
    };
  });

// ------------ checkInByBookingId ------------

export const checkInByBookingId = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; bookingId: string }) =>
    z.object({
      accessToken: z.string().min(10),
      bookingId: z.string().uuid(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin, userId } = await requireStaff(data.accessToken);

    const { data: found } = await admin
      .from("bookings")
      .select("id, status, checked_in_at, checked_in_by, full_name, phone, pass_type, category, user_id, ticket_token, purchase_id")
      .eq("id", data.bookingId)
      .maybeSingle();

    if (!found) return { result: "invalid" as const };
    if (found.status !== "verified" && found.status !== "active") {
      return { result: "invalid" as const, booking: found };
    }
    if (found.checked_in_at) {
      return { result: "already" as const, booking: found, byName: null };
    }

    const { data: updated } = await admin
      .from("bookings")
      .update({ checked_in_at: new Date().toISOString(), checked_in_by: userId })
      .eq("id", found.id)
      .is("checked_in_at", null)
      .select("id, checked_in_at, full_name, phone, pass_type, category, purchase_id")
      .maybeSingle();

    if (!updated) {
      return { result: "already" as const, booking: found, byName: null };
    }

    const { data: prof } = await admin
      .from("profiles")
      .select("user_code")
      .eq("id", found.user_id)
      .maybeSingle();

    return {
      result: "verified" as const,
      booking: { ...found, ...updated, user_code: prof?.user_code ?? null },
    };
  });

// ------------ searchBookings ------------

export const searchBookings = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; q: string }) =>
    z.object({
      accessToken: z.string().min(10),
      q: z.string().trim().min(2).max(64),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { admin } = await requireStaff(data.accessToken);
    const q = data.q.trim();

    // Try user_code match first
    const matchedIds = new Set<string>();
    const matches: Array<{
      id: string;
      full_name: string;
      phone: string;
      pass_type: string;
      category: string;
      status: string;
      checked_in_at: string | null;
      user_code: string | null;
    }> = [];

    const push = (rows: Array<Record<string, unknown>>, codeByUser: Map<string, string | null>) => {
      for (const r of rows) {
        const id = r.id as string;
        if (matchedIds.has(id)) continue;
        matchedIds.add(id);
        matches.push({
          id,
          full_name: r.full_name as string,
          phone: r.phone as string,
          pass_type: r.pass_type as string,
          category: r.category as string,
          status: r.status as string,
          checked_in_at: (r.checked_in_at as string) ?? null,
          user_code: codeByUser.get(r.user_id as string) ?? null,
        });
      }
    };

    // Match by user_code via profiles
    const { data: profs } = await admin
      .from("profiles")
      .select("id, user_code")
      .ilike("user_code", `%${q.toUpperCase()}%`)
      .limit(20);
    if (profs && profs.length) {
      const ids = profs.map((p) => p.id);
      const codeMap = new Map(profs.map((p) => [p.id, p.user_code as string]));
      const { data: rows } = await admin
        .from("bookings")
        .select("id, user_id, full_name, phone, pass_type, category, status, checked_in_at")
        .in("user_id", ids)
        .in("status", ["verified", "active"]);
      push(rows ?? [], codeMap);
    }

    // Match by phone
    const { data: byPhone } = await admin
      .from("bookings")
      .select("id, user_id, full_name, phone, pass_type, category, status, checked_in_at")
      .ilike("phone", `%${q}%`)
      .in("status", ["verified", "active"])
      .limit(20);
    if (byPhone && byPhone.length) {
      const uids = [...new Set(byPhone.map((b) => b.user_id as string))];
      const { data: profs2 } = await admin.from("profiles").select("id, user_code").in("id", uids);
      const codeMap = new Map((profs2 ?? []).map((p) => [p.id, p.user_code as string]));
      push(byPhone, codeMap);
    }

    // Match by name
    const { data: byName } = await admin
      .from("bookings")
      .select("id, user_id, full_name, phone, pass_type, category, status, checked_in_at")
      .ilike("full_name", `%${q}%`)
      .in("status", ["verified", "active"])
      .limit(20);
    if (byName && byName.length) {
      const uids = [...new Set(byName.map((b) => b.user_id as string))];
      const { data: profs3 } = await admin.from("profiles").select("id, user_code").in("id", uids);
      const codeMap = new Map((profs3 ?? []).map((p) => [p.id, p.user_code as string]));
      push(byName, codeMap);
    }

    return { matches: matches.slice(0, 12) };
  });

// ------------ getMyRoles (client uses to reveal /gate link) ------------

export const getMyRoles = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string }) =>
    z.object({ accessToken: z.string().min(10) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    const { data: u, error } = await admin.auth.getUser(data.accessToken);
    if (error || !u.user) return { roles: [] as string[] };
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", u.user.id);
    return { roles: (roles ?? []).map((r) => r.role as string) };
  });