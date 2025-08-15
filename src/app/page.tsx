'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import AuthErrorBoundary from '@/components/auth/AuthErrorBoundary'

// Dynamic import with loading optimization
const App = dynamic(() => import('@/components/core/App'), {
  ssr: false,
  loading: () => <PageLoadingFallback />
})

// Loading fallback component with KOOUK branding
function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* KOOUK Logo Animation */}
        <div className="mb-8 animate-pulse">
          <div className="w-32 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl tracking-wide">KOOUK</span>
          </div>
        </div>
        
        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-200"></div>
        </div>
        
        <p className="text-gray-600 text-lg font-medium mb-2">
          Loading your digital world...
        </p>
        <p className="text-gray-500 text-sm">
          Preparing your personalized experience
        </p>
      </div>
    </div>
  )
}

// Enhanced error fallback component
function AppErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            We encountered an unexpected error while loading KOOUK. Don't worry, this happens sometimes!
          </p>
          
          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                Technical Details (Dev Only)
              </summary>
              <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-red-600 overflow-auto max-h-32">
                {error.message}
              </div>
            </details>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={retry}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Reload Page
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-6">
            If the problem persists, please contact support at{' '}
            <a href="mailto:support@koouk.im" className="text-blue-600 hover:text-blue-700">
              support@koouk.im
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

// SEO-friendly structured data
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "KOOUK",
  "description": "Personal lifestyle management platform for organizing, bookmarking, and discovering amazing content",
  "url": "https://koouk.im",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Any",
  "permissions": "browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "KOOUK Team",
    "url": "https://koouk.im"
  },
  "publisher": {
    "@type": "Organization", 
    "name": "KOOUK",
    "url": "https://koouk.im"
  },
  "datePublished": "2024-01-01",
  "dateModified": new Date().toISOString().split('T')[0]
}

export default function HomePage() {
  return (
    <>
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Main App with Error Boundary */}
      <AuthErrorBoundary fallback={AppErrorFallback}>
        <Suspense fallback={<PageLoadingFallback />}>
          <main role="main" aria-label="KOOUK Main Application">
            <App />
          </main>
        </Suspense>
      </AuthErrorBoundary>
      
      {/* Preload critical resources */}
      <link rel="prefetch" href="/koouk-logo.svg" />
      <link rel="preload" href="/koouk-logo.svg" as="image" />
    </>
  )
}