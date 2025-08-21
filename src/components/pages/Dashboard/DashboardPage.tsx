'use client'

import React from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { motion } from 'framer-motion'

export default function DashboardPage({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user, signIn } = useAuth() // 인증 및 로그인 기능

  // 🏠 비로그인 사용자용 홈페이지 렌더링
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* 🎯 KOOUK 브랜드 소개 - 현재 디자인 감성 유지 */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* 로고 & 타이틀 */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">K</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Welcome to KOOUK
              </h1>
              <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Your personal digital life manager. Organize folders, save bookmarks, 
                and discover amazing content shared by our community.
              </p>
            </div>

            {/* 로그인 버튼 */}
            <motion.button
              onClick={signIn}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>🚀</span>
              <span>Sign in to get started</span>
            </motion.button>
          </motion.div>

          {/* 🎯 기능 소개 카드들 - 단조로운 색상 */}
          <motion.div 
            className="grid md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">📁</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">My Folder</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Organize your digital content in smart folders. Links, notes, images - everything in one place.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">🔖</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Bookmarks</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Save websites instantly. Auto-categorization and smart search make finding things effortless.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-4">
                <span className="text-lg">🛍️</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Marketplace</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Discover and import curated content collections shared by our community.
              </p>
            </div>
          </motion.div>

          {/* 🎯 간단한 통계 또는 사용법 */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Simple. Fast. Intuitive.
              </h3>
              <p className="text-xs text-gray-600 mb-4 max-w-md mx-auto">
                No complex setup, no learning curve. 
                Start organizing your digital life in seconds.
              </p>
              <div className="flex justify-center items-center gap-6 text-xs text-gray-500">
                <div>✓ Free to use</div>
                <div>✓ No downloads</div>
                <div>✓ Works everywhere</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // 🔐 로그인된 사용자용 대시보드 (기존 코드 유지)
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* 기존 로그인된 사용자 대시보드는 그대로 유지 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dashboard coming soon
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Your personalized dashboard will show stats and recent activity.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => onNavigate('my-folder')}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              Go to My Folder
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Explore Marketplace
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}