'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, FileText, Image, Video, X } from 'lucide-react'
import { FolderItem, StorageItem, createStorageItem } from '@/types/folder'
import { isYouTubeUrl, getYouTubeThumbnail, getYouTubeMetadata } from '@/utils/youtube'
import { extractMetadata as extractWebMetadata, isValidUrl } from '@/utils/metadata'
import { useDevice } from '@/hooks/useDevice'
import { useToast } from '@/hooks/useToast'
import Toast from './Toast'

interface ContentInputProps {
  folders: FolderItem[]
  selectedFolderId?: string
  onAddItem: (item: StorageItem, folderId: string) => void
  className?: string
}

export default function ContentInput({
  folders,
  selectedFolderId,
  onAddItem,
  className = ''
}: ContentInputProps) {
  const device = useDevice()
  const { toast, showSuccess, showError, hideToast } = useToast()
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [pastedImages, setPastedImages] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 현재 선택된 폴더
  const selectedFolder = folders.find(f => f.id === selectedFolderId)

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

    // YouTube URL을 먼저 확인 (가장 높은 우선순위)
    if (isYouTubeUrl(content)) {
      return 'video'
    }
    
    // 일반 URL 확인
    if (urlRegex.test(content)) {
      // 이미지 URL 확인
      if (imageExtensions.test(content)) {
        return 'image'
      }
      // 비디오 파일 URL 확인
      if (videoExtensions.test(content)) {
        return 'video'
      }
      // 일반 URL
      return 'url'
    }
    
    // 텍스트 길이로 memo/document 구분
    if (content.length < 500) {
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
    } else if (type === 'url' && isValidUrl(content)) {
      // 일반 웹페이지 Meta 정보 추출
      try {
        const webMetadata = await extractWebMetadata(content)
        if (webMetadata) {
          metadata.title = webMetadata.title
          metadata.description = webMetadata.description
          metadata.thumbnail = webMetadata.image
          metadata.domain = webMetadata.domain
          metadata.platform = 'web'
        }
      } catch (error) {
        console.error('Failed to fetch web metadata:', error)
      }
    }

    return metadata
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

  // 콘텐츠 제출
  const handleSubmit = async () => {
    if (!input.trim() && attachedFiles.length === 0 && pastedImages.length === 0) return
    if (!selectedFolderId) {
      showError('Please select a folder!')
      return
    }

    setIsProcessing(true)

    try {
      // 텍스트 콘텐츠 처리
      if (input.trim()) {
        const type = detectContentType(input.trim())
        const metadata = await extractMetadata(input.trim(), type)
        
        // 제목 결정 로직 개선
        let title = 'Content'
        if (type === 'video' && isYouTubeUrl(input.trim())) {
          title = metadata.title as string || 'YouTube Video'
        } else if (type === 'video') {
          title = 'Video'
        } else if (type === 'url') {
          title = metadata.title as string || 'Link'
        } else if (type === 'memo') {
          title = 'Memo'
        } else if (type === 'document') {
          title = 'Document'
        } else if (type === 'image') {
          title = 'Image'
        }

        const item = createStorageItem(
          title,
          type,
          input.trim(),
          selectedFolderId
        )

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

      // 성공 피드백
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
      console.error('Failed to save content:', error)
      showError('Failed to save content. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // 키보드 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!device.isMobile) {
        if (!e.shiftKey && input.trim()) {
          e.preventDefault()
          handleSubmit()
        }
        return
      }
      
      if (pastedImages.length > 0 || attachedFiles.length > 0) {
        e.preventDefault()
        handleSubmit()
      }
    }
  }

  return (
    <div className={className}>
      {/* 첨부 파일 프리뷰 */}
      {attachedFiles.length > 0 && (
        <motion.div
          className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white"
              >
                {file.type.startsWith('image/') ? <Image size={14} aria-label="Image file" /> :
                 file.type.startsWith('video/') ? <Video size={14} aria-label="Video file" /> :
                 <FileText size={14} aria-label="Document file" />}
                <span className="text-xs truncate max-w-32">
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachedFile(index)}
                  className="p-1 rounded hover:bg-red-100"
                >
                  <X size={12} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 메인 입력 바 */}
      <motion.div
        className="relative rounded-xl shadow-lg bg-white border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-3 p-4">
          {/* 텍스트 입력 영역 */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              onPaste={handlePaste}
              placeholder="Add links, notes, documents, or anything..."
              className="w-full resize-none border-none outline-none bg-transparent text-sm leading-relaxed"
              style={{ 
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
                      alt="Pasted image preview"
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
              <Paperclip size={18} className="text-gray-500" />
            </button>

            <motion.button
              onClick={handleSubmit}
              disabled={(!input.trim() && attachedFiles.length === 0 && pastedImages.length === 0) || isProcessing || !selectedFolderId}
              className={`relative overflow-hidden transition-all duration-300 ease-out rounded-2xl p-3 ${
                (!input.trim() && attachedFiles.length === 0 && pastedImages.length === 0) || isProcessing || !selectedFolderId
                  ? 'opacity-50 cursor-not-allowed bg-gray-200' 
                  : 'shadow-lg hover:shadow-xl bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ 
                scale: (!input.trim() && attachedFiles.length === 0 && pastedImages.length === 0) || isProcessing || !selectedFolderId ? 1 : 1.05,
                y: (!input.trim() && attachedFiles.length === 0 && pastedImages.length === 0) || isProcessing || !selectedFolderId ? 0 : -2
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              title={device.isMobile ? "Submit" : "Send (Enter)"}
            >
              <Send 
                size={18} 
                className={`${
                  (!input.trim() && attachedFiles.length === 0 && pastedImages.length === 0) || isProcessing || !selectedFolderId
                    ? 'text-gray-400'
                    : 'text-white'
                }`}
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