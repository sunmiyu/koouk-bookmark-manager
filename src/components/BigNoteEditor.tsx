'use client'

import { useState, useEffect } from 'react'
import { NoteType } from '@/app/page'

type BigNoteEditorProps = {
  noteId: string | null
}

export default function BigNoteEditor({ noteId }: BigNoteEditorProps) {
  const [note, setNote] = useState<NoteType | null>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Mock data - 실제로는 props나 context에서 받아올 데이터
  useEffect(() => {
    if (noteId) {
      // 실제로는 API 호출이나 상태관리에서 노트 데이터를 가져옴
      const mockNote: NoteType = {
        id: noteId,
        title: `note${noteId}`,
        content: '',
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setNote(mockNote)
      setTitle(mockNote.title)
      setContent(mockNote.content)
    }
  }, [noteId])

  // Auto-save functionality
  useEffect(() => {
    if (!note) return
    
    const timer = setTimeout(() => {
      // 실제로는 여기서 API 호출로 저장
      setLastSaved(new Date())
      console.log('Auto-saved:', { title, content })
    }, 2000) // 2초 후 자동저장

    return () => clearTimeout(timer)
  }, [title, content, note])

  const handleTitleSave = () => {
    setIsEditingTitle(false)
    if (note) {
      setNote(prev => prev ? { ...prev, title, updatedAt: new Date().toISOString() } : null)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // 실제로는 파일 업로드 처리
      console.log('Images to upload:', files)
      // 임시로 파일명만 추가
      const newImages = Array.from(files).map(file => file.name)
      if (note) {
        setNote(prev => prev ? { ...prev, images: [...prev.images, ...newImages] } : null)
      }
    }
  }

  if (!note) {
    return (
      <div className="h-full flex items-center justify-center" style={{ padding: 'var(--space-6)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 style={{ 
            fontSize: 'var(--text-xl)', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            노트를 선택해주세요
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            왼쪽 사이드바에서 편집할 노트를 선택하세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          {/* Title */}
          <div className="flex items-center gap-3 flex-1">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                autoFocus
                className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
                style={{ 
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-2xl)'
                }}
              >
                {title} ✏️
              </h1>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Image Upload */}
            <label className="cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Last Saved */}
            {lastSaved && (
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                저장됨 {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Images */}
        {note.images.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {note.images.map((image, index) => (
              <div key={index} className="flex-shrink-0 relative">
                <div className="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center" style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-light)'
                }}>
                  <span className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                    {image}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setNote(prev => prev ? {
                      ...prev,
                      images: prev.images.filter((_, i) => i !== index)
                    } : null)
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Editor */}
      <div className="flex-1 bg-white rounded-lg border p-6" style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-light)'
      }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="자유롭게 노트를 작성하세요...

여기에 무엇이든 적을 수 있습니다:
- 아이디어
- 메모
- 계획
- 생각들

이미지도 첨부할 수 있고, 글자 수 제한도 없습니다.
2초마다 자동으로 저장됩니다."
          className="w-full h-full resize-none outline-none"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-base)',
            lineHeight: '1.6',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}
        />
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex justify-between items-center text-sm" style={{ color: 'var(--text-muted)' }}>
        <div>
          글자 수: {content.length.toLocaleString()}
        </div>
        <div>
          생성: {new Date(note.createdAt).toLocaleDateString()}
          {note.updatedAt !== note.createdAt && (
            <span className="ml-2">
              수정: {new Date(note.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}