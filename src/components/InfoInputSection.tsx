'use client'

import { useState } from 'react'
import { useContent } from '@/contexts/ContentContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { trackEvents } from '@/lib/analytics'


export default function InfoInputSection() {
  const { videos, links, images, notes, addItem } = useContent()
  const { getStorageLimit, canAddItem, currentPlan } = useUserPlan()
  
  // Get current counts from context
  const currentCounts = {
    video: videos.length,
    link: links.length,
    image: images.length,
    note: notes.length
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

  const fetchYouTubeTitle = async (url: string): Promise<string> => {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      if (response.ok) {
        const data = await response.json()
        return data.title || 'YouTube Video'
      }
    } catch (error) {
      console.error('YouTube title fetch failed:', error)
    }
    return 'YouTube Video'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Check if at limit for this content type
    const limit = getStorageLimit()
    if (!canAddItem(currentCounts[inputType])) {
      const planName = currentPlan === 'free' ? 'Free' : currentPlan === 'pro' ? 'Pro' : 'Unlimited'
      alert(`${planName} plan limit reached for ${inputType}s (${limit === Infinity ? 'unlimited' : limit}). Delete existing items${currentPlan === 'free' ? ' or upgrade to Pro' : ''}.`)
      return
    }

    const isUrl = inputValue.includes('http')
    let title = ''
    
    // Get title based on type
    if (inputType === 'image') {
      title = ''
    } else if (inputType === 'video' && isUrl) {
      title = await fetchYouTubeTitle(inputValue.trim())
    } else {
      title = isUrl ? `${inputType.charAt(0).toUpperCase() + inputType.slice(1)} from URL` : inputValue.trim()
    }
    
    // Create the new item and add it to context
    const newItem = {
      type: inputType,
      title,
      url: isUrl ? inputValue.trim() : undefined,
      content: !isUrl ? inputValue.trim() : undefined,
      thumbnail: inputType === 'image' && isUrl ? inputValue.trim() : undefined
    }

    addItem(newItem)
    
    // Track analytics event
    trackEvents.addContent(inputType)
    
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
            // Auto submit after a short delay to ensure UI updates
            setTimeout(() => {
              const limit = getStorageLimit()
              if (currentCounts.image < limit) {
                handleSubmit(e as unknown as React.FormEvent)
              }
            }, 100)
          }
          reader.readAsDataURL(file)
        }
        return
      }
    }
  }

  return (
    <div className="bg-black rounded-xl p-8">
      {/* Professional Header */}
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Add Content</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder="Paste URL, image, or type your note..."
            className="w-full px-4 py-3 bg-gray-800/50 rounded-lg focus:outline-none focus:bg-gray-800 text-white placeholder-gray-400 text-sm pr-24 transition-all"
          />
          
          {isExpanded && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                inputType === 'video' ? 'bg-red-600/20 text-red-400' :
                inputType === 'image' ? 'bg-green-600/20 text-green-400' :
                inputType === 'link' ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'
              }`}>
                {inputType}
              </span>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-all shadow-sm"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <span className="text-sm font-medium text-gray-400">Content Type:</span>
              <div className="flex flex-wrap gap-2">
                {(['link', 'video', 'image', 'note'] as const).map((type) => {
                  const limit = getStorageLimit()
                  const isAtLimit = currentCounts[type] >= limit
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInputType(type)}
                      disabled={isAtLimit}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all relative ${
                        inputType === type 
                          ? type === 'video' ? 'bg-red-600/20 text-red-400' :
                            type === 'image' ? 'bg-green-600/20 text-green-400' :
                            type === 'link' ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'
                          : isAtLimit 
                            ? 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50'
                      }`}
                      title={isAtLimit ? `${type} limit reached (${limit === Infinity ? 'unlimited' : limit})` : ''}
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
                <span className={(() => {
                  const limit = getStorageLimit()
                  return currentCounts[inputType] >= limit ? 'text-yellow-400' : ''
                })()}>
                  {currentCounts[inputType]}
                </span>
                <span className="text-gray-500">/{(() => {
                  const limit = getStorageLimit()
                  return limit === Infinity ? '∞' : limit
                })()}</span>
              </div>
            </div>
            
            {/* Show limit warning */}
            {(() => {
              const limit = getStorageLimit()
              const isAtLimit = currentCounts[inputType] >= limit
              return isAtLimit && (
                <div className="p-2 bg-yellow-900/30 border border-yellow-600/50 rounded text-xs">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{currentPlan === 'free' ? 'Free' : currentPlan === 'pro' ? 'Pro' : 'Unlimited'} plan limit reached for {inputType}s</span>
                  </div>
                  <p className="text-yellow-300 mt-1">
                    Delete existing {inputType}s to add new ones{currentPlan === 'free' ? ', or ' : ''}
                    {currentPlan === 'free' && <a href="/pricing" className="underline hover:text-yellow-200">upgrade to Pro</a>}
                  </p>
                </div>
              )
            })()}
          </div>
        )}
      </form>
    </div>
  )
}