import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

// ULTRA SINGLETON: Lazy initialization to prevent ANY multiple instance creation
let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

// Getter function for main client - absolutely ensures singleton
export const getSupabase = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const isServer = typeof window === 'undefined'
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'koouk-auth-token',
      storage: isServer ? undefined : window?.localStorage,
      autoRefreshToken: !isServer,
      persistSession: !isServer,
      detectSessionInUrl: !isServer,
      flowType: 'pkce'
    }
  })
  
  console.log('🔒 Supabase client instance created (ULTRA-SINGLETON)')
  return supabaseInstance
}

// Getter function for admin client 
export const getSupabaseAdmin = (): SupabaseClient => {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      storageKey: 'koouk-admin-token',
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  console.log('🔒 Supabase admin client instance created (ULTRA-SINGLETON)')
  return supabaseAdminInstance
}

// Export lazy-loaded instances (DO NOT create at module load time)
export const supabase = getSupabase()
export const supabaseAdmin = getSupabaseAdmin()

// Reset for testing
export const resetSupabaseInstances = () => {
  supabaseInstance = null
  supabaseAdminInstance = null
}