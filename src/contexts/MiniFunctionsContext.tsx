'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { MiniFunctionData, MiniFunctionType } from '@/types/miniFunctions'
import { useUserPlan } from './UserPlanContext'

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
  const { currentPlan } = useUserPlan()
  
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

  // Load enabled functions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('koouk_enabled_mini_functions')
    if (saved) {
      try {
        const enabledTypes = JSON.parse(saved) as MiniFunctionType[]
        const enabled = availableFunctions.filter(func => enabledTypes.includes(func.type))
        enabled.forEach(func => func.isEnabled = true)
        setEnabledFunctions(enabled)
      } catch (error) {
        console.error('Failed to load enabled mini functions:', error)
      }
    }
  }, [availableFunctions])

  // Save enabled functions to localStorage
  useEffect(() => {
    const enabledTypes = enabledFunctions.map(func => func.type)
    localStorage.setItem('koouk_enabled_mini_functions', JSON.stringify(enabledTypes))
  }, [enabledFunctions])

  // Calculate max enabled functions based on plan
  const maxEnabled = currentPlan === 'free' ? 0 : currentPlan === 'pro' ? 2 : 4
  const canEnableMore = enabledFunctions.length < maxEnabled

  const enableFunction = (type: MiniFunctionType) => {
    if (!canEnableMore) return
    
    const func = availableFunctions.find(f => f.type === type)
    if (func && !func.isEnabled) {
      func.isEnabled = true
      setEnabledFunctions(prev => [...prev, { ...func }])
    }
  }

  const disableFunction = (type: MiniFunctionType) => {
    const func = availableFunctions.find(f => f.type === type)
    if (func) {
      func.isEnabled = false
      setEnabledFunctions(prev => prev.filter(f => f.type !== type))
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