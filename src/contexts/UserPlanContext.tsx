'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export type UserPlan = 'free' | 'pro' | 'unlimited'

interface UserPlanContextType {
  currentPlan: UserPlan
  upgradeToProPlan: () => void
  upgradeToUnlimitedPlan: () => void
  downgradeToFreePlan: () => void
  getStorageLimit: (contentType: 'video' | 'link' | 'image' | 'note') => number
  isAtLimit: (contentType: 'video' | 'link' | 'image' | 'note', currentCount: number) => boolean
  canAddItem: (contentType: 'video' | 'link' | 'image' | 'note', currentCount: number) => boolean
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

  const getStorageLimit = (contentType: 'video' | 'link' | 'image' | 'note'): number => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const isAtLimit = (contentType: 'video' | 'link' | 'image' | 'note', currentCount: number): boolean => {
    const limit = getStorageLimit(contentType)
    return currentCount >= limit
  }

  const canAddItem = (contentType: 'video' | 'link' | 'image' | 'note', currentCount: number): boolean => {
    return !isAtLimit(contentType, currentCount)
  }

  const upgradeToProPlan = () => {
    setCurrentPlan('pro')
    // Here you would typically integrate with payment system
    console.log('Upgraded to Pro plan! 🎉')
  }

  const upgradeToUnlimitedPlan = () => {
    setCurrentPlan('unlimited')
    // Here you would typically integrate with payment system
    console.log('Upgraded to Unlimited plan! 🚀')
  }

  const downgradeToFreePlan = () => {
    setCurrentPlan('free')
    console.log('Downgraded to Free plan')
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