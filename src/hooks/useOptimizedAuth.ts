/**
 * 🚀 SIMPLIFIED OPTIMIZED AUTH HOOK
 * Reliable authentication with optimistic UI feedback
 * Uses simple redirect-based OAuth for maximum compatibility
 */

import { useCallback, useState } from 'react'
import { useAuth } from '@/components/auth/AuthContext'

interface OptimizedAuthState {
  isOptimistic: boolean
  predictedUser: any
}

export const useOptimizedAuth = () => {
  const auth = useAuth()
  const [authState, setAuthState] = useState<OptimizedAuthState>({
    isOptimistic: false,
    predictedUser: null
  })

  /**
   * 🚀 Optimistic sign-in with instant UI feedback
   * Uses reliable redirect-based authentication
   */
  const optimisticSignIn = useCallback(async () => {
    try {
      // Show immediate loading state
      setAuthState(prev => ({ 
        ...prev, 
        isOptimistic: true,
        predictedUser: { email: 'authenticating...', name: 'Loading...' }
      }))

      // Use reliable redirect authentication
      await auth.signIn()
      
      // Clear optimistic state on success (component will unmount on redirect)
      setAuthState(prev => ({ 
        ...prev, 
        isOptimistic: false,
        predictedUser: null 
      }))
      
    } catch (error) {
      // Rollback optimistic state on failure
      setAuthState(prev => ({ 
        ...prev, 
        isOptimistic: false,
        predictedUser: null 
      }))
      throw error
    }
  }, [auth])

  /**
   * 🚀 Smart button state management
   * Provides instant feedback for loading states
   */
  const getLoginButtonProps = useCallback(() => {
    const isLoading = auth.status === 'loading' || authState.isOptimistic
    const isAuthenticated = auth.status === 'authenticated'
    
    return {
      onClick: optimisticSignIn,
      disabled: isLoading || isAuthenticated,
      children: isLoading 
        ? 'Signing in...' 
        : isAuthenticated 
          ? 'Signed in' 
          : 'Sign in with Google',
      'data-loading': isLoading,
      'data-optimistic': authState.isOptimistic
    }
  }, [auth.status, authState.isOptimistic, optimisticSignIn])

  /**
   * Enhanced user state with optimistic updates
   */
  const getDisplayUser = useCallback(() => {
    if (authState.isOptimistic && authState.predictedUser) {
      return authState.predictedUser
    }
    return auth.user
  }, [auth.user, authState.isOptimistic, authState.predictedUser])

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
    getLoginButtonProps,
    
    // Performance state
    isOptimistic: authState.isOptimistic,
    
    // Original auth context (for compatibility)
    originalAuth: auth
  }
}