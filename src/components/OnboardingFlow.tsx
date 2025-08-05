'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: string
  content: React.ReactNode
}

interface OnboardingFlowProps {
  onComplete: () => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Koouk Dashboard',
      description: 'Your personal productivity hub for daily planning and content organization',
      icon: '👋',
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white">Welcome to Koouk!</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Let&apos;s take a quick tour to help you get the most out of your new dashboard.
            This will only take a minute.
          </p>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      description: 'Manage your daily tasks, track habits, and stay updated with news',
      icon: '📊',
      content: (
        <div className="space-y-4">
          <div className="text-5xl text-center mb-4">📊</div>
          <h3 className="text-xl font-semibold text-white">Dashboard - Your Command Center</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-white">Daily Cards:</strong> Track todos, habits, diary entries, and gratitude
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-white">Live News:</strong> Stay updated with latest headlines
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-white">Music & Market:</strong> Spotify integration and market overview
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'storage',
      title: 'Storage System',
      description: 'Save and organize links, videos, images, and notes in one place',
      icon: '💾',
      content: (
        <div className="space-y-4">
          <div className="text-5xl text-center mb-4">💾</div>
          <h3 className="text-xl font-semibold text-white">Storage - Your Digital Library</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-400">🔗</span>
                <span className="text-white font-medium">Links</span>
              </div>
              <p className="text-sm text-gray-400">Save important websites and articles</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-400">🎥</span>
                <span className="text-white font-medium">Videos</span>
              </div>
              <p className="text-sm text-gray-400">YouTube videos and tutorials</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400">🖼️</span>
                <span className="text-white font-medium">Images</span>
              </div>
              <p className="text-sm text-gray-400">Screenshots and visual content</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-400">📝</span>
                <span className="text-white font-medium">Notes</span>
              </div>
              <p className="text-sm text-gray-400">Ideas, thoughts, and reminders</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tools',
      title: 'AI Tools & Workspace',
      description: 'Productivity tools and AI assistants for enhanced workflow',
      icon: '🛠️',
      content: (
        <div className="space-y-4">
          <div className="text-5xl text-center mb-4">🛠️</div>
          <h3 className="text-xl font-semibold text-white">Tools - Coming Soon</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-white">AI Assistant:</strong> Smart productivity helper
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-white">Automation:</strong> Streamline repetitive tasks
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-white">Integrations:</strong> Connect your favorite apps
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'Personalization',
      description: 'Customize your experience and manage your account preferences',
      icon: '⚙️',
      content: (
        <div className="space-y-4">
          <div className="text-5xl text-center mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-white">Settings - Your Preferences</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-white">Account:</strong> Manage profile and security
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-white">Preferences:</strong> Customize notifications and themes
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-white">Integrations:</strong> Connect external services
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'You&apos;re All Set!',
      description: 'Start exploring your new dashboard and boost your productivity',
      icon: '✅',
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white">You&apos;re Ready to Go!</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Your dashboard is ready! Start by adding your first todo or saving a link.
            You can always access help from the settings menu.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3">
              <div className="text-blue-400 font-medium">💡 Pro Tip</div>
              <div className="text-sm text-gray-300 mt-1">
                Use Ctrl+V to paste links and images anywhere!
              </div>
            </div>
            <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3">
              <div className="text-green-400 font-medium">🔍 Quick Search</div>
              <div className="text-sm text-gray-300 mt-1">
                Search across all your stored content instantly
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('koouk_onboarding_completed')
    if (!hasSeenOnboarding && user) {
      setIsVisible(true)
    }
  }, [user])

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipOnboarding = () => {
    completeOnboarding()
  }

  const completeOnboarding = () => {
    localStorage.setItem('koouk_onboarding_completed', 'true')
    setIsVisible(false)
    onComplete()
  }

  if (!isVisible) return null

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">{currentStepData.icon}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{currentStepData.title}</h2>
                <p className="text-sm text-gray-400">{currentStepData.description}</p>
              </div>
            </div>
            <button
              onClick={skipOnboarding}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Skip Tour
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-blue-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentStep === 0
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-blue-400 w-6'
                    : index < currentStep
                    ? 'bg-blue-600'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Get Started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            ) : (
              <>
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}