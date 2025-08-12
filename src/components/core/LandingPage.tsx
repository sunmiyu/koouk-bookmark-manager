'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export default function LandingPage() {
  const { signIn, loading } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Same style as main app */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="w-full px-4 sm:px-8 sm:max-w-6xl sm:mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image 
                src="/koouk-logo.svg" 
                alt="KOOUK" 
                width={100}
                height={24}
                className="h-6 w-auto"
              />
            </div>

            {/* Login Button */}
            <button 
              onClick={signIn}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-8 sm:max-w-6xl sm:mx-auto py-8">
        {/* Hero Section - Compact */}
        <div className="text-center mb-12">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Your Personal Knowledge Repository
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            Where scattered ideas come together
          </p>
          <div className="text-xs text-gray-400">
            Your precious memories that AI cannot replicate
          </div>
        </div>

        {/* Features - Same card style as main app */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          {/* Feature 1 */}
          <div className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              📁 Mental Organization
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Organize complex thoughts clearly and find peace of mind
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Calm</span>
              <span>•</span>
              <span>Systematic</span>
              <span>•</span>
              <span>Instant Search</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              🛍️ Inspiration Treasury
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Discover new perspectives and experiences from others to spark fresh ideas
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>New Views</span>
              <span>•</span>
              <span>Growth</span>
              <span>•</span>
              <span>Connection</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              ⭐ Precious Moments
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Keep those special moments you want to revisit safe and never lose them
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Memories</span>
              <span>•</span>
              <span>Comfort</span>
              <span>•</span>
              <span>Always There</span>
            </div>
          </div>
        </div>

        {/* Stats - Compact information */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">1K+</div>
            <div className="text-xs text-gray-500">Users</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">10K+</div>
            <div className="text-xs text-gray-500">Memories</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">500+</div>
            <div className="text-xs text-gray-500">Stories Shared</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-sm font-medium text-gray-900 mb-2">
              Start Your Story
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Begin collecting your precious moments today
            </p>
            <button 
              onClick={signIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer - Compact */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="w-full px-4 sm:px-8 sm:max-w-6xl sm:mx-auto py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image 
                src="/koouk-logo.svg" 
                alt="Koouk" 
                width={60}
                height={16}
                className="h-4 w-auto"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">
                © 2025 Koouk
              </span>
              <Link 
                href="/privacy" 
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}