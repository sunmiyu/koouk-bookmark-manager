import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Environment variables with proper validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Missing required Supabase environment variables:\n' +
    `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}\n` +
    `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅' : '❌'}\n` +
    'Please check your .env.local file'
  )
}

if (!serviceRoleKey && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found - admin functions will not work')
}

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

  if (!serviceRoleKey) {
    throw new Error(
      '❌ SUPABASE_SERVICE_ROLE_KEY is required for admin operations.\n' +
      'Please add it to your .env.local file'
    )
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