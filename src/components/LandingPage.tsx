'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStory, setCurrentStory] = useState(0)

  const stories = [
    {
      question: "노래방에서 부르고 싶었던 노래,",
      subtext: "어디에 써놓고 싶지 않았나요?"
    },
    {
      question: "꼭 먹고 싶었던 메뉴가", 
      subtext: "분명 떠오른 적이 있었는데\n지금은 잊혀져있지 않나요?"
    },
    {
      question: "친구가 추천해준 영화,",
      subtext: "나중에 보려고 했는데\n제목이 기억나지 않죠?"
    },
    {
      question: "여행가고 싶었던 그 장소,",
      subtext: "인스타에서 봤는데\n어디였는지 모르겠죠?"
    },
    {
      question: "오늘 있었던 소소한 일상,",
      subtext: "일기로 남기고 싶었는데\n매번 미루고 있지 않나요?"
    }
  ]

  // Auto-scroll through stories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStory(prev => (prev + 1) % (stories.length + 1)) // +1 for final section
    }, 4000)
    return () => clearInterval(interval)
  }, [stories.length])

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
        console.error('로그인 실패: 다시 시도해주세요 🙏')
      }
    } catch {
      console.error('연결 오류: 인터넷 연결을 확인해주세요')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAFA',
      fontFamily: '"Pretendard", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif'
    }}>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .story-enter {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .elegant-button {
          transition: all 0.3s ease;
          transform: translateY(0);
        }
        
        .elegant-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }
        
        .story-indicator {
          transition: all 0.3s ease;
          background-color: #E5E7EB;
        }
        
        .story-indicator.active {
          background-color: #667EEA;
        }
      `}</style>

      {/* Header */}
      <header style={{
        padding: '2rem 1.5rem',
        textAlign: 'center' as const,
        borderBottom: '1px solid #F3F4F6'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '300',
          color: '#1A1A1A',
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          koouk
        </h1>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 1.5rem'
      }}>
        
        {/* Stories Section */}
        <section style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center' as const,
          position: 'relative' as const
        }}>
          
          {/* Story Content */}
          {currentStory < stories.length ? (
            <div key={currentStory} className="story-enter" style={{
              maxWidth: '600px',
              padding: '4rem 0'
            }}>
              <h2 style={{
                fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                fontWeight: '300',
                color: '#1A1A1A',
                lineHeight: '1.2',
                letterSpacing: '-0.03em',
                margin: '0 0 2rem 0',
                wordBreak: 'keep-all'
              }}>
                {stories[currentStory].question}
              </h2>
              
              <p style={{
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                fontWeight: '300',
                color: '#6B7280',
                lineHeight: '1.8',
                margin: 0,
                whiteSpace: 'pre-line',
                wordBreak: 'keep-all'
              }}>
                {stories[currentStory].subtext}
              </p>
            </div>
          ) : (
            // Final Value Proposition
            <div key="final" className="story-enter" style={{
              maxWidth: '700px',
              padding: '4rem 0'
            }}>
              <h2 style={{
                fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                fontWeight: '300',
                color: '#1A1A1A',
                lineHeight: '1.3',
                letterSpacing: '-0.03em',
                margin: '0 0 3rem 0',
                wordBreak: 'keep-all'
              }}>
                소소한 기록들이 모이면<br />
                당신만의 큰 가치가 됩니다.
              </h2>
              
              <p style={{
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                fontWeight: '300',
                color: '#6B7280',
                lineHeight: '1.8',
                margin: '0 0 4rem 0',
                wordBreak: 'keep-all'
              }}>
                그 무엇보다 쉽게,<br />
                koouk에서 기록해보세요.
              </p>

              {/* CTA Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="elegant-button"
                style={{
                  backgroundColor: '#667EEA',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem 2.5rem',
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  letterSpacing: '-0.01em',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.2)'
                }}
              >
                {isLoading ? '로딩중...' : '시작하기'}
              </button>
            </div>
          )}

          {/* Story Indicators */}
          <div style={{
            position: 'absolute' as const,
            bottom: '3rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.5rem'
          }}>
            {[...stories, {}].map((_, index) => (
              <div
                key={index}
                className={`story-indicator ${currentStory === index ? 'active' : ''}`}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentStory(index)}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          textAlign: 'center' as const,
          padding: '3rem 0 2rem',
          borderTop: '1px solid #F3F4F6',
          marginTop: '4rem'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#9CA3AF',
            margin: 0,
            fontWeight: '300'
          }}>
            © 2024 koouk. 소소함을 소중히.
          </p>
        </footer>
      </main>
    </div>
  )
}