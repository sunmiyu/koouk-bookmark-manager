import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Fallback URL and key for cases where env vars are not available (like during build)
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-key'

// Global instances to ensure singleton
declare global {
  var __supabase: SupabaseClient | undefined
  var __supabaseAdmin: SupabaseClient | undefined
}

// Create or reuse existing client instance
export const supabase = globalThis.__supabase ?? createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey,
  {
    auth: {
      storageKey: 'koouk-auth-token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Store in global to prevent recreation
if (typeof window !== 'undefined') {
  globalThis.__supabase = supabase
}

// Server-side client with service role key (for admin operations)
export const supabaseAdmin = globalThis.__supabaseAdmin ?? createClient(
  supabaseUrl || fallbackUrl,
  serviceRoleKey || fallbackKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

if (typeof window !== 'undefined') {
  globalThis.__supabaseAdmin = supabaseAdmin
}