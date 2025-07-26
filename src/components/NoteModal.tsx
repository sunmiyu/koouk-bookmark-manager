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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-3xl max-h-[85vh] w-full bg-gray-900 rounded-lg overflow-hidden shadow-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">{noteTitle}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 text-gray-400 hover:text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 h-[60vh] overflow-y-auto">
          <div className="prose prose-invert max-w-none">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-gray-300 text-base leading-relaxed placeholder-gray-500"
              placeholder="Write your notes here..."
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-700 bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // TODO: Save note content
              console.log('Saving note:', content)
              onClose()
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
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