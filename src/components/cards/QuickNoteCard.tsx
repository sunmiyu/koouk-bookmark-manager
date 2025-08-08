'use client'

import { StorageItem } from '@/types/folder'

type QuickNoteCardProps = {
  note: StorageItem
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function QuickNoteCard({ note, onEdit, onDelete }: QuickNoteCardProps) {
  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  // Quick Note는 포스트잇 스타일로 컬러풀한 배경
  const getRandomColor = (id: string) => {
    const colors = [
      { bg: '#FFF9C4', border: '#F9A825' }, // 노란색
      { bg: '#E8F5E8', border: '#66BB6A' }, // 연한 초록
      { bg: '#E3F2FD', border: '#42A5F5' }, // 연한 파란
      { bg: '#FCE4EC', border: '#EC407A' }, // 연한 분홍
      { bg: '#F3E5F5', border: '#AB47BC' }, // 연한 보라
      { bg: '#FFF3E0', border: '#FFA726' }, // 연한 주황
    ]
    
    const index = parseInt(id.slice(-1)) % colors.length
    return colors[index]
  }

  const colorScheme = getRandomColor(note.id)

  return (
    <div
      className="group relative transition-all duration-300 cursor-pointer"
      style={{
        backgroundColor: colorScheme.bg,
        border: `2px solid ${colorScheme.border}`,
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
        minHeight: '180px',
        maxHeight: '220px',
        transform: 'rotate(-1deg)' // 포스트잇 느낌의 살짝 기울어진 효과
      }}
      onClick={() => onEdit(note.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'rotate(0deg) translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'rotate(-1deg) translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '6px',
            padding: '4px',
            fontSize: '14px'
          }}>
            📝
          </div>
          <span style={{
            fontSize: '10px',
            color: colorScheme.border,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '2px 6px',
            borderRadius: '8px',
            fontWeight: '600'
          }}>
            Memo
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(note.id)
          }}
          className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 hover:bg-red-50 rounded"
          style={{ color: '#EF4444' }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Title */}
      {note.name && (
        <h3 className="mb-2 line-clamp-1" style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#2D3748',
          lineHeight: '1.3',
          letterSpacing: '-0.01em'
        }}>
          {note.name}
        </h3>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <p style={{
          fontSize: '12px',
          color: '#4A5568',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {truncateContent(note.content)}
        </p>
      </div>

      {/* Tags - 간단하게만 */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 mb-2">
          {note.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-xs rounded"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: colorScheme.border,
                fontSize: '10px',
                fontWeight: '500'
              }}
            >
              #{tag}
            </span>
          ))}
          {note.tags.length > 2 && (
            <span style={{
              fontSize: '10px',
              color: colorScheme.border,
              opacity: 0.7
            }}>
              +{note.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <span style={{
          fontSize: '9px',
          color: colorScheme.border,
          opacity: 0.8
        }}>
          {new Date(note.createdAt).toLocaleDateString('ko-KR', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{
          fontSize: '9px',
          color: colorScheme.border
        }}>
          <span>Edit</span>
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* 포스트잇 상단 구멍 효과 */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1"
        style={{
          width: '8px',
          height: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '50%'
        }}
      />
    </div>
  )
}