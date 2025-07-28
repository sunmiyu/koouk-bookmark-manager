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
  const [videos, setVideos] = useState<ContentItem[]>([
    { id: '1', type: 'video', title: "React 18 Complete Tutorial", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", createdAt: '2025-01-20' },
    { id: '2', type: 'video', title: "Next.js App Router Guide", url: "https://www.youtube.com/watch?v=ZVnjOPwW4ZA", createdAt: '2025-01-19' },
    { id: '3', type: 'video', title: "TypeScript Best Practices", url: "https://www.youtube.com/watch?v=RmGHnYUqQ4k", createdAt: '2025-01-18' },
    { id: '4', type: 'video', title: "Tailwind CSS Masterclass", url: "https://www.youtube.com/watch?v=ft30zcMlFao", createdAt: '2025-01-17' },
    { id: '5', type: 'video', title: "JavaScript ES2024 Features", url: "https://www.youtube.com/watch?v=ti2Q4P_LZFE", createdAt: '2025-01-16' },
    { id: '6', type: 'video', title: "Web Performance Optimization", url: "https://www.youtube.com/watch?v=uhRWMGBjlO8", createdAt: '2025-01-15' },
    { id: '7', type: 'video', title: "Modern CSS Techniques", url: "https://www.youtube.com/watch?v=qm0IfZGk-2E", createdAt: '2025-01-14' },
    { id: '8', type: 'video', title: "Node.js Backend Development", url: "https://www.youtube.com/watch?v=ENrzD9HAZK4", createdAt: '2025-01-13' },
    { id: '9', type: 'video', title: "React State Management", url: "https://www.youtube.com/watch?v=35lXWvCuM8o", createdAt: '2025-01-12' }
  ])

  const [links, setLinks] = useState<ContentItem[]>([
    { id: '1', type: 'link', title: "GitHub", url: "https://github.com", description: "Development platform", createdAt: '2025-01-20' },
    { id: '2', type: 'link', title: "Stack Overflow", url: "https://stackoverflow.com", description: "Programming Q&A", createdAt: '2025-01-19' },
    { id: '3', type: 'link', title: "MDN Web Docs", url: "https://developer.mozilla.org", description: "Web development resources", createdAt: '2025-01-18' },
    { id: '4', type: 'link', title: "Next.js Documentation", url: "https://nextjs.org/docs", description: "React framework docs", createdAt: '2025-01-17' },
    { id: '5', type: 'link', title: "Tailwind CSS", url: "https://tailwindcss.com", description: "Utility-first CSS framework", createdAt: '2025-01-16' },
    { id: '6', type: 'link', title: "Vercel", url: "https://vercel.com", description: "Deployment platform", createdAt: '2025-01-15' },
    { id: '7', type: 'link', title: "TypeScript", url: "https://www.typescriptlang.org", description: "Typed JavaScript", createdAt: '2025-01-14' }
  ])

  const [images, setImages] = useState<ContentItem[]>([
    { id: '1', type: 'image', title: "Modern UI Design Trends", url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop", createdAt: '2025-01-20' },
    { id: '2', type: 'image', title: "Color Palette Inspiration", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=200&fit=crop", createdAt: '2025-01-19' },
    { id: '3', type: 'image', title: "Typography Examples", url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop", createdAt: '2025-01-18' }
  ])

  const [notes, setNotes] = useState<ContentItem[]>([
    { id: '1', type: 'note', title: 'Project Ideas', content: 'Build a bookmark manager app\nAdd PWA functionality\nImplement dark mode', createdAt: '2025-01-20' },
    { id: '2', type: 'note', title: 'Learning Resources', content: 'Next.js documentation\nTailwind CSS guide\nTypeScript handbook', createdAt: '2025-01-19' },
    { id: '3', type: 'note', title: 'Code Snippets', content: 'Useful React hooks\nCSS animations\nJavaScript utilities', createdAt: '2025-01-18' },
    { id: '4', type: 'note', title: 'Meeting Notes', content: 'Team standup discussion points\nAction items for next sprint', createdAt: '2025-01-17' }
  ])

  const addItem = (item: Omit<ContentItem, 'id' | 'createdAt'>) => {
    const newItem: ContentItem = {
      ...item,
      id: Date.now().toString(),
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