'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  TrendingUp,
  Heart,
  ThumbsUp,
  Download,
  Eye,
  Star,
  ArrowLeft
} from 'lucide-react'
import { SharedFolder, ShareCategory, categoryMetadata, createDummySharedFolders } from '@/types/share'

interface SharePlaceProps {
  onBack: () => void
  onImportFolder?: (folder: SharedFolder) => void
  initialSearchQuery?: string
}

export default function SharePlace({ onBack, onImportFolder, initialSearchQuery }: SharePlaceProps) {
  const [sharedFolders, setSharedFolders] = useState<SharedFolder[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ShareCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '')
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'helpful'>('popular')
  const [selectedFolder, setSelectedFolder] = useState<SharedFolder | null>(null)

  // 더미 데이터 로드
  useEffect(() => {
    setSharedFolders(createDummySharedFolders())
  }, [])

  // 필터링 및 정렬
  const filteredAndSortedFolders = sharedFolders
    .filter(folder => {
      const matchesCategory = selectedCategory === 'all' || folder.category === selectedCategory
      const matchesSearch = searchQuery === '' || 
        folder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        folder.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        folder.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.stats.likes + b.stats.helpful) - (a.stats.likes + a.stats.helpful)
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'helpful':
          return b.stats.helpful - a.stats.helpful
        default:
          return 0
      }
    })

  const handleRating = (folderId: string, type: 'like' | 'helpful' | 'not_helpful') => {
    setSharedFolders(prev => prev.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          stats: {
            ...folder.stats,
            [type === 'like' ? 'likes' : type === 'helpful' ? 'helpful' : 'notHelpful']: 
              folder.stats[type === 'like' ? 'likes' : type === 'helpful' ? 'helpful' : 'notHelpful'] + 1
          }
        }
      }
      return folder
    }))
  }

  const handleImportFolder = (folder: SharedFolder) => {
    if (onImportFolder) {
      onImportFolder(folder)
      alert(`"${folder.title}" 폴더가 내 워크스페이스에 복사되었습니다! 🎉`)
    }
  }

  if (selectedFolder) {
    return (
      <FolderDetailView 
        folder={selectedFolder} 
        onBack={() => setSelectedFolder(null)} 
        onRate={handleRating}
        onImport={handleImportFolder}
      />
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 헤더 */}
      <motion.header 
        className="flex items-center justify-between px-6 py-4 border-b backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'var(--border-light)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} style={{ color: 'var(--text-primary)' }} />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              🤝 Share Place
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {initialSearchQuery 
                ? `"${initialSearchQuery}" 검색 결과` 
                : "다른 사용자들이 공유한 유용한 폴더들을 둘러보세요"
              }
            </p>
          </div>
        </div>

        {/* 검색 */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="폴더 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                   style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>

        {/* 정렬 */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'popular' | 'recent' | 'helpful')}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="popular">인기순</option>
            <option value="recent">최신순</option>
            <option value="helpful">유익함순</option>
          </select>
        </div>
      </motion.header>

      <div className="flex-1 flex overflow-hidden">
        {/* 카테고리 사이드바 */}
        <motion.aside 
          className="w-64 border-r p-4"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-light)'
          }}
          initial={{ x: -256, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            카테고리
          </h3>
          
          <div className="space-y-2">
            <CategoryButton
              isSelected={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
              icon="🌟"
              label="전체"
              count={sharedFolders.length}
            />
            
            {(Object.keys(categoryMetadata) as ShareCategory[]).map(category => (
              <CategoryButton
                key={category}
                isSelected={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                icon={categoryMetadata[category].icon}
                label={categoryMetadata[category].label}
                count={sharedFolders.filter(f => f.category === category).length}
                color={categoryMetadata[category].color}
              />
            ))}
          </div>
        </motion.aside>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 p-6 overflow-auto scrollbar-hide">
          {/* 통계 헤더 */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedCategory === 'all' 
                    ? '모든 폴더' 
                    : categoryMetadata[selectedCategory as ShareCategory]?.label
                  }
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {filteredAndSortedFolders.length}개의 공유 폴더
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} />
                  <span>이번 주 인기</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 폴더 그리드 */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence>
              {filteredAndSortedFolders.map((folder, index) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  index={index}
                  onClick={() => setSelectedFolder(folder)}
                  onRate={handleRating}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* 빈 상태 */}
          {filteredAndSortedFolders.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                검색 결과가 없습니다
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                다른 키워드로 검색하거나 카테고리를 변경해보세요
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}

// 카테고리 버튼 컴포넌트
const CategoryButton = ({ 
  isSelected, 
  onClick, 
  icon, 
  label, 
  count, 
  color 
}: {
  isSelected: boolean
  onClick: () => void
  icon: string
  label: string
  count: number
  color?: string
}) => (
  <motion.button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
    style={{
      backgroundColor: isSelected ? (color ? color + '20' : 'var(--bg-secondary)') : 'transparent',
      color: isSelected ? (color || 'var(--text-primary)') : 'var(--text-secondary)'
    }}
    whileHover={{ scale: 1.02, x: 2 }}
    whileTap={{ scale: 0.98 }}
  >
    <span className="text-base">{icon}</span>
    <span className="flex-1 text-left font-medium">{label}</span>
    <span className="text-xs opacity-70">{count}</span>
  </motion.button>
)

// 폴더 카드 컴포넌트
const FolderCard = ({ 
  folder, 
  index, 
  onClick, 
  onRate 
}: {
  folder: SharedFolder
  index: number
  onClick: () => void
  onRate: (folderId: string, type: 'like' | 'helpful' | 'not_helpful') => void
}) => (
  <motion.div
    className="group relative bg-white rounded-xl p-6 shadow-sm border cursor-pointer transition-all duration-200"
    style={{
      backgroundColor: 'var(--bg-card)',
      borderColor: 'var(--border-light)',
    }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ 
      scale: 1.02,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
    }}
    onClick={onClick}
  >
    {/* 썸네일 */}
    <div 
      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4"
      style={{ backgroundColor: categoryMetadata[folder.category].color + '20' }}
    >
      {folder.thumbnail || categoryMetadata[folder.category].icon}
    </div>

    {/* 제목 및 설명 */}
    <h3 className="text-lg font-semibold mb-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
      {folder.title}
    </h3>
    
    <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
      {folder.description}
    </p>

    {/* 작성자 */}
    <div className="flex items-center gap-2 mb-4">
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
        style={{ backgroundColor: categoryMetadata[folder.category].color + '20' }}
      >
        {folder.author.avatar}
      </div>
      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {folder.author.name}
      </span>
      {folder.author.verified && <Star size={12} style={{ color: '#F59E0B' }} />}
    </div>

    {/* 태그 */}
    <div className="flex flex-wrap gap-1 mb-4">
      {folder.tags.slice(0, 3).map(tag => (
        <span
          key={tag}
          className="px-2 py-1 text-xs rounded-full"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)'
          }}
        >
          #{tag}
        </span>
      ))}
    </div>

    {/* 통계 및 액션 */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <div className="flex items-center gap-1">
          <Eye size={12} />
          <span>{folder.stats.views.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart size={12} />
          <span>{folder.stats.likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsUp size={12} />
          <span>{folder.stats.helpful}</span>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRate(folder.id, 'like')
          }}
          className="p-1 rounded hover:bg-red-50 transition-colors"
        >
          <Heart size={14} style={{ color: '#EF4444' }} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRate(folder.id, 'helpful')
          }}
          className="p-1 rounded hover:bg-green-50 transition-colors"
        >
          <ThumbsUp size={14} style={{ color: '#10B981' }} />
        </button>
      </div>
    </div>
  </motion.div>
)

// 폴더 상세 뷰 컴포넌트
const FolderDetailView = ({ 
  folder, 
  onBack, 
  onRate,
  onImport
}: {
  folder: SharedFolder
  onBack: () => void
  onRate: (folderId: string, type: 'like' | 'helpful' | 'not_helpful') => void
  onImport: (folder: SharedFolder) => void
}) => (
  <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
    {/* 상세 헤더 */}
    <motion.header 
      className="px-6 py-4 border-b"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-light)'
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex-1">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {folder.title}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              by {folder.author.name}
            </span>
            <span className="px-2 py-1 text-xs rounded-full" 
                  style={{ 
                    backgroundColor: categoryMetadata[folder.category].color + '20',
                    color: categoryMetadata[folder.category].color
                  }}>
              {categoryMetadata[folder.category].label}
            </span>
          </div>
        </div>
      </div>
    </motion.header>

    {/* 상세 컨텐츠 */}
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* 설명 */}
        <div className="mb-8">
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {folder.description}
          </p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Eye size={20} />} label="조회수" value={folder.stats.views.toLocaleString()} />
          <StatCard icon={<Heart size={20} />} label="좋아요" value={folder.stats.likes.toString()} />
          <StatCard icon={<ThumbsUp size={20} />} label="유익해요" value={folder.stats.helpful.toString()} />
          <StatCard icon={<Download size={20} />} label="다운로드" value={folder.stats.downloads.toString()} />
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            onClick={() => onRate(folder.id, 'like')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: '#EF4444',
              color: 'white'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart size={16} />
            좋아요
          </motion.button>
          
          <motion.button
            onClick={() => onRate(folder.id, 'helpful')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: '#10B981',
              color: 'white'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ThumbsUp size={16} />
            유익해요
          </motion.button>

          <motion.button
            onClick={() => onImport(folder)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-card)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={16} />
            내 워크스페이스로 복사
          </motion.button>
        </div>

        {/* 폴더 미리보기 */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            📁 폴더 미리보기
          </h3>
          <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
            <div className="text-4xl mb-4">{folder.thumbnail || '📁'}</div>
            <p>폴더 구조와 내용을 여기에 표시합니다</p>
            <p className="text-sm mt-2">({folder.folder.children.length}개 항목)</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
    <div className="flex justify-center mb-2" style={{ color: 'var(--text-secondary)' }}>
      {icon}
    </div>
    <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</div>
    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</div>
  </div>
)