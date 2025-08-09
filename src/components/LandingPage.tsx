'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from './auth/AuthContext'

export default function LandingPage() {
  const { signIn, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = 3

  // Auto-advance pages every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % totalPages)
    }, 8000)
    
    return () => clearInterval(interval)
  }, [])

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Header */}
      <header className="page-header sticky top-0 z-50" style={{ 
        borderBottom: '1px solid var(--border)', 
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(12px)' 
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '2rem', 
                height: '2rem', 
                background: 'var(--accent)', 
                color: 'var(--accent-foreground)', 
                borderRadius: '0.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 'bold' 
              }}>
                K
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>Koouk</span>
            </div>
            
            <button 
              onClick={signIn}
              disabled={loading}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Hero Section */}
      <section style={{ padding: '4rem 0 2rem', background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
        <div className="container text-center" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 4vw, 3.5rem)', 
            fontWeight: '700', 
            marginBottom: '1rem', 
            color: 'var(--text-primary)',
            lineHeight: '1.1',
            letterSpacing: '-0.02em'
          }}>
            Personal Knowledge
            <br />
            <span style={{ color: 'var(--text-secondary)' }}>Management</span>
          </h1>
          
          <p style={{ 
            fontSize: '1.125rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '0.75rem', 
            fontWeight: '500',
            letterSpacing: '-0.01em'
          }}>
            Information. Organized. Monetized. Discovered.
          </p>
          
          <p style={{ 
            fontSize: '0.9375rem', 
            color: 'var(--text-muted)', 
            marginBottom: '2rem',
            fontWeight: '400',
            letterSpacing: '-0.01em'
          }}>
            AI가 줄 수 없는 것들이 여기 있습니다
          </p>
        </div>
      </section>

      {/* Swipeable Content Container */}
      <section style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div 
          style={{
            display: 'flex',
            width: `${totalPages * 100}%`,
            transform: `translateX(-${currentPage * (100 / totalPages)}%)`,
            transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
            height: '100%'
          }}
        >
          {/* Page 1: Information Curation */}
          <div style={{ width: `${100 / totalPages}%`, padding: '3rem 0' }}>
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em'
                }}>
                  Information. Reimagined.
                </h2>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '2rem',
                  color: 'var(--text-secondary)',
                  letterSpacing: '-0.015em'
                }}>
                  진짜 내 것이 되는 정보의 경험
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.5', 
                  color: 'var(--text-secondary)',
                  maxWidth: '800px',
                  margin: '0 auto',
                  letterSpacing: '-0.01em'
                }}>
                  Koouk은 흩어진 정보를 체계적 지식으로 바꿉니다.<br />
                  저장이 아닌, <strong>소유의 시작</strong>입니다.
                </p>
              </div>

              {/* User Testimonial */}
              <div style={{ 
                background: 'linear-gradient(135deg, #f1f3f4 0%, #ffffff 100%)',
                borderRadius: '1rem',
                padding: '2.5rem',
                maxWidth: '900px',
                margin: '0 auto',
                position: 'relative',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <div style={{ 
                  fontSize: '3rem',
                  color: 'var(--accent)',
                  position: 'absolute',
                  top: '1rem',
                  left: '2rem',
                  fontFamily: 'Georgia, serif'
                }}>
                  &ldquo;
                </div>
                
                <blockquote style={{ 
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  fontStyle: 'normal',
                  marginTop: '1rem',
                  marginBottom: '2rem',
                  letterSpacing: '-0.01em'
                }}>
                  <strong style={{ color: 'var(--accent)' }}>AI는 제가 뭘 저장했는지 모르잖아요</strong>. 
                  Koouk에서 제 방식대로 정리해서 필요할 때 바로 찾을 수 있어요. 
                  <strong style={{ background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    AI가 줄 수 없는 &lsquo;내가 검증한 정보&rsquo;의 힘이에요!
                  </strong>
                </blockquote>
                
                <cite style={{ 
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'normal',
                  letterSpacing: '-0.01em'
                }}>
                  — 직장인 김○○님
                </cite>
              </div>
            </div>
          </div>

          {/* Page 2: Knowledge Commerce */}
          <div style={{ width: `${100 / totalPages}%`, padding: '3rem 0' }}>
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em'
                }}>
                  Your Interest. Your Income.
                </h2>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '2rem',
                  color: 'var(--text-secondary)',
                  letterSpacing: '-0.015em'
                }}>
                  당신의 관심사가 수입이 되는 순간
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.5', 
                  color: 'var(--text-secondary)',
                  maxWidth: '800px',
                  margin: '0 auto',
                  letterSpacing: '-0.01em'
                }}>
                  정성스럽게 만든 서울 맛집 리스트가<br />
                  누군가에게는 <strong style={{ color: 'var(--accent)' }}>2,900원의 가치</strong>입니다.<br />
                  이것이 <strong>관심 경제</strong>의 새로운 정의입니다.
                </p>
              </div>

              {/* User Testimonial */}
              <div style={{ 
                background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)',
                borderRadius: '1rem',
                padding: '2.5rem',
                maxWidth: '900px',
                margin: '0 auto',
                position: 'relative',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <div style={{ 
                  fontSize: '3rem',
                  color: '#4ecdc4',
                  position: 'absolute',
                  top: '1rem',
                  left: '2rem',
                  fontFamily: 'Georgia, serif'
                }}>
                  &ldquo;
                </div>
                
                <blockquote style={{ 
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  fontStyle: 'normal',
                  marginTop: '1rem',
                  marginBottom: '2rem',
                  letterSpacing: '-0.01em'
                }}>
                  <strong style={{ color: '#4ecdc4' }}>사람이 직접 겪어봐야 아는 거잖아요</strong>. 
                  3년간 시행착오 겪으며 정리한 리스트가 엄마들에게 도움이 되고 
                  <strong style={{ background: 'linear-gradient(135deg, #4ecdc4, #44a08d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    그걸로 용돈도 벌 수 있어서 뿌듯해요!
                  </strong>
                </blockquote>
                
                <cite style={{ 
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'normal',
                  letterSpacing: '-0.01em'
                }}>
                  — 육아맘 박○○님
                </cite>
              </div>
            </div>
          </div>

          {/* Page 3: Intelligent Discovery */}
          <div style={{ width: `${100 / totalPages}%`, padding: '3rem 0' }}>
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em'
                }}>
                  Stop Searching. Start Discovering.
                </h2>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '2rem',
                  color: 'var(--text-secondary)',
                  letterSpacing: '-0.015em'
                }}>
                  검색을 넘어, 발견의 시대로
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.5', 
                  color: 'var(--text-secondary)',
                  maxWidth: '800px',
                  margin: '0 auto',
                  letterSpacing: '-0.01em'
                }}>
                  <strong style={{ color: 'var(--accent)' }}>AI가 줄 수 없고 검색엔진이 줄 수 없는</strong><br />
                  완결성 리스트를 발견하세요!
                </p>
              </div>

              {/* User Testimonial */}
              <div style={{ 
                background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)',
                borderRadius: '1rem',
                padding: '2.5rem',
                maxWidth: '900px',
                margin: '0 auto',
                position: 'relative',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <div style={{ 
                  fontSize: '3rem',
                  color: '#ff9800',
                  position: 'absolute',
                  top: '1rem',
                  left: '2rem',
                  fontFamily: 'Georgia, serif'
                }}>
                  &ldquo;
                </div>
                
                <blockquote style={{ 
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  fontStyle: 'normal',
                  marginTop: '1rem',
                  marginBottom: '2rem',
                  letterSpacing: '-0.01em'
                }}>
                  진짜 아는 사람이 리얼한 정보까지 담아놓은 리스트를 찾을 수 있어서 너무 좋아요. 
                  <strong style={{ color: '#ff9800' }}>AI로는 절대 얻을 수 없는 &lsquo;현장에서 직접 겪은 사람만 아는 정보&rsquo;죠.</strong> 
                  <strong style={{ background: 'linear-gradient(135deg, #ff9800, #f57c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    이런 건 정말 돈 주고 살 만해요!
                  </strong>
                </blockquote>
                
                <cite style={{ 
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'normal',
                  letterSpacing: '-0.01em'
                }}>
                  — 워킹맘 최○○님
                </cite>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevPage}
          style={{
            position: 'absolute',
            left: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '3rem',
            height: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.9)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
          }}
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <button
          onClick={nextPage}
          style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '3rem',
            height: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.9)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
          }}
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </section>

      {/* Page Indicators */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '0.75rem', 
        padding: '2rem 0',
        background: 'var(--surface)'
      }}>
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToPage(index)}
            style={{
              width: currentPage === index ? '2.5rem' : '0.75rem',
              height: '0.75rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: currentPage === index ? 'var(--accent)' : 'var(--border)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Fixed CTA Section */}
      <section style={{ 
        padding: '3rem 0', 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderTop: '1px solid var(--border)'
      }}>
        <div className="container text-center" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
          <h2 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            AI 시대에도 인간만이 줄 수 있는 가치
          </h2>
          
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '2rem',
            lineHeight: '1.5',
            letterSpacing: '-0.01em'
          }}>
            검증된 개인 경험의 힘 • 시행착오를 거쳐 완성된 지식
          </p>
          
          <button 
            onClick={signIn}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, var(--accent), #2c3e50)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: '0 auto',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>지금 시작하기</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Fixed Footer */}
      <footer style={{ 
        padding: '2rem 0', 
        borderTop: '1px solid var(--border)',
        background: 'var(--background)'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '1.5rem', 
                height: '1.5rem', 
                background: 'var(--accent)', 
                color: 'var(--accent-foreground)', 
                borderRadius: '0.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 'bold', 
                fontSize: '0.875rem' 
              }}>
                K
              </div>
              <span style={{ fontWeight: '600' }}>Koouk</span>
            </div>
            
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              © 2024 Personal Knowledge Management
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}