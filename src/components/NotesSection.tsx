'use client'

import { useState } from 'react'
import { useContent } from '@/contexts/ContentContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { trackEvents } from '@/lib/analytics'
// NoteModal removed - using inline editing

export default function NotesSection() {
  const { notes, deleteItem, updateItem } = useContent()
  const { getStorageLimit } = useUserPlan()
  // Modal functionality removed
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)

  const limit = getStorageLimit()
  const isAtLimit = notes.length >= limit

  const toggleBulkMode = () => {
    setBulkMode(!bulkMode)
    setSelectedItems(new Set())
  }

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const selectAll = () => {
    setSelectedItems(new Set(notes.map(note => note.id)))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  const bulkDelete = async () => {
    if (selectedItems.size === 0) return
    
    if (confirm(`선택된 ${selectedItems.size}개의 노트를 삭제하시겠습니까?`)) {
      try {
        await Promise.all(
          Array.from(selectedItems).map(id => deleteItem(id, 'note'))
        )
        setSelectedItems(new Set())
        setBulkMode(false)
      } catch (error) {
        console.error('Bulk delete failed:', error)
        alert('일부 항목 삭제에 실패했습니다.')
      }
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="responsive-text-lg font-semibold text-purple-400">Notes</h3>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400">
            <span className={notes.length >= limit ? 'text-yellow-400' : ''}>{notes.length}</span>
            <span className="text-gray-500">/{limit === Infinity ? '∞' : limit}</span>
          </div>
          {notes.length > 1 && (
            <button
              onClick={toggleBulkMode}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                bulkMode 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {bulkMode ? '완료' : '다중선택'}
            </button>
          )}
          <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors">
            + New
          </button>
        </div>
      </div>

      {/* Bulk operation controls */}
      {bulkMode && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">
                {selectedItems.size}개 선택됨
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  전체선택
                </button>
                <button
                  onClick={clearSelection}
                  className="text-xs text-gray-400 hover:text-gray-300"
                >
                  선택해제
                </button>
              </div>
            </div>
            <button
              onClick={bulkDelete}
              disabled={selectedItems.size === 0}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 text-white text-xs rounded transition-colors"
            >
              삭제 ({selectedItems.size})
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-3 max-h-[800px] overflow-y-auto">
        {/* Render actual notes */}
        {notes.map((note) => {
          const isSelected = selectedItems.has(note.id)
          return (
            <div 
              key={note.id} 
              className={`bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border group relative ${
                isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'
              }`}
              onClick={() => {
                if (bulkMode) {
                  toggleSelectItem(note.id)
                } else {
                  trackEvents.openModal('note')
                  // Note viewing removed - edit inline instead
                }
              }}
            >
            {/* Bulk selection checkbox */}
            {bulkMode && (
              <div className="absolute top-2 left-2 z-10">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-400 bg-gray-700'
                }`}>
                  {isSelected && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
              </div>
            )}

            {/* Edit and Delete buttons */}
            <div className={`absolute top-2 right-2 flex gap-1 z-10 ${
              bulkMode ? 'hidden' : 'opacity-0 group-hover:opacity-100'
            }`}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const newTitle = prompt('노트 제목을 수정하세요:', note.title)
                  if (newTitle && newTitle.trim() !== note.title) {
                    updateItem(note.id, 'note', { title: newTitle.trim() })
                  }
                }}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors text-sm"
                title="Edit note"
              >
                ✎
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('이 노트를 삭제하시겠습니까?')) {
                    deleteItem(note.id, 'note')
                  }
                }}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors text-sm"
                title="Delete note"
              >
                ✕
              </button>
            </div>
            <div className="flex items-start responsive-gap-sm">
              <div className="w-6 h-6 bg-purple-500 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white responsive-text-sm truncate">{note.title}</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {note.content?.split('\n')[0] || 'No content'}
                </p>
                <p className="text-xs text-purple-400 mt-2">{formatDate(note.createdAt)}</p>
              </div>
            </div>
          </div>
          )
        })}
        
        {/* Add sample data if empty */}
        {notes.length === 0 && (
          <div 
            className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700 group relative"
            onClick={() => {
              trackEvents.openModal('note')
              alert('로그인 후 실제 노트를 추가해보세요!')
            }}
          >
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                alert('이것은 샘플 데이터입니다. 로그인 후 실제 노트를 추가해보세요!')
              }}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors opacity-0 group-hover:opacity-100 text-sm z-10"
              title="Delete note"
            >
              ✕
            </button>
            <div className="flex items-start responsive-gap-sm">
              <div className="w-6 h-6 bg-purple-500 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white responsive-text-sm truncate">메모 예시</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">이곳에 중요한 메모를 저장할 수 있습니다.</p>
                <p className="text-xs text-purple-400 mt-2">{formatDate('2025-01-29')}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Show empty slots to fill 10 total */}
        {Array.from({ length: Math.max(0, 10 - Math.max(notes.length, 1)) }, (_, index) => (
          <div 
            key={`empty-${index}`}
            className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg responsive-p-sm opacity-50"
          >
            <div className="flex items-start responsive-gap-sm">
              <div className="w-6 h-6 bg-gray-700 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-600 responsive-text-sm">노트 추가하기</h4>
                <p className="text-xs text-gray-600 mt-1">새로운 메모를 저장해보세요</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      
      {isAtLimit && (
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Storage limit reached ({limit === Infinity ? 'unlimited' : limit} notes)</span>
          </div>
          <p className="text-xs text-yellow-300 mt-1">
            Delete existing notes to add new ones, or <a href="/pricing" className="underline hover:text-yellow-200">upgrade to Pro</a>
          </p>
        </div>
      )}
      
      {/* Note Modal */}
      {/* Modal removed - inline editing only */}
    </div>
  )
}