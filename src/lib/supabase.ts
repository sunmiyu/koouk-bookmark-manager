import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Fallback URL and key for cases where env vars are not available (like during build)
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-key'

// Global singleton instance to prevent multiple clients
let globalSupabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

// Ensure only ONE instance is created across the entire app
const createSupabaseInstance = () => {
  if (globalSupabaseInstance) {
    return globalSupabaseInstance
  }

  const isServer = typeof window === 'undefined'
  
  globalSupabaseInstance = createClient(
    supabaseUrl || fallbackUrl,
    supabaseAnonKey || fallbackKey,
    {
      auth: {
        storageKey: 'koouk-auth-token',
        storage: isServer ? undefined : window.localStorage,
        autoRefreshToken: !isServer,
        persistSession: !isServer,
        detectSessionInUrl: !isServer,
        flowType: 'pkce'
      }
    }
  )
  
  return globalSupabaseInstance
}

export const supabase = createSupabaseInstance()

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