'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ContentItem {
  id: string
  type: 'video' | 'link' | 'image' | 'note'
  title: string
  url?: string
  content?: string
  thumbnail?: string
  description?: string
  createdAt: string
}

interface ContentContextType {
  videos: ContentItem[]
  links: ContentItem[]
  images: ContentItem[]
  notes: ContentItem[]
  addItem: (item: Omit<ContentItem, 'id' | 'createdAt'>) => void
  deleteItem: (id: string, type: ContentItem['type']) => void
}

const ContentContext = createContext<ContentContextType | undefined>(undefined)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<ContentItem[]>([])
  const [links, setLinks] = useState<ContentItem[]>([])
  const [images, setImages] = useState<ContentItem[]>([])
  const [notes, setNotes] = useState<ContentItem[]>([])

  const addItem = (item: Omit<ContentItem, 'id' | 'createdAt'>) => {
    const newItem: ContentItem = {
      ...item,
      id: `${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    }

    switch (item.type) {
      case 'video':
        setVideos(prev => [newItem, ...prev])
        break
      case 'link':
        setLinks(prev => [newItem, ...prev])
        break
      case 'image':
        setImages(prev => [newItem, ...prev])
        break
      case 'note':
        setNotes(prev => [newItem, ...prev])
        break
    }
  }

  const deleteItem = (id: string, type: ContentItem['type']) => {
    switch (type) {
      case 'video':
        setVideos(prev => prev.filter(item => item.id !== id))
        break
      case 'link':
        setLinks(prev => prev.filter(item => item.id !== id))
        break
      case 'image':
        setImages(prev => prev.filter(item => item.id !== id))
        break
      case 'note':
        setNotes(prev => prev.filter(item => item.id !== id))
        break
    }
  }

  return (
    <ContentContext.Provider value={{ videos, links, images, notes, addItem, deleteItem }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const context = useContext(ContentContext)
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return context
}