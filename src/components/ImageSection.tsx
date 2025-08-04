'use client'

import { useContent } from '@/contexts/ContentContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvents } from '@/lib/analytics'
// ImageModal removed - using simple click handler
import ImageUpload from './ImageUpload'

interface ImageSectionProps {
  fullWidth?: boolean
  searchQuery?: string
}

export default function ImageSection({ fullWidth = false, searchQuery = '' }: ImageSectionProps) {
  const { images, deleteItem, loading, refreshData } = useContent()
  const { getStorageLimit } = useUserPlan()
  const { user } = useAuth()
  // Modal functionality removed

  const limit = getStorageLimit()
  
  // Filter images based on search query
  const filteredImages = images.filter(image => 
    searchQuery === '' || 
    image.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const isAtLimit = images.length >= limit
  
  if (loading) {
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="responsive-text-lg font-semibold text-green-400">Images</h3>
          <div className="text-xs text-gray-400">Loading...</div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg responsive-p-sm animate-pulse">
              <div className="flex items-start responsive-gap-sm">
                <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gray-700 rounded flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="responsive-text-lg font-semibold text-green-400">Images</h3>
        <div className="text-xs text-gray-400">
          {searchQuery ? (
            <span className="text-green-400">{filteredImages.length} found</span>
          ) : (
            <>
              <span className={images.length >= limit ? 'text-yellow-400' : ''}>{images.length}</span>
              <span className="text-gray-500">/{limit === Infinity ? '∞' : limit}</span>
            </>
          )}
        </div>
      </div>

      {/* Image Upload Component */}
      {user && !isAtLimit && (
        <div className="mb-6">
          <ImageUpload
            multiple={true}
            maxFiles={5}
            onUploadComplete={(imageData) => {
              console.log('Image uploaded:', imageData)
              refreshData() // Refresh the images list
              trackEvents.addContent('image')
            }}
            onUploadError={(error) => {
              console.error('Upload error:', error)
            }}
            compressionOptions={{
              maxWidth: 1920,
              maxHeight: 1080,
              quality: 0.8,
              maxSizeInMB: 2,
              outputFormat: 'webp'
            }}
          />
        </div>
      )}
      
      <div className={fullWidth ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 max-h-[800px] overflow-y-auto" : "space-y-3 max-h-[600px] overflow-y-auto"}>
        {/* Render filtered images */}
        {filteredImages.map((image) => (
          <div 
            key={image.id} 
            className={`bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg border border-gray-700 group relative ${
              fullWidth ? 'aspect-square p-0 overflow-hidden' : 'responsive-p-sm'
            }`}
            onClick={() => {
              trackEvents.openModal('image')
              window.open(image.thumbnail || image.url || '', '_blank')
            }}
          >
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('이 이미지를 삭제하시겠습니까?')) {
                  deleteItem(image.id, 'image')
                }
              }}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors opacity-0 group-hover:opacity-100 text-sm z-10"
              title="Delete image"
            >
              ✕
            </button>
            {fullWidth ? (
              // Full width layout - gallery grid
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={image.thumbnail || image.url}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-gray-700">
                        <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                        </svg>
                      </div>
                    `
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-end">
                  <div className="p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {image.title || 'Untitled'}
                    </h4>
                  </div>
                </div>
              </>
            ) : (
              // Default compact layout
              <div className="flex items-start responsive-gap-sm">
                <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={image.thumbnail || image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center">
                          <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                          </svg>
                        </div>
                      `
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white responsive-text-sm line-clamp-2">
                    {image.title || 'Untitled Image'}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {image.description || 'Image • Uploaded'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Add sample data if empty and not logged in */}
        {images.length === 0 && !user && !searchQuery && (
          <div 
            className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700 group relative"
            onClick={() => {
              trackEvents.openModal('image')
              window.open('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop', '_blank')
            }}
          >
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                alert('이것은 샘플 데이터입니다. 로그인 후 실제 이미지를 추가해보세요!')
              }}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors opacity-0 group-hover:opacity-100 text-sm z-10"
              title="Delete image"
            >
              ✕
            </button>
            <div className="flex items-start responsive-gap-sm">
              <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop"
                  alt="아름다운 풍경 예시"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white responsive-text-sm line-clamp-2">아름다운 풍경 예시</h4>
                <p className="text-xs text-gray-400 mt-1">Sample Image • Design</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredImages.length === 0 && (
          <div className="text-center py-8">
            {searchQuery ? (
              <>
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">No images found for &quot;{searchQuery}&quot;</p>
                <p className="text-gray-500 text-xs mt-1">Try a different search term</p>
              </>
            ) : user ? (
              <>
                <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                </svg>
                <h4 className="text-gray-400 font-medium mb-2">이미지가 없습니다</h4>
                <p className="text-gray-500 text-sm">위의 업로드 영역을 사용해서 첫 번째 이미지를 추가해보세요</p>
              </>
            ) : null}
          </div>
        )}
        
        {/* Show empty slots to fill visual space - only when not searching */}
        {!searchQuery && Array.from({ length: Math.max(0, 5 - Math.max(images.length, user ? 0 : 1)) }, (_, index) => (
          <div 
            key={`empty-${index}`}
            className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg responsive-p-sm opacity-30"
          >
            <div className="flex items-start responsive-gap-sm">
              <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-600 responsive-text-sm">이미지 슬롯</h4>
                <p className="text-xs text-gray-600 mt-1">새로운 이미지를 위한 공간</p>
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
            <span>Storage limit reached ({limit === Infinity ? 'unlimited' : limit} images)</span>
          </div>
          <p className="text-xs text-yellow-300 mt-1">
            Delete existing images to add new ones, or <a href="/pricing" className="underline hover:text-yellow-200">upgrade to Pro</a>
          </p>
        </div>
      )}
      
      {/* Modal removed - images open in new tab */}
    </div>
  )
}