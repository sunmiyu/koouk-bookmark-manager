'use client'

import { useContent } from '@/contexts/ContentContext'

export default function NotesSection() {
  const FREE_PLAN_LIMIT = 50
  const { notes } = useContent()

  const isAtLimit = notes.length >= FREE_PLAN_LIMIT

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
            <span className={notes.length >= FREE_PLAN_LIMIT ? 'text-yellow-400' : ''}>{notes.length}</span>
            <span className="text-gray-500">/{FREE_PLAN_LIMIT}</span>
          </div>
          <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors">
            + New
          </button>
        </div>
      </div>
      
      <div className="space-y-3 max-h-[800px] overflow-y-auto">
        {notes.map((note) => (
          <div key={note.id} className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700">
            <div className="flex items-start responsive-gap-sm">
              <div className="w-6 h-6 bg-purple-500 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white responsive-text-sm truncate">{note.title}</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {note.content.split('\n')[0]}
                </p>
                <p className="text-xs text-purple-400 mt-2">{formatDate(note.createdAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {notes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No notes yet</p>
        </div>
      )}
      
      {isAtLimit && (
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Free plan limit reached ({FREE_PLAN_LIMIT} notes)</span>
          </div>
          <p className="text-xs text-yellow-300 mt-1">
            Delete existing notes to add new ones, or <a href="/pricing" className="underline hover:text-yellow-200">upgrade to Pro</a>
          </p>
        </div>
      )}
    </div>
  )
}