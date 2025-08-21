'use client'

import { motion } from 'framer-motion'
import SharedFolderCard from '@/components/ui/SharedFolderCard'
import { useMarketplaceState } from './MarketplaceStateManager'
import { useMarketplaceEventHandlers } from './MarketplaceEventHandlers'

/**
 * MarketPlace 카드 그리드 표시 컴포넌트
 * 그리드/리스트 뷰 모드 지원
 */
export function MarketplaceGrid({ onImportFolder }: { onImportFolder?: (folder: any) => void }) {
  const {
    filteredFolders,
    viewMode,
    isLoading,
    isMobile,
    categories
  } = useMarketplaceState()
  
  const { openImportModal, openEditModal, handleLikeToggle } = useMarketplaceEventHandlers(onImportFolder)

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
            : 'grid-cols-1'
        }`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-lg animate-pulse"
              style={{ height: viewMode === 'grid' ? '240px' : '120px' }}
            />
          ))}
        </div>
      </div>
    )
  }

  // 빈 상태
  if (filteredFolders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-gray-400 mb-4">
          <div className="text-4xl mb-2">🔍</div>
          <div className="text-lg font-medium">No collections found</div>
          <div className="text-sm">Try adjusting your search or filters</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* 그리드 뷰 */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
          {filteredFolders.map((folder, index) => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <SharedFolderCard
                sharedFolder={folder}
                onImportFolder={() => openImportModal(folder)}
                onEditFolder={() => openEditModal(folder)}
                categories={categories.map(cat => ({ 
                  value: cat.id, 
                  label: cat.label,
                  emoji: cat.id === 'lifestyle' ? '🏠' : 
                        cat.id === 'tech' ? '💻' : 
                        cat.id === 'food' ? '🍽️' : 
                        cat.id === 'travel' ? '✈️' : 
                        cat.id === 'study' ? '📚' : 
                        cat.id === 'work' ? '💼' : 
                        cat.id === 'entertainment' ? '🎵' : 
                        cat.id === 'health' ? '🏃' : 
                        cat.id === 'investment' ? '💰' : 
                        cat.id === 'parenting' ? '👶' : '📁'
                }))}
                isOwnFolder={false}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* 리스트 뷰 */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredFolders.map((folder, index) => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
            >
              <SharedFolderCard
                sharedFolder={folder}
                onImportFolder={() => openImportModal(folder)}
                onEditFolder={() => openEditModal(folder)}
                categories={categories.map(cat => ({ 
                  value: cat.id, 
                  label: cat.label,
                  emoji: cat.id === 'lifestyle' ? '🏠' : 
                        cat.id === 'tech' ? '💻' : 
                        cat.id === 'food' ? '🍽️' : 
                        cat.id === 'travel' ? '✈️' : 
                        cat.id === 'study' ? '📚' : 
                        cat.id === 'work' ? '💼' : 
                        cat.id === 'entertainment' ? '🎵' : 
                        cat.id === 'health' ? '🏃' : 
                        cat.id === 'investment' ? '💰' : 
                        cat.id === 'parenting' ? '👶' : '📁'
                }))}
                isOwnFolder={false}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* 페이지네이션 (나중에 추가) */}
      <div className="mt-8 flex justify-center">
        <div className="text-sm text-gray-500">
          Showing {filteredFolders.length} collections
        </div>
      </div>
    </div>
  )
}