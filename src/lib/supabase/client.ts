// Supabase browser client — the single entry point for talking to the real
// backend from client components. Everything is env-guarded so the app keeps
// running on the localStorage mock when Supabase isn't configured.
//
// Phase 1 uses the browser client only (auth session persisted in localStorage
// by supabase-js, OAuth via implicit flow with detectSessionInUrl). Server-side
// cookie auth can be layered in later without touching call sites.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True only when both public Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

let cached: SupabaseClient | null = null;

/**
 * Lazily create (and memoise) the browser Supabase client. Returns null when
 * Supabase isn't configured so callers can fall back to the mock cleanly —
 * this is never called unless `isSupabaseConfigured()` is true, but we guard
 * anyway so a misconfiguration degrades gracefully instead of throwing.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (typeof window === "undefined") return null; // client-only in Phase 1
  if (cached) return cached;
  cached = createClient(url!, anonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // completes OAuth redirects automatically
    },
  });
  return cached;
}
