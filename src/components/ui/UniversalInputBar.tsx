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
  ChevronUp,
  StickyNote,
  NotebookPen
} from 'lucide-react'
import { FolderItem, StorageItem, createStorageItem } from '@/types/folder'
import { isYouTubeUrl, getYouTubeThumbnail, getYouTubeMetadata } from '@/utils/youtube'
import { useDevice } from '@/hooks/useDevice'

interface UniversalInputBarProps {
  folders: FolderItem[]
  selectedFolderId?: string
  onAddItem: (item: StorageItem, folderId: string) => void
  onFolderSelect: (folderId: string) => void
  onOpenMemo?: () => void
  onOpenNote?: () => void
}

export default function UniversalInputBar({ 
  folders, 
  selectedFolderId, 
  onAddItem, 
  onFolderSelect,
  onOpenMemo,
  onOpenNote
}: UniversalInputBarProps) {
  const device = useDevice()
  const [input, setInput] = useState('')
  const [showFolderSelector, setShowFolderSelector] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [pastedImages, setPastedImages] = useState<File[]>([])
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
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i
    const videoExtensions = /\.(mp4|avi|mov|wmv|flv|webm)$/i

    if (isYouTubeUrl(content)) {
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

  // 메타데이터 추출
  const extractMetadata = async (content: string, type: StorageItem['type']) => {
    const metadata: Record<string, unknown> = {}

    if (type === 'video' && isYouTubeUrl(content)) {
      const thumbnail = getYouTubeThumbnail(content)
      if (thumbnail) {
        metadata.thumbnail = thumbnail
        metadata.platform = 'youtube'
      }

      // YouTube 제목 가져오기
      try {
        const youtubeData = await getYouTubeMetadata(content)
        if (youtubeData?.title) {
          metadata.title = youtubeData.title
          metadata.description = youtubeData.description
          metadata.channelTitle = youtubeData.channelTitle
          metadata.duration = youtubeData.duration
        }
      } catch (error) {
        console.error('Failed to fetch YouTube metadata:', error)
      }
    }

    // URL 타입에서도 YouTube 감지
    if (type === 'url' && isYouTubeUrl(content)) {
      const thumbnail = getYouTubeThumbnail(content)
      if (thumbnail) {
        metadata.thumbnail = thumbnail
        metadata.platform = 'youtube'
      }

      // YouTube 제목 가져오기
      try {
        const youtubeData = await getYouTubeMetadata(content)
        if (youtubeData?.title) {
          metadata.title = youtubeData.title
          metadata.description = youtubeData.description
          metadata.channelTitle = youtubeData.channelTitle
          metadata.duration = youtubeData.duration
        }
      } catch (error) {
        console.error('Failed to fetch YouTube metadata:', error)
      }
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

      // 붙여넣은 이미지 처리
      for (const image of pastedImages) {
        const item = createStorageItem(
          `Pasted Image ${new Date().toISOString()}`,
          'image',
          URL.createObjectURL(image),
          selectedFolderId
        )

        item.metadata = {
          fileSize: image.size,
          fileType: image.type,
          fileName: `pasted-image-${Date.now()}.${image.type.split('/')[1]}`
        }

        onAddItem(item, selectedFolderId)
      }

      // 초기화
      setInput('')
      setAttachedFiles([])
      setPastedImages([])
    } catch (error) {
      console.error('콘텐츠 추가 실패:', error)
      alert('콘텐츠 추가에 실패했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  // 🎨 PC/모바일 맞춤 키보드 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // PC: Enter 키로 제출, Shift+Enter로 줄바꿈
      if (!device.isMobile) {
        if (!e.shiftKey && input.trim()) {
          e.preventDefault()
          handleSubmit()
        }
        return
      }
      
      // 모바일: Shift+Enter 없이는 기본적으로 줄바꿈, 완료 버튼으로만 제출
      // 단, 파일이나 이미지가 있으면 Enter로도 제출 가능
      if (pastedImages.length > 0 || attachedFiles.length > 0) {
        e.preventDefault()
        handleSubmit()
      }
    }
  }

  // 이미지 붙여넣기 핸들러
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const imageItems = items.filter(item => item.type.startsWith('image/'))
    
    if (imageItems.length > 0) {
      e.preventDefault()
      
      imageItems.forEach(item => {
        const file = item.getAsFile()
        if (file) {
          setPastedImages(prev => [...prev, file])
        }
      })
    }
  }

  // 붙여넣은 이미지 제거
  const removePastedImage = (index: number) => {
    setPastedImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="w-full">
      <div className={`w-full max-w-6xl mx-auto ${device.isMobile ? 'px-4 pb-4' : 'px-8 pb-6'}`}>
        {/* 메모/노트 작성 버튼들 */}
        <div className="flex justify-end gap-3 mb-3">
          <motion.button
            onClick={onOpenMemo}
            className={`flex items-center ${device.isMobile ? 'gap-0' : 'gap-2'} px-4 py-2 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl`}
            style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #F59E0B',
              color: '#92400E'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <StickyNote className="w-4 h-4" />
            {!device.isMobile && <span className="text-xs font-medium">메모 작성</span>}
          </motion.button>
          
          <motion.button
            onClick={onOpenNote}
            className={`flex items-center ${device.isMobile ? 'gap-0' : 'gap-2'} px-4 py-2 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl`}
            style={{
              backgroundColor: '#DBEAFE',
              border: '1px solid #3B82F6',
              color: '#1E40AF'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <NotebookPen className="w-4 h-4" />
            {!device.isMobile && <span className="text-xs font-medium">노트 작성</span>}
          </motion.button>
        </div>
        {/* 폴더 선택기 */}
        <AnimatePresence>
          {showFolderSelector && (
            <motion.div
              className="mb-4 p-4 rounded-xl shadow-lg relative z-[100]"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-light)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <h3 className="text-xs font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                저장할 폴더 선택:
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {allFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onFolderSelect(folder.id)
                      setShowFolderSelector(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedFolderId === folder.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    style={{ paddingLeft: `${12 + folder.depth * 16}px` }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="text-xs truncate flex-1" style={{ 
                      color: selectedFolderId === folder.id ? '#3B82F6' : 'var(--text-primary)' 
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
            className="mb-4 p-3 rounded-xl"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-card)' }}
                >
                  {file.type.startsWith('image/') ? <Image size={14} aria-label="Image file" /> :
                   file.type.startsWith('video/') ? <Video size={14} /> :
                   <FileText size={14} />}
                  <span className="text-xs truncate max-w-32" style={{ color: 'var(--text-primary)' }}>
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
          className="relative rounded-xl shadow-xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3 p-4">
            {/* 폴더 선택 버튼 */}
            <button
              onClick={toggleFolderSelector}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: selectedFolder ? selectedFolder.color + '20' : 'var(--bg-secondary)',
                color: selectedFolder ? selectedFolder.color : 'var(--text-secondary)',
                border: `1px solid ${selectedFolder ? selectedFolder.color + '40' : 'var(--border-light)'}`
              }}
            >
              <Folder size={16} />
              <span className="text-xs font-medium">
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
                onPaste={handlePaste}
                placeholder="링크, 메모, 문서 등 무엇이든 입력하세요... (Ctrl+Enter로 저장)"
                className="w-full resize-none border-none outline-none bg-transparent text-xs leading-relaxed"
                style={{ 
                  color: 'var(--text-primary)',
                  minHeight: '60px',
                  maxHeight: '200px'
                }}
              />

              {/* 붙여넣은 이미지 미리보기 */}
              {pastedImages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {pastedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Pasted image"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removePastedImage(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleFileAttach}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="파일 첨부"
              >
                <Paperclip size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>

              {/* 🎨 Emotional Submit Button - ph.md 철학 적용 */}
              <motion.button
                onClick={handleSubmit}
                disabled={(!input.trim() && attachedFiles.length === 0 && pastedImages.length === 0) || isProcessing || !selectedFolderId}
                className={`relative overflow-hidden transition-all duration-300 ease-out ${
                  (!input.trim() && attachedFiles.length === 0 && pastedImages.length === 0) || isProcessing || !selectedFolderId
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'shadow-lg hover:shadow-xl'
                }`}
                style={{
                  background: (!input.trim() && attachedFiles.length === 0 && pastedImages.length === 0) || isProcessing || !selectedFolderId
                    ? 'linear-gradient(135deg, #E5E7EB, #D1D5DB)'
                    : 'linear-gradient(135deg, #F59E0B, #D97706)',
                  borderRadius: '16px',
                  padding: '12px',
                  border: 'none',
                  minWidth: '48px',
                  minHeight: '48px'
                }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ 
                  scale: (!input.trim() && attachedFiles.length === 0 && pastedImages.length === 0) || isProcessing || !selectedFolderId ? 1 : 1.05,
                  y: (!input.trim() && attachedFiles.length === 0 && pastedImages.length === 0) || isProcessing || !selectedFolderId ? 0 : -2
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                title={device.isMobile ? "완료" : "전송 (Enter)"}
              >
                {/* 🎨 Warm gradient overlay for active state */}
                {!((!input.trim() && attachedFiles.length === 0 && pastedImages.length === 0) || isProcessing || !selectedFolderId) && (
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-20"
                    style={{
                      background: 'linear-gradient(135deg, #FEF3C7, #F59E0B)'
                    }}
                  />
                )}
                
                <Send 
                  size={18} 
                  style={{ 
                    color: (!input.trim() && attachedFiles.length === 0 && pastedImages.length === 0) || isProcessing || !selectedFolderId
                      ? '#9CA3AF'
                      : '#FFFFFF',
                    position: 'relative',
                    zIndex: 1,
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                  }} 
                />
              </motion.button>
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