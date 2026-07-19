import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function buildPassPdf(b: {
  id: string;
  full_name: string;
  pass_type: string;
  category: string;
  ticket_token: string;
}, userCode: string | null) {
  const [{ PDFDocument, StandardFonts, rgb }, QR] = await Promise.all([
    import("pdf-lib"),
    import("qrcode"),
  ]);

  const qrDataUrl = await QR.toDataURL(b.ticket_token, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 512,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
  const qrBytes = Uint8Array.from(atob(qrDataUrl.split(",")[1]), (c) => c.charCodeAt(0));

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([420, 595]);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.Courier);
  const serif = await pdf.embedFont(StandardFonts.TimesRomanItalic);

  page.drawRectangle({ x: 0, y: 0, width: 420, height: 595, color: rgb(0.04, 0.04, 0.05) });
  page.drawRectangle({ x: 0, y: 555, width: 420, height: 6, color: rgb(0.75, 0.15, 0.15) });
  page.drawRectangle({ x: 0, y: 30, width: 420, height: 2, color: rgb(0.75, 0.15, 0.15) });

  page.drawText("ILLUMINATI 3.0", { x: 30, y: 520, size: 22, font, color: rgb(1, 1, 1) });
  page.drawText("— BY INVITATION", { x: 30, y: 500, size: 8, font: mono, color: rgb(0.75, 0.15, 0.15) });

  const qrImg = await pdf.embedPng(qrBytes);
  const qrSize = 220;
  page.drawRectangle({ x: (420 - qrSize) / 2 - 10, y: 240, width: qrSize + 20, height: qrSize + 20, color: rgb(1, 1, 1) });
  page.drawImage(qrImg, { x: (420 - qrSize) / 2, y: 250, width: qrSize, height: qrSize });

  const drawLine = (label: string, value: string, y: number) => {
    page.drawText(label, { x: 30, y, size: 7, font: mono, color: rgb(0.55, 0.55, 0.6) });
    page.drawText(value, { x: 30, y: y - 14, size: 13, font, color: rgb(1, 1, 1) });
  };
  drawLine("NAME", b.full_name.toUpperCase(), 210);
  drawLine("USER ID", userCode ?? "—", 170);
  drawLine("PASS", `${b.pass_type.toUpperCase()} · ${b.category.toUpperCase()}`, 130);

  page.drawText("AUG 3 · MARQUEE CLUB", { x: 30, y: 60, size: 9, font: mono, color: rgb(0.7, 0.7, 0.75) });
  page.drawText("Present this pass at the gate. One-time entry.", { x: 30, y: 45, size: 9, font: serif, color: rgb(0.6, 0.6, 0.65) });

  const bytes = await pdf.save();
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const base64 = btoa(bin);
  return { base64, filename: `illuminati-pass-${userCode ?? b.id.slice(0, 8)}.pdf` };
}

// Token-authenticated: the ticket_token itself IS the credential (staff scan it
// at the gate). Anyone with the link can view/download that pass — that's the
// intended UX so guests don't have to log in on someone else's phone.
export const getPassByToken = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) =>
    z.object({ token: z.string().trim().min(4).max(64) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    const { data: b } = await admin
      .from("bookings")
      .select("id, user_id, pass_type, category, full_name, status, ticket_token")
      .eq("ticket_token", data.token)
      .maybeSingle();
    if (!b) throw new Error("Pass not found.");
    if (b.status !== "verified" && b.status !== "active") {
      throw new Error("This pass isn't verified yet.");
    }
    if (!b.ticket_token) throw new Error("Pass token missing.");
    const { data: prof } = await admin
      .from("profiles")
      .select("user_code")
      .eq("id", b.user_id)
      .maybeSingle();
    return await buildPassPdf(
      { id: b.id, full_name: b.full_name, pass_type: b.pass_type, category: b.category, ticket_token: b.ticket_token },
      prof?.user_code ?? null,
    );
  });

export const getPassInfoByToken = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) =>
    z.object({ token: z.string().trim().min(4).max(64) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    const { data: b } = await admin
      .from("bookings")
      .select("id, user_id, pass_type, category, full_name, status, ticket_token")
      .eq("ticket_token", data.token)
      .maybeSingle();
    if (!b) return { ok: false as const, reason: "not_found" as const };
    if (b.status !== "verified" && b.status !== "active") {
      return { ok: false as const, reason: "unverified" as const };
    }
    const { data: prof } = await admin
      .from("profiles")
      .select("user_code")
      .eq("id", b.user_id)
      .maybeSingle();
    return {
      ok: true as const,
      full_name: b.full_name,
      pass_type: b.pass_type,
      category: b.category,
      user_code: prof?.user_code ?? null,
      ticket_token: b.ticket_token as string,
    };
  });

export const getPassPdf = createServerFn({ method: "POST" })
  .inputValidator((data: { accessToken: string; bookingId: string }) =>
    z.object({
      accessToken: z.string().min(10),
      bookingId: z.string().uuid(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();

    const { data: u, error: uErr } = await admin.auth.getUser(data.accessToken);
    if (uErr || !u.user) throw new Error("Not signed in.");

    const { data: b } = await admin
      .from("bookings")
      .select("id, user_id, pass_type, category, full_name, status, ticket_token")
      .eq("id", data.bookingId)
      .maybeSingle();
    if (!b) throw new Error("Booking not found.");

    // Owner-only download (unless staff/admin)
    if (b.user_id !== u.user.id) {
      const { data: roles } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id);
      const staff = (roles ?? []).some((r) => r.role === "admin" || r.role === "gate");
      if (!staff) throw new Error("Not authorized to download this pass.");
    }

    if (b.status !== "verified" && b.status !== "active") {
      throw new Error("Pass not verified yet.");
    }
    if (!b.ticket_token) throw new Error("Pass token missing. Contact support.");

    const { data: prof } = await admin
      .from("profiles")
      .select("user_code")
      .eq("id", b.user_id)
      .maybeSingle();

    return await buildPassPdf(
      { id: b.id, full_name: b.full_name, pass_type: b.pass_type, category: b.category, ticket_token: b.ticket_token },
      prof?.user_code ?? null,
    );
  });