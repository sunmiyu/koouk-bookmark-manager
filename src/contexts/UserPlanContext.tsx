'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export type UserPlan = 'free' | 'pro' | 'unlimited'

interface UserPlanContextType {
  currentPlan: UserPlan
  upgradeToProPlan: () => void
  upgradeToUnlimitedPlan: () => void
  downgradeToFreePlan: () => void
  getStorageLimit: () => number
  isAtLimit: (currentCount: number) => boolean
  canAddItem: (currentCount: number) => boolean
}

const UserPlanContext = createContext<UserPlanContextType | undefined>(undefined)

export function UserPlanProvider({ children }: { children: ReactNode }) {
  const [currentPlan, setCurrentPlan] = useState<UserPlan>('free')

  // Load plan from localStorage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem('koouk_user_plan') as UserPlan
    if (savedPlan && ['free', 'pro', 'unlimited'].includes(savedPlan)) {
      setCurrentPlan(savedPlan)
    }
  }, [])

  // Save plan to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('koouk_user_plan', currentPlan)
  }, [currentPlan])

  const getStorageLimit = (): number => {
    switch (currentPlan) {
      case 'free':
        return 50
      case 'pro':
        return 500
      case 'unlimited':
        return Infinity
      default:
        return 50
    }
  }

  const isAtLimit = (currentCount: number): boolean => {
    const limit = getStorageLimit()
    return currentCount >= limit
  }

  const canAddItem = (currentCount: number): boolean => {
    return !isAtLimit(currentCount)
  }

  const upgradeToProPlan = () => {
    setCurrentPlan('pro')
    // Here you would typically integrate with payment system
  }

  const upgradeToUnlimitedPlan = () => {
    setCurrentPlan('unlimited')
    // Here you would typically integrate with payment system
  }

  const downgradeToFreePlan = () => {
    setCurrentPlan('free')
  }

  return (
    <UserPlanContext.Provider
      value={{
        currentPlan,
        upgradeToProPlan,
        upgradeToUnlimitedPlan,
        downgradeToFreePlan,
        getStorageLimit,
        isAtLimit,
        canAddItem,
      }}
    >
      {children}
    </UserPlanContext.Provider>
  )
}

export function useUserPlan() {
  const context = useContext(UserPlanContext)
  if (context === undefined) {
    throw new Error('useUserPlan must be used within a UserPlanProvider')
  }
  return context
}