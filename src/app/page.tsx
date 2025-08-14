'use client'

import { lazy, Suspense } from 'react'

// Lazy load heavy components to reduce initial bundle size
const App = lazy(() => import('@/components/core/App'))

export default function HomePage() {
  // AuthProvider 의존성 완전 제거 - 즉시 앱 표시
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    }>
      <App />
    </Suspense>
  )
}