'use client'

import { useState } from 'react'
import { useContent } from '@/contexts/ContentContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { useToastActions } from '@/contexts/ToastContext'
import { useLoadingActions } from '@/contexts/LoadingContext'
import { useFeedbackSystem, FeedbackContainer } from '@/components/FeedbackSystem'
import LoadingButton from '@/components/LoadingButton'
import { trackEvents } from '@/lib/analytics'


export default function InfoInputSection() {
  const { videos, links, images, notes, addItem } = useContent()
  const { getStorageLimit, canAddItem, currentPlan } = useUserPlan()
  const { success, error, warning, info } = useToastActions()
  const { showProgress, hideLoading, updateLoading } = useLoadingActions()
  const {
    inlineFeedbacks,
    showSuccess: showInlineSuccess,
    showError: showInlineError,
    processWithFeedback,
    clearInlineFeedback
  } = useFeedbackSystem()
  
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
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (!inputValue.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    // Check if at limit for this content type
    const limit = getStorageLimit()
    if (!canAddItem(currentCounts[inputType])) {
      const planName = currentPlan === 'free' ? 'Free' : currentPlan === 'pro' ? 'Pro' : 'Unlimited'
      error(
        'Storage Limit Reached',
        `${planName} plan limit reached for ${inputType}s (${limit === Infinity ? 'unlimited' : limit}). Delete existing items${currentPlan === 'free' ? ' or upgrade to Pro' : ''}.`,
        { duration: 8000 }
      )
      setIsSubmitting(false)
      return
    }
    
    // Show loading for content processing
    showProgress('content-processing', 'Processing content...', 10)

    try {
      const isUrl = inputValue.includes('http')
      let title = ''
      
      updateLoading('content-processing', { progress: 30, message: 'Analyzing content...' })
      
      // Get title based on type
      if (inputType === 'image') {
        title = ''
      } else if (inputType === 'video' && isUrl) {
        updateLoading('content-processing', { progress: 60, message: 'Fetching video information...' })
        title = await fetchYouTubeTitle(inputValue.trim())
      } else {
        title = isUrl ? `${inputType.charAt(0).toUpperCase() + inputType.slice(1)} from URL` : inputValue.trim()
      }
      
      updateLoading('content-processing', { progress: 80, message: 'Saving content...' })
    
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
      
      updateLoading('content-processing', { progress: 100, message: 'Content saved!' })
      
      // Hide loading after a brief delay
      setTimeout(() => {
        hideLoading('content-processing')
      }, 500)
      
      // Show success feedback (both toast and inline)
      const typeLabels = {
        video: 'Video',
        link: 'Link', 
        image: 'Image',
        note: 'Note'
      }
      
      // Show animated inline success
      showInlineSuccess(
        `${typeLabels[inputType]} Added Successfully`,
        isUrl ? `Saved ${inputType} from URL` : `Created new ${inputType}`,
        { showToast: true, showInline: true, duration: 4000 }
      )
      
      // Also show regular toast with action
      success(
        `${typeLabels[inputType]} Added Successfully`,
        isUrl ? `Saved ${inputType} from URL` : `Created new ${inputType}`,
        { 
          duration: 4000,
          action: {
            label: 'View',
            onClick: () => {
              info('Navigate to Storage', `View your ${inputType} in the Storage tab`, { duration: 3000 })
            }
          }
        }
      )
      
      setInputValue('')
      setIsExpanded(false)
    } catch (err) {
      hideLoading('content-processing')
      
      // Show animated inline error
      showInlineError(
        'Failed to Add Content',
        'An error occurred while processing your content. Please try again.',
        { showToast: true, showInline: true, duration: 5000 }
      )
    } finally {
      setIsSubmitting(false)
    }
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
          // Check storage limit before processing
          const limit = getStorageLimit()
          if (currentCounts.image >= limit) {
            error(
              'Image Storage Limit Reached',
              `Image storage limit reached (${limit === Infinity ? 'unlimited' : limit}). Please delete existing images or upgrade your plan.`,
              { duration: 8000 }
            )
            return
          }

          // Show immediate feedback
          setInputValue('📷 Processing image...')
          setInputType('image')
          setIsExpanded(true)
          
          // Show processing toast and loading
          showProgress('image-processing', 'Converting pasted image...', 20)
          info(
            'Processing Image',
            'Converting pasted image for storage...',
            { duration: 2000 }
          )
          
          // Convert to base64 data URL
          const reader = new FileReader()
          reader.onload = (event) => {
            updateLoading('image-processing', { progress: 80, message: 'Image converted, saving...' })
            const dataUrl = event.target?.result as string
            setInputValue(dataUrl)
            // Auto submit after a short delay to ensure UI updates
            setTimeout(() => {
              hideLoading('image-processing')
              handleSubmit(e as unknown as React.FormEvent)
            }, 100)
          }
          reader.onerror = () => {
            hideLoading('image-processing')
            setInputValue('')
            error(
              'Image Processing Failed',
              'Failed to process the pasted image. Please try again.',
              { duration: 5000 }
            )
          }
          reader.readAsDataURL(file)
        }
        return
      }
    }
  }

  return (
    <div>
      {/* Inline Feedback Container */}
      <FeedbackContainer
        inlineFeedbacks={inlineFeedbacks}
        onClearFeedback={clearInlineFeedback}
        position="top"
        className="mb-4"
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder={inputType === 'link' ? 'Paste URL: https://github.com/user/repo or https://stackoverflow.com/questions/123...' :
              inputType === 'video' ? 'Paste YouTube URL: https://youtube.com/watch?v=dQw4w9WgXcQ...' :
              inputType === 'image' ? 'Paste image or press Ctrl+V to paste from clipboard...' :
              'Write a note: Meeting notes, project ideas, daily reflections...'
            }
            className="w-full px-4 py-4 bg-gray-800/30 hover:bg-gray-800/50 border-2 border-gray-600/30 hover:border-gray-500/50 focus:border-blue-500/70 focus:bg-gray-800/60 rounded-xl text-white placeholder-gray-400 text-base font-medium pr-24 transition-all duration-300 shadow-sm focus:shadow-lg focus:shadow-blue-500/10"
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
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                variant="primary"
                size="sm"
                loadingText="Adding..."
                className="text-sm font-semibold"
              >
                Add
              </LoadingButton>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="bg-gray-800/40 hover:bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/30 shadow-lg transition-all duration-200">
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