'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Save, 
  FileText, 
  Link, 
  Image as ImageIcon,
  Video,
  StickyNote,
  Check,
  X
} from 'lucide-react'

interface SharedContent {
  title?: string
  text?: string
  url?: string
  files?: File[]
  type?: 'url' | 'text' | 'image' | 'video' | 'document' | 'memo'
}

function ShareReceiverContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sharedContent, setSharedContent] = useState<SharedContent>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string>('default')

  useEffect(() => {
    // URL에서 공유받은 데이터 추출
    const title = searchParams.get('title') || ''
    const text = searchParams.get('text') || ''
    const url = searchParams.get('url') || ''
    
    // 콘텐츠 타입 자동 감지
    let detectedType: SharedContent['type'] = 'memo'
    
    if (url) {
      if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
        detectedType = 'video'
      } else {
        detectedType = 'url'
      }
    } else if (text && text.length > 200) {
      detectedType = 'document'
    } else if (text) {
      detectedType = 'memo'
    }

    setSharedContent({
      title: title || 'Shared Content',
      text,
      url,
      type: detectedType
    })
  }, [searchParams])

  const handleSave = async () => {
    setSaving(true)
    
    try {
      // 공유받은 콘텐츠를 localStorage에 저장 (임시)
      const existingContent = JSON.parse(localStorage.getItem('koouk-shared-content') || '[]')
      
      const newContent = {
        id: `shared_${Date.now()}`,
        ...sharedContent,
        folderId: selectedFolder,
        createdAt: new Date().toISOString(),
        source: 'share-target'
      }
      
      existingContent.push(newContent)
      localStorage.setItem('koouk-shared-content', JSON.stringify(existingContent))
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // 저장 시뮬레이션
      
      setSaved(true)
      
      // 2초 후 워크스페이스로 이동
      setTimeout(() => {
        router.push('/workspace')
      }, 2000)
      
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const getTypeIcon = () => {
    switch (sharedContent.type) {
      case 'video': return <Video className="w-5 h-5 text-blue-600" />
      case 'url': return <Link className="w-5 h-5 text-purple-600" />
      case 'document': return <FileText className="w-5 h-5 text-orange-600" />
      case 'image': return <ImageIcon className="w-5 h-5 text-green-600" />
      default: return <StickyNote className="w-5 h-5 text-yellow-600" />
    }
  }

  const getTypeLabel = () => {
    switch (sharedContent.type) {
      case 'video': return 'Video'
      case 'url': return 'Link'
      case 'document': return 'Document'
      case 'image': return 'Image'
      default: return 'Memo'
    }
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            저장 완료!
          </h2>
          
          <p className="text-gray-600 mb-6">
            KOOUK 워크스페이스에 성공적으로 저장되었습니다.
          </p>
          
          <div className="animate-pulse text-sm text-gray-500">
            워크스페이스로 이동 중...
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              KOOUK에 저장
            </h1>
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Content Preview */}
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  {getTypeIcon()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {sharedContent.title}
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {getTypeLabel()}
                    </span>
                  </div>
                  
                  {sharedContent.url && (
                    <div className="mb-2">
                      <a 
                        href={sharedContent.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                      >
                        {sharedContent.url}
                      </a>
                    </div>
                  )}
                  
                  {sharedContent.text && (
                    <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                      {sharedContent.text}
                    </div>
                  )}
                </div>
              </div>

              {/* Folder Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  저장할 폴더 선택
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'default', name: '일반', icon: '📄' },
                    { id: 'bookmarks', name: '북마크', icon: '🔖' },
                    { id: 'research', name: '연구자료', icon: '🔬' },
                    { id: 'inspiration', name: '영감', icon: '💡' },
                  ].map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={`
                        p-3 rounded-lg border-2 transition-all text-left
                        ${selectedFolder === folder.id 
                          ? 'border-accent bg-accent/5' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{folder.icon}</span>
                        <span className="font-medium text-sm">{folder.name}</span>
                        {selectedFolder === folder.id && (
                          <Check className="w-4 h-4 text-accent ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 px-4 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      KOOUK에 저장
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function ShareReceiver() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <ShareReceiverContent />
    </Suspense>
  )
}