'use client'

import React, { useRef, useEffect } from 'react'
import { Content } from '@/types/core'
import CoverFlowCard from './CoverFlowCard'

interface CoverFlowGridProps {
  contents: Content[]
  onDelete: (id: string) => void
  onContentClick?: (content: Content) => void
}

export default function CoverFlowGrid({ contents, onDelete, onContentClick }: CoverFlowGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!containerRef.current) return

      const container = containerRef.current
      const scrollAmount = 260 // Card width + gap

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
          break
        case 'ArrowRight':
          e.preventDefault()
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
          break
        case 'Home':
          e.preventDefault()
          container.scrollTo({ left: 0, behavior: 'smooth' })
          break
        case 'End':
          e.preventDefault()
          container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' })
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Mouse wheel horizontal scrolling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return
      
      // Only handle horizontal scrolling when shift is held or when vertical scroll is at limits
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault()
        containerRef.current.scrollBy({
          left: e.deltaY || e.deltaX,
          behavior: 'smooth'
        })
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  if (contents.length === 0) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-primary mb-2">No content yet</h3>
          <p className="text-secondary max-w-sm">
            Drag and drop files here or use the input bar below to add images, videos, text files, or web links.
          </p>
          <div className="mt-4 text-sm text-muted">
            <p>• Images: JPG, PNG, GIF, WebP</p>
            <p>• Videos: MP4, WebM, MOV</p>
            <p>• Text files: TXT, MD, JSON</p>
            <p>• Web links: Any valid URL</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="coverflow-wrapper">
      {/* Navigation hint */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted">
          Use arrow keys or mouse wheel + Shift to navigate
        </div>
        <div className="text-sm text-secondary">
          {contents.length} {contents.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      {/* Cover Flow Container */}
      <div
        ref={containerRef}
        className="coverflow-container"
        style={{
          display: 'flex',
          gap: '20px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          padding: '20px 40px',
          minHeight: '400px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border) transparent'
        }}
      >
        {contents.map((content, index) => (
          <CoverFlowCard
            key={content.id}
            content={content}
            index={index}
            onDelete={onDelete}
            onClick={onContentClick}
          />
        ))}
      </div>

      {/* Scroll indicators */}
      <div className="flex justify-center mt-4">
        <div className="flex space-x-1">
          {contents.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-border hover:bg-border-hover cursor-pointer transition-colors"
              onClick={() => {
                const container = containerRef.current
                if (container) {
                  const scrollAmount = index * 260
                  container.scrollTo({ left: scrollAmount, behavior: 'smooth' })
                }
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .coverflow-container::-webkit-scrollbar {
          height: 8px;
        }

        .coverflow-container::-webkit-scrollbar-track {
          background: var(--surface);
          border-radius: 4px;
        }

        .coverflow-container::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }

        .coverflow-container::-webkit-scrollbar-thumb:hover {
          background: var(--border-hover);
        }

        /* Smooth scrolling momentum on mobile */
        .coverflow-container {
          -webkit-overflow-scrolling: touch;
        }

        /* Hide scrollbar on Firefox */
        .coverflow-container {
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
      `}</style>
    </div>
  )
}