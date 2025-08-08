'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import LandingPage from '@/components/LandingPage'
import FolderWorkspace from '@/components/FolderWorkspace'

function HomeContent() {
  const { user, loading: authLoading } = useAuth()
  const isAuthenticated = !!user

  // 인증 로딩
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading KOOUK...</p>
        </div>
      </div>
    )
  }

  // 비인증 사용자
  if (!isAuthenticated) {
    return <LandingPage />
  }

  // 인증된 사용자에게 새로운 폴더 기반 워크스페이스 제공
  return <FolderWorkspace />
}

export default function Home() {
  return <HomeContent />
}