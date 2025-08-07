'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showFormatting, setShowFormatting] = useState(false)
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null)

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

  // Track unsaved changes
  useEffect(() => {
    if (!note) return
    setHasUnsavedChanges(true)
  }, [title, content, note])

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges) return
    
    setIsSaving(true)
    try {
      // 실제로는 여기서 API 호출로 저장
      await new Promise(resolve => setTimeout(resolve, 500)) // 저장 시뮬레이션
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      console.log('Auto-saved:', { title, content })
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [hasUnsavedChanges, title, content])

  // Auto-save functionality
  useEffect(() => {
    if (!note || !hasUnsavedChanges) return
    
    const timer = setTimeout(() => {
      handleAutoSave()
    }, 3000) // 3초 후 자동저장

    return () => clearTimeout(timer)
  }, [title, content, note, hasUnsavedChanges, handleAutoSave])

  const handleManualSave = async () => {
    setIsSaving(true)
    try {
      // 실제로는 여기서 API 호출로 저장
      await new Promise(resolve => setTimeout(resolve, 800)) // 저장 시뮬레이션
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      console.log('Manually saved:', { title, content })
    } catch (error) {
      console.error('Manual save failed:', error)
      alert('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async () => {
    if (!note) return
    
    const confirmed = window.confirm(`"${title}" 노트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)
    if (!confirmed) return

    try {
      // 실제로는 여기서 API 호출로 삭제
      await new Promise(resolve => setTimeout(resolve, 500)) // 삭제 시뮬레이션
      console.log('Deleted note:', note.id)
      // 실제로는 상위 컴포넌트에 삭제 알림을 보냄
      alert('노트가 삭제되었습니다.')
      setNote(null)
    } catch (error) {
      console.error('Delete failed:', error)
      alert('삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleDuplicateNote = async () => {
    if (!note) return
    
    try {
      setIsSaving(true)
      // 실제로는 여기서 API 호출로 복제
      await new Promise(resolve => setTimeout(resolve, 500)) // 복제 시뮬레이션
      console.log('Duplicated note:', { title: `${title} (복사본)`, content })
      alert('노트가 복제되었습니다.')
    } catch (error) {
      console.error('Duplicate failed:', error)
      alert('복제에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  // Format text functions
  const insertTextAtCursor = (beforeText: string, afterText: string = '') => {
    if (!textareaRef) return

    const start = textareaRef.selectionStart
    const end = textareaRef.selectionEnd
    const selectedText = content.substring(start, end)
    
    const newText = content.substring(0, start) + 
                   beforeText + selectedText + afterText + 
                   content.substring(end)
    
    setContent(newText)
    
    // Move cursor to after the inserted text
    setTimeout(() => {
      if (textareaRef) {
        const newPosition = start + beforeText.length + selectedText.length + afterText.length
        textareaRef.setSelectionRange(newPosition, newPosition)
        textareaRef.focus()
      }
    }, 0)
  }

  const makeBold = () => {
    insertTextAtCursor('**', '**')
  }

  const makeItalic = () => {
    insertTextAtCursor('*', '*')
  }

  const addColorText = (color: string) => {
    insertTextAtCursor(`<span style="color: ${color}">`, '</span>')
  }

  const addHighlight = (color: string) => {
    insertTextAtCursor(`<span style="background-color: ${color}; padding: 2px 4px; border-radius: 3px;">`, '</span>')
  }

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
          <div className="text-lg mb-4">📝</div>
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
    <div className="h-full flex flex-col" style={{ 
      padding: 'var(--space-3) var(--space-6)',
      paddingTop: 'var(--space-4)'
    }}>
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
                className="text-xl font-bold bg-transparent border-b-2 border-blue-500 outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
                style={{ 
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-xl)'
                }}
              >
                {title} ✏️
              </h1>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Save Button */}
            <button
              onClick={handleManualSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="transition-all duration-200 flex items-center gap-2"
              style={{
                backgroundColor: hasUnsavedChanges ? 'var(--text-primary)' : 'var(--bg-secondary)',
                color: hasUnsavedChanges ? 'var(--bg-card)' : 'var(--text-tertiary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-xs)',
                fontWeight: '500',
                cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed'
              }}
              onMouseEnter={(e) => {
                if (hasUnsavedChanges) {
                  e.currentTarget.style.transform = 'scale(1.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (hasUnsavedChanges) {
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>저장중...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>저장</span>
                </>
              )}
            </button>

            {/* Duplicate Button */}
            <button
              onClick={handleDuplicateNote}
              disabled={isSaving}
              className="transition-all duration-200 flex items-center gap-1"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-xs)',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--text-primary)'
                e.currentTarget.style.color = 'var(--bg-card)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>복제</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDeleteNote}
              disabled={isSaving}
              className="transition-all duration-200 flex items-center gap-1"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-tertiary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-xs)',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EF4444'
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.borderColor = '#EF4444'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--text-tertiary)'
                e.currentTarget.style.borderColor = 'var(--border-light)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>삭제</span>
            </button>

            {/* Image Upload */}
            <label className="cursor-pointer transition-all duration-200 flex items-center gap-1"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-xs)',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--text-primary)'
                e.currentTarget.style.color = 'var(--bg-card)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>이미지</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Status */}
            <div className="flex flex-col items-end text-xs">
              {hasUnsavedChanges && !isSaving && (
                <span style={{ color: '#F59E0B' }}>● 저장되지 않음</span>
              )}
              {isSaving && (
                <span style={{ color: '#10B981' }}>● 저장 중...</span>
              )}
              {lastSaved && !hasUnsavedChanges && !isSaving && (
                <span style={{ color: 'var(--text-muted)' }}>
                  저장됨 {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
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

      {/* Formatting Toolbar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowFormatting(!showFormatting)}
            className="transition-all duration-200 flex items-center gap-2"
            style={{
              backgroundColor: showFormatting ? 'var(--text-primary)' : 'var(--bg-secondary)',
              color: showFormatting ? 'var(--bg-card)' : 'var(--text-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-xs)',
              fontWeight: '500'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
            <span>서식</span>
          </button>
        </div>

        {showFormatting && (
          <div className="flex flex-wrap gap-2 p-3 rounded-lg" style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)'
          }}>
            {/* Text Formatting */}
            <div className="flex items-center gap-1">
              <button
                onClick={makeBold}
                className="transition-all duration-200 flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'bold',
                  width: '2rem',
                  height: '2rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--text-primary)'
                  e.currentTarget.style.color = 'var(--bg-card)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-card)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                title="Bold (굵게)"
              >
                B
              </button>

              <button
                onClick={makeItalic}
                className="transition-all duration-200 flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  fontStyle: 'italic',
                  width: '2rem',
                  height: '2rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--text-primary)'
                  e.currentTarget.style.color = 'var(--bg-card)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-card)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                title="Italic (기울임)"
              >
                I
              </button>
            </div>

            {/* Color Divider */}
            <div style={{
              width: '1px',
              height: '2rem',
              backgroundColor: 'var(--border-light)',
              margin: '0 var(--space-2)'
            }}></div>

            {/* Text Colors */}
            <div className="flex items-center gap-1">
              <span style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                marginRight: 'var(--space-1)'
              }}>
                글자색:
              </span>
              {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'].map((color, index) => (
                <button
                  key={index}
                  onClick={() => addColorText(color)}
                  className="transition-all duration-200"
                  style={{
                    backgroundColor: color,
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    width: '1.5rem',
                    height: '1.5rem',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                  title={`글자색: ${color}`}
                />
              ))}
            </div>

            {/* Highlight Colors */}
            <div className="flex items-center gap-1">
              <span style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                marginRight: 'var(--space-1)'
              }}>
                하이라이트:
              </span>
              {['#FEF3C7', '#D1FAE5', '#DBEAFE', '#E0E7FF', '#F3E8FF', '#FCE7F3'].map((color, index) => (
                <button
                  key={index}
                  onClick={() => addHighlight(color)}
                  className="transition-all duration-200"
                  style={{
                    backgroundColor: color,
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    width: '1.5rem',
                    height: '1.5rem',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                  title={`하이라이트: ${color}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Editor */}
      <div className="flex-1 bg-white rounded-lg border p-6" style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-light)'
      }}>
        <textarea
          ref={setTextareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="자유롭게 노트를 작성하세요...

🎨 서식 기능 사용법:
• **굵게** 또는 *기울임*으로 강조
• 서식 버튼으로 색상과 하이라이트 추가
• 이미지 첨부 가능
• 글자 수 제한 없음
• 3초마다 자동 저장

여기에 무엇이든 적어보세요:
- 아이디어와 영감 ✨
- 중요한 메모 📝
- 계획과 목표 🎯
- 개인적인 생각들 💭"
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