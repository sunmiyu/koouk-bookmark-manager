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
      {/* Mobile: Premium Splash Screen */}
      <div className="md:hidden min-h-screen flex flex-col items-center justify-center px-8 text-center">
        {/* Premium Mobile Card Container */}
        <div className="w-full max-w-sm" style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-elevated)',
          padding: 'var(--space-12) var(--space-8)'
        }}>
          <div className="mb-10">
            <div className="flex items-center justify-center mb-8">
              <span style={{ fontSize: '3.5rem', marginRight: '0.75rem' }}>🏠</span>
              <KooukLogo />
            </div>
            
            <h1 style={{ 
              fontSize: 'var(--text-2xl)',
              fontWeight: '300',
              letterSpacing: '-0.02em',
              lineHeight: '1.2',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-6)'
            }}>
              일상이 복잡하다고?
            </h1>
            
            <p style={{ 
              fontSize: 'var(--text-lg)',
              color: 'var(--text-secondary)',
              fontWeight: '400',
              lineHeight: '1.5',
              letterSpacing: '0.01em'
            }}>
              여기서 간단하게 정리해보세요! ✨
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full transition-all duration-300 ease-out group"
              style={{
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-card)',
                border: 'none',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-5) var(--space-6)',
                fontSize: 'var(--text-lg)',
                fontWeight: '500',
                letterSpacing: '-0.01em',
                boxShadow: 'var(--shadow-subtle)'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'
              }}
            >
              🚀 바로 시작하기!
            </button>
            
            <button
              onClick={handleEmailSignIn}
              className="w-full transition-all duration-200 ease-out"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4) var(--space-6)',
                fontSize: 'var(--text-md)',
                fontWeight: '400',
                letterSpacing: '0.01em'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: Premium Landing Page */}
      <div className="hidden md:block">
        <div className="container mx-auto px-8">
          {/* Hero Section */}
          <div className="min-h-screen flex flex-col items-center justify-center text-center">
            <div className="max-w-5xl mx-auto">
              {/* Premium Logo Section */}
              <div className="flex items-center justify-center mb-12">
                <span style={{ fontSize: '4.5rem', marginRight: '1rem' }}>🏠</span>
                <div className="scale-[1.8]">
                  <KooukLogo />
                </div>
              </div>
              
              {/* Premium Typography */}
              <h1 style={{ 
                fontSize: '4.5rem',
                fontWeight: '300',
                letterSpacing: '-0.03em',
                lineHeight: '1.1',
                color: 'var(--text-primary)',
                marginBottom: '2rem'
              }}>
                일상이 복잡하다고?<br />
                <span style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '3.5rem',
                  fontWeight: '400'
                }}>
                  koouk에서 간단하게 정리해보세요!
                </span>
              </h1>
              
              <div className="mb-12 space-y-6">
                <p style={{ 
                  fontSize: '1.5rem',
                  color: 'var(--text-secondary)',
                  fontWeight: '400',
                  lineHeight: '1.5',
                  letterSpacing: '0.01em'
                }}>
                  할일, 저장, 정보체크 모두 여기서 끝! 🎯
                </p>
                
                {/* Premium Badge */}
                <div className="inline-flex items-center gap-3 transition-all duration-300 ease-out" style={{ 
                  backgroundColor: '#F5F1E8', 
                  border: '1px solid #E8DCC0',
                  color: '#8B5A2B',
                  fontSize: '1.25rem',
                  fontWeight: '500',
                  letterSpacing: '-0.01em',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-4) var(--space-8)',
                  boxShadow: 'var(--shadow-subtle)'
                }}>
                  ✨ Easy Easy Super Easy! ✨
                </div>
              </div>

              {/* Premium Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={handleGoogleSignIn}
                  className="transition-all duration-300 ease-out group"
                  style={{
                    backgroundColor: 'var(--text-primary)',
                    color: 'var(--bg-card)',
                    border: 'none',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-6) var(--space-10)',
                    fontSize: '1.25rem',
                    fontWeight: '500',
                    letterSpacing: '-0.01em',
                    boxShadow: 'var(--shadow-elevated)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
                  }}
                >
                  🚀 바로 시작하기!
                </button>
                
                <button
                  onClick={handleEmailSignIn}
                  className="transition-all duration-200 ease-out"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-6) var(--space-10)',
                    fontSize: '1.125rem',
                    fontWeight: '400',
                    letterSpacing: '0.01em',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'
                  }}
                >
                  로그인하기
                </button>
              </div>
            </div>
          </div>

          {/* Premium Features Section */}
          <div className="py-32">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-20">
                <h2 style={{ 
                  fontSize: '3rem',
                  fontWeight: '300',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.2',
                  color: 'var(--text-primary)',
                  marginBottom: '1.5rem'
                }}>
                  뭘 할 수 있나요? 🤔
                </h2>
                <p style={{ 
                  fontSize: '1.25rem',
                  color: 'var(--text-secondary)',
                  fontWeight: '400',
                  lineHeight: '1.6',
                  letterSpacing: '0.01em'
                }}>
                  복잡한 앱들은 그만! <strong style={{ color: 'var(--text-primary)' }}>클릭 한 번</strong>으로 모든 게 끝나요 ⚡
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-10">
                {/* Daily Cards */}
                <div 
                  className="text-center group transition-all duration-300 ease-out"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '3rem 2.5rem',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'
                  }}
                >
                  <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📝</div>
                  <h3 style={{ 
                    fontSize: '1.75rem',
                    fontWeight: '500',
                    letterSpacing: '-0.01em',
                    color: 'var(--text-primary)',
                    marginBottom: '1.5rem'
                  }}>
                    Daily Cards
                  </h3>
                  <p style={{ 
                    fontSize: '1.125rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                    fontWeight: '400'
                  }}>
                    &ldquo;오늘 뭐 해야 하지?&rdquo;<br />
                    할일부터 일기까지 한번에! 📋
                  </p>
                  <div className="inline-flex items-center gap-2" style={{
                    backgroundColor: '#F0FDF4',
                    color: '#15803D',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    letterSpacing: '0.01em',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-2) var(--space-4)',
                    border: '1px solid #BBF7D0'
                  }}>
                    <span>⚡</span> 쓰고 → 엔터!
                  </div>
                </div>

                {/* Storage */}
                <div 
                  className="text-center group transition-all duration-300 ease-out"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '3rem 2.5rem',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'
                  }}
                >
                  <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>💾</div>
                  <h3 style={{ 
                    fontSize: '1.75rem',
                    fontWeight: '500',
                    letterSpacing: '-0.01em',
                    color: 'var(--text-primary)',
                    marginBottom: '1.5rem'
                  }}>
                    Storage
                  </h3>
                  <p style={{ 
                    fontSize: '1.125rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                    fontWeight: '400'
                  }}>
                    &ldquo;여기저기 저장한 링크들,&rdquo;<br />
                    이제 찾기 쉽게! 🔍
                  </p>
                  <div className="inline-flex items-center gap-2" style={{
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    letterSpacing: '0.01em',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-2) var(--space-4)',
                    border: '1px solid #BFDBFE'
                  }}>
                    <span>⚡</span> 붙여넣기 → 저장!
                  </div>
                </div>

                {/* Info Hub */}
                <div 
                  className="text-center group transition-all duration-300 ease-out"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '3rem 2.5rem',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'
                  }}
                >
                  <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📰</div>
                  <h3 style={{ 
                    fontSize: '1.75rem',
                    fontWeight: '500',
                    letterSpacing: '-0.01em',
                    color: 'var(--text-primary)',
                    marginBottom: '1.5rem'
                  }}>
                    Info Hub
                  </h3>
                  <p style={{ 
                    fontSize: '1.125rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                    fontWeight: '400'
                  }}>
                    &ldquo;뉴스, 날씨, 주식까지&rdquo;<br />
                    매일 확인하는 것들 모음! 📊
                  </p>
                  <div className="inline-flex items-center gap-2" style={{
                    backgroundColor: '#FFFBEB',
                    color: '#92400E',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    letterSpacing: '0.01em',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-2) var(--space-4)',
                    border: '1px solid #FDE68A'
                  }}>
                    <span>⚡</span> 클릭 → 바로 확인!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium CTA Section */}
          <div className="py-32 text-center">
            {/* Premium Final Message */}
            <div className="mb-16">
              <h2 style={{ 
                fontSize: '3.5rem',
                fontWeight: '300',
                letterSpacing: '-0.03em',
                lineHeight: '1.1',
                color: 'var(--text-primary)',
                marginBottom: '2rem'
              }}>
                복잡한 건 그만! 🙅‍♂️<br />
                <span style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '2.75rem',
                  fontWeight: '400'
                }}>
                  koouk과 함께 심플하게! ✨
                </span>
              </h2>
              
              {/* Premium Final Badge */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-3 transition-all duration-300 ease-out" style={{
                  backgroundColor: '#F5F1E8',
                  border: '2px solid #E8DCC0',
                  color: '#8B5A2B',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  letterSpacing: '-0.01em',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-6) var(--space-12)',
                  boxShadow: 'var(--shadow-elevated)'
                }}>
                  🚀 Easy Easy Super Easy!
                </div>
              </div>
            </div>
            
            {/* Premium Final CTA */}
            <div className="space-y-6">
              <button
                onClick={handleGoogleSignIn}
                className="transition-all duration-300 ease-out"
                style={{
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-card)',
                  border: 'none',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-8) var(--space-16)',
                  fontSize: '1.75rem',
                  fontWeight: '500',
                  letterSpacing: '-0.02em',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#333333'
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.25), 0 12px 30px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--text-primary)'
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)'
                }}
              >
                🚀 바로 시작하기!
              </button>
              
              <p style={{ 
                fontSize: '1rem',
                color: 'var(--text-tertiary)',
                fontWeight: '400',
                letterSpacing: '0.01em',
                marginTop: '1.5rem'
              }}>
                3초 만에 시작! 복잡한 설정은 없어요 ⚡
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}