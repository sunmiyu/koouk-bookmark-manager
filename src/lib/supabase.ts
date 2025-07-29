import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Fallback URL and key for cases where env vars are not available (like during build)
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-key'

// Create single instance with proper error handling
let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Server-side: create new instance each time
    return createClient(
      supabaseUrl || fallbackUrl,
      supabaseAnonKey || fallbackKey,
      {
        auth: {
          storageKey: 'koouk-auth-token',
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
          flowType: 'pkce'
        }
      }
    )
  }
  
  // Client-side: use singleton
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      supabaseUrl || fallbackUrl,
      supabaseAnonKey || fallbackKey,
      {
        auth: {
          storageKey: 'koouk-auth-token',
          storage: window.localStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        }
      }
    )
  }
  return supabaseInstance
}

export const supabase = getSupabaseClient()

export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(
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
  return supabaseAdminInstance
})()