'use client'

import { useState } from 'react'
import { NoteType } from '@/app/page'

type BigNoteDropdownProps = {
  notes: NoteType[]
  selectedNoteId: string | null
  onNoteSelect: (noteId: string | null) => void
  onAddNote: () => void
}

export default function BigNoteDropdown({ 
  notes, 
  selectedNoteId, 
  onNoteSelect, 
  onAddNote 
}: BigNoteDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedNote = notes.find(note => note.id === selectedNoteId)

  const handleNoteSelect = (noteId: string) => {
    onNoteSelect(noteId)
    setIsOpen(false)
  }

  const handleAddNote = () => {
    onAddNote()
    setIsOpen(false)
  }

  return (
    <div 
      className="md:hidden relative"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)',
        padding: 'var(--space-3) var(--space-4)'
      }}
    >
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between transition-all duration-200 ease-out"
        style={{
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)'
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-primary)'
          e.currentTarget.style.transform = 'scale(0.98)'
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '1rem' }}>📔</span>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}
          >
            {selectedNote ? selectedNote.title : '노트 선택'}
          </span>
        </div>
        
        <div 
          className="transition-transform duration-200 ease-out"
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}
        >
          ▼
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-4 right-4 top-full z-50 mt-1"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {/* Add New Note */}
          <button
            onClick={handleAddNote}
            className="w-full flex items-center gap-3 transition-all duration-200 ease-out"
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: '1px solid var(--border-light)',
              backgroundColor: 'transparent'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span style={{ fontSize: '1rem' }}>➕</span>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                color: 'var(--text-primary)'
              }}
            >
              새 노트 추가
            </span>
          </button>

          {/* Notes List */}
          {notes.map((note, index) => (
            <button
              key={note.id}
              onClick={() => handleNoteSelect(note.id)}
              className="w-full flex items-center gap-3 transition-all duration-200 ease-out"
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: index < notes.length - 1 ? '1px solid var(--border-light)' : 'none',
                backgroundColor: selectedNoteId === note.id ? 'var(--bg-secondary)' : 'transparent'
              }}
              onTouchStart={(e) => {
                if (selectedNoteId !== note.id) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                }
              }}
              onTouchEnd={(e) => {
                if (selectedNoteId !== note.id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: '1rem' }}>📄</span>
              <div className="flex-1 text-left">
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: selectedNoteId === note.id ? '600' : '400',
                    color: selectedNoteId === note.id ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  {note.title}
                </span>
                {selectedNoteId === note.id && (
                  <span 
                    style={{ 
                      fontSize: '0.75rem',
                      color: 'var(--text-primary)',
                      marginLeft: '0.5rem'
                    }}
                  >
                    ✓
                  </span>
                )}
              </div>
            </button>
          ))}

          {notes.length === 0 && (
            <div 
              className="text-center"
              style={{
                padding: 'var(--space-4)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-sm)'
              }}
            >
              노트가 없습니다
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
        />
      )}
    </div>
  )
}