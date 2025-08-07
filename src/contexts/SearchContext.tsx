'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useContent } from '@/contexts/ContentContext'
import { useTodos } from '@/contexts/TodoContext'

// 검색 가능한 모든 콘텐츠 타입
export type SearchableContent = {
  id: string
  type: 'note' | 'link' | 'video' | 'image' | 'todo'
  title: string
  content?: string
  description?: string
  tags: string[]
  category: string
  url?: string
  createdAt: string
  updatedAt: string
  priority?: 'high' | 'medium' | 'low'
  completed?: boolean
  dueDate?: string
}

// 검색 필터 옵션
export interface SearchFilter {
  query?: string
  type?: SearchableContent['type'] | 'all'
  category?: string
  tags?: string[]
  priority?: 'high' | 'medium' | 'low'
  completed?: boolean
  dateRange?: {
    from: string
    to: string
  }
  sortBy?: 'relevance' | 'date' | 'title' | 'priority'
  sortOrder?: 'asc' | 'desc'
}

// 검색 결과
export interface SearchResult {
  items: SearchableContent[]
  totalCount: number
  matchedTerms: string[]
  searchTime: number
  categories: { name: string; count: number }[]
  tags: { name: string; count: number }[]
}

interface SearchContextType {
  // 검색 상태
  searchFilter: SearchFilter
  searchResults: SearchResult | null
  isSearching: boolean
  searchHistory: string[]
  
  // 검색 액션
  setSearchFilter: (filter: SearchFilter) => void
  search: (query: string, filters?: Partial<SearchFilter>) => Promise<SearchResult>
  clearSearch: () => void
  addToHistory: (query: string) => void
  clearHistory: () => void
  
  // 유틸리티
  highlightText: (text: string, query: string) => string
  getSuggestions: (query: string) => string[]
  
  // 통계
  getSearchStats: () => {
    totalItems: number
    categories: { name: string; count: number }[]
    tags: { name: string; count: number }[]
  }
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

// 카테고리 매핑
const CATEGORY_MAPPING = {
  note: 'Notes',
  link: 'Links', 
  video: 'Videos',
  image: 'Images',
  todo: {
    Personal: 'Personal',
    Work: 'Work',
    Shopping: 'Shopping',
    Health: 'Health',
    Learning: 'Learning',
    Projects: 'Projects'
  }
} as const

export function SearchProvider({ children }: { children: ReactNode }) {
  // Safe context access with fallbacks
  const contentContext = useContent()
  const todosContext = useTodos()
  
  const notes = contentContext?.notes || []
  const links = contentContext?.links || []
  const videos = contentContext?.videos || []
  const images = contentContext?.images || []
  const todos = todosContext?.todos || []
  
  const [searchFilter, setSearchFilter] = useState<SearchFilter>({
    query: '',
    type: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc'
  })
  
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  
  // 검색 기록 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('search-history')
      if (saved) {
        try {
          setSearchHistory(JSON.parse(saved))
        } catch (error) {
          console.error('Failed to load search history:', error)
        }
      }
    }
  }, [])
  
  // 모든 콘텐츠를 SearchableContent 형태로 변환
  const getAllContent = (): SearchableContent[] => {
    const allContent: SearchableContent[] = []
    
    // Notes 변환
    notes.forEach(note => {
      allContent.push({
        id: note.id,
        type: 'note',
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        category: CATEGORY_MAPPING.note,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt || note.createdAt
      })
    })
    
    // Links 변환
    links.forEach(link => {
      allContent.push({
        id: link.id,
        type: 'link',
        title: link.title,
        description: link.description,
        url: link.url,
        tags: link.tags || [],
        category: CATEGORY_MAPPING.link,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt || link.createdAt
      })
    })
    
    // Videos 변환
    videos.forEach(video => {
      allContent.push({
        id: video.id,
        type: 'video',
        title: video.title,
        description: video.description,
        url: video.url,
        tags: video.tags || [],
        category: CATEGORY_MAPPING.video,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt || video.createdAt
      })
    })
    
    // Images 변환
    images.forEach(image => {
      allContent.push({
        id: image.id,
        type: 'image',
        title: image.title,
        description: image.description,
        url: image.url,
        tags: image.tags || [],
        category: CATEGORY_MAPPING.image,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt || image.createdAt
      })
    })
    
    // Todos 변환
    todos.forEach(todo => {
      allContent.push({
        id: todo.id,
        type: 'todo',
        title: todo.title,
        description: todo.description,
        tags: todo.tags || [],
        category: todo.category,
        priority: todo.priority,
        completed: todo.completed,
        dueDate: todo.dueDate,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt
      })
    })
    
    return allContent
  }
  
  // 검색 실행
  const search = async (query: string, filters: Partial<SearchFilter> = {}): Promise<SearchResult> => {
    setIsSearching(true)
    const startTime = Date.now()
    
    try {
      const allContent = getAllContent()
      const mergedFilter = { ...searchFilter, query, ...filters }
      
      let filteredContent = allContent
      
      // 타입 필터
      if (mergedFilter.type && mergedFilter.type !== 'all') {
        filteredContent = filteredContent.filter(item => item.type === mergedFilter.type)
      }
      
      // 카테고리 필터
      if (mergedFilter.category) {
        filteredContent = filteredContent.filter(item => item.category === mergedFilter.category)
      }
      
      // 태그 필터
      if (mergedFilter.tags && mergedFilter.tags.length > 0) {
        filteredContent = filteredContent.filter(item => 
          mergedFilter.tags!.some(tag => item.tags.includes(tag))
        )
      }
      
      // 우선순위 필터 (Todo only)
      if (mergedFilter.priority) {
        filteredContent = filteredContent.filter(item => 
          item.type === 'todo' && item.priority === mergedFilter.priority
        )
      }
      
      // 완료 상태 필터 (Todo only)
      if (mergedFilter.completed !== undefined) {
        filteredContent = filteredContent.filter(item => 
          item.type === 'todo' && item.completed === mergedFilter.completed
        )
      }
      
      // 날짜 범위 필터
      if (mergedFilter.dateRange) {
        const fromDate = new Date(mergedFilter.dateRange.from)
        const toDate = new Date(mergedFilter.dateRange.to)
        filteredContent = filteredContent.filter(item => {
          const itemDate = new Date(item.createdAt)
          return itemDate >= fromDate && itemDate <= toDate
        })
      }
      
      // 텍스트 검색
      let searchResults = filteredContent
      const matchedTerms: string[] = []
      
      if (query.trim()) {
        const queryLower = query.toLowerCase()
        const searchTerms = queryLower.split(/\s+/).filter(term => term.length > 0)
        
        searchResults = filteredContent.filter(item => {
          const searchableText = [
            item.title,
            item.content,
            item.description,
            ...item.tags,
            item.category
          ].filter(Boolean).join(' ').toLowerCase()
          
          const matches = searchTerms.every(term => searchableText.includes(term))
          if (matches) {
            searchTerms.forEach(term => {
              if (!matchedTerms.includes(term)) {
                matchedTerms.push(term)
              }
            })
          }
          return matches
        })
        
        // 관련성 점수 계산 및 정렬
        if (mergedFilter.sortBy === 'relevance') {
          searchResults = searchResults.map(item => {
            const titleMatches = searchTerms.filter(term => 
              item.title.toLowerCase().includes(term)
            ).length
            const contentMatches = searchTerms.filter(term => 
              (item.content || item.description || '').toLowerCase().includes(term)
            ).length
            const tagMatches = searchTerms.filter(term => 
              item.tags.some(tag => tag.toLowerCase().includes(term))
            ).length
            
            const relevanceScore = titleMatches * 3 + contentMatches * 2 + tagMatches * 1
            return { ...item, relevanceScore }
          }).sort((a: SearchableContent & { relevanceScore: number }, b: SearchableContent & { relevanceScore: number }) => b.relevanceScore - a.relevanceScore)
        }
      }
      
      // 정렬
      if (mergedFilter.sortBy !== 'relevance' || !query.trim()) {
        searchResults.sort((a, b) => {
          let comparison = 0
          
          switch (mergedFilter.sortBy) {
            case 'date':
              comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              break
            case 'title':
              comparison = a.title.localeCompare(b.title)
              break
            case 'priority':
              if (a.type === 'todo' && b.type === 'todo') {
                const priorityOrder = { high: 3, medium: 2, low: 1 }
                comparison = (priorityOrder[b.priority!] || 0) - (priorityOrder[a.priority!] || 0)
              }
              break
            default:
              comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          }
          
          return mergedFilter.sortOrder === 'asc' ? comparison : -comparison
        })
      }
      
      // 카테고리 및 태그 통계 계산
      const categories = new Map<string, number>()
      const tags = new Map<string, number>()
      
      searchResults.forEach(item => {
        categories.set(item.category, (categories.get(item.category) || 0) + 1)
        item.tags.forEach(tag => {
          tags.set(tag, (tags.get(tag) || 0) + 1)
        })
      })
      
      const result: SearchResult = {
        items: searchResults,
        totalCount: searchResults.length,
        matchedTerms,
        searchTime: Date.now() - startTime,
        categories: Array.from(categories.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        tags: Array.from(tags.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20) // 상위 20개 태그만
      }
      
      setSearchResults(result)
      setSearchFilter(mergedFilter)
      
      return result
    } finally {
      setIsSearching(false)
    }
  }
  
  // 검색 초기화
  const clearSearch = () => {
    setSearchResults(null)
    setSearchFilter({
      query: '',
      type: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc'
    })
  }
  
  // 검색 기록 추가
  const addToHistory = (query: string) => {
    if (!query.trim()) return
    
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
    setSearchHistory(newHistory)
    if (typeof window !== 'undefined') {
      localStorage.setItem('search-history', JSON.stringify(newHistory))
    }
  }
  
  // 검색 기록 초기화
  const clearHistory = () => {
    setSearchHistory([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('search-history')
    }
  }
  
  // 텍스트 하이라이팅
  const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text
    
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0)
    let highlightedText = text
    
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
    })
    
    return highlightedText
  }
  
  // 검색 제안
  const getSuggestions = (query: string): string[] => {
    if (!query.trim()) return searchHistory.slice(0, 5)
    
    const allContent = getAllContent()
    const suggestions = new Set<string>()
    
    // 제목에서 제안 추출
    allContent.forEach(item => {
      const words = item.title.toLowerCase().split(/\s+/)
      words.forEach(word => {
        if (word.includes(query.toLowerCase()) && word.length > 2) {
          suggestions.add(word)
        }
      })
    })
    
    // 태그에서 제안 추출
    allContent.forEach(item => {
      item.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(tag)
        }
      })
    })
    
    return Array.from(suggestions).slice(0, 8)
  }
  
  // 통계 정보
  const getSearchStats = () => {
    const allContent = getAllContent()
    
    const categories = new Map<string, number>()
    const tags = new Map<string, number>()
    
    allContent.forEach(item => {
      categories.set(item.category, (categories.get(item.category) || 0) + 1)
      item.tags.forEach(tag => {
        tags.set(tag, (tags.get(tag) || 0) + 1)
      })
    })
    
    return {
      totalItems: allContent.length,
      categories: Array.from(categories.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      tags: Array.from(tags.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    }
  }
  
  const value: SearchContextType = {
    searchFilter,
    searchResults,
    isSearching,
    searchHistory,
    setSearchFilter,
    search,
    clearSearch,
    addToHistory,
    clearHistory,
    highlightText,
    getSuggestions,
    getSearchStats
  }
  
  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}