'use client'

import { useState } from 'react'

interface InfoItem {
  id: string
  type: 'video' | 'link' | 'image' | 'note'
  title: string
  url?: string
  content?: string
}

export default function InfoInputSection() {
  const [inputValue, setInputValue] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputType, setInputType] = useState<'video' | 'link' | 'image' | 'note'>('link')

  const detectInputType = (value: string): 'video' | 'link' | 'image' | 'note' => {
    if (value.includes('youtube.com') || value.includes('youtu.be')) return 'video'
    if (value.includes('http') && (value.includes('.jpg') || value.includes('.png') || value.includes('.gif') || value.includes('.webp'))) return 'image'
    if (value.includes('http')) return 'link'
    return 'note'
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    if (value.length > 0) {
      setIsExpanded(true)
      const detectedType = detectInputType(value)
      setInputType(detectedType)
    } else {
      setIsExpanded(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const isUrl = inputValue.includes('http')
    const newItem: InfoItem = {
      id: Date.now().toString(),
      type: inputType,
      title: isUrl ? `${inputType.charAt(0).toUpperCase() + inputType.slice(1)} from URL` : inputValue.trim(),
      url: isUrl ? inputValue.trim() : undefined,
      content: !isUrl ? inputValue.trim() : undefined
    }

    console.log('새 아이템 추가:', newItem)
    
    setInputValue('')
    setIsExpanded(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLInputElement>)
    }
  }

  return (
    <div className="mb-6 sm:mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Add link, video, image, or note..."
            className="w-full responsive-p-md bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400 responsive-text-base pr-16 sm:pr-20"
          />
          
          {isExpanded && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
              <span className={`px-1.5 sm:px-2 py-1 rounded text-xs ${
                inputType === 'video' ? 'bg-red-600' :
                inputType === 'image' ? 'bg-green-600' :
                inputType === 'link' ? 'bg-blue-600' : 'bg-purple-600'
              } text-white`}>
                {inputType}
              </span>
              <button
                type="submit"
                className="px-2 sm:px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-2 responsive-p-sm bg-gray-800 border border-gray-600 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center responsive-gap-sm mb-2">
              <span className="responsive-text-sm text-gray-400">Detected as:</span>
              <div className="flex flex-wrap gap-1">
                {(['link', 'video', 'image', 'note'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInputType(type)}
                    className={`px-2 py-1 rounded text-xs capitalize transition-colors ${
                      inputType === type 
                        ? type === 'video' ? 'bg-red-600 text-white' :
                          type === 'image' ? 'bg-green-600 text-white' :
                          type === 'link' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {inputType === 'video' && 'YouTube videos will show thumbnails'}
              {inputType === 'image' && 'Images will be displayed as previews'}
              {inputType === 'link' && 'Links will be saved as bookmarks'}
              {inputType === 'note' && 'Text will be saved as a note'}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}