'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { SharedFolder, ShareCategory } from '@/types/share'

// MarketPlace 상태 인터페이스
interface MarketplaceState {
  // 데이터 상태
  sharedFolders: SharedFolder[]
  filteredFolders: SharedFolder[]
  categories: Array<{ id: string; label: string; count: number }>
  
  // 필터링 상태
  selectedCategory: string
  sortOrder: 'popular' | 'recent' | 'helpful'
  localSearchQuery: string
  
  // UI 상태
  isLoading: boolean
  viewMode: 'grid' | 'list'
  isMobile: boolean
  showMobileSearch: boolean
  currentPage: number
  
  // 모달 상태
  editModalOpen: boolean
  editingFolder: SharedFolder | null
  showImportModal: boolean
  selectedFolderForImport: SharedFolder | null
  showSuccessOverlay: boolean
  successMessage: string
}

// State Actions 인터페이스
interface MarketplaceStateActions {
  // 데이터 액션
  setSharedFolders: (folders: SharedFolder[]) => void
  setFilteredFolders: (folders: SharedFolder[]) => void
  
  // 필터링 액션
  setSelectedCategory: (category: string) => void
  setSortOrder: (order: 'popular' | 'recent' | 'helpful') => void
  setLocalSearchQuery: (query: string) => void
  
  // UI 액션
  setIsLoading: (loading: boolean) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setIsMobile: (mobile: boolean) => void
  setShowMobileSearch: (show: boolean) => void
  setCurrentPage: (page: number) => void
  
  // 모달 액션
  setEditModalOpen: (open: boolean) => void
  setEditingFolder: (folder: SharedFolder | null) => void
  setShowImportModal: (show: boolean) => void
  setSelectedFolderForImport: (folder: SharedFolder | null) => void
  setShowSuccessOverlay: (show: boolean) => void
  setSuccessMessage: (message: string) => void
}

// 계산된 속성들
interface MarketplaceComputed {
  categories: Array<{
    id: string
    label: string
    count: number
  }>
}

// Context 타입
type MarketplaceContextType = MarketplaceState & MarketplaceStateActions & MarketplaceComputed

// Context 생성
const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined)

// Provider 컴포넌트
export function MarketplaceStateProvider({ children }: { children: ReactNode }) {
  // 데이터 상태
  const [sharedFolders, setSharedFolders] = useState<SharedFolder[]>([])
  const [filteredFolders, setFilteredFolders] = useState<SharedFolder[]>([])
  
  // 필터링 상태
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'popular' | 'recent' | 'helpful'>('popular')
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  
  // UI 상태
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  
  // 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<SharedFolder | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedFolderForImport, setSelectedFolderForImport] = useState<SharedFolder | null>(null)
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // 계산된 카테고리 목록
  const categories = [
    { id: 'all', label: 'All Categories', count: sharedFolders.length },
    { id: 'lifestyle', label: 'Lifestyle', count: sharedFolders.filter(f => f.category === 'lifestyle').length },
    { id: 'tech', label: 'Tech', count: sharedFolders.filter(f => f.category === 'tech').length },
    { id: 'food', label: 'Food & Recipe', count: sharedFolders.filter(f => f.category === 'food').length },
    { id: 'travel', label: 'Travel', count: sharedFolders.filter(f => f.category === 'travel').length },
    { id: 'study', label: 'Study', count: sharedFolders.filter(f => f.category === 'study').length },
    { id: 'work', label: 'Work', count: sharedFolders.filter(f => f.category === 'work').length },
    { id: 'entertainment', label: 'Entertainment', count: sharedFolders.filter(f => f.category === 'entertainment').length },
    { id: 'health', label: 'Health', count: sharedFolders.filter(f => f.category === 'health').length },
    { id: 'investment', label: 'Investment', count: sharedFolders.filter(f => f.category === 'investment').length },
    { id: 'parenting', label: 'Parenting', count: sharedFolders.filter(f => f.category === 'parenting').length }
  ]

  const contextValue: MarketplaceContextType = {
    // 상태 값들
    sharedFolders,
    filteredFolders,
    selectedCategory,
    sortOrder,
    localSearchQuery,
    isLoading,
    viewMode,
    isMobile,
    showMobileSearch,
    currentPage,
    editModalOpen,
    editingFolder,
    showImportModal,
    selectedFolderForImport,
    showSuccessOverlay,
    successMessage,
    categories,
    
    // 액션 함수들
    setSharedFolders,
    setFilteredFolders,
    setSelectedCategory,
    setSortOrder,
    setLocalSearchQuery,
    setIsLoading,
    setViewMode,
    setIsMobile,
    setShowMobileSearch,
    setCurrentPage,
    setEditModalOpen,
    setEditingFolder,
    setShowImportModal,
    setSelectedFolderForImport,
    setShowSuccessOverlay,
    setSuccessMessage
  }

  return (
    <MarketplaceContext.Provider value={contextValue}>
      {children}
    </MarketplaceContext.Provider>
  )
}

// Hook for using the context
export function useMarketplaceState() {
  const context = useContext(MarketplaceContext)
  if (context === undefined) {
    throw new Error('useMarketplaceState must be used within a MarketplaceStateProvider')
  }
  return context
}