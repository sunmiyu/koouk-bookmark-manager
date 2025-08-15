'use client'

import App from '@/components/core/App'

export default function HomePage() {
  console.log('🏠 HomePage rendering... URL:', typeof window !== 'undefined' ? window.location.href : 'server')
  console.log('🏠 HomePage timestamp:', new Date().toISOString())
  
  if (typeof window !== 'undefined') {
    console.log('🏠 Browser localStorage keys:', Object.keys(localStorage))
    console.log('🏠 Browser sessionStorage keys:', Object.keys(sessionStorage))
  }
  
  return <App />
}