'use client'

import { useState } from 'react'
import { useContent } from '@/contexts/ContentContext'
import InfoInputSection from '@/components/InfoInputSection'
import LinkSection from '@/components/LinkSection'
import VideoSection from '@/components/VideoSection'
import NotesSection from '@/components/NotesSection'
import ImageSection from '@/components/ImageSection'

type CategoryType = 'links' | 'images' | 'videos' | 'notes' | 'restaurants' | 'travel' | 'ai-tools'

export default function SimpleStorageContent() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('links')
  const { links, videos, notes, images } = useContent()

  const categories = [
    { 
      id: 'links' as CategoryType, 
      label: 'Links', 
      icon: '🔗', 
      count: links.length,
      color: 'text-blue-400 border-blue-400/30 bg-blue-600/10'
    },
    { 
      id: 'images' as CategoryType, 
      label: 'Images', 
      icon: '🖼️', 
      count: images.length,
      color: 'text-green-400 border-green-400/30 bg-green-600/10'
    },
    { 
      id: 'videos' as CategoryType, 
      label: 'Videos', 
      icon: '🎥', 
      count: videos.length,
      color: 'text-red-400 border-red-400/30 bg-red-600/10'
    },
    { 
      id: 'notes' as CategoryType, 
      label: 'Notes', 
      icon: '📝', 
      count: notes.length,
      color: 'text-purple-400 border-purple-400/30 bg-purple-600/10'
    },
    { 
      id: 'restaurants' as CategoryType, 
      label: '맛집', 
      icon: '🍽️', 
      count: 0, // TODO: 맛집 데이터 연결 필요
      color: 'text-orange-400 border-orange-400/30 bg-orange-600/10'
    },
    { 
      id: 'travel' as CategoryType, 
      label: '여행지', 
      icon: '✈️', 
      count: 0, // TODO: 여행지 데이터 연결 필요
      color: 'text-cyan-400 border-cyan-400/30 bg-cyan-600/10'
    },
    { 
      id: 'ai-tools' as CategoryType, 
      label: 'AI 도구', 
      icon: '🤖', 
      count: 0, // TODO: AI 도구 데이터 연결 필요
      color: 'text-pink-400 border-pink-400/30 bg-pink-600/10'
    }
  ]

  const renderContent = () => {
    switch (activeCategory) {
      case 'links':
        return <LinkSection />
      case 'images':
        return <ImageSection />
      case 'videos':
        return <VideoSection />
      case 'notes':
        return <NotesSection />
      case 'restaurants':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-white mb-2">맛집 모음</h3>
            <p className="text-gray-400 mb-6">좋아하는 맛집들을 저장하고 관리하세요</p>
            <div className="bg-gray-800/50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-300 mb-3">예시 맛집:</p>
              <div className="space-y-2 text-left">
                <div className="text-orange-400">🍕 이태원 피자집</div>
                <div className="text-orange-400">🍜 명동 칼국수</div>
                <div className="text-orange-400">🥘 강남 인도 요리</div>
              </div>
            </div>
          </div>
        )
      case 'travel':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-white mb-2">여행지 모음</h3>
            <p className="text-gray-400 mb-6">가고 싶은 여행지와 추억을 저장하세요</p>
            <div className="bg-gray-800/50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-300 mb-3">예시 여행지:</p>
              <div className="space-y-2 text-left">
                <div className="text-cyan-400">🏔️ 제주도 한라산</div>
                <div className="text-cyan-400">🏖️ 부산 해운대</div>
                <div className="text-cyan-400">🏯 경주 불국사</div>
              </div>
            </div>
          </div>
        )
      case 'ai-tools':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-white mb-2">AI 도구 모음</h3>
            <p className="text-gray-400 mb-6">유용한 AI 도구들을 모아서 관리하세요</p>
            <div className="bg-gray-800/50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-300 mb-3">예시 AI 도구:</p>
              <div className="space-y-2 text-left">
                <div className="text-pink-400">💬 ChatGPT</div>
                <div className="text-pink-400">🎨 Midjourney</div>
                <div className="text-pink-400">📝 Claude</div>
              </div>
            </div>
          </div>
        )
      default:
        return <LinkSection />
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Content Section */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-xl font-semibold text-white mb-4">Add Content</h2>
        <InfoInputSection />
      </div>

      {/* Category Navigation */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`storage-category-btn flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                activeCategory === category.id
                  ? category.color
                  : 'text-gray-400 border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600/50'
              }`}
            >
              <span className="text-2xl mb-2">{category.icon}</span>
              <span className="font-medium text-sm">{category.label}</span>
              <span className={`storage-count-badge text-xs mt-1 px-2 py-1 rounded-full ${
                activeCategory === category.id
                  ? 'bg-white/20'
                  : 'bg-gray-700/50'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 min-h-[400px]">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">
              {categories.find(c => c.id === activeCategory)?.icon}
            </span>
            <h2 className="text-xl font-semibold text-white">
              {categories.find(c => c.id === activeCategory)?.label}
            </h2>
            <span className="storage-count-badge text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-300">
              {categories.find(c => c.id === activeCategory)?.count} items
            </span>
          </div>
          
          {/* Dynamic Content */}
          <div className="storage-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}