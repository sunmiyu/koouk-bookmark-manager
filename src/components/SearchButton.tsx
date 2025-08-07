'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearch } from '@/contexts/SearchContext'

export default function SearchButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { search, searchResults, isSearching } = useSearch()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 검색 실행
  const handleSearch = async () => {
    if (query.trim()) {
      await search(query.trim())
    }
  }

  // Enter 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // 검색창이 열릴 때 자동 포커스
      setTimeout(() => inputRef.current?.focus(), 100)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="fixed bottom-6 right-6 z-40" ref={searchRef}>
      {/* 검색 버튼 - Floating */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ease-out flex items-center justify-center"
        style={{
          backgroundColor: isOpen ? 'var(--bg-primary)' : '#667eea',
          color: 'white',
          border: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.backgroundColor = isOpen ? 'var(--bg-primary)' : '#5a67d8'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.backgroundColor = isOpen ? 'var(--bg-primary)' : '#667eea'
        }}
        aria-label="검색"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* 검색 팝업 */}
      {isOpen && (
        <div
          className="absolute right-0 bottom-full mb-2 w-80 max-h-96 overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
            zIndex: 50
          }}
        >
          {/* 검색 입력창 */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="검색어를 입력하세요..."
                className="flex-1 px-3 py-2 rounded-md text-sm"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--border-focus)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-light)'
                }}
              />
              <button
                onClick={handleSearch}
                disabled={!query.trim() || isSearching}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  backgroundColor: query.trim() && !isSearching ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                  color: query.trim() && !isSearching ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-light)',
                  cursor: query.trim() && !isSearching ? 'pointer' : 'not-allowed'
                }}
              >
                {isSearching ? '검색중...' : '검색'}
              </button>
            </div>
          </div>

          {/* 검색 결과 */}
          <div className="max-h-80 overflow-y-auto">
            {searchResults ? (
              <>
                {searchResults.totalCount > 0 ? (
                  <>
                    {/* 결과 헤더 */}
                    <div className="p-3 text-xs" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
                      {searchResults.totalCount}개 결과 ({searchResults.searchTime}ms)
                    </div>

                    {/* 결과 목록 */}
                    <div className="p-2">
                      {searchResults.items.slice(0, 10).map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-md mb-2 cursor-pointer transition-colors"
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                            e.currentTarget.style.borderColor = 'var(--border-light)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.borderColor = 'transparent'
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span 
                              className="text-sm font-medium truncate"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {item.title}
                            </span>
                            <span
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              {item.type}
                            </span>
                          </div>
                          {item.description && (
                            <p 
                              className="text-xs truncate"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <p style={{ color: 'var(--text-secondary)' }}>검색 결과가 없습니다</p>
                  </div>
                )}
              </>
            ) : query && !isSearching ? (
              <div className="p-6 text-center">
                <p style={{ color: 'var(--text-secondary)' }}>검색어를 입력하고 검색 버튼을 눌러보세요</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}