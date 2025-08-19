'use client'

import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/database'
import type { Database } from '@/types/database'

type UserSettings = Database['public']['Tables']['user_settings']['Row']

const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  last_active_tab: 'dashboard',
  selected_folder_id: null,
  view_mode: 'grid',
  sort_by: 'recent',
  theme: 'light',
  language: 'en',
  pwa_install_dismissed_at: null,
  visit_count: 0,
  cross_platform_state: {}
}

export function useUserSettings(userId: string | null | undefined) {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setSettings(null)
      setLoading(false)
      setError(null)
      return
    }

    const loadSettings = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('⚙️ Loading user settings...')
        
        try {
          const userSettings = await DatabaseService.getUserSettings(userId)
          setSettings(userSettings)
          console.log('✅ Settings loaded')
        } catch (err) {
          console.warn('Could not load settings, using defaults:', err)
          
          // Use default settings if loading fails
          const defaultSettings: UserSettings = {
            id: userId,
            user_id: userId,
            ...DEFAULT_SETTINGS,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          setSettings(defaultSettings)
        }
        
      } catch (err) {
        console.error('❌ Failed to load settings:', err)
        setError(err instanceof Error ? err.message : 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [userId])

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!userId || !settings) return
    
    try {
      console.log('⚙️ Updating settings:', updates)
      const updatedSettings = await DatabaseService.updateUserSettings(userId, updates)
      setSettings(updatedSettings)
      console.log('✅ Settings updated')
      return updatedSettings
    } catch (err) {
      console.error('❌ Failed to update settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      throw err
    }
  }

  const resetSettings = async () => {
    if (!userId) return
    
    try {
      const resetSettings = await DatabaseService.updateUserSettings(userId, DEFAULT_SETTINGS)
      setSettings(resetSettings)
      return resetSettings
    } catch (err) {
      console.error('❌ Failed to reset settings:', err)
      throw err
    }
  }

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings
  }
}