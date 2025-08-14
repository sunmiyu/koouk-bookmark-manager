'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { X, FileText, Link, Image, File } from 'lucide-react'
import { createStorageItem, StorageItem } from '@/types/folder'

interface SharedData {
  title: string
  text: string
  url: string
  files: Array<{
    name: string
    size: number
    type: string
  }>
  timestamp: string
  processed: boolean
}

interface SharedContentHandlerProps {
  onAddItem?: (item: StorageItem, folderId: string) => void
  folders?: Array<{ id: string; name: string }>
  selectedFolderId?: string
}

function SharedContentHandlerInner({ 
  onAddItem, 
  folders = [], 
  selectedFolderId 
}: SharedContentHandlerProps) {
  const [sharedData, setSharedData] = useState<SharedData | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string>(selectedFolderId || '')
  const [showModal, setShowModal] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const isShared = searchParams.get('shared')
    const dataParam = searchParams.get('data')
    
    if (isShared === 'true' && dataParam) {
      try {
        const decoded = JSON.parse(atob(dataParam))
        setSharedData(decoded)
        setShowModal(true)
        
        // URL에서 파라미터 제거
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('shared')
        newUrl.searchParams.delete('data')
        window.history.replaceState({}, '', newUrl.toString())
      } catch (error) {
        console.error('공유 데이터 파싱 오류:', error)
      }
    }
  }, [searchParams])

  const handleSaveSharedContent = () => {
    if (!sharedData || !onAddItem) return
    
    const targetFolderId = selectedFolder || (folders[0]?.id)
    if (!targetFolderId) {
      alert('폴더를 선택해주세요.')
      return
    }

    try {
      // 공유받은 콘텐츠를 StorageItem으로 변환
      let item
      
      if (sharedData.url && sharedData.url.startsWith('http')) {
        // URL이 있는 경우 - URL 아이템으로 저장
        item = createStorageItem(
          sharedData.title || 'Shared Link',
          'url',
          sharedData.text || sharedData.title || '',
          targetFolderId,
          {
            url: sharedData.url,
            thumbnail: sharedData.url.includes('youtube') 
              ? `https://img.youtube.com/vi/${extractYouTubeId(sharedData.url)}/maxresdefault.jpg`
              : undefined,
            tags: ['shared', 'imported']
          }
        )
      } else if (sharedData.text) {
        // 텍스트가 있는 경우 - 메모/문서로 저장
        const type = sharedData.text.length > 500 ? 'document' : 'memo'
        item = createStorageItem(
          sharedData.title || 'Shared Content',
          type,
          sharedData.text,
          targetFolderId,
          {
            tags: ['shared', 'imported']
          }
        )
      } else {
        // 기타 - 일반 메모로 저장
        item = createStorageItem(
          sharedData.title || 'Shared Item',
          'memo',
          `공유받은 콘텐츠\n제목: ${sharedData.title}\nURL: ${sharedData.url}`,
          targetFolderId,
          {
            tags: ['shared', 'imported']
          }
        )
      }

      onAddItem(item, targetFolderId)
      setShowModal(false)
      setSharedData(null)
      
      // 성공 메시지
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
      
    } catch (error) {
      console.error('공유 콘텐츠 저장 오류:', error)
      alert('콘텐츠 저장 중 오류가 발생했습니다.')
    }
  }

  const extractYouTubeId = (url: string): string => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : ''
  }

  const getContentIcon = () => {
    if (!sharedData) return <File className="w-6 h-6 text-blue-500" />
    
    if (sharedData.url && sharedData.url.startsWith('http')) {
      return <Link className="w-6 h-6 text-green-500" />
    }
    if (sharedData.files.length > 0) {
      const fileType = sharedData.files[0].type
      if (fileType.startsWith('image/')) {
        return <Image className="w-6 h-6 text-purple-500" />
      }
      return <File className="w-6 h-6 text-orange-500" />
    }
    return <FileText className="w-6 h-6 text-blue-500" />
  }

  const handleDismiss = () => {
    setShowModal(false)
    setSharedData(null)
  }

  if (!showModal || !sharedData) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {getContentIcon()}
            <h2 className="text-lg font-semibold text-gray-900">
              공유받은 콘텐츠
            </h2>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Title */}
          {sharedData.title && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                제목
              </label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
                {sharedData.title}
              </div>
            </div>
          )}

          {/* URL */}
          {sharedData.url && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                링크
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <a
                  href={sharedData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 break-all"
                >
                  {sharedData.url}
                </a>
              </div>
            </div>
          )}

          {/* Text Content */}
          {sharedData.text && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                내용
              </label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {sharedData.text}
              </div>
            </div>
          )}

          {/* Files */}
          {sharedData.files.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                파일 ({sharedData.files.length}개)
              </label>
              <div className="space-y-2">
                {sharedData.files.map((file, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded-lg flex items-center gap-2">
                    <File className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 flex-1">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)}KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Folder Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              저장할 폴더
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {folders.length === 0 ? (
                <option value="">폴더가 없습니다</option>
              ) : (
                <>
                  {!selectedFolder && <option value="">폴더를 선택해주세요</option>}
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 px-4 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSaveSharedContent}
            disabled={!selectedFolder || folders.length === 0}
            className="flex-1 py-2 px-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SharedContentHandler(props: SharedContentHandlerProps) {
  return (
    <Suspense fallback={null}>
      <SharedContentHandlerInner {...props} />
    </Suspense>
  )
}