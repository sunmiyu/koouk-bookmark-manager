'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Paperclip, 
  Folder,
  FileText,
  Image,
  Video,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { FolderItem, StorageItem, createStorageItem } from '@/types/folder'

interface UniversalInputBarProps {
  folders: FolderItem[]
  selectedFolderId?: string
  onAddItem: (item: StorageItem, folderId: string) => void
  onFolderSelect: (folderId: string) => void
}

export default function UniversalInputBar({ 
  folders, 
  selectedFolderId, 
  onAddItem, 
  onFolderSelect 
}: UniversalInputBarProps) {
  const [input, setInput] = useState('')
  const [showFolderSelector, setShowFolderSelector] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 현재 선택된 폴더
  const selectedFolder = folders.find(f => f.id === selectedFolderId)

  // 모든 폴더를 재귀적으로 수집 (하위 폴더 포함)
  const getAllFolders = (folders: FolderItem[], depth: number = 0): Array<FolderItem & { depth: number }> => {
    const result: Array<FolderItem & { depth: number }> = []
    
    for (const folder of folders) {
      result.push({ ...folder, depth })
      
      // 하위 폴더들 수집
      const subfolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
      if (subfolders.length > 0) {
        result.push(...getAllFolders(subfolders, depth + 1))
      }
    }
    
    return result
  }

  const allFolders = getAllFolders(folders)

  // 텍스트 영역 자동 높이 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  // 콘텐츠 타입 자동 감지
  const detectContentType = (content: string): StorageItem['type'] => {
    const urlRegex = /^https?:\/\/.+/i
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i
    const videoExtensions = /\.(mp4|avi|mov|wmv|flv|webm)$/i

    if (youtubeRegex.test(content)) {
      return 'video'
    } else if (urlRegex.test(content)) {
      if (imageExtensions.test(content)) return 'image'
      if (videoExtensions.test(content)) return 'video'
      return 'url'
    } else if (content.length < 500) {
      return 'memo'
    } else {
      return 'document'
    }
  }

  // YouTube 썸네일 추출
  const getYouTubeThumbnail = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
    }
    return null
  }

  // 메타데이터 추출
  const extractMetadata = async (content: string, type: StorageItem['type']) => {
    const metadata: Record<string, unknown> = {}

    if (type === 'video' && content.includes('youtube.com')) {
      metadata.thumbnail = getYouTubeThumbnail(content)
      metadata.platform = 'youtube'
    }

    return metadata
  }

  // 폴더 선택 토글
  const toggleFolderSelector = () => {
    setShowFolderSelector(!showFolderSelector)
  }

  // 파일 첨부 핸들러
  const handleFileAttach = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
  }

  // 첨부 파일 제거
  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 콘텐츠 제출
  const handleSubmit = async () => {
    if (!input.trim() && attachedFiles.length === 0) return
    if (!selectedFolderId) {
      alert('폴더를 선택해주세요!')
      return
    }

    setIsProcessing(true)

    try {
      // 텍스트 콘텐츠 처리
      if (input.trim()) {
        const type = detectContentType(input.trim())
        const metadata = await extractMetadata(input.trim(), type)
        
        const item = createStorageItem(
          type === 'url' ? 'Link' : type === 'video' ? 'Video' : 'Content',
          type,
          input.trim(),
          selectedFolderId
        )

        // 메타데이터 추가
        item.metadata = metadata

        onAddItem(item, selectedFolderId)
      }

      // 첨부 파일 처리
      for (const file of attachedFiles) {
        const type: StorageItem['type'] = file.type.startsWith('image/') ? 'image' 
          : file.type.startsWith('video/') ? 'video'
          : 'document'

        const item = createStorageItem(
          file.name,
          type,
          URL.createObjectURL(file),
          selectedFolderId
        )

        item.metadata = {
          fileSize: file.size,
          fileType: file.type,
          fileName: file.name
        }

        onAddItem(item, selectedFolderId)
      }

      // 초기화
      setInput('')
      setAttachedFiles([])
    } catch (error) {
      console.error('콘텐츠 추가 실패:', error)
      alert('콘텐츠 추가에 실패했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  // 키보드 단축키
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="w-full max-w-6xl mx-auto px-6 pb-6">
        {/* 폴더 선택기 */}
        <AnimatePresence>
          {showFolderSelector && (
            <motion.div
              className="mb-4 apple-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <h3 className="text-sm font-medium px-4 pt-4" style={{ color: 'var(--apple-text)' }}>
                저장할 폴더 선택:
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-1 p-4 pt-2">
                {allFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onFolderSelect(folder.id)
                      setShowFolderSelector(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedFolderId === folder.id ? 'bg-blue-50' : 'hover:bg-black/5'
                    }`}
                    style={{ paddingLeft: `${12 + folder.depth * 16}px` }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="text-sm truncate flex-1" style={{ 
                      color: selectedFolderId === folder.id ? '#3B82F6' : 'var(--apple-text)'
                    }}>
                      {folder.depth > 0 && '└ '}
                      {folder.name}
                    </span>
                    {selectedFolderId === folder.id && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 첨부 파일 프리뷰 */}
        {attachedFiles.length > 0 && (
          <motion.div
            className="mb-4 apple-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap gap-2 p-3">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.6)' }}
                >
                  {file.type.startsWith('image/') ? <Image size={14} /> :
                   file.type.startsWith('video/') ? <Video size={14} /> :
                   <FileText size={14} />}
                  <span className="text-xs truncate max-w-32" style={{ color: 'var(--apple-text)' }}>
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeAttachedFile(index)}
                    className="p-1 rounded hover:bg-red-100"
                  >
                    <X size={12} style={{ color: '#EF4444' }} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 메인 입력 바 */}
        <motion.div
          className="relative apple-card"
          style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3 p-4">
            {/* 폴더 선택 버튼 */}
            <button
              onClick={toggleFolderSelector}
              className="apple-button-ghost"
              style={{
                color: selectedFolder ? selectedFolder.color : 'var(--apple-text)'
              }}
            >
              <Folder size={16} />
              <span className="text-sm font-medium">
                {selectedFolder?.name || '폴더 선택'}
              </span>
              {showFolderSelector ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* 텍스트 입력 영역 */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="링크, 메모, 문서 등 무엇이든 입력하세요... (Ctrl+Enter로 저장)"
                className="w-full resize-none border-none outline-none bg-transparent text-sm leading-relaxed"
                style={{ 
                  color: 'var(--apple-text)',
                  minHeight: '60px',
                  maxHeight: '200px'
                }}
              />
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleFileAttach}
                className="apple-button-ghost"
                title="파일 첨부"
              >
                <Paperclip size={18} />
              </button>

              <button
                onClick={handleSubmit}
                disabled={(!input.trim() && attachedFiles.length === 0) || isProcessing || !selectedFolderId}
                className={`apple-button-primary ${
                  ((!input.trim() && attachedFiles.length === 0) || isProcessing || !selectedFolderId) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}