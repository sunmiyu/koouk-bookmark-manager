'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Paperclip, 
  FileText,
  Image,
  Video,
  X,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react'
import { FolderItem, StorageItem, createStorageItem } from '@/types/folder'
import { isYouTubeUrl, getYouTubeThumbnail, getYouTubeMetadata } from '@/utils/youtube'
import { useDevice } from '@/hooks/useDevice'
import { useToast } from '@/hooks/useToast'
import Toast from './Toast'

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
  const { toast, showSuccess, showError, hideToast } = useToast()
  const [input, setInput] = useState('')
  const [showFolderSelector, setShowFolderSelector] = useState(false)
  const [selectedParentFolder, setSelectedParentFolder] = useState<string | null>(null)
  const [folderSearchQuery, setFolderSearchQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [pastedImages, setPastedImages] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 현재 선택된 폴더
  const selectedFolder = folders.find(f => f.id === selectedFolderId)

  // 필터링된 폴더들 (검색어가 있을 때)
  const getFilteredFolders = () => {
    if (!folderSearchQuery.trim()) return folders
    
    const query = folderSearchQuery.toLowerCase()
    return folders.filter(folder => 
      folder.name.toLowerCase().includes(query)
    )
  }

  const filteredFolders = getFilteredFolders()

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
      alert('Please select a folder!')
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

      // 성공 피드백 추가
      const itemCount = (input.trim() ? 1 : 0) + attachedFiles.length + pastedImages.length
      const folderName = selectedFolder?.name || 'folder'
      
      if (itemCount === 1) {
        showSuccess(`✨ Saved to ${folderName}!`)
      } else {
        showSuccess(`✨ ${itemCount} items saved to ${folderName}!`)
      }
      
      // 초기화
      setInput('')
      setAttachedFiles([])
      setPastedImages([])
    } catch (error) {
      console.error('콘텐츠 추가 실패:', error)
      showError('Failed to save content. Please try again.')
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
        {/* 메모/노트 작성 버튼들 - Square icon-only buttons */}
        <div className="flex justify-end gap-2 mb-3">
          <motion.button
            onClick={onOpenMemo}
            className="w-10 h-10 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl flex items-center justify-center"
            style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #F59E0B'
            }}
            whileTap={{ scale: 0.95 }}
            title="Quick Memo"
          >
            <span className="text-lg">📝</span>
          </motion.button>
          
          <motion.button
            onClick={onOpenNote}
            className="w-10 h-10 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl flex items-center justify-center"
            style={{
              backgroundColor: '#DBEAFE',
              border: '1px solid #3B82F6'
            }}
            whileTap={{ scale: 0.95 }}
            title="Write Note"
          >
            <span className="text-lg">📄</span>
          </motion.button>
        </div>
        {/* 새로운 폴더 선택기 - 키워드 스타일 버튼들 */}
        <AnimatePresence>
          {showFolderSelector && (
            <motion.div
              className="mb-4 p-4 rounded-xl shadow-lg relative z-[100] bg-white border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Choose folder to save
                </h3>
                <button
                  onClick={() => {
                    setShowFolderSelector(false)
                    setFolderSearchQuery('')
                    setSelectedParentFolder(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              </div>
              
              {/* Search bar for many folders */}
              {folders.length > 6 && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search folders..."
                    value={folderSearchQuery}
                    onChange={(e) => setFolderSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus={folders.length > 10}
                  />
                </div>
              )}
              
              {/* Folder display based on count and search */}
              <div className="space-y-4">
                {folderSearchQuery.trim() ? (
                  // Search results
                  <>
                    <div className="text-xs text-gray-500 mb-2">
                      {filteredFolders.length} folder(s) found
                    </div>
                    <div className={`${filteredFolders.length > 8 ? 'max-h-48 overflow-y-auto' : ''} space-y-1`}>
                      {filteredFolders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => {
                            onFolderSelect(folder.id)
                            setShowFolderSelector(false)
                            setSelectedParentFolder(null)
                            setFolderSearchQuery('')
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            selectedFolderId === folder.id 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: selectedFolderId === folder.id ? 'white' : folder.color }}
                          />
                          <span className="text-sm font-medium truncate">
                            {folder.name}
                          </span>
                          <span className="text-xs text-gray-400 ml-auto">
                            {folder.children.length} items
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  // Normal display
                  <>
                    {folders.length <= 8 ? (
                      // Few folders - show as keyword buttons
                      <div className="flex flex-wrap gap-2">
                        {folders.map((folder) => {
                          const hasSubfolders = folder.children.filter(child => child.type === 'folder').length > 0
                          return (
                            <button
                              key={folder.id}
                              onClick={() => {
                                if (hasSubfolders) {
                                  setSelectedParentFolder(folder.id)
                                } else {
                                  onFolderSelect(folder.id)
                                  setShowFolderSelector(false)
                                  setSelectedParentFolder(null)
                                }
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                                selectedFolderId === folder.id 
                                  ? 'bg-blue-500 text-white shadow-md' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: selectedFolderId === folder.id ? 'white' : folder.color }}
                              />
                              {folder.name}
                              {hasSubfolders && <ChevronDown size={14} />}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      // Many folders - show as list with scrolling
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {folders.map((folder) => (
                          <button
                            key={folder.id}
                            onClick={() => {
                              onFolderSelect(folder.id)
                              setShowFolderSelector(false)
                              setSelectedParentFolder(null)
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                              selectedFolderId === folder.id 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: selectedFolderId === folder.id ? 'white' : folder.color }}
                            />
                            <span className="text-sm font-medium truncate flex-1">
                              {folder.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {folder.children.length}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* New folder option */}
                    <div className="pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          const name = prompt('Enter new folder name:')
                          if (name?.trim()) {
                            // This would need to be handled by parent component
                            alert(`Creating folder: ${name}`)
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors w-full justify-center"
                      >
                        <Plus size={14} />
                        Create new folder
                      </button>
                    </div>
                  </>
                )}
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
            {/* 폴더 선택 버튼 - 키워드 스타일 */}
            <button
              onClick={toggleFolderSelector}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                selectedFolder 
                  ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: selectedFolder ? 'white' : '#6B7280' }}
              />
              <span className="text-xs font-medium">
                {selectedFolder?.name || 'Choose folder'}
              </span>
              {showFolderSelector ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {/* 텍스트 입력 영역 */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                onPaste={handlePaste}
                placeholder="Add links, notes, documents, or anything... (Ctrl+Enter to save)"
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
                title="Attach file"
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
                title={device.isMobile ? "Submit" : "Send (Enter)"}
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
      
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  )
}