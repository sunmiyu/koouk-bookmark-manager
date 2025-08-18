/**
 * 🚀 OPTIMIZED AUTH HOOK
 * Commercial-grade authentication with predictive loading and instant feedback
 * Implements industry best practices for sub-second login experience
 */

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthContext'
import { FastAuth } from '@/lib/fastAuth'

interface OptimizedAuthState {
  isPreloaded: boolean
  isOptimistic: boolean
  predictedUser: any
}

export const useOptimizedAuth = () => {
  const auth = useAuth()
  const [authState, setAuthState] = useState<OptimizedAuthState>({
    isPreloaded: false,
    isOptimistic: false,
    predictedUser: null
  })

  // 🚀 OPTIMIZATION 22: Preload auth resources on component mount
  useEffect(() => {
    if (!authState.isPreloaded) {
      FastAuth.preloadAuthResources()
      setAuthState(prev => ({ ...prev, isPreloaded: true }))
    }
  }, [authState.isPreloaded])

  /**
   * 🚀 OPTIMIZATION 23: Predictive auth preloading on hover/focus
   * Start auth process before user actually clicks
   */
  const preloadAuth = useCallback(() => {
    FastAuth.preloadAuthResources()
  }, [])

  /**
   * 🚀 OPTIMIZATION 24: Optimistic sign-in with instant UI feedback
   * Show success state immediately, rollback on failure
   */
  const optimisticSignIn = useCallback(async () => {
    const startTime = performance.now()
    
    try {
      // 🚀 Step 1: Immediate optimistic UI update
      setAuthState(prev => ({ 
        ...prev, 
        isOptimistic: true,
        predictedUser: { email: 'authenticating...', name: 'Loading...' }
      }))

      // 🚀 Step 2: Perform actual authentication
      await auth.signIn()
      
      // 🚀 Step 3: Clear optimistic state on success
      setAuthState(prev => ({ 
        ...prev, 
        isOptimistic: false,
        predictedUser: null 
      }))

      const totalTime = performance.now() - startTime
      console.log(`🚀 Total optimistic auth time: ${Math.round(totalTime)}ms`)
      
    } catch (error) {
      // 🚀 Rollback optimistic state on failure
      setAuthState(prev => ({ 
        ...prev, 
        isOptimistic: false,
        predictedUser: null 
      }))
      throw error
    }
  }, [auth])

  /**
   * 🚀 OPTIMIZATION 25: Smart button state management
   * Provides instant feedback and predictive states
   */
  const getLoginButtonProps = useCallback(() => {
    const isLoading = auth.status === 'loading' || authState.isOptimistic
    const isAuthenticated = auth.status === 'authenticated'
    
    return {
      onClick: optimisticSignIn,
      onMouseEnter: preloadAuth, // Preload on hover
      onFocus: preloadAuth, // Preload on focus
      disabled: isLoading || isAuthenticated,
      children: isLoading 
        ? 'Signing in...' 
        : isAuthenticated 
          ? 'Signed in' 
          : 'Sign in with Google',
      'data-loading': isLoading,
      'data-optimistic': authState.isOptimistic
    }
  }, [auth.status, authState.isOptimistic, optimisticSignIn, preloadAuth])

  /**
   * 🚀 OPTIMIZATION 26: Enhanced user state with optimistic updates
   */
  const getDisplayUser = useCallback(() => {
    if (authState.isOptimistic && authState.predictedUser) {
      return authState.predictedUser
    }
    return auth.user
  }, [auth.user, authState.isOptimistic, authState.predictedUser])

  /**
   * 🚀 OPTIMIZATION 27: Performance metrics tracking
   */
  const getPerformanceMetrics = useCallback(() => {
    return {
      isPreloaded: authState.isPreloaded,
      isOptimistic: authState.isOptimistic,
      supportsPopup: FastAuth.isPopupSupported(),
      authStatus: auth.status
    }
  }, [authState, auth.status])

  return {
    // Enhanced auth methods
    signIn: optimisticSignIn,
    signOut: auth.signOut,
    
    // Optimized state
    user: getDisplayUser(),
    status: auth.status,
    error: auth.error,
    userProfile: auth.userProfile,
    userSettings: auth.userSettings,
    
    // Performance helpers
    preloadAuth,
    getLoginButtonProps,
    getPerformanceMetrics,
    
    // Performance state
    isOptimistic: authState.isOptimistic,
    isPreloaded: authState.isPreloaded,
    
    // Original auth context (for compatibility)
    originalAuth: auth
  }
}