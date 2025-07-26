'use client'

import { useState } from 'react'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  noteTitle: string
  noteContent: string
}

export default function NoteModal({ isOpen, onClose, noteTitle, noteContent }: NoteModalProps) {
  const [content, setContent] = useState(noteContent)
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
      {/* Dialog Box */}
      <div className="relative bg-white rounded-lg shadow-2xl border border-gray-300 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {noteTitle || 'Note'}
          </h3>
          <button
            onClick={onClose}
            className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 bg-white overflow-auto max-h-[calc(80vh-140px)]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full min-h-[300px] bg-gray-50 border border-gray-200 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-sm leading-relaxed placeholder-gray-500"
            placeholder="Write your notes here..."
          />
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // TODO: Save note content
              console.log('Saving note:', content)
              onClose()
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Save
          </button>
        </div>
      </div>
      
      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  )
}