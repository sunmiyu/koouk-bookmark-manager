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
  X,
  Plus,
  Folder,
  FolderOpen
} from 'lucide-react'
import { FolderItem, StorageItem, createFolder, createStorageItem } from '@/types/folder'

interface SharedContent {
  title?: string
  text?: string
  url?: string
  files?: File[]
  type?: 'url' | 'image' | 'video' | 'document' | 'memo'
}

function ShareReceiverContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sharedContent, setSharedContent] = useState<SharedContent>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [userFolders, setUserFolders] = useState<FolderItem[]>([])
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  useEffect(() => {
    // 사용자 폴더 목록 로드
    const loadUserFolders = () => {
      try {
        const savedFolders = localStorage.getItem('koouk-folders')
        if (savedFolders) {
          const folders = JSON.parse(savedFolders)
          setUserFolders(folders)
          if (folders.length > 0 && !selectedFolder) {
            setSelectedFolder(folders[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to load user folders:', error)
      }
    }

    loadUserFolders()

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
  }, [searchParams, selectedFolder])

  const handleCreateNewFolder = () => {
    if (!newFolderName.trim()) return
    
    const newFolder = createFolder(newFolderName.trim())
    const updatedFolders = [...userFolders, newFolder]
    
    // localStorage에 새 폴더 추가
    localStorage.setItem('koouk-folders', JSON.stringify(updatedFolders))
    
    // 상태 업데이트
    setUserFolders(updatedFolders)
    setSelectedFolder(newFolder.id)
    setNewFolderName('')
    setShowNewFolderInput(false)
  }

  // 실제 워크스페이스 폴더에 직접 저장
  const addItemToFolder = (folders: FolderItem[], folderId: string, newItem: StorageItem): FolderItem[] => {
    return folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          children: [...folder.children, newItem],
          updatedAt: new Date().toISOString()
        }
      }
      
      return {
        ...folder,
        children: folder.children.map(child =>
          child.type === 'folder'
            ? addItemToFolder([child as FolderItem], folderId, newItem)[0]
            : child
        )
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      // 공유받은 콘텐츠를 StorageItem으로 생성
      const content = sharedContent.url || sharedContent.text || ''
      const newItem = createStorageItem(
        sharedContent.title || 'Shared Content',
        (sharedContent.type as StorageItem['type']) || 'memo',
        content,
        selectedFolder
      )
      
      // 실제 워크스페이스 폴더에 아이템 추가
      const updatedFolders = addItemToFolder(userFolders, selectedFolder, newItem)
      
      // localStorage에 저장
      localStorage.setItem('koouk-folders', JSON.stringify(updatedFolders))
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
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
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  저장할 폴더 선택
                </label>
                
                {/* User Folders */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {userFolders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={`
                        w-full p-3 rounded-lg border-2 transition-all text-left hover:shadow-sm
                        ${selectedFolder === folder.id 
                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {/* Folder Color & Icon */}
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: folder.color || '#6B7280' }}
                        >
                          <Folder className="w-4 h-4 text-white" />
                        </div>
                        
                        {/* Folder Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900 truncate">
                              {folder.name}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {folder.children.length}개
                            </span>
                          </div>
                        </div>
                        
                        {/* Selection Check */}
                        {selectedFolder === folder.id && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                  
                  {/* Create New Folder */}
                  {!showNewFolderInput ? (
                    <button
                      onClick={() => setShowNewFolderInput(true)}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-all"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">새 폴더 만들기</span>
                      </div>
                    </button>
                  ) : (
                    <div className="p-3 border-2 border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="폴더 이름을 입력하세요..."
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCreateNewFolder()
                            } else if (e.key === 'Escape') {
                              setShowNewFolderInput(false)
                              setNewFolderName('')
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleCreateNewFolder}
                          disabled={!newFolderName.trim()}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setShowNewFolderInput(false)
                            setNewFolderName('')
                          }}
                          className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        Enter로 확인, Escape로 취소
                      </p>
                    </div>
                  )}
                </div>
                
                {userFolders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">아직 폴더가 없습니다.</p>
                    <p className="text-xs text-gray-400 mt-1">새 폴더를 만들어서 시작해보세요!</p>
                  </div>
                )}
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
                  disabled={saving || !selectedFolder}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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