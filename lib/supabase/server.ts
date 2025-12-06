import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

let _supabaseServer: SupabaseClient<Database> | null = null;

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  return url;
}

function getSupabaseServiceKey(): string {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_KEY environment variable');
  }
  return key;
}

/**
 * Creates a Supabase server client with service role key.
 * Use this for server-side operations (API routes, server actions).
 * This client bypasses RLS policies.
 */
export function createServerClient(): SupabaseClient<Database> {
  if (!_supabaseServer) {
    _supabaseServer = createClient<Database>(
      getSupabaseUrl(),
      getSupabaseServiceKey(),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _supabaseServer;
}

/**
 * Helper to get fresh server client (useful for testing or when you need a new instance)
 */
export function getServerClient(): SupabaseClient<Database> {
  return createClient<Database>(
    getSupabaseUrl(),
    getSupabaseServiceKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
