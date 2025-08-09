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
            <div className="content-preview-image" style={{ height: '200px', overflow: 'hidden' }}>
              <img
                src={content.metadata.imageData}
                alt={content.title}
                onError={() => setImageError(true)}
                style={{
                  borderRadius: '8px',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          )
        }
        return (
          <div className="content-preview-fallback" style={{
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--surface)',
            borderRadius: '8px',
            border: '2px dashed var(--border)'
          }}>
            <ImageIcon className="w-12 h-12 text-muted" />
            <p className="text-sm text-muted mt-2">Image preview unavailable</p>
          </div>
        )

      case 'video':
        if (content.metadata?.videoData && !videoError) {
          return (
            <div className="content-preview-video" style={{ height: '200px', position: 'relative' }}>
              <video
                controls
                onError={() => setVideoError(true)}
                style={{
                  borderRadius: '8px',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              >
                <source src={content.metadata.videoData} type={content.metadata.videoType || 'video/mp4'} />
                Your browser does not support video playback.
              </video>
            </div>
          )
        }
        return (
          <div className="content-preview-fallback" style={{
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--surface)',
            borderRadius: '8px',
            border: '2px dashed var(--border)'
          }}>
            <Video className="w-12 h-12 text-muted" />
            <p className="text-sm text-muted mt-2">Video preview unavailable</p>
          </div>
        )

      case 'text':
        const textContent = content.metadata?.textContent || content.body
        return (
          <div className="content-preview-text" style={{ height: '200px' }}>
            <pre
              style={{
                fontSize: '0.8125rem',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                height: '100%',
                overflow: 'auto',
                padding: '12px',
                margin: '0',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                lineHeight: '1.4',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em'
              }}
            >
              {textContent.length > 800 ? textContent.substring(0, 800) + '...' : textContent}
            </pre>
          </div>
        )

      case 'website':
        const url = content.metadata?.url || content.body
        return (
          <div className="content-preview-website" style={{ height: '200px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, marginBottom: '8px' }}>
              <iframe
                src={url}
                title={content.title}
                style={{
                  border: '0',
                  width: '100%',
                  height: '100%',
                  borderRadius: '8px',
                  backgroundColor: 'var(--surface)'
                }}
                sandbox="allow-same-origin allow-scripts"
                loading="lazy"
              />
            </div>
            <div style={{
              padding: '8px 12px',
              backgroundColor: 'var(--surface)',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Globe className="w-4 h-4 text-muted flex-shrink-0 mr-2" />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-accent truncate flex-1"
                onClick={(e) => e.stopPropagation()}
                style={{ textDecoration: 'none', letterSpacing: '-0.01em' }}
              >
                {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
              <ExternalLink className="w-3 h-3 text-muted flex-shrink-0 ml-2" />
            </div>
          </div>
        )

      case 'memo':
        const memoContent = content.metadata?.memoContent || content.body
        const previewLines = memoContent.split('\n').filter(line => line.trim()).slice(0, 6).join('\n')
        
        return (
          <div className="content-preview-memo" style={{ height: '200px' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e1e5e9',
                borderRadius: '8px',
                padding: '16px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              {/* Memo content with typography focus */}
              <div
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: '1.5',
                  fontWeight: '400',
                  color: '#2d3748',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  flex: 1,
                  overflow: 'hidden',
                  letterSpacing: '-0.01em'
                }}
              >
                {previewLines.length > 150 ? previewLines.substring(0, 150) + '...' : previewLines}
              </div>
              
              {/* Memo date indicator */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '12px',
                borderTop: '1px solid #f1f3f4',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Edit3 className="w-3 h-3" style={{ color: '#9ca3af' }} />
                <span style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  fontWeight: '500',
                  letterSpacing: '-0.01em'
                }}>
                  {content.metadata?.createdDate || new Date(content.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="content-preview-fallback" style={{
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--surface)',
            borderRadius: '8px',
            border: '2px dashed var(--border)'
          }}>
            <FileText className="w-12 h-12 text-muted" />
            <p className="text-sm text-muted mt-2">Preview unavailable</p>
          </div>
        )
    }
  }

  const getTypeIcon = () => {
    switch (content.type) {
      case 'image': return <ImageIcon className="w-3.5 h-3.5" />
      case 'video': return <Video className="w-3.5 h-3.5" />
      case 'text': return <FileText className="w-3.5 h-3.5" />
      case 'website': return <Globe className="w-3.5 h-3.5" />
      case 'memo': return <Edit3 className="w-3.5 h-3.5" />
      default: return <FileText className="w-3.5 h-3.5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return '#10b981'  // green-500
      case 'video': return '#f59e0b'  // amber-500
      case 'text': return '#6366f1'   // indigo-500
      case 'website': return '#06b6d4' // cyan-500
      case 'memo': return '#8b5cf6'   // violet-500
      default: return '#6b7280'       // gray-500
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return 'Image'
      case 'video': return 'Video'
      case 'text': return 'Text'
      case 'website': return 'Website'
      case 'memo': return 'Memo'
      default: return 'File'
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
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
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
        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>

      {/* Content Preview Section */}
      <div className="content-section" style={{ padding: '12px' }}>
        {renderContentPreview()}
      </div>

      {/* Title Section */}
      <div
        className="title-section"
        style={{
          padding: '12px 16px 16px',
          borderTop: '1px solid #eee',
          backgroundColor: '#fafafa',
          borderRadius: '0 0 12px 12px',
          minHeight: '80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        {/* Content Type Indicator */}
        <div className="flex items-center justify-center mb-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-white rounded-full border border-gray-200">
            <div style={{ color: getTypeColor(content.type) }}>{getTypeIcon()}</div>
            <span className="text-sm font-medium text-gray-600 capitalize">
              {getTypeLabel(content.type)}
            </span>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="font-semibold text-center mb-1 text-gray-800 leading-tight text-lg" style={{
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.6em'
        }}>
          {content.title}
        </h3>
        
        {/* Metadata */}
        <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
          <span>
            {content.type === 'memo' 
              ? (content.metadata?.createdDate || new Date(content.createdAt).toLocaleDateString())
              : new Date(content.updatedAt).toLocaleDateString()
            }
          </span>
          {content.metadata?.fileSize && (
            <>
              <span className="mx-1">•</span>
              <span>{formatFileSize(content.metadata.fileSize)}</span>
            </>
          )}
        </div>
      </div>
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