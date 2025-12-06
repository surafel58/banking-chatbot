import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Lazy initialization to allow environment variables to be loaded first
let _supabase: SupabaseClient<Database> | null = null;
let _supabaseAdmin: SupabaseClient<Database> | null = null;

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  return key;
}

// Public client for client-side operations
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    if (!_supabase) {
      _supabase = createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
    }
    return (_supabase as any)[prop];
  },
});

// Service client for server-side operations (requires service key)
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    if (!_supabaseAdmin && process.env.SUPABASE_SERVICE_KEY) {
      _supabaseAdmin = createClient<Database>(
        getSupabaseUrl(),
        process.env.SUPABASE_SERVICE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
    }
    return _supabaseAdmin ? (_supabaseAdmin as any)[prop] : null;
  },
});

// Helper function to get admin client for server-side operations
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!_supabaseAdmin && process.env.SUPABASE_SERVICE_KEY) {
    _supabaseAdmin = createClient<Database>(
      getSupabaseUrl(),
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  if (!_supabaseAdmin) {
    throw new Error('Supabase admin client not initialized. Check SUPABASE_SERVICE_KEY env var.');
  }
  return _supabaseAdmin;
}
