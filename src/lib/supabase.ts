import { createClient } from "@supabase/supabase-js";

// Public values — safe to ship to the browser. RLS enforces access.
const SUPABASE_URL = "https://royldphvtrbrwmvxahyf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJveWxkcGh2dHJicndtdnhhaHlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NjA2MTcsImV4cCI6MjA5OTUzNjYxN30.xPkBfdFrPRGYVuTorC8k4HLuvgpYeZV5yIv9_yWQQNg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const SUPABASE_PUBLIC_URL = SUPABASE_URL;