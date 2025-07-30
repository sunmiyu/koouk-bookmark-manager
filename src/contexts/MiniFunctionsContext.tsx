'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { MiniFunctionData, MiniFunctionType } from '@/types/miniFunctions'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface MiniFunctionsContextType {
  availableFunctions: MiniFunctionData[]
  enabledFunctions: MiniFunctionData[]
  enableFunction: (type: MiniFunctionType) => void
  disableFunction: (type: MiniFunctionType) => void
  canEnableMore: boolean
  maxEnabled: number
  updateFunctionData: (type: MiniFunctionType, data: MiniFunctionData['data']) => void
  getFunctionData: (type: MiniFunctionType) => MiniFunctionData['data']
}

const MiniFunctionsContext = createContext<MiniFunctionsContextType | undefined>(undefined)

export function MiniFunctionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  
  // Available Mini Functions
  const [availableFunctions] = useState<MiniFunctionData[]>([
    {
      id: 'news',
      title: 'News Headlines',
      icon: '🗞️',
      type: 'news',
      isEnabled: false,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'music',
      title: 'Music Recommendations',
      icon: '🎵',
      type: 'music',
      isEnabled: false,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'alarm',
      title: 'Next Alarm',
      icon: '⏰',
      type: 'alarm',
      isEnabled: false,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'expense',
      title: 'Today\'s Expenses',
      icon: '💰',
      type: 'expense',
      isEnabled: false,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'diary',
      title: 'Mini Diary',
      icon: '📝',
      type: 'diary',
      isEnabled: false,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'stocks',
      title: 'Stock Market',
      icon: '📈',
      type: 'stocks',
      isEnabled: false,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'commute',
      title: 'Commute Time',
      icon: '🚗',
      type: 'commute',
      isEnabled: false,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'food',
      title: 'Nearby Restaurants',
      icon: '🍽️',
      type: 'food',
      isEnabled: false,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'dday',
      title: 'D-day Counter',
      icon: '📅',
      type: 'dday',
      isEnabled: false,
      lastUpdated: new Date().toISOString()
    }
  ])

  const [enabledFunctions, setEnabledFunctions] = useState<MiniFunctionData[]>([])

  // Load enabled functions from Supabase
  useEffect(() => {
    loadEnabledFunctions()
  }, [availableFunctions]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadEnabledFunctions = useCallback(async () => {
    try {
      if (!user) {
        // Fallback to localStorage
        const saved = localStorage.getItem('koouk_enabled_mini_functions')
        if (saved) {
          const enabledTypes = JSON.parse(saved) as MiniFunctionType[]
          const enabled = availableFunctions.filter(func => enabledTypes.includes(func.type))
          enabled.forEach(func => func.isEnabled = true)
          setEnabledFunctions(enabled)
        } else {
          // Default: enable all functions for testing
          const allEnabled = availableFunctions.map(func => ({ ...func, isEnabled: true }))
          setEnabledFunctions(allEnabled)
          const allTypes = availableFunctions.map(func => func.type)
          localStorage.setItem('koouk_enabled_mini_functions', JSON.stringify(allTypes))
        }
        return
      }

      // Load from Supabase mini_functions table
      const { data: miniFunctions, error } = await supabase
        .from('mini_functions')
        .select('function_type, is_enabled')
        .eq('user_id', user.id)
        .eq('is_enabled', true)
      
      if (error) {
        console.error('Failed to load mini functions:', error)
        // Fallback to localStorage
        const saved = localStorage.getItem('koouk_enabled_mini_functions')
        if (saved) {
          const enabledTypes = JSON.parse(saved) as MiniFunctionType[]
          const enabled = availableFunctions.filter(func => enabledTypes.includes(func.type))
          enabled.forEach(func => func.isEnabled = true)
          setEnabledFunctions(enabled)
        }
        return
      }

      if (miniFunctions && miniFunctions.length > 0) {
        const enabledTypes = miniFunctions.map(mf => mf.function_type as MiniFunctionType)
        const enabled = availableFunctions.filter(func => enabledTypes.includes(func.type))
        enabled.forEach(func => func.isEnabled = true)
        setEnabledFunctions(enabled)
      } else {
        // Initialize with all functions enabled for testing
        const allEnabled = availableFunctions.map(func => ({ ...func, isEnabled: true }))
        setEnabledFunctions(allEnabled)
        
        // Save to Supabase
        const miniFunctionInserts = availableFunctions.map(func => ({
          user_id: user.id,
          function_type: func.type,
          is_enabled: true,
          settings: {}
        }))
        
        await supabase
          .from('mini_functions')
          .insert(miniFunctionInserts)
      }
    } catch (error) {
      console.error('Failed to load enabled functions:', error)
      // Fallback to localStorage
      const saved = localStorage.getItem('koouk_enabled_mini_functions')
      if (saved) {
        const enabledTypes = JSON.parse(saved) as MiniFunctionType[]
        const enabled = availableFunctions.filter(func => enabledTypes.includes(func.type))
        enabled.forEach(func => func.isEnabled = true)
        setEnabledFunctions(enabled)
      }
    }
  }, [availableFunctions, user])

  // Save enabled functions to Supabase and localStorage
  useEffect(() => {
    saveEnabledFunctions()
  }, [enabledFunctions]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveEnabledFunctions = useCallback(async () => {
    const enabledTypes = enabledFunctions.map(func => func.type)
    
    try {
      if (user) {
        // Update Supabase - disable all first, then enable selected ones
        await supabase
          .from('mini_functions')
          .update({ is_enabled: false })
          .eq('user_id', user.id)
        
        if (enabledTypes.length > 0) {
          await supabase
            .from('mini_functions')
            .update({ is_enabled: true })
            .eq('user_id', user.id)
            .in('function_type', enabledTypes)
        }
      }
      
      // Always save to localStorage as backup
      localStorage.setItem('koouk_enabled_mini_functions', JSON.stringify(enabledTypes))
    } catch (error) {
      console.error('Failed to save enabled functions:', error)
      // Fallback to localStorage only
      localStorage.setItem('koouk_enabled_mini_functions', JSON.stringify(enabledTypes))
    }
  }, [enabledFunctions, user])

  // Calculate max enabled functions based on plan
  // 테스트 기간: 모든 9개 Mini Function 사용 가능
  const maxEnabled = 9
  const canEnableMore = enabledFunctions.length < maxEnabled

  const enableFunction = async (type: MiniFunctionType) => {
    if (!canEnableMore) return
    
    const func = availableFunctions.find(f => f.type === type)
    if (func && !func.isEnabled) {
      func.isEnabled = true
      setEnabledFunctions(prev => [...prev, { ...func }])
      
      try {
        if (user) {
          // Update or insert in Supabase
          await supabase
            .from('mini_functions')
            .upsert({
              user_id: user.id,
              function_type: type,
              is_enabled: true,
              settings: {}
            })
        }
      } catch (error) {
        console.error('Failed to enable function in Supabase:', error)
      }
    }
  }

  const disableFunction = async (type: MiniFunctionType) => {
    const func = availableFunctions.find(f => f.type === type)
    if (func) {
      func.isEnabled = false
      setEnabledFunctions(prev => prev.filter(f => f.type !== type))
      
      try {
        if (user) {
          // Update in Supabase
          await supabase
            .from('mini_functions')
            .update({ is_enabled: false })
            .eq('user_id', user.id)
            .eq('function_type', type)
        }
      } catch (error) {
        console.error('Failed to disable function in Supabase:', error)
      }
    }
  }

  const updateFunctionData = (type: MiniFunctionType, data: MiniFunctionData['data']) => {
    setEnabledFunctions(prev => prev.map(func => 
      func.type === type 
        ? { ...func, data, lastUpdated: new Date().toISOString() }
        : func
    ))
  }

  const getFunctionData = (type: MiniFunctionType) => {
    const func = enabledFunctions.find(f => f.type === type)
    return func?.data
  }

  return (
    <MiniFunctionsContext.Provider value={{
      availableFunctions,
      enabledFunctions,
      enableFunction,
      disableFunction,
      canEnableMore,
      maxEnabled,
      updateFunctionData,
      getFunctionData
    }}>
      {children}
    </MiniFunctionsContext.Provider>
  )
}

export function useMiniFunctions() {
  const context = useContext(MiniFunctionsContext)
  if (context === undefined) {
    throw new Error('useMiniFunctions must be used within a MiniFunctionsProvider')
  }
  return context
}