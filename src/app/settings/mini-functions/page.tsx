'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMiniFunctions } from '@/contexts/MiniFunctionsContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { MiniFunctionData } from '@/types/miniFunctions'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function MiniFunctionsSettings() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { currentPlan } = useUserPlan()
  const { 
    availableFunctions, 
    enabledFunctions, 
    enableFunction, 
    disableFunction, 
    canEnableMore, 
    maxEnabled 
  } = useMiniFunctions()

  // Get user session
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        }
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Failed to get session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      setUser(session?.user ?? null)
      if (!loading) {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You must be logged in to access this page.</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  // Redirect free users to pricing
  if (currentPlan === 'free') {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto responsive-p-md py-8">
          <div className="max-w-2xl mx-auto text-center">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 mx-auto"
            >
              ← Back
            </button>
            
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl mb-8">
              <h1 className="text-3xl font-bold mb-4">✨ Mini Functions</h1>
              <p className="text-xl text-blue-100 mb-6">
                Your personal dashboard widgets
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {availableFunctions.slice(0, 4).map((func) => (
                  <div key={func.id} className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <div className="text-2xl mb-2">{func.icon}</div>
                    <div className="text-sm font-medium">{func.title}</div>
                  </div>
                ))}
              </div>
              
              <div className="text-yellow-200 mb-6">
                <p className="font-semibold">🔒 Premium Feature</p>
                <p className="text-sm">Mini Functions are available in Pro and Premium plans</p>
              </div>
              
              <button 
                onClick={() => router.push('/pricing')}
                className="px-8 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                View Pricing Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleToggleFunction = (func: MiniFunctionData) => {
    if (func.isEnabled) {
      disableFunction(func.type)
    } else if (canEnableMore) {
      enableFunction(func.type)
    }
  }

  const enableAllFunctions = () => {
    const availableSlots = maxEnabled - enabledFunctions.length
    const functionsToEnable = availableFunctions
      .filter(func => !func.isEnabled)
      .slice(0, availableSlots)
    
    functionsToEnable.forEach(func => enableFunction(func.type))
  }

  const disableAllFunctions = () => {
    enabledFunctions.forEach(func => disableFunction(func.type))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto responsive-p-md py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
            >
              ← Back
            </button>
            <h1 className="responsive-text-3xl font-bold">Mini Functions Settings</h1>
            <p className="text-gray-400 mt-2">
              Choose up to {maxEnabled} Mini Functions to display on your dashboard
            </p>
          </div>

          {/* Beta Testing Notice */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-400 text-lg">🧪</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Beta Testing Phase</h3>
                <p className="text-sm text-gray-300 mb-2">
                  Mini Functions are currently in testing mode with simulated data.
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• <strong>Stock Market:</strong> Real Yahoo Finance data</li>
                  <li>• <strong>Commute Time:</strong> Simulated traffic data (Real API integration planned)</li>
                  <li>• <strong>Other Functions:</strong> Sample data for UI/UX testing</li>
                </ul>
                <div className="mt-2 text-xs text-gray-400">
                  📈 Real-time data services will be available in the official release
                </div>
              </div>
            </div>
          </div>

          {/* Current Plan Info */}
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg capitalize">{currentPlan} Plan</h3>
                <p className="text-gray-400 text-sm">
                  {enabledFunctions.length}/{maxEnabled} Mini Functions enabled
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(enabledFunctions.length / maxEnabled) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400">
                  {enabledFunctions.length}/{maxEnabled}
                </span>
              </div>
            </div>
          </div>

          {/* Functions Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Available Functions</h2>
              <div className="flex items-center gap-3">
                {enabledFunctions.length > 0 && (
                  <button
                    onClick={disableAllFunctions}
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Disable All
                  </button>
                )}
                {canEnableMore && (
                  <button
                    onClick={enableAllFunctions}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Add All Available ({Math.min(maxEnabled - enabledFunctions.length, availableFunctions.filter(f => !f.isEnabled).length)})
                  </button>
                )}
                {!canEnableMore && (
                  <span className="text-yellow-400 text-sm">
                    Maximum functions reached
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableFunctions.map((func) => (
                <div
                  key={func.id}
                  className={`relative p-6 rounded-lg border transition-all cursor-pointer ${
                    func.isEnabled
                      ? 'bg-gray-700 border-blue-500'
                      : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => handleToggleFunction(func)}
                >
                  {/* Enabled Badge */}
                  {func.isEnabled && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Disabled overlay */}
                  {!func.isEnabled && !canEnableMore && (
                    <div className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm font-medium">Limit Reached</span>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{func.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{func.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {getFunctionDescription(func.type)}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFunction(func)
                          }}
                          disabled={!func.isEnabled && !canEnableMore}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            func.isEnabled
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : canEnableMore
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {func.isEnabled ? 'Remove' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Prompt */}
          {currentPlan === 'pro' && (
            <div className="mt-12 bg-gray-800 border border-gray-600 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Want more Mini Functions?</h3>
              <p className="text-gray-400 mb-4">
                Upgrade to Premium to unlock 4 Mini Functions (double your current limit!)
              </p>
              <button 
                onClick={() => router.push('/pricing')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Upgrade to Premium
              </button>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <h3 className="font-semibold mb-4">About Mini Functions</h3>
            <div className="text-gray-400 text-sm space-y-2">
              <p>
                Mini Functions are compact widgets that display on your main dashboard, 
                giving you quick access to important information and tools.
              </p>
              <p>
                Choose the functions that matter most to your daily routine. 
                You can change your selection anytime from this settings page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getFunctionDescription(type: string): string {
  switch (type) {
    case 'news':
      return 'Stay updated with the latest news headlines and trending topics'
    case 'music':
      return 'Get personalized music recommendations based on time of day'
    case 'alarm':
      return 'View your next alarm and manage your daily wake-up schedule'
    case 'expense':
      return 'Track your daily expenses with quick input and running totals'
    case 'diary':
      return 'Write daily journal entries with mood tracking and quick notes'
    case 'stocks':
      return 'Monitor real-time stock prices and your watchlist with live market data'
    case 'commute':
      return 'Check real-time commute times and traffic conditions for your routes'
    case 'food':
      return 'Discover nearby restaurants with ratings, reviews, and opening hours'
    case 'dday':
      return 'Track important dates and countdown to special events and deadlines'
    default:
      return 'A useful mini function for your dashboard'
  }
}