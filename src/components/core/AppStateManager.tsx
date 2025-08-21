'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { FolderItem } from '@/types/folder'

// 탭 타입 정의
export type TabType = 'my-folder' | 'bookmarks' | 'marketplace'

// State 인터페이스 정의
interface AppState {
  // 네비게이션 상태
  activeTab: TabType
  currentView: 'grid' | 'detail'
  marketplaceView: 'marketplace' | 'my-shared'
  
  // 데이터 상태
  folders: FolderItem[]
  selectedFolderId?: string
  sharedFolderIds: Set<string>
  
  // UI 상태
  isLoading: boolean
  isMobileMenuOpen: boolean
  showMobileDropdown: boolean
  showAccountMenu: boolean
  
  // 모달 상태
  showFeedbackModal: boolean
  showCreateFolderModal: boolean
  showLoginModal: boolean
  showSignoutModal: boolean
  
  // 폼 상태
  newFolderName: string
}

// State Actions 인터페이스
interface AppStateActions {
  // 네비게이션 액션
  setActiveTab: (tab: TabType) => void
  setCurrentView: (view: 'grid' | 'detail') => void
  setMarketplaceView: (view: 'marketplace' | 'my-shared') => void
  
  // 데이터 액션
  setFolders: (folders: FolderItem[]) => void
  setSelectedFolderId: (id?: string) => void
  setSharedFolderIds: (ids: Set<string>) => void
  
  // UI 액션
  setIsLoading: (loading: boolean) => void
  setIsMobileMenuOpen: (open: boolean) => void
  setShowMobileDropdown: (show: boolean) => void
  setShowAccountMenu: (show: boolean) => void
  
  // 모달 액션
  setShowFeedbackModal: (show: boolean) => void
  setShowCreateFolderModal: (show: boolean) => void
  setShowLoginModal: (show: boolean) => void
  setShowSignoutModal: (show: boolean) => void
  
  // 폼 액션
  setNewFolderName: (name: string) => void
}

// Context 타입 정의
type AppStateContextType = AppState & AppStateActions & {
  selectedFolder?: FolderItem
}

// Context 생성
const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

// Provider 컴포넌트
export function AppStateProvider({ children }: { children: ReactNode }) {
  // 네비게이션 상태
  const [activeTab, setActiveTab] = useState<TabType>('my-folder')
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid')
  const [marketplaceView, setMarketplaceView] = useState<'marketplace' | 'my-shared'>('marketplace')
  
  // 데이터 상태
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [sharedFolderIds, setSharedFolderIds] = useState<Set<string>>(new Set())
  
  // UI 상태
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showMobileDropdown, setShowMobileDropdown] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  
  // 모달 상태
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignoutModal, setShowSignoutModal] = useState(false)
  
  // 폼 상태
  const [newFolderName, setNewFolderName] = useState('')
  
  // 계산된 값
  const selectedFolder = folders.find(f => f.id === selectedFolderId)
  
  const contextValue: AppStateContextType = {
    // 상태 값들
    activeTab,
    currentView,
    marketplaceView,
    folders,
    selectedFolderId,
    sharedFolderIds,
    isLoading,
    isMobileMenuOpen,
    showMobileDropdown,
    showAccountMenu,
    showFeedbackModal,
    showCreateFolderModal,
    showLoginModal,
    showSignoutModal,
    newFolderName,
    selectedFolder,
    
    // 액션 함수들
    setActiveTab,
    setCurrentView,
    setMarketplaceView,
    setFolders,
    setSelectedFolderId,
    setSharedFolderIds,
    setIsLoading,
    setIsMobileMenuOpen,
    setShowMobileDropdown,
    setShowAccountMenu,
    setShowFeedbackModal,
    setShowCreateFolderModal,
    setShowLoginModal,
    setShowSignoutModal,
    setNewFolderName,
  }

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  )
}

// Hook for using the context
export function useAppState() {
  const context = useContext(AppStateContext)
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return context
}