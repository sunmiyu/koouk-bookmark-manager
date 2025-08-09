'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Folder, ChevronDown } from 'lucide-react'
import { Content, ContentType, Folder as FolderType } from '@/types/core'

interface QuickInputProps {
  selectedFolderId: string | null
  folders: FolderType[]
  onCreateContent: (content: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'position'>) => void
  onSelectFolder: (folderId: string) => void
}

export default function QuickInput({
  selectedFolderId,
  folders,
  onCreateContent,
  onSelectFolder
}: QuickInputProps) {
  const [input, setInput] = useState('')
  const [showFolderPicker, setShowFolderPicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const detectContentType = (text: string): ContentType => {
    const urlRegex = /^https?:\/\/.+/i
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    
    if (youtubeRegex.test(text)) return 'video'
    if (urlRegex.test(text)) return 'website'
    if (text.length < 300) return 'memo'  // Short text becomes memo
    return 'text'  // Longer text becomes text file
  }

  const handleSubmit = async () => {
    if (!input.trim() || !selectedFolderId || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      const type = detectContentType(input.trim())
      const text = input.trim()
      
      const newContent: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'position'> = {
        title: '',
        body: '',
        folderId: selectedFolderId,
        type,
        metadata: {}
      }

      // Handle different content types
      switch (type) {
        case 'website':
          newContent.title = 'Website Link'
          newContent.body = text
          newContent.metadata = { url: text, mimeType: 'text/uri-list' }
          break
          
        case 'video':
          newContent.title = 'Video Link'  
          newContent.body = text
          newContent.metadata = { url: text, mimeType: 'video/url' }
          break
          
        case 'memo':
          const lines = text.split('\n').filter(line => line.trim())
          const preview = lines.slice(0, 3).join('\n')
          newContent.title = lines[0] ? lines[0].substring(0, 30) + (lines[0].length > 30 ? '...' : '') : 'Quick Note'
          newContent.body = preview
          newContent.metadata = { 
            memoContent: text, 
            createdDate: new Date().toLocaleDateString(),
            mimeType: 'text/memo' 
          }
          break
          
        case 'text':
          newContent.title = text.split('\n')[0].substring(0, 50) || 'Text Document'
          newContent.body = text.substring(0, 100) + (text.length > 100 ? '...' : '')
          newContent.metadata = { 
            textContent: text, 
            textType: 'text/plain',
            mimeType: 'text/plain' 
          }
          break
          
        default:
          newContent.title = text.split('\n')[0].substring(0, 50) || 'Content'
          newContent.body = text
          break
      }
      
      onCreateContent(newContent)
      setInput('')
    } catch (error) {
      console.error('Failed to create content:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const selectedFolder = folders.find(f => f.id === selectedFolderId)

  return (
    <div className="fixed bottom-0 left-64 right-0 p-4 bg-background border-t border-default">
      <div className="container max-w-4xl">
        {/* Folder Picker */}
        {showFolderPicker && (
          <div className="mb-3 surface rounded-lg p-3 max-h-32 overflow-y-auto">
            <p className="text-xs text-muted mb-2">Select folder:</p>
            <div className="space-y-1">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => {
                    onSelectFolder(folder.id)
                    setShowFolderPicker(false)
                  }}
                  className={`w-full text-left px-2 py-1 rounded text-sm ${
                    selectedFolderId === folder.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-surface-hover'
                  }`}
                >
                  {folder.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="surface rounded-lg p-3">
          <div className="flex items-start space-x-3">
            {/* Folder Selector */}
            <button
              onClick={() => setShowFolderPicker(!showFolderPicker)}
              className="flex items-center space-x-2 px-3 py-2 bg-surface-hover rounded-lg text-sm font-medium flex-shrink-0"
            >
              <Folder className="w-4 h-4" />
              <span>{selectedFolder?.name || 'Select folder'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Input Area */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type anything - notes, links, ideas... (Ctrl+Enter to save)"
                className="w-full resize-none border-none outline-none bg-transparent text-sm"
                style={{ minHeight: '20px', maxHeight: '120px' }}
                rows={1}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || !selectedFolderId || isSubmitting}
                className={`btn-primary p-2 ${
                  (!input.trim() || !selectedFolderId || isSubmitting)
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
              >
                {isSubmitting ? (
                  <div className="spinner" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hint */}
        {!input && (
          <p className="text-xs text-muted mt-2 text-center">
            Paste URLs, write notes, or add any content. Ctrl+Enter to save quickly.
          </p>
        )}
      </div>
    </div>
  )
}