import { useState } from 'react'
import { useContent } from '@/contexts/ContentContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { trackEvents } from '@/lib/analytics'
import Image from 'next/image'

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

const getYouTubeThumbnail = (url: string): string => {
  const videoId = getYouTubeVideoId(url)
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
}

interface VideoSectionProps {
  fullWidth?: boolean
  searchQuery?: string
}

export default function VideoSection({ fullWidth = false, searchQuery = '' }: VideoSectionProps) {
  const { videos, deleteItem, updateItem } = useContent()
  const { getStorageLimit } = useUserPlan()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)

  const limit = getStorageLimit()
  const isAtLimit = videos.length >= limit
  
  // Filter videos based on search query
  const filteredVideos = videos.filter(video => 
    searchQuery === '' || 
    video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.url?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleBulkMode = () => {
    setBulkMode(!bulkMode)
    setSelectedItems(new Set())
  }

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const selectAll = () => {
    setSelectedItems(new Set(videos.map(video => video.id)))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  const bulkDelete = async () => {
    if (selectedItems.size === 0) return
    
    if (confirm(`선택된 ${selectedItems.size}개의 비디오를 삭제하시겠습니까?`)) {
      try {
        await Promise.all(
          Array.from(selectedItems).map(id => deleteItem(id, 'video'))
        )
        setSelectedItems(new Set())
        setBulkMode(false)
      } catch (error) {
        console.error('Bulk delete failed:', error)
        alert('일부 항목 삭제에 실패했습니다.')
      }
    }
  }
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="responsive-text-lg font-semibold text-red-400">Videos</h3>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400">
            {searchQuery ? (
              <span className="text-red-400">{filteredVideos.length} found</span>
            ) : (
              <>
                <span className={videos.length >= limit ? 'text-yellow-400' : ''}>{videos.length}</span>
                <span className="text-gray-500">/{limit === Infinity ? '∞' : limit}</span>
              </>
            )}
          </div>
          {videos.length > 1 && (
            <button
              onClick={toggleBulkMode}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                bulkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {bulkMode ? '완료' : '다중선택'}
            </button>
          )}
        </div>
      </div>

      {/* Bulk operation controls */}
      {bulkMode && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">
                {selectedItems.size}개 선택됨
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  전체선택
                </button>
                <button
                  onClick={clearSelection}
                  className="text-xs text-gray-400 hover:text-gray-300"
                >
                  선택해제
                </button>
              </div>
            </div>
            <button
              onClick={bulkDelete}
              disabled={selectedItems.size === 0}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded transition-colors"
            >
              삭제 ({selectedItems.size})
            </button>
          </div>
        </div>
      )}
      <div className={fullWidth ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[800px] overflow-y-auto" : "space-y-3 max-h-[800px] overflow-y-auto"}>
        {/* Render filtered videos */}
        {filteredVideos.map((video) => {
          const thumbnailUrl = video.url ? getYouTubeThumbnail(video.url) : ''
          const isSelected = selectedItems.has(video.id)
          return (
            <div 
              key={video.id} 
              className={`bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg border group relative cursor-pointer ${
                fullWidth ? 'aspect-video p-0' : 'responsive-p-sm'
              } ${
                isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'
              }`}
              onClick={() => {
                if (bulkMode) {
                  toggleSelectItem(video.id)
                } else {
                  trackEvents.clickExternalLink(video.url || '')
                  window.open(video.url, '_blank')
                }
              }}
            >
              {/* Bulk selection checkbox */}
              {bulkMode && (
                <div className="absolute top-2 left-2 z-10">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-400 bg-gray-700'
                  }`}>
                    {isSelected && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                </div>
              )}

              {/* Edit and Delete buttons */}
              <div className={`absolute top-2 right-2 flex gap-1 z-10 ${
                bulkMode ? 'hidden' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const newTitle = prompt('비디오 제목을 수정하세요:', video.title)
                    if (newTitle && newTitle.trim() !== video.title) {
                      updateItem(video.id, 'video', { title: newTitle.trim() })
                    }
                  }}
                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors text-sm"
                  title="Edit video"
                >
                  ✎
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('이 비디오를 삭제하시겠습니까?')) {
                      deleteItem(video.id, 'video')
                    }
                  }}
                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors text-sm"
                  title="Delete video"
                >
                  ✕
                </button>
              </div>
              {fullWidth ? (
                // Full width layout - video card grid
                <div className="relative w-full h-full">
                  <div className="w-full h-full bg-gray-700 rounded-lg overflow-hidden relative">
                    {thumbnailUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-8 h-8 text-white bg-red-600 rounded-full p-2 bg-opacity-80" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                    <h4 className="font-medium text-white text-sm line-clamp-2">{video.title}</h4>
                  </div>
                </div>
              ) : (
                // Default compact layout
                <div className="flex items-start responsive-gap-sm">
                  <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gray-700 rounded flex-shrink-0 overflow-hidden relative">
                    {thumbnailUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white bg-red-600 rounded-full p-0.5 sm:p-1 bg-opacity-80" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white responsive-text-sm line-clamp-2">{video.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">Video • YouTube</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        
        {/* Add useful default videos if empty and not logged in */}
        {videos.length === 0 && !searchQuery && (
          <>
            <div 
              className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700 group relative"
              onClick={() => {
                trackEvents.clickExternalLink('https://www.youtube.com/watch?v=bMknfKXIFA8')
                window.open('https://www.youtube.com/watch?v=bMknfKXIFA8', '_blank')
              }}
            >
              <div className="flex items-start responsive-gap-sm">
                <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gray-700 rounded flex-shrink-0 overflow-hidden relative">
                  <Image 
                    src="https://img.youtube.com/vi/bMknfKXIFA8/maxresdefault.jpg"
                    alt="React Tutorial"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white bg-red-600 rounded-full p-0.5 sm:p-1 bg-opacity-80" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white responsive-text-sm line-clamp-2">React Tutorial - Modern Web Development</h4>
                  <p className="text-xs text-gray-400 mt-1">Educational • Programming</p>
                </div>
              </div>
            </div>
            <div 
              className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700 group relative"
              onClick={() => {
                trackEvents.clickExternalLink('https://www.youtube.com/watch?v=SzJ46YA_RaA')
                window.open('https://www.youtube.com/watch?v=SzJ46YA_RaA', '_blank')
              }}
            >
              <div className="flex items-start responsive-gap-sm">
                <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gray-700 rounded flex-shrink-0 overflow-hidden relative">
                  <Image 
                    src="https://img.youtube.com/vi/SzJ46YA_RaA/maxresdefault.jpg"
                    alt="Design Systems"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white bg-red-600 rounded-full p-0.5 sm:p-1 bg-opacity-80" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white responsive-text-sm line-clamp-2">Design Systems & Component Libraries</h4>
                  <p className="text-xs text-gray-400 mt-1">Design • UI/UX</p>
                </div>
              </div>
            </div>
            <div 
              className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700 group relative"
              onClick={() => {
                trackEvents.clickExternalLink('https://www.youtube.com/watch?v=F2Mx-u7auUs')
                window.open('https://www.youtube.com/watch?v=F2Mx-u7auUs', '_blank')
              }}
            >
              <div className="flex items-start responsive-gap-sm">
                <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gray-700 rounded flex-shrink-0 overflow-hidden relative">
                  <Image 
                    src="https://img.youtube.com/vi/F2Mx-u7auUs/maxresdefault.jpg"
                    alt="Productivity Tips"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white bg-red-600 rounded-full p-0.5 sm:p-1 bg-opacity-80" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white responsive-text-sm line-clamp-2">Developer Productivity & Tools</h4>
                  <p className="text-xs text-gray-400 mt-1">Productivity • Workflow</p>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Enhanced empty state message */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-8">
            {searchQuery ? (
              <>
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">No videos found for &quot;{searchQuery}&quot;</p>
                <p className="text-gray-500 text-xs mt-1">Try a different search term</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-white text-base font-semibold mb-2">Add Your First Video</h3>
                <p className="text-gray-400 text-sm mb-4">Save YouTube videos to watch later or reference</p>
                
                {/* CTA Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Focus on the input section
                      const input = document.querySelector('input[placeholder*="YouTube URL"]') as HTMLInputElement
                      if (input) {
                        input.focus()
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Video
                  </button>
                  
                  {/* Quick example buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="YouTube URL"]') as HTMLInputElement
                        if (input) {
                          input.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                          input.focus()
                          input.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          // Trigger change event
                          input.dispatchEvent(new Event('input', { bubbles: true }))
                        }
                      }}
                      className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md text-xs transition-all duration-200"
                    >
                      🎬 Tutorial
                    </button>
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="YouTube URL"]') as HTMLInputElement
                        if (input) {
                          input.value = 'https://www.youtube.com/watch?v=jNQXAC9IVRw'
                          input.focus()
                          input.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          input.dispatchEvent(new Event('input', { bubbles: true }))
                        }
                      }}
                      className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md text-xs transition-all duration-200"
                    >
                      🎵 Music
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Show empty slots to fill 10 total */}
        {Array.from({ length: Math.max(0, 10 - Math.max(videos.length, 1)) }, (_, index) => (
          <div 
            key={`empty-${index}`}
            className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg responsive-p-sm opacity-50"
          >
            <div className="flex items-start responsive-gap-sm">
              <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-600 responsive-text-sm">비디오 추가하기</h4>
                <p className="text-xs text-gray-600 mt-1">새로운 영상을 저장해보세요</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      
      {isAtLimit && (
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Storage limit reached ({limit === Infinity ? 'unlimited' : limit} videos)</span>
          </div>
          <p className="text-xs text-yellow-300 mt-1">
            Delete existing videos to add new ones, or <a href="/pricing" className="underline hover:text-yellow-200">upgrade to Pro</a>
          </p>
        </div>
      )}
    </div>
  )
}