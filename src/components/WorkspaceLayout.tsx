'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  User, 
  Menu,
  X,
  Filter,
  Grid3X3,
  LayoutList,
  Maximize2,
  Share2
} from 'lucide-react'
import FolderTree from './FolderTree'
import { FolderItem, StorageItem } from '@/types/folder'

interface WorkspaceLayoutProps {
  folders: FolderItem[]
  selectedFolderId?: string
  expandedFolders: Set<string>
  onFolderSelect: (folderId: string) => void
  onFolderToggle: (folderId: string) => void
  onCreateFolder: (parentId?: string) => void
  onCreateItem: (type: StorageItem['type'], folderId: string) => void
  onRenameFolder: (folderId: string, newName: string) => void
  onDeleteFolder: (folderId: string) => void
  onShareFolder?: (folderId: string) => void
  onSharePlaceClick?: () => void
  onSharePlaceSearch?: (query: string) => void
  children: (isFullWidth: boolean) => React.ReactNode
}

export default function WorkspaceLayout(props: WorkspaceLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchScope, setSearchScope] = useState<'all' | 'folder' | 'share'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  // const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 현재 선택된 폴더 정보
  const selectedFolder = props.folders.find(f => f.id === props.selectedFolderId)

  // 검색 처리
  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (searchScope === 'share' && props.onSharePlaceSearch) {
        props.onSharePlaceSearch(searchQuery.trim())
      }
      // 다른 검색 범위는 나중에 구현
    }
  }

  return (
    <div 
      className="h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* 전체 컨테이너를 중앙 정렬하고 max-width 설정 */}
      <div className="w-full max-w-[1400px] mx-auto h-full flex flex-col">
      {/* 상단 헤더 - Apple 스타일 가볍게 적용 */}
      <motion.header 
        className="apple-header flex items-center justify-between px-6 py-3"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* 좌측: 로고 & 네비게이션 */}
        <div className="flex items-center gap-4">
          {/* 모바일 햄버거 메뉴 */}
          <button
            className="md:hidden apple-button-ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={20} />
          </button>

          {/* 사이드바 토글 (데스크톱) */}
          <button
            className="hidden md:block apple-button-ghost"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu size={20} />
          </button>

          {/* KOOUK 로고 */}
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center apple-card">
              <div className="w-4 h-4 bg-black rounded-sm"></div>
            </div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--apple-text)' }}>
              KOOUK
            </h1>
          </motion.div>
        </div>

        {/* 중앙: 검색 바 */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <motion.input
              type="text"
              placeholder={
                searchScope === 'all' ? '전체 검색...' 
                : searchScope === 'share' ? 'Share Place에서 검색... (예: 서울 물놀이 장소)'
                : `${selectedFolder?.name || '폴더'} 내에서 검색...`
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="apple-input pl-10 pr-24"
              whileFocus={{
                scale: 1.01
              }}
            />
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--apple-text-secondary)' }}
            />
            
            {/* 검색 범위 선택 */}
            <select
              value={searchScope}
              onChange={(e) => setSearchScope(e.target.value as typeof searchScope)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-lg text-xs font-medium border apple-card"
              style={{ color: 'var(--apple-text)' }}
            >
              <option value="all">전체</option>
              <option value="folder">현재폴더</option>
              <option value="share">Share Place</option>
            </select>
          </div>
        </div>

        {/* 우측: 도구 & 사용자 */}
        <div className="flex items-center gap-2">
          {/* 뷰 모드 토글 */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-full apple-card">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'apple-elevated' : ''}`}
            >
              <Grid3X3 size={16} style={{ color: viewMode === 'grid' ? 'var(--apple-text)' : 'var(--apple-text-secondary)' }} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'apple-elevated' : ''}`}
            >
              <LayoutList size={16} style={{ color: viewMode === 'list' ? 'var(--apple-text)' : 'var(--apple-text-secondary)' }} />
            </button>
          </div>

          {/* Share Place 버튼 */}
          <motion.button
            onClick={props.onSharePlaceClick}
            className="apple-button-ghost"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 size={16} />
            <span className="hidden md:inline">Share Place</span>
          </motion.button>

          {/* 새 항목 추가 */}
          <motion.button
            className="apple-button-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={16} />
            <span className="hidden md:inline">추가</span>
          </motion.button>

          {/* 사용자 프로필 */}
          <motion.button 
            className="w-10 h-10 rounded-full flex items-center justify-center apple-card"
            whileHover={{ scale: 1.05 }}
          >
            <User size={18} style={{ color: 'var(--apple-text-secondary)' }} />
          </motion.button>
        </div>
      </motion.header>

      {/* 메인 작업 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 사이드바 - 가벼운 유리효과 */}
        <AnimatePresence>
          {(!sidebarCollapsed || mobileMenuOpen) && (
            <motion.aside
              className={`${mobileMenuOpen ? 'fixed inset-0 z-50 md:relative md:inset-auto' : 'hidden md:block'} w-72 h-full apple-card`}
              initial={{ x: -288, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -288, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {/* 모바일 닫기 버튼 */}
              {mobileMenuOpen && (
                <div className="md:hidden flex justify-end p-4">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="apple-button-ghost"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              <FolderTree 
                folders={props.folders}
                selectedFolderId={props.selectedFolderId}
                expandedFolders={props.expandedFolders}
                onFolderSelect={props.onFolderSelect}
                onFolderToggle={props.onFolderToggle}
                onCreateFolder={props.onCreateFolder}
                onCreateItem={props.onCreateItem}
                onRenameFolder={props.onRenameFolder}
                onDeleteFolder={props.onDeleteFolder}
                onShareFolder={props.onShareFolder}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* 메인 캔버스 영역 */}
        <motion.main 
          className="flex-1 flex flex-col overflow-hidden"
          style={{ backgroundColor: 'var(--bg-primary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* 브레드크럼 & 제어 */}
          {selectedFolder && (
            <motion.div 
              className="flex items-center justify-between px-6 py-4 border-b apple-card"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedFolder.color }}
                />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--apple-text)' }}>
                  {selectedFolder.name}
                </h2>
                <span className="text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                  {selectedFolder.children.length}개 항목
                </span>
              </div>

              <button className="apple-button-ghost">
                <Maximize2 size={18} />
              </button>
            </motion.div>
          )}

          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1 p-6 overflow-auto scrollbar-hide">
            {props.children(sidebarCollapsed)}
          </div>
        </motion.main>
      </div>

      {/* 모바일 오버레이 */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      </div> {/* 전체 컨테이너 닫기 */}
    </div>
  )
}