'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export default function LandingPage() {
  const { signIn, loading } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* Header - 메인 앱과 동일한 스타일 */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="w-full px-4 sm:px-8 sm:max-w-6xl sm:mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/koouk-logo.svg" 
                alt="KOOUK" 
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
                  <span>로그인</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-8 sm:max-w-6xl sm:mx-auto py-8">
        {/* Hero Section - 컴팩트 */}
        <div className="text-center mb-12">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            개인 지식 관리 플랫폼
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            정보를 정리하고, 공유하고, 발견하세요
          </p>
          <div className="text-xs text-gray-400">
            AI가 줄 수 없는 개인의 경험과 통찰
          </div>
        </div>

        {/* Features - 메인 앱의 카드 스타일과 동일 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          {/* Feature 1 */}
          <div className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              📁 정보 정리
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              흩어진 링크, 메모, 이미지를 체계적으로 관리
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>폴더</span>
              <span>•</span>
              <span>태그</span>
              <span>•</span>
              <span>검색</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              🛍️ 마켓플레이스
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              다른 사용자의 큐레이션된 콘텐츠 탐색
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>발견</span>
              <span>•</span>
              <span>다운로드</span>
              <span>•</span>
              <span>평가</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              ⭐ 북마크
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              중요한 링크를 빠르게 찾고 접근
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>즐겨찾기</span>
              <span>•</span>
              <span>분류</span>
              <span>•</span>
              <span>동기화</span>
            </div>
          </div>
        </div>

        {/* Stats - 컴팩트한 정보 */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">1K+</div>
            <div className="text-xs text-gray-500">사용자</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">10K+</div>
            <div className="text-xs text-gray-500">저장된 콘텐츠</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">500+</div>
            <div className="text-xs text-gray-500">공유 폴더</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-sm font-medium text-gray-900 mb-2">
              지금 시작해보세요
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              구글 계정으로 간편하게 로그인
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
                  <span>로그인</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer - 컴팩트 */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="w-full px-4 sm:px-8 sm:max-w-6xl sm:mx-auto py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/koouk-logo.svg" 
                alt="KOOUK" 
                className="h-4 w-auto"
              />
              <span className="text-sm font-medium text-gray-900">Koouk</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">
                © 2024 Koouk
              </span>
              <a 
                href="/privacy" 
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                개인정보정책
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}