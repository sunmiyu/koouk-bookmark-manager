'use client'

import AppSimple from '@/components/core/AppSimple'

export default function HomePage() {
  // 🎬 Netflix Debug: Direct import to check if App component loads
  console.log('🎬 HomePage rendering...')
  
  // AuthProvider 의존성 완전 제거 - 즉시 앱 표시
  return <AppSimple />
}