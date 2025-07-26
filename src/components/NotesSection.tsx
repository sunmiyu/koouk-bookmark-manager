'use client'

import { useState } from 'react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function NotesSection() {
  const [notes] = useState<Note[]>([
    {
      id: '1',
      title: 'Project Ideas',
      content: 'Build a bookmark manager app\nAdd PWA functionality\nImplement dark mode',
      createdAt: '2025-01-25',
      updatedAt: '2025-01-25'
    },
    {
      id: '2',
      title: 'Learning Resources',
      content: 'Next.js documentation\nTailwind CSS guide\nTypeScript handbook',
      createdAt: '2025-01-24',
      updatedAt: '2025-01-24'
    },
    {
      id: '3',
      title: 'Code Snippets',
      content: 'Useful React hooks\nCSS animations\nJavaScript utilities',
      createdAt: '2025-01-23',
      updatedAt: '2025-01-23'
    },
    {
      id: '4',
      title: 'Meeting Notes',
      content: 'Team standup discussion points\nAction items for next sprint',
      createdAt: '2025-01-22',
      updatedAt: '2025-01-22'
    }
  ])

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
        <h3 className="responsive-text-lg font-semibold text-purple-400">Notes ({notes.length})</h3>
        <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors">
          + New
        </button>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
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
                <p className="text-xs text-purple-400 mt-2">{formatDate(note.updatedAt)}</p>
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
    </div>
  )
}