import { createClient } from "@supabase/supabase-js";

// Public values — safe to ship to the browser (RLS enforces access).
// Env vars take precedence (for Vercel), with hardcoded fallback for the
// Lovable sandbox where the managed integration doesn't inject a .env file.
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  "https://royldphvtrbrwmvxahyf.supabase.co";
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  "sb_publishable_HTFbg6HKAr1FnZG9pfnpAA_TrEZfp5s";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const SUPABASE_PUBLIC_URL = SUPABASE_URL;