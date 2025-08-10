'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Header - Compact */}
      <header className="page-header" style={{ 
        borderBottom: '1px solid var(--border)', 
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(12px)',
        flexShrink: 0
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '1.75rem', 
                height: '1.75rem', 
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
              <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>Koouk</span>
            </div>
            
            <button 
              onClick={signIn}
              disabled={loading}
              className="btn-primary"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem'
              }}
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Compact */}
      <section style={{ 
        padding: '1.5rem 0 1rem', 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        flexShrink: 0
      }}>
        <div className="container text-center" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ 
            fontSize: '1.375rem', 
            fontWeight: '700', 
            marginBottom: '0.5rem', 
            color: 'var(--text-primary)',
            lineHeight: '1.2',
            letterSpacing: '-0.02em'
          }}>
            Personal Knowledge Management
          </h1>
          
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '0.25rem', 
            fontWeight: '500'
          }}>
            Information. Organized. Monetized. Discovered.
          </p>
          
          <p style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)'
          }}>
            AI가 줄 수 없는 것들이 여기 있습니다
          </p>
        </div>
      </section>

      {/* Swipeable Content Container - Takes remaining space */}
      <section style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
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
          <div style={{ width: `${100 / totalPages}%`, padding: '1.5rem 0', display: 'flex', alignItems: 'center' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ 
                  fontSize: '1.375rem', 
                  fontWeight: '700', 
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  Information. Reimagined.
                </h2>
                <p style={{ 
                  fontSize: '0.875rem', 
                  lineHeight: '1.4', 
                  color: 'var(--text-secondary)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  Koouk은 흩어진 정보를 체계적 지식으로 바꿉니다.<br />
                  저장이 아닌, <strong>소유의 시작</strong>입니다.
                </p>
              </div>

              {/* User Testimonial */}
              <div style={{ 
                background: 'linear-gradient(135deg, #f1f3f4 0%, #ffffff 100%)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                maxWidth: '700px',
                margin: '0 auto',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
              }}>
                <blockquote style={{ 
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)',
                  fontStyle: 'normal',
                  marginBottom: '0.75rem'
                }}>
                  평소에 읽던 아티클이나 영상들을 내 방식대로 정리해두니까 
                  <strong style={{ color: 'var(--accent)' }}> 나중에 필요할 때 바로 찾을 수 있어서 정말 편해요.</strong> 
                  마치 나만의 도서관을 만든 것 같은 느낌이에요. 
                  정보가 진짜 제 것이 된 기분입니다.
                </blockquote>
                
                <cite style={{ 
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'normal'
                }}>
                  — 마케터 김민지님
                </cite>
              </div>
            </div>
          </div>

          {/* Page 2: Knowledge Commerce */}
          <div style={{ width: `${100 / totalPages}%`, padding: '1.5rem 0', display: 'flex', alignItems: 'center' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ 
                  fontSize: '1.375rem', 
                  fontWeight: '700', 
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  Your Interest. Your Income.
                </h2>
                <p style={{ 
                  fontSize: '0.875rem', 
                  lineHeight: '1.4', 
                  color: 'var(--text-secondary)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  정성스럽게 만든 나만의 큐레이션이<br />
                  누군가에게는 <strong style={{ color: 'var(--accent)' }}>소중한 지식</strong>이 됩니다.
                </p>
              </div>

              {/* User Testimonial */}
              <div style={{ 
                background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                maxWidth: '700px',
                margin: '0 auto',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
              }}>
                <blockquote style={{ 
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)',
                  fontStyle: 'normal',
                  marginBottom: '0.75rem'
                }}>
                  3년간 아이 키우면서 하나하나 경험으로 쌓은 육아 팁들을 정리해서 공유했더니 
                  <strong style={{ color: '#4ecdc4' }}> 많은 엄마들이 도움이 된다고 감사 인사를 보내주세요.</strong> 
                  제 경험이 다른 사람에게 도움이 된다는 게 정말 뿌듯해요.
                </blockquote>
                
                <cite style={{ 
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'normal'
                }}>
                  — 육아맘 박서연님
                </cite>
              </div>
            </div>
          </div>

          {/* Page 3: Intelligent Discovery */}
          <div style={{ width: `${100 / totalPages}%`, padding: '1.5rem 0', display: 'flex', alignItems: 'center' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ 
                  fontSize: '1.375rem', 
                  fontWeight: '700', 
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  Stop Searching. Start Discovering.
                </h2>
                <p style={{ 
                  fontSize: '0.875rem', 
                  lineHeight: '1.4', 
                  color: 'var(--text-secondary)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  <strong style={{ color: 'var(--accent)' }}>실제 경험이 담긴</strong><br />
                  완결성 있는 리스트를 발견하세요
                </p>
              </div>

              {/* User Testimonial */}
              <div style={{ 
                background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                maxWidth: '700px',
                margin: '0 auto',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
              }}>
                <blockquote style={{ 
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)',
                  fontStyle: 'normal',
                  marginBottom: '0.75rem'
                }}>
                  여행 준비할 때 현지인이 직접 다녀본 맛집 리스트를 발견했는데, 
                  <strong style={{ color: '#ff9800' }}> 숨은 명소들까지 자세한 팁과 함께 정리되어 있어서 놀랐어요.</strong> 
                  검색으로는 절대 찾을 수 없는 진짜 정보들이었죠. 덕분에 완벽한 여행이 됐어요!
                </blockquote>
                
                <cite style={{ 
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'normal'
                }}>
                  — 여행 블로거 최지우님
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
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '2.5rem',
            height: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
          }}
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        
        <button
          onClick={nextPage}
          style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '2.5rem',
            height: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
          }}
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </section>

      {/* Page Indicators - Compact */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '0.5rem', 
        padding: '0.75rem 0',
        background: 'var(--surface)',
        flexShrink: 0
      }}>
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToPage(index)}
            style={{
              width: currentPage === index ? '2rem' : '0.5rem',
              height: '0.5rem',
              borderRadius: '0.25rem',
              border: 'none',
              background: currentPage === index ? 'var(--accent)' : 'var(--border)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Fixed CTA Section - Compact */}
      <section style={{ 
        padding: '1.5rem 0', 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <div className="container text-center" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
          <h2 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '700', 
            marginBottom: '0.5rem',
            color: 'var(--text-primary)'
          }}>
            AI 시대에도 인간만이 줄 수 있는 가치
          </h2>
          
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '1rem',
            lineHeight: '1.4'
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
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              borderRadius: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'
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
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Fixed Footer - Compact */}
      <footer style={{ 
        padding: '0.75rem 0', 
        borderTop: '1px solid var(--border)',
        background: 'var(--background)',
        flexShrink: 0
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '1.25rem', 
                height: '1.25rem', 
                background: 'var(--accent)', 
                color: 'var(--accent-foreground)', 
                borderRadius: '0.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 'bold', 
                fontSize: '0.75rem' 
              }}>
                K
              </div>
              <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Koouk</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                © 2024 Personal Knowledge Management
              </p>
              <a 
                href="/privacy" 
                style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
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