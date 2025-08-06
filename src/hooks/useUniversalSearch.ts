'use client'

import { useState, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'

// 검색 결과 타입
export type SearchResultType = 'daily-card' | 'storage' | 'note'

export interface SearchResult {
  id: string
  type: SearchResultType
  category: string
  title: string
  content?: string
  url?: string
  createdAt: string
  sectionType?: string // 'dailyCard', 'storage-url', etc.
  score: number
}

// 검색 가능한 데이터 타입
export interface SearchableItem {
  id: string
  type: SearchResultType
  category: string
  title: string
  content?: string
  url?: string
  createdAt: string
  sectionType?: string
}

export function useUniversalSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Mock 데이터 (실제로는 여러 컨텍스트에서 가져와야 함)
  const mockSearchableData: SearchableItem[] = useMemo(() => [
    // Daily Cards 데이터
    {
      id: 'todo-1',
      type: 'daily-card',
      category: '할일',
      title: '프로젝트 회의 준비',
      content: '내일 있을 팀 미팅을 위한 자료 정리 및 발표 준비',
      createdAt: new Date().toISOString(),
      sectionType: 'dailyCard'
    },
    {
      id: 'diary-1',
      type: 'daily-card',
      category: '일기',
      title: '오늘의 기분',
      content: '새로운 프로젝트를 시작하게 되어서 기대되고 설렌다. 팀원들과의 협업이 잘 될 것 같다.',
      createdAt: new Date().toISOString(),
      sectionType: 'dailyCard'
    },
    {
      id: 'budget-1',
      type: 'daily-card',
      category: '가계부',
      title: '점심값',
      content: '12000원 - 김치찌개 정식',
      createdAt: new Date().toISOString(),
      sectionType: 'dailyCard'
    },
    // Storage 데이터
    {
      id: 'url-1',
      type: 'storage',
      category: 'URL',
      title: 'React 공식 문서',
      content: 'React의 최신 기능과 API를 학습하기 위한 공식 문서',
      url: 'https://react.dev',
      createdAt: new Date().toISOString(),
      sectionType: 'storage-url'
    },
    {
      id: 'url-2',
      type: 'storage',
      category: 'URL',
      title: 'TypeScript 핸드북',
      content: 'TypeScript 문법과 고급 기능을 배우기 위한 핸드북',
      url: 'https://www.typescriptlang.org/docs/',
      createdAt: new Date().toISOString(),
      sectionType: 'storage-url'
    },
    {
      id: 'restaurant-1',
      type: 'storage',
      category: '맛집',
      title: '홍대 파스타 맛집',
      content: '크림파스타가 유명한 이탈리안 레스토랑. 분위기도 좋고 데이트 코스로 추천',
      createdAt: new Date().toISOString(),
      sectionType: 'storage-restaurants'
    },
    {
      id: 'travel-1',
      type: 'storage',
      category: '여행지',
      title: '제주도 성산일출봉',
      content: '일출 명소로 유명한 제주도의 대표 관광지. 트레킹 코스도 있어서 좋다.',
      createdAt: new Date().toISOString(),
      sectionType: 'storage-travel'
    },
    // Notes 데이터
    {
      id: 'note-1',
      type: 'note',
      category: '노트',
      title: '개발 아이디어 메모',
      content: '새로운 앱 아이디어: 일상을 간단하게 정리할 수 있는 개인 대시보드. 복잡한 기능보다는 직관적인 UI에 집중.',
      createdAt: new Date().toISOString(),
      sectionType: 'bigNote'
    },
    {
      id: 'note-2',
      type: 'note',
      category: '노트',
      title: '독서 노트',
      content: '클린 코드 책 정리: 함수는 한 가지 일만 해야 한다. 변수명은 의도를 명확히 드러내야 한다.',
      createdAt: new Date().toISOString(),
      sectionType: 'bigNote'
    }
  ], [])

  // Fuse.js 설정
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'content', weight: 1 },
        { name: 'category', weight: 0.5 }
      ],
      threshold: 0.4, // 0.0 (완전 일치) ~ 1.0 (모든 것 일치)
      distance: 100,
      includeScore: true,
      minMatchCharLength: 1,
      ignoreLocation: true
    }
    return new Fuse(mockSearchableData, options)
  }, [mockSearchableData])

  // 검색 실행
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    
    // 실제 검색 수행
    const fuseResults = fuse.search(query.trim())
    
    // 결과를 SearchResult 형태로 변환
    const results: SearchResult[] = fuseResults.map(result => ({
      ...result.item,
      score: result.score || 0
    }))

    // 카테고리별로 최대 5개씩만 표시
    const groupedResults = results.reduce((acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = []
      }
      if (acc[result.type].length < 5) {
        acc[result.type].push(result)
      }
      return acc
    }, {} as Record<SearchResultType, SearchResult[]>)

    // 다시 평면 배열로 변환 (카테고리별 정렬)
    const flatResults = [
      ...(groupedResults['daily-card'] || []),
      ...(groupedResults['storage'] || []),
      ...(groupedResults['note'] || [])
    ]

    setSearchResults(flatResults)
    setIsSearching(false)
  }, [fuse])

  // 검색어 업데이트 (실시간 검색)
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query)
    performSearch(query)
  }, [performSearch])

  // 검색 초기화
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
  }, [])

  // 카테고리별 결과 그룹핑
  const groupedResults = useMemo(() => {
    const groups = searchResults.reduce((acc, result) => {
      const groupKey = result.type
      if (!acc[groupKey]) {
        acc[groupKey] = []
      }
      acc[groupKey].push(result)
      return acc
    }, {} as Record<SearchResultType, SearchResult[]>)

    return groups
  }, [searchResults])

  // 카테고리 한글 이름
  const getCategoryDisplayName = (type: SearchResultType) => {
    switch (type) {
      case 'daily-card':
        return '📅 Daily Cards'
      case 'storage':
        return '📦 Storage'
      case 'note':
        return '📝 Notes'
      default:
        return type
    }
  }

  return {
    searchQuery,
    searchResults,
    groupedResults,
    isSearching,
    updateSearchQuery,
    clearSearch,
    getCategoryDisplayName,
    hasResults: searchResults.length > 0
  }
}