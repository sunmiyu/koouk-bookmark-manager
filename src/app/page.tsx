'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import AuthErrorBoundary from '@/components/auth/AuthErrorBoundary'

// Restore dynamic import for better performance
const App = dynamic(() => import('@/components/core/App'), {
  ssr: false,
  loading: () => <PageLoadingFallback />
})


// Minimal loading fallback
function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl font-medium">K</span>
        </div>
        <div className="flex items-center justify-center space-x-1 mb-3">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
        </div>
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  )
}

// Minimal error fallback
function AppErrorFallback({ retry }: { retry: () => void }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl">!</span>
        </div>
        
        <h1 className="text-lg font-medium text-gray-900 mb-2">
          Something went wrong
        </h1>
        
        <p className="text-gray-600 text-sm mb-6">
          Please try refreshing the page
        </p>
        
        <div className="space-y-2">
          <button
            onClick={retry}
            className="w-full bg-black text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-200 transition-colors"
          >
            Reload Page
          </button>
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
      
    </>
  )
}