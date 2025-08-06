'use client'

import { useState, useRef, useEffect } from 'react'
import { useUniversalSearch, SearchResult } from '@/hooks/useUniversalSearch'

export default function UniversalSearch() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const {
    searchQuery,
    searchResults,
    groupedResults,
    isSearching,
    updateSearchQuery,
    clearSearch,
    getCategoryDisplayName,
    hasResults
  } = useUniversalSearch()

  // 모바일 검색 열기
  const openMobileSearch = () => {
    setIsMobileSearchOpen(true)
    // DOM 업데이트 후 포커스
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  // 모바일 검색 닫기
  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false)
    clearSearch()
  }

  // ESC 키로 검색 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileSearchOpen) {
          closeMobileSearch()
        }
        if (isDesktopSearchOpen) {
          setIsDesktopSearchOpen(false)
          clearSearch()
        }
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isMobileSearchOpen, isDesktopSearchOpen, clearSearch])

  // 검색 결과 클릭 핸들러
  const handleResultClick = (result: SearchResult) => {
    // TODO: 실제 네비게이션 로직 구현
    console.log('Navigate to:', result)
    closeMobileSearch()
    setIsDesktopSearchOpen(false)
    clearSearch()
  }

  return (
    <>
      {/* 모바일 플로팅 검색 버튼 */}
      <button
        onClick={openMobileSearch}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ease-out z-40"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '2px solid var(--border-light)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
          color: 'var(--text-primary)'
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)'
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.backgroundColor = 'var(--bg-card)'
        }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* PC 플로팅 검색 버튼 */}
      <button
        onClick={() => setIsDesktopSearchOpen(true)}
        className="hidden md:flex fixed bottom-8 right-8 w-16 h-16 rounded-full items-center justify-center transition-all duration-300 ease-out z-40"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '2px solid var(--border-light)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15), 0 6px 12px rgba(0, 0, 0, 0.1)',
          color: 'var(--text-primary)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
          e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.backgroundColor = 'var(--bg-card)'
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.15), 0 6px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* 모바일 검색 슬라이드업 */}
      {isMobileSearchOpen && (
        <>
          {/* 배경 오버레이 */}
          <div 
            className="md:hidden fixed inset-0 z-50"
            style={{
              background: hasResults ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
              backdropFilter: hasResults ? 'blur(8px)' : 'blur(2px)',
            }}
            onClick={closeMobileSearch}
          />

          {/* 검색바 컨테이너 */}
          <div 
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out"
            style={{
              transform: isMobileSearchOpen ? 'translateY(0)' : 'translateY(100%)',
              backgroundColor: 'var(--bg-card)',
              borderTopLeftRadius: 'var(--radius-xl)',
              borderTopRightRadius: 'var(--radius-xl)',
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.15)',
              maxHeight: hasResults ? '70vh' : 'auto',
              overflowY: 'auto'
            }}
          >
            {/* 검색바 헤더 */}
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => updateSearchQuery(e.target.value)}
                  placeholder="할일, 저장 항목, 노트를 검색해보세요! 🔍"
                  className="w-full pr-10 transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-3) var(--space-4)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-base)',
                    outline: 'none'
                  }}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div 
                      className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{
                        borderColor: 'var(--border-light)',
                        borderTopColor: 'var(--text-primary)'
                      }}
                    />
                  </div>
                )}
              </div>
              
              <button
                onClick={closeMobileSearch}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 검색 결과 */}
            {hasResults && (
              <div className="p-4 space-y-4">
                {Object.entries(groupedResults).map(([type, results]) => (
                  <div key={type}>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {getCategoryDisplayName(type as any)}
                    </h3>
                    <div className="space-y-2">
                      {results.map((result) => (
                        <SearchResultCard
                          key={result.id}
                          result={result}
                          onClick={() => handleResultClick(result)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 검색 결과 없음 */}
            {searchQuery && !isSearching && !hasResults && (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  검색 결과가 없어요
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  다른 키워드로 검색해보세요!
                </p>
              </div>
            )}

            {/* 검색 도움말 (빈 상태) */}
            {!searchQuery && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">✨</div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    모든 걸 한 번에 검색해보세요!
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Daily Cards, Storage, Notes 모든 내용을 찾을 수 있어요
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: '📅', title: 'Daily Cards', desc: '할일, 일기, 가계부 검색' },
                    { icon: '📦', title: 'Storage', desc: 'URL, 이미지, 맛집, 여행지 검색' },
                    { icon: '📝', title: 'Notes', desc: '모든 노트 내용 검색' }
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-muted)' }}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                          {item.title}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* PC 검색 패널 */}
      {isDesktopSearchOpen && (
        <>
          {/* 배경 오버레이 */}
          <div 
            className="hidden md:block fixed inset-0 z-50"
            style={{
              background: hasResults ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)',
              backdropFilter: hasResults ? 'blur(8px)' : 'blur(4px)',
            }}
            onClick={() => {
              setIsDesktopSearchOpen(false)
              clearSearch()
            }}
          />

          {/* 검색 패널 */}
          <div 
            className="hidden md:block fixed bottom-8 right-8 z-50 transition-all duration-300 ease-out"
            style={{
              width: '600px',
              maxWidth: '50vw',
              maxHeight: hasResults ? '70vh' : '400px',
              transform: isDesktopSearchOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
              opacity: isDesktopSearchOpen ? 1 : 0,
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.25), 0 12px 32px rgba(0, 0, 0, 0.15)',
              border: '1px solid var(--border-light)',
              overflowY: 'auto',
              transformOrigin: 'bottom right'
            }}
          >
            {/* 검색바 헤더 */}
            <div className="flex items-center gap-4 p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => updateSearchQuery(e.target.value)}
                  placeholder="할일, 저장 항목, 노트를 검색해보세요! 🔍"
                  className="w-full pr-12 transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4) var(--space-5)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-md)',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-medium)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-focus)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div 
                      className="w-5 h-5 border-2 rounded-full animate-spin"
                      style={{
                        borderColor: 'var(--border-light)',
                        borderTopColor: 'var(--text-primary)'
                      }}
                    />
                  </div>
                )}
              </div>
              
              <button
                onClick={() => {
                  setIsDesktopSearchOpen(false)
                  clearSearch()
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-light)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--border-light)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 검색 결과 */}
            {hasResults && (
              <div className="p-6 space-y-6">
                {Object.entries(groupedResults).map(([type, results]) => (
                  <div key={type}>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      {getCategoryDisplayName(type as any)}
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {results.length}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {results.map((result) => (
                        <DesktopSearchResultCard
                          key={result.id}
                          result={result}
                          onClick={() => handleResultClick(result)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 검색 결과 없음 */}
            {searchQuery && !isSearching && !hasResults && (
              <div className="p-12 text-center">
                <div className="text-5xl mb-6">🔍</div>
                <p className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  검색 결과가 없어요
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  다른 키워드로 검색해보세요!
                </p>
              </div>
            )}

            {/* 검색 도움말 (빈 상태) */}
            {!searchQuery && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">✨</div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    모든 걸 한 번에 검색해보세요!
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Daily Cards, Storage, Notes 모든 내용을 찾을 수 있어요
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { icon: '📅', title: 'Daily Cards', desc: '할일, 일기, 가계부 검색' },
                    { icon: '📦', title: 'Storage', desc: 'URL, 이미지, 맛집, 여행지 검색' },
                    { icon: '📝', title: 'Notes', desc: '모든 노트 내용 검색' }
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-gray-50"
                      style={{ backgroundColor: 'var(--bg-muted)' }}
                    >
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                          {item.title}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    💡 <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">ESC</kbd>로 닫기
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

// 검색 결과 카드 컴포넌트
function SearchResultCard({ result, onClick }: { result: SearchResult; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="p-3 rounded-lg cursor-pointer transition-all duration-200"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
        e.currentTarget.style.transform = 'scale(0.98)'
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-card)'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>
          {result.title}
        </h4>
        <span 
          className="text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2"
          style={{
            backgroundColor: 'var(--bg-muted)',
            color: 'var(--text-secondary)'
          }}
        >
          {result.category}
        </span>
      </div>
      
      {result.content && (
        <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
          {result.content}
        </p>
      )}
      
      {result.url && (
        <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
          🔗 {result.url}
        </p>
      )}
    </div>
  )
}

// PC용 검색 결과 카드 컴포넌트
function DesktopSearchResultCard({ result, onClick }: { result: SearchResult; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-card)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-base line-clamp-1 flex-1" style={{ color: 'var(--text-primary)' }}>
          {result.title}
        </h4>
        <span 
          className="text-xs px-3 py-1 rounded-full flex-shrink-0 ml-3"
          style={{
            backgroundColor: 'var(--bg-muted)',
            color: 'var(--text-secondary)',
            fontWeight: '500'
          }}
        >
          {result.category}
        </span>
      </div>
      
      {result.content && (
        <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
          {result.content}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        {result.url && (
          <p className="text-xs truncate flex-1 mr-3" style={{ color: 'var(--text-tertiary)' }}>
            🔗 {result.url}
          </p>
        )}
        
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span>⚡</span>
          <span>바로 이동</span>
        </div>
      </div>
    </div>
  )
}