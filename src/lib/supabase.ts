import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

// ULTRA SINGLETON: Lazy initialization to prevent ANY multiple instance creation
let supabaseInstance: SupabaseClient<Database> | null = null
let supabaseAdminInstance: SupabaseClient<Database> | null = null

// Getter function for main client - absolutely ensures singleton
export const getSupabase = (): SupabaseClient<Database> => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const isServer = typeof window === 'undefined'
  
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'koouk-auth-token',
      storage: isServer ? undefined : window?.localStorage,
      autoRefreshToken: !isServer,
      persistSession: !isServer,
      detectSessionInUrl: !isServer,
      flowType: 'pkce',
      debug: false
    },
    global: {
      headers: {
        'X-Client-Info': 'koouk-web-app'
      }
    }
  })
  
  console.log('🔒 Supabase client instance created (ULTRA-SINGLETON)')
  return supabaseInstance
}

// Getter function for admin client 
export const getSupabaseAdmin = (): SupabaseClient<Database> => {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  supabaseAdminInstance = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      storageKey: 'koouk-admin-token',
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  console.log('🔒 Supabase admin client instance created (ULTRA-SINGLETON)')
  return supabaseAdminInstance
}

// Export main client instance (singleton)
export const supabase = getSupabase()

// Reset for testing
export const resetSupabaseInstances = () => {
  supabaseInstance = null
  supabaseAdminInstance = null
}