'use client'

import React, { useState } from 'react'
import { Trash2, ExternalLink, Eye, FileText, Globe, Image as ImageIcon, Video, Edit3 } from 'lucide-react'
import { Content } from '@/types/core'

interface CoverFlowCardProps {
  content: Content
  index: number
  onDelete: (id: string) => void
  onClick?: (content: Content) => void
}

export default function CoverFlowCard({ content, index, onDelete, onClick }: CoverFlowCardProps) {
  const [imageError, setImageError] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const handleCardClick = () => {
    if (onClick) {
      onClick(content)
    } else if (content.type === 'website' && content.metadata?.url) {
      window.open(content.metadata.url, '_blank')
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Delete "${content.title}"?`)) {
      onDelete(content.id)
    }
  }

  const renderContentPreview = () => {
    switch (content.type) {
      case 'image':
        if (content.metadata?.imageData && !imageError) {
          return (
            <img
              src={content.metadata.imageData}
              alt={content.title}
              className="content-preview-image"
              onError={() => setImageError(true)}
              style={{
                borderRadius: '8px',
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'cover',
                width: '100%'
              }}
            />
          )
        }
        return (
          <div className="content-preview-fallback">
            <ImageIcon className="w-12 h-12 text-muted" />
            <p className="text-sm text-muted mt-2">Image preview unavailable</p>
          </div>
        )

      case 'video':
        if (content.metadata?.videoData && !videoError) {
          return (
            <video
              controls
              className="content-preview-video"
              onError={() => setVideoError(true)}
              style={{
                borderRadius: '8px',
                maxWidth: '100%',
                maxHeight: '200px',
                width: '100%'
              }}
            >
              <source src={content.metadata.videoData} type={content.metadata.videoType} />
              Your browser does not support video playback.
            </video>
          )
        }
        return (
          <div className="content-preview-fallback">
            <Video className="w-12 h-12 text-muted" />
            <p className="text-sm text-muted mt-2">Video preview unavailable</p>
          </div>
        )

      case 'text':
        const textContent = content.metadata?.textContent || content.body
        return (
          <div className="content-preview-text">
            <pre
              style={{
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                maxHeight: '200px',
                overflow: 'auto',
                padding: '12px',
                backgroundColor: 'var(--surface)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontFamily: 'monospace',
                lineHeight: '1.4'
              }}
            >
              {textContent.length > 500 ? textContent.substring(0, 500) + '...' : textContent}
            </pre>
          </div>
        )

      case 'website':
        const url = content.metadata?.url || content.body
        return (
          <div className="content-preview-website">
            <iframe
              src={url}
              style={{
                border: '0',
                width: '100%',
                height: '200px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface)'
              }}
              onError={() => {
                // Fallback to link preview
                console.log('iframe failed, showing link preview')
              }}
              sandbox="allow-same-origin"
            />
            <div className="mt-2 p-2 bg-surface rounded border border-default">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-muted flex-shrink-0" />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-accent truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {url}
                </a>
                <ExternalLink className="w-3 h-3 text-muted flex-shrink-0" />
              </div>
            </div>
          </div>
        )

      case 'memo':
        const memoContent = content.metadata?.memoContent || content.body
        const previewLines = memoContent.split('\n').slice(0, 3).join('\n')
        
        return (
          <div className="content-preview-memo">
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '16px',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start'
              }}
            >
              {/* Memo content with typography focus */}
              <div
                style={{
                  fontSize: '16px',
                  lineHeight: '1.5',
                  fontWeight: '400',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'inherit' // Clean typography
                }}
              >
                {previewLines.length > 120 ? previewLines.substring(0, 120) + '...' : previewLines}
              </div>
              
              {/* Memo indicator */}
              <div className="mt-auto pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-muted">
                  <Edit3 className="w-4 h-4" />
                  <span className="text-xs">Quick Note</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="content-preview-fallback">
            <FileText className="w-12 h-12 text-muted" />
            <p className="text-sm text-muted mt-2">Preview unavailable</p>
          </div>
        )
    }
  }

  const getTypeIcon = () => {
    switch (content.type) {
      case 'image': return <ImageIcon className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'text': return <FileText className="w-4 h-4" />
      case 'website': return <Globe className="w-4 h-4" />
      case 'memo': return <Edit3 className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div
      className="coverflow-card group"
      onClick={handleCardClick}
      style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
        flex: '0 0 auto',
        width: '240px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        minHeight: '300px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)'
      }}
    >
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 p-1 rounded bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ backdropFilter: 'blur(4px)' }}
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>

      {/* Content Preview */}
      <div className="content-section" style={{ padding: '12px', flex: 1 }}>
        {renderContentPreview()}
      </div>

      {/* Title Section */}
      <div
        className="title-section"
        style={{
          padding: '12px',
          borderTop: '1px solid #eee',
          backgroundColor: 'var(--surface)',
          borderRadius: '0 0 12px 12px'
        }}
      >
        <div className="flex items-center space-x-2 mb-2">
          <div className="text-muted">{getTypeIcon()}</div>
          <span className="text-xs px-2 py-1 bg-surface-hover rounded-full text-muted capitalize">
            {content.type}
          </span>
        </div>
        
        <h3 className="font-semibold text-primary text-center mb-1 line-clamp-2">
          {content.title}
        </h3>
        
        {content.metadata?.fileName && content.metadata.fileName !== content.title && (
          <p className="text-xs text-muted text-center truncate">
            {content.metadata.fileName}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted">
          <span>
            {content.type === 'memo' 
              ? (content.metadata?.createdDate || new Date(content.createdAt).toLocaleDateString())
              : new Date(content.updatedAt).toLocaleDateString()
            }
          </span>
          {content.metadata?.fileSize && (
            <span>{formatFileSize(content.metadata.fileSize)}</span>
          )}
        </div>
      </div>

      <style jsx>{`
        .content-preview-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          background: var(--surface);
          border-radius: 8px;
          border: 2px dashed var(--border);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

// Helper function to format file sizes
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}