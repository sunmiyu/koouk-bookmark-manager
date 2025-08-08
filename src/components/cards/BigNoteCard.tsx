'use client'

import { StorageItem } from '@/app/page'

type BigNoteCardProps = {
  note: StorageItem
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function BigNoteCard({ note, onEdit, onDelete }: BigNoteCardProps) {
  const getReadingTime = (wordCount: number) => {
    return Math.max(1, Math.ceil(wordCount / 200)) // 분당 200단어 기준
  }

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div
      className="group relative transition-all duration-300 cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        minHeight: '280px'
      }}
      onClick={() => onEdit(note.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '6px',
            fontSize: '16px'
          }}>
            📄
          </div>
          <span style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-secondary)',
            padding: '4px 8px',
            borderRadius: '12px',
            fontWeight: '500'
          }}>
            Document
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(note.id)
          }}
          className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 hover:bg-red-50 rounded-lg"
          style={{ color: '#EF4444' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <h3 className="mb-3 line-clamp-2" style={{
        fontSize: 'var(--text-lg)',
        fontWeight: '600',
        color: 'var(--text-primary)',
        lineHeight: '1.4',
        letterSpacing: '-0.01em'
      }}>
        {note.title}
      </h3>

      {/* Content Preview */}
      <p className="mb-4 line-clamp-3" style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
        lineHeight: '1.6'
      }}>
        {truncateContent(note.content)}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4" style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)'
      }}>
        {note.wordCount && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {note.wordCount.toLocaleString()} words
          </span>
        )}
        {note.wordCount && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getReadingTime(note.wordCount)} min read
          </span>
        )}
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-xs)'
              }}
            >
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)'
            }}>
              +{note.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <span style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)'
        }}>
          {new Date(note.createdAt).toLocaleDateString()}
        </span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)'
        }}>
          <span>Edit</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}