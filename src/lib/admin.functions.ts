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