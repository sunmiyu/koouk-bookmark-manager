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
  Maximize2
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
  children: React.ReactNode
}

export default function WorkspaceLayout(props: WorkspaceLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchScope, setSearchScope] = useState<'all' | 'folder'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  // const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 현재 선택된 폴더 정보
  const selectedFolder = props.folders.find(f => f.id === props.selectedFolderId)

  return (
    <div 
      className="h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* 상단 헤더 - 피그마 스타일 */}
      <motion.header 
        className="flex items-center justify-between px-6 py-4 border-b backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'var(--border-light)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* 좌측: 로고 & 네비게이션 */}
        <div className="flex items-center gap-4">
          {/* 모바일 햄버거 메뉴 */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={20} style={{ color: 'var(--text-primary)' }} />
          </button>

          {/* 사이드바 토글 (데스크톱) */}
          <button
            className="hidden md:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu size={20} style={{ color: 'var(--text-primary)' }} />
          </button>

          {/* KOOUK 로고 */}
          <motion.h1 
            className="text-xl font-light tracking-wide"
            style={{ color: 'var(--text-primary)' }}
            whileHover={{ scale: 1.02 }}
          >
            koouk
          </motion.h1>
        </div>

        {/* 중앙: 검색 바 */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <motion.input
              type="text"
              placeholder={searchScope === 'all' ? '전체 검색...' : `${selectedFolder?.name || '폴더'} 내에서 검색...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-20 py-3 rounded-xl text-sm transition-all duration-300"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '2px solid transparent',
                color: 'var(--text-primary)'
              }}
              whileFocus={{
                scale: 1.01,
                borderColor: 'var(--text-primary)'
              }}
            />
            <Search 
              size={18} 
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
              style={{ color: 'var(--text-secondary)' }}
            />
            
            {/* 검색 범위 토글 */}
            <button
              onClick={() => setSearchScope(searchScope === 'all' ? 'folder' : 'all')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: searchScope === 'folder' ? 'var(--text-primary)' : 'var(--bg-card)',
                color: searchScope === 'folder' ? 'var(--bg-card)' : 'var(--text-secondary)'
              }}
            >
              <Filter size={12} />
              {searchScope === 'all' ? '전체' : '폴더'}
            </button>
          </div>
        </div>

        {/* 우측: 도구 & 사용자 */}
        <div className="flex items-center gap-3">
          {/* 뷰 모드 토글 */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid3X3 size={16} style={{ color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)' }} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <LayoutList size={16} style={{ color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* 새 항목 추가 */}
          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-card)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={16} />
            <span className="hidden md:inline">추가</span>
          </motion.button>

          {/* 사용자 프로필 */}
          <motion.button 
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
            whileHover={{ scale: 1.05 }}
          >
            <User size={18} style={{ color: 'var(--text-secondary)' }} />
          </motion.button>
        </div>
      </motion.header>

      {/* 메인 작업 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 사이드바 - 피그마 스타일 */}
        <AnimatePresence>
          {(!sidebarCollapsed || mobileMenuOpen) && (
            <motion.aside
              className={`${mobileMenuOpen ? 'fixed inset-0 z-50 md:relative md:inset-auto' : 'hidden md:block'} w-72 h-full border-r`}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-light)'
              }}
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
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              <FolderTree {...props} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* 메인 캔버스 영역 - 피그마 스타일 */}
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
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-light)'
              }}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedFolder.color }}
                />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedFolder.name}
                </h2>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {selectedFolder.children.length}개 항목
                </span>
              </div>

              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Maximize2 size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </motion.div>
          )}

          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1 p-6 overflow-auto scrollbar-hide">
            {props.children}
          </div>
        </motion.main>
      </div>

      {/* 모바일 오버레이 */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}