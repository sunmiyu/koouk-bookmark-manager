'use client'

import React from 'react'
import { FileText, Link, Image, Video, StickyNote, Trash2, ExternalLink } from 'lucide-react'
import { Content, ContentType } from '@/types/core'

interface ContentGridProps {
  contents: Content[]
  viewMode: 'grid' | 'list'
  onDelete: (id: string) => void
}

export default function ContentGrid({ contents, viewMode, onDelete }: ContentGridProps) {
  if (contents.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-primary mb-2">No content yet</h3>
        <p className="text-secondary">
          Use the input bar below to add your first note, link, or document.
        </p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {contents.map(content => (
          <ContentListItem key={content.id} content={content} onDelete={onDelete} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {contents.map(content => (
        <ContentCard key={content.id} content={content} onDelete={onDelete} />
      ))}
    </div>
  )
}

function ContentCard({ content, onDelete }: { content: Content; onDelete: (id: string) => void }) {
  const handleClick = () => {
    if (content.type === 'link' && content.metadata?.url) {
      window.open(content.metadata.url, '_blank')
    }
  }

  return (
    <div className="content-card group cursor-pointer" onClick={handleClick}>
      <div className="flex items-start justify-between mb-3">
        <ContentTypeIcon type={content.type} />
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(content.id)
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-600 transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <h3 className="font-medium text-primary mb-2 line-clamp-2">{content.title}</h3>
      
      <div className="text-sm text-secondary line-clamp-3 mb-3">
        {content.type === 'link' ? content.metadata?.url : content.body}
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="capitalize px-2 py-1 bg-surface rounded">
          {content.type}
        </span>
        <span>{new Date(content.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

function ContentListItem({ content, onDelete }: { content: Content; onDelete: (id: string) => void }) {
  const handleClick = () => {
    if (content.type === 'link' && content.metadata?.url) {
      window.open(content.metadata.url, '_blank')
    }
  }

  return (
    <div className="content-card flex items-center space-x-4 group cursor-pointer" onClick={handleClick}>
      <ContentTypeIcon type={content.type} />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-primary truncate mb-1">{content.title}</h3>
        <p className="text-sm text-secondary truncate">
          {content.type === 'link' ? content.metadata?.url : content.body}
        </p>
      </div>
      
      <div className="flex items-center space-x-3 text-xs text-muted">
        <span className="capitalize px-2 py-1 bg-surface rounded">
          {content.type}
        </span>
        <span>{new Date(content.updatedAt).toLocaleDateString()}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(content.id)
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-600 transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function ContentTypeIcon({ type }: { type: ContentType }) {
  const iconClass = "w-5 h-5"
  
  switch (type) {
    case 'note':
      return <StickyNote className={`${iconClass} type-note`} />
    case 'link':
      return <Link className={`${iconClass} type-link`} />
    case 'image':
      return <Image className={`${iconClass} type-image`} />
    case 'video':
      return <Video className={`${iconClass} type-video`} />
    case 'document':
      return <FileText className={`${iconClass} type-document`} />
    default:
      return <FileText className={`${iconClass} type-document`} />
  }
}