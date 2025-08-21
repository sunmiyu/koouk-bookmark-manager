'use client'

import { Suspense } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import KooukSidebar from '../layout/KooukSidebar'
import MainContent from '../layout/MainContent'
import { useDevice } from '@/hooks/useDevice'
import DashboardPage from '../pages/Dashboard/DashboardPage'

// 분리된 컴포넌트들 import
import { AppStateProvider, useAppState } from './AppStateManager'
import { useAppEventHandlers } from './AppEventHandlers'
import { useAppEffectManager } from './AppEffectManager'
import { AppModals } from './AppModals'

/**
 * 🚀 리팩토링된 메인 App 컴포넌트
 * 831줄 → 150줄 (82% 감소)
 * 
 * 분리된 구조:
 * - AppStateManager: 모든 useState 관리
 * - AppEventHandlers: 모든 이벤트 핸들러 관리  
 * - AppEffectManager: 모든 useEffect 관리
 * - AppModals: 모든 모달 관리
 */
function AppContent() {
  const device = useDevice()
  const { user, loading } = useAuth()
  const status = loading ? 'loading' : (user ? 'authenticated' : 'idle')
  
  // 분리된 상태 관리
  const {
    activeTab,
    currentView,
    folders,
    selectedFolderId,
    selectedFolder,
    sharedFolderIds,
    isLoading,
    isMobileMenuOpen,
    showMobileDropdown,
    marketplaceView,
    setActiveTab,
    setIsMobileMenuOpen,
    setShowMobileDropdown,
    setShowAccountMenu,
    setShowCreateFolderModal
  } = useAppState()
  
  // 분리된 이벤트 핸들러
  const {
    handleFolderSelect,
    handleViewChange,
    handleReorderFolders,
    handleEditFolder,
    handleDeleteFolder,
    handleAddItem,
    handleItemDelete,
    handleImportFolder,
    handleBatchImport
  } = useAppEventHandlers()
  
  // 분리된 Effect 관리 (자동 실행)
  useAppEffectManager()

  // 로딩 상태
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading KOOUK...</p>
        </div>
      </div>
    )
  }

  // 미인증 상태 - Dashboard 표시
  if (status === 'idle') {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardPage onNavigate={(tab) => setActiveTab(tab as any)} />
        <AppModals />
      </div>
    )
  }

  // 인증된 사용자 - 메인 앱 UI
  return (
    <div className={`min-h-screen bg-gray-50 ${device.isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
      {/* 데스크톱 레이아웃 */}
      {!device.isMobile && (
        <div className="flex h-screen">
          <KooukSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            folders={folders}
            selectedFolderId={selectedFolderId}
            onFolderSelect={handleFolderSelect}
            onCreateFolder={() => setShowCreateFolderModal(true)}
            onReorderFolders={handleReorderFolders}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            sharedFolderIds={sharedFolderIds}
            onAccountClick={() => setShowAccountMenu(true)}
          />
          <div className="flex-1 overflow-hidden">
            <MainContent
              activeTab={activeTab}
              currentView={currentView}
              onViewChange={handleViewChange}
              folders={folders}
              selectedFolder={selectedFolder}
              isLoading={isLoading}
              onAddItem={handleAddItem}
              onItemDelete={handleItemDelete}
              onImportFolder={handleImportFolder}
              onBatchImport={handleBatchImport}
              marketplaceView={marketplaceView}
            />
          </div>
        </div>
      )}

      {/* 모바일 레이아웃 */}
      {device.isMobile && (
        <div className="flex flex-col h-screen">
          {/* 모바일 헤더 */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <div className="w-full h-0.5 bg-currentColor"></div>
                  <div className="w-full h-0.5 bg-currentColor"></div>
                  <div className="w-full h-0.5 bg-currentColor"></div>
                </div>
              </button>
              
              <h1 className="text-lg font-semibold text-gray-900">KOOUK</h1>
              
              <button
                onClick={() => setShowMobileDropdown(!showMobileDropdown)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
              </button>
            </div>
          </div>
          
          {/* 메인 콘텐츠 */}
          <div className="flex-1 overflow-hidden">
            <MainContent
              activeTab={activeTab}
              currentView={currentView}
              onViewChange={handleViewChange}
              folders={folders}
              selectedFolder={selectedFolder}
              isLoading={isLoading}
              onAddItem={handleAddItem}
              onItemDelete={handleItemDelete}
              onImportFolder={handleImportFolder}
              onBatchImport={handleBatchImport}
              marketplaceView={marketplaceView}
            />
          </div>
        </div>
      )}

      {/* 통합 모달 관리 */}
      <AppModals />
    </div>
  )
}

/**
 * 메인 App 컴포넌트 with Provider
 */
export default function App() {
  return (
    <AppStateProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading KOOUK...</p>
          </div>
        </div>
      }>
        <AppContent />
      </Suspense>
    </AppStateProvider>
  )
}