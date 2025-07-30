import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

// ULTIMATE singleton pattern - no matter what, only ONE instance ever exists
class SupabaseSingleton {
  private static instance: SupabaseClient | null = null
  private static adminInstance: SupabaseClient | null = null

  static getClient(): SupabaseClient {
    if (this.instance) {
      return this.instance
    }

    const isServer = typeof window === 'undefined'
    
    this.instance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'koouk-auth-token',
        storage: isServer ? undefined : window?.localStorage,
        autoRefreshToken: !isServer,
        persistSession: !isServer,
        detectSessionInUrl: !isServer,
        flowType: 'pkce'
      }
    })
    
    // Prevent any future instance creation attempts
    console.log('🔒 Supabase client instance created (SINGLETON)')
    return this.instance
  }

  static getAdminClient(): SupabaseClient {
    if (this.adminInstance) {
      return this.adminInstance
    }

    this.adminInstance = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        storageKey: 'koouk-admin-token',
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('🔒 Supabase admin client instance created (SINGLETON)')
    return this.adminInstance
  }

  // Reset for testing only
  static reset() {
    this.instance = null
    this.adminInstance = null
  }
}

// Export the singleton instances
export const supabase = SupabaseSingleton.getClient()
export const supabaseAdmin = SupabaseSingleton.getAdminClient()

// Export the class for advanced usage
export { SupabaseSingleton }