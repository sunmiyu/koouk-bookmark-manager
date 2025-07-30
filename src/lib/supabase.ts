import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Fallback URL and key for cases where env vars are not available (like during build)
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-key'

// CRITICAL: Use window-level global to prevent React re-renders from creating multiple instances
declare global {
  var __supabaseInstance: SupabaseClient | undefined
  var __supabaseAdminInstance: SupabaseClient | undefined
}

// Ensure only ONE instance exists globally across all React renders
const getSupabaseInstance = (): SupabaseClient => {
  if (typeof window !== 'undefined' && window.__supabaseInstance) {
    return window.__supabaseInstance
  }
  
  if (typeof window === 'undefined' && global.__supabaseInstance) {
    return global.__supabaseInstance
  }

  const isServer = typeof window === 'undefined'
  
  const instance = createClient(
    supabaseUrl || fallbackUrl,
    supabaseAnonKey || fallbackKey,
    {
      auth: {
        storageKey: 'koouk-auth-token',
        storage: isServer ? undefined : window?.localStorage,
        autoRefreshToken: !isServer,
        persistSession: !isServer,
        detectSessionInUrl: !isServer,
        flowType: 'pkce'
      }
    }
  )
  
  // Store in global scope to prevent recreation
  if (typeof window !== 'undefined') {
    window.__supabaseInstance = instance
  } else {
    global.__supabaseInstance = instance
  }
  
  return instance
}

export const supabase = getSupabaseInstance()

export const supabaseAdmin = (() => {
  if (typeof window !== 'undefined' && window.__supabaseAdminInstance) {
    return window.__supabaseAdminInstance
  }
  
  if (typeof window === 'undefined' && global.__supabaseAdminInstance) {
    return global.__supabaseAdminInstance
  }

  const instance = createClient(
    supabaseUrl || fallbackUrl,
    serviceRoleKey || fallbackKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
  
  // Store in global scope
  if (typeof window !== 'undefined') {
    window.__supabaseAdminInstance = instance
  } else {
    global.__supabaseAdminInstance = instance
  }
  
  return instance
})()