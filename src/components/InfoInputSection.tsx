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
  const FREE_PLAN_LIMIT = 50
  
  // Mock current counts - in real app, these would come from state management
  const currentCounts = {
    video: 9,
    link: 7,
    image: 11,
    note: 4
  }
  
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

    // Check if at limit for this content type
    if (currentCounts[inputType] >= FREE_PLAN_LIMIT) {
      alert(`Free plan limit reached for ${inputType}s (${FREE_PLAN_LIMIT}). Delete existing items or upgrade to Pro.`)
      return
    }

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

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // Check if pasted item is an image
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          // Convert to base64 data URL
          const reader = new FileReader()
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string
            setInputValue(dataUrl)
            setInputType('image')
            setIsExpanded(true)
          }
          reader.readAsDataURL(file)
        }
        return
      }
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
            onPaste={handlePaste}
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
                {(['link', 'video', 'image', 'note'] as const).map((type) => {
                  const isAtLimit = currentCounts[type] >= FREE_PLAN_LIMIT
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInputType(type)}
                      disabled={isAtLimit}
                      className={`px-2 py-1 rounded text-xs capitalize transition-colors relative ${
                        inputType === type 
                          ? type === 'video' ? 'bg-red-600 text-white' :
                            type === 'image' ? 'bg-green-600 text-white' :
                            type === 'link' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                          : isAtLimit 
                            ? 'bg-gray-600 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      title={isAtLimit ? `${type} limit reached (${FREE_PLAN_LIMIT})` : ''}
                    >
                      {type}
                      {isAtLimit && (
                        <span className="ml-1 text-yellow-400">!</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Show current count and limit warning */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-500">
                {inputType === 'video' && 'YouTube videos will show thumbnails'}
                {inputType === 'image' && 'Images will be displayed as previews'}
                {inputType === 'link' && 'Links will be saved as bookmarks'}
                {inputType === 'note' && 'Text will be saved as a note'}
              </p>
              <div className="text-xs text-gray-400">
                <span className={currentCounts[inputType] >= FREE_PLAN_LIMIT ? 'text-yellow-400' : ''}>
                  {currentCounts[inputType]}
                </span>
                <span className="text-gray-500">/{FREE_PLAN_LIMIT}</span>
              </div>
            </div>
            
            {/* Show limit warning */}
            {currentCounts[inputType] >= FREE_PLAN_LIMIT && (
              <div className="p-2 bg-yellow-900/30 border border-yellow-600/50 rounded text-xs">
                <div className="flex items-center gap-1 text-yellow-400">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Free plan limit reached for {inputType}s</span>
                </div>
                <p className="text-yellow-300 mt-1">
                  Delete existing {inputType}s to add new ones, or <a href="/pricing" className="underline hover:text-yellow-200">upgrade to Pro</a>
                </p>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}