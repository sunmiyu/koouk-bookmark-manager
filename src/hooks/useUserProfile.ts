'use client'

import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['users']['Row']

export function useUserProfile(userId: string | null | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      setError(null)
      return
    }

    const loadProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('👤 Loading user profile...')
        
        // Try to get existing profile
        let profile = await DatabaseService.getUserProfile(userId)
        
        // Create profile if doesn't exist
        if (!profile) {
          const { data: { user: authUser } } = await supabase.auth.getUser()
          
          if (authUser) {
            const { data, error } = await supabase
              .from('users')
              .upsert({
                id: authUser.id,
                email: authUser.email!,
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
                avatar_url: authUser.user_metadata?.avatar_url,
                is_verified: !!authUser.email_confirmed_at,
                user_plan: 'free' as const,
                plan_expires_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single()
            
            if (!error && data) {
              profile = data as UserProfile
            }
          }
        }
        
        setProfile(profile)
        console.log('✅ Profile loaded:', profile?.name)
        
      } catch (err) {
        console.error('❌ Failed to load profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [userId])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userId || !profile) return
    
    try {
      setLoading(true)
      const updatedProfile = await DatabaseService.updateUserProfile(userId, updates)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (err) {
      console.error('❌ Failed to update profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile
  }
}