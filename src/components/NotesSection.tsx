'use client'

import { useState } from 'react'
import { useContent } from '@/contexts/ContentContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { trackEvents } from '@/lib/analytics'
// NoteModal removed - using inline editing

interface NotesSectionProps {
  fullWidth?: boolean
  searchQuery?: string
}

export default function NotesSection({ fullWidth = false, searchQuery = '' }: NotesSectionProps) {
  const { notes, deleteItem, updateItem } = useContent()
  const { getStorageLimit } = useUserPlan()
  
  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    searchQuery === '' || 
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )
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
            {searchQuery ? (
              <span className="text-purple-400">{filteredNotes.length} found</span>
            ) : (
              <>
                <span className={notes.length >= limit ? 'text-yellow-400' : ''}>{notes.length}</span>
                <span className="text-gray-500">/{limit === Infinity ? '∞' : limit}</span>
              </>
            )}
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
      
      <div className={fullWidth ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[800px] overflow-y-auto" : "space-y-3 max-h-[800px] overflow-y-auto"}>
        {/* Render filtered notes */}
        {filteredNotes.map((note) => {
          const isSelected = selectedItems.has(note.id)
          return (
            <div 
              key={note.id} 
              className={`bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg border group relative ${
                fullWidth ? 'aspect-square p-3 flex flex-col' : 'responsive-p-sm'
              } ${
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
            {fullWidth ? (
              // Full width layout - square memo card
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-white text-sm truncate flex-1">{note.title}</h4>
                </div>
                <div className="flex-1 min-h-0">
                  <p className="text-xs text-gray-300 line-clamp-6 leading-relaxed">
                    {note.content || 'No content'}
                  </p>
                </div>
                <div className="mt-auto pt-2">
                  <p className="text-xs text-purple-400">{formatDate(note.createdAt)}</p>
                </div>
              </>
            ) : (
              // Default compact layout
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
            )}
          </div>
          )
        })}
        
        {/* Add useful default notes if empty and not logged in */}
        {notes.length === 0 && !searchQuery && (
          <>
            <div 
              className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700 group relative"
              onClick={() => {
                trackEvents.openModal('note')
                const input = document.querySelector('input[placeholder*="Paste URL"]') as HTMLInputElement
                if (input) {
                  input.value = 'Meeting Notes: Discuss project timeline and resource allocation for Q1 deliverables'
                  input.focus()
                  input.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
              }}
            >
              <div className="flex items-start responsive-gap-sm">
                <div className="w-6 h-6 bg-purple-500 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white responsive-text-sm truncate">Meeting Notes Template</h4>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">Keep track of important discussions and action items</p>
                  <p className="text-xs text-purple-400 mt-2">{formatDate(new Date().toISOString())}</p>
                </div>
              </div>
            </div>
            <div 
              className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700 group relative"
              onClick={() => {
                trackEvents.openModal('note')
                const input = document.querySelector('input[placeholder*="Paste URL"]') as HTMLInputElement
                if (input) {
                  input.value = 'Project Ideas: Implement dark mode toggle, add keyboard shortcuts, optimize loading performance'
                  input.focus()
                  input.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
              }}
            >
              <div className="flex items-start responsive-gap-sm">
                <div className="w-6 h-6 bg-purple-500 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white responsive-text-sm truncate">Project Ideas</h4>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">Brainstorm and organize your next big ideas</p>
                  <p className="text-xs text-purple-400 mt-2">{formatDate(new Date().toISOString())}</p>
                </div>
              </div>
            </div>
            <div 
              className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700 group relative"
              onClick={() => {
                trackEvents.openModal('note')
                const input = document.querySelector('input[placeholder*="Paste URL"]') as HTMLInputElement
                if (input) {
                  input.value = 'Daily Reflection: What went well today? What can I improve tomorrow? Key learnings and insights.'
                  input.focus()
                  input.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
              }}
            >
              <div className="flex items-start responsive-gap-sm">
                <div className="w-6 h-6 bg-purple-500 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white responsive-text-sm truncate">Daily Reflection</h4>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">Track progress and personal growth insights</p>
                  <p className="text-xs text-purple-400 mt-2">{formatDate(new Date().toISOString())}</p>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Show empty slots to fill remaining space */}
        {!searchQuery && Array.from({ length: Math.max(0, 7 - Math.max(filteredNotes.length, 3)) }, (_, index) => (
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
        
        {/* Empty state message */}
        {filteredNotes.length === 0 && (
          <div className="text-center py-8">
            {searchQuery ? (
              <>
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">No notes found for &quot;{searchQuery}&quot;</p>
                <p className="text-gray-500 text-xs mt-1">Try a different search term</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-white text-base font-semibold mb-2">Create Your First Note</h3>
                <p className="text-gray-400 text-sm mb-4">Save important thoughts, ideas, and reminders in one place</p>
                
                {/* CTA Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Focus on the input section
                      const input = document.querySelector('input[placeholder*="Paste URL"]') as HTMLInputElement
                      if (input) {
                        input.focus()
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    }}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Note
                  </button>
                  
                  {/* Quick example buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="Paste URL"]') as HTMLInputElement
                        if (input) {
                          input.value = 'Meeting: Discussed Q1 roadmap, decided on React migration timeline. Action items: update docs, schedule training'
                          input.focus()
                          input.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          // Trigger change event
                          input.dispatchEvent(new Event('input', { bubbles: true }))
                        }
                      }}
                      className="px-2 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md text-xs transition-all duration-200"
                    >
                      💼 Meeting
                    </button>
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="Paste URL"]') as HTMLInputElement
                        if (input) {
                          input.value = 'Project Idea: Create a productivity dashboard with habit tracking, goal setting, and progress visualization'
                          input.focus()
                          input.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          input.dispatchEvent(new Event('input', { bubbles: true }))
                        }
                      }}
                      className="px-2 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md text-xs transition-all duration-200"
                    >
                      💡 Ideas
                    </button>
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="Paste URL"]') as HTMLInputElement
                        if (input) {
                          input.value = 'Daily Reflection: Completed 3 major tasks today. Learned about React Server Components. Tomorrow: focus on testing'
                          input.focus()
                          input.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          input.dispatchEvent(new Event('input', { bubbles: true }))
                        }
                      }}
                      className="px-2 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md text-xs transition-all duration-200"
                    >
                      🌱 Daily
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
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