import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY. Never import from client-reachable code except inside a
// createServerFn .handler() via `await import(...)`.
export function getSupabaseAdmin() {
  const url = process.env.APP_SB_URL;
  const key = process.env.APP_SB_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("APP_SB_URL / APP_SB_SERVICE_ROLE_KEY not set in server env.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}