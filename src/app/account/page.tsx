'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthContext'
import { useRouter } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function AccountPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('로그아웃 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: 'var(--bg-primary)', 
      color: 'var(--text-primary)',
      padding: 'var(--space-6)'
    }}>
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            돌아가기
          </button>
          
          <h1 style={{ 
            fontSize: 'var(--text-2xl)', 
            fontWeight: '700', 
            color: 'var(--text-primary)' 
          }}>
            계정 정보
          </h1>
        </div>

        {/* 사용자 정보 카드 */}
        <div className="bg-white rounded-lg border p-6 mb-6" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)'
        }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            기본 정보
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                이메일
              </label>
              <div className="p-3 bg-gray-50 rounded-lg" style={{ 
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}>
                {user.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                사용자 ID
              </label>
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm" style={{ 
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}>
                {user.id}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                가입일
              </label>
              <div className="p-3 bg-gray-50 rounded-lg" style={{ 
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}>
                {user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '정보 없음'}
              </div>
            </div>
          </div>
        </div>

        {/* 계정 관리 */}
        <div className="bg-white rounded-lg border p-6 mb-6" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)'
        }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            계정 관리
          </h2>
          
          <div className="space-y-3">
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    개인정보처리방침
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    개인정보 처리 및 보호 정책 확인
                  </div>
                </div>
                <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
            
            <Link
              href="/account/delete"
              className="block p-3 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                borderColor: 'rgba(239, 68, 68, 0.2)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-red-600">
                    계정 삭제
                  </div>
                  <div className="text-sm text-red-500">
                    계정과 모든 데이터를 영구적으로 삭제
                  </div>
                </div>
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* 로그아웃 */}
        <div className="bg-white rounded-lg border p-6" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-light)'
        }}>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                로그아웃 중...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                로그아웃
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}