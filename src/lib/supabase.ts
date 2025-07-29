import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Fallback URL and key for cases where env vars are not available (like during build)
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-key'

// Enhanced singleton pattern with proper cleanup
const SUPABASE_STORAGE_KEY = 'koouk-auth-token'

// Global storage for instances
let _supabaseInstance: SupabaseClient | null = null
let _supabaseAdminInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!_supabaseInstance) {
    console.log('Creating new Supabase client instance')
    _supabaseInstance = createClient(
      supabaseUrl || fallbackUrl,
      supabaseAnonKey || fallbackKey,
      {
        auth: {
          storageKey: SUPABASE_STORAGE_KEY,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    )
  }
  return _supabaseInstance
}

function getSupabaseAdminClient(): SupabaseClient {
  if (!_supabaseAdminInstance) {
    _supabaseAdminInstance = createClient(
      supabaseUrl || fallbackUrl,
      serviceRoleKey || fallbackKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  return _supabaseAdminInstance
}

export const supabase = getSupabaseClient()
export const supabaseAdmin = getSupabaseAdminClient()