'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToastActions } from '@/contexts/ToastContext'
import KooukLogo from '@/components/KooukLogo'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { success, error } = useToastActions()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
        }
      })
      
      if (authError) {
        error('로그인 실패', '다시 시도해주세요 🙏', { duration: 3000 })
      }
    } catch {
      error('연결 오류', '인터넷 연결을 확인해주세요', { duration: 3000 })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async () => {
    // 간단한 이메일 로그인을 위한 기본 구현
    const email = prompt('이메일을 입력해주세요:')
    if (!email) return

    const password = prompt('비밀번호를 입력해주세요:')
    if (!password) return

    setIsLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) {
        error('로그인 실패', authError.message, { duration: 3000 })
      } else {
        success('환영합니다! 🎉', '로그인되었습니다', { duration: 2000 })
      }
    } catch {
      error('연결 오류', '다시 시도해주세요', { duration: 3000 })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: 'var(--bg-primary)', 
        color: 'var(--text-primary)' 
      }}>
        <LoadingSpinner size="lg" text="잠깐만요..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: 'var(--bg-primary)', 
      color: 'var(--text-primary)' 
    }}>
      {/* Mobile: Simple Splash Screen */}
      <div className="md:hidden min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <span className="text-5xl mr-3">🏠</span>
            <KooukLogo />
          </div>
          
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            일상이 복잡하다고?
          </h1>
          
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            여기서 간단하게 정리해보세요! ✨
          </p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '2px solid var(--border-light)',
            }}
          >
            🚀 바로 시작하기!
          </button>
          
          <button
            onClick={handleEmailSignIn}
            className="w-full py-3 px-6 rounded-xl font-medium transition-all"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-light)',
            }}
          >
            로그인하기
          </button>
        </div>
      </div>

      {/* Desktop: Full Landing Page */}
      <div className="hidden md:block">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="min-h-screen flex flex-col items-center justify-center text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-8">
                <span className="text-6xl mr-4">🏠</span>
                <div className="scale-150">
                  <KooukLogo />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                일상이 복잡하다고?<br />
                <span style={{ color: 'var(--text-secondary)' }}>koouk에서 간단하게 정리해보세요!</span>
              </h1>
              
              <div className="text-xl md:text-2xl mb-8 space-y-2">
                <p style={{ color: 'var(--text-secondary)' }}>
                  할일, 저장, 정보체크 모두 여기서 끝! 🎯
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ 
                  backgroundColor: '#FEF3C7', 
                  border: '2px solid #F59E0B',
                  color: '#92400E',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}>
                  ✨ Easy Easy Super Easy! ✨
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <button
                  onClick={handleGoogleSignIn}
                  className="px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 shadow-lg"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '2px solid var(--border-light)',
                  }}
                >
                  🚀 바로 시작하기!
                </button>
                
                <button
                  onClick={handleEmailSignIn}
                  className="px-8 py-4 rounded-xl text-lg font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '2px solid var(--border-light)',
                  }}
                >
                  로그인하기
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-20">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  뭘 할 수 있나요? 🤔
                </h2>
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                  복잡한 앱들은 그만! <strong>클릭 한 번</strong>으로 모든 게 끝나요 ⚡
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Daily Cards */}
                <div 
                  className="p-8 rounded-2xl text-center hover:scale-105 transition-all"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Daily Cards
                  </h3>
                  <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                    &ldquo;오늘 뭐 해야 하지?&rdquo;<br />
                    할일부터 일기까지 한번에! 📋
                  </p>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full" style={{
                    backgroundColor: '#DCFCE7',
                    color: '#166534',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    <span>⚡</span> 쓰고 → 엔터!
                  </div>
                </div>

                {/* Storage */}
                <div 
                  className="p-8 rounded-2xl text-center hover:scale-105 transition-all"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div className="text-6xl mb-4">💾</div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Storage
                  </h3>
                  <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                    &ldquo;여기저기 저장한 링크들,&rdquo;<br />
                    이제 찾기 쉽게! 🔍
                  </p>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full" style={{
                    backgroundColor: '#DBEAFE',
                    color: '#1D4ED8',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    <span>⚡</span> 붙여넣기 → 저장!
                  </div>
                </div>

                {/* Info Hub */}
                <div 
                  className="p-8 rounded-2xl text-center hover:scale-105 transition-all"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div className="text-6xl mb-4">📰</div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Info Hub
                  </h3>
                  <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                    &ldquo;뉴스, 날씨, 주식까지&rdquo;<br />
                    매일 확인하는 것들 모음! 📊
                  </p>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full" style={{
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    <span>⚡</span> 클릭 → 바로 확인!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 text-center">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                복잡한 건 그만! 🙅‍♂️<br />
                <span style={{ color: 'var(--text-secondary)' }}>koouk과 함께 심플하게! ✨</span>
              </h2>
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full" style={{
                  backgroundColor: '#EDE9FE',
                  border: '2px solid #8B5CF6',
                  color: '#5B21B6',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  🚀 Easy Easy Super Easy!
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                className="px-12 py-6 rounded-2xl text-2xl font-bold transition-all hover:scale-105 shadow-xl"
                style={{
                  backgroundColor: '#1A1A1A',
                  color: 'white',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#333333'
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1A1A1A'
                  e.currentTarget.style.transform = 'scale(1) translateY(0)'
                }}
              >
                🚀 바로 시작하기!
              </button>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                3초 만에 시작! 복잡한 설정은 없어요 ⚡
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}