'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { linksService, videosService, imagesService, notesService } from '@/lib/supabase-services'

interface ContentItem {
  id: string
  type: 'video' | 'link' | 'image' | 'note'
  title: string
  url?: string
  content?: string
  thumbnail?: string
  description?: string
  tags?: string[]
  createdAt: string
  updatedAt?: string
}

interface ContentContextType {
  videos: ContentItem[]
  links: ContentItem[]
  images: ContentItem[]
  notes: ContentItem[]
  loading: boolean
  addItem: (item: Omit<ContentItem, 'id' | 'createdAt'>) => Promise<void>
  deleteItem: (id: string, type: ContentItem['type']) => Promise<void>
  updateItem: (id: string, type: ContentItem['type'], updates: Partial<ContentItem>) => Promise<void>
  refreshData: () => Promise<void>
}

const ContentContext = createContext<ContentContextType | undefined>(undefined)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<ContentItem[]>([])
  const [links, setLinks] = useState<ContentItem[]>([])
  const [images, setImages] = useState<ContentItem[]>([])
  const [notes, setNotes] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  
  const { user } = useAuth()

  // Transform database items to ContentItem format
  const transformDbItem = (dbItem: any, type: ContentItem['type']): ContentItem => { // eslint-disable-line @typescript-eslint/no-explicit-any
    return {
      id: dbItem.id,
      type,
      title: dbItem.title || '',
      url: dbItem.url || undefined,
      content: dbItem.content || undefined,
      thumbnail: dbItem.thumbnail_url || dbItem.url || undefined,
      description: dbItem.description || undefined,
      tags: dbItem.tags || [],
      createdAt: dbItem.created_at ? new Date(dbItem.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      updatedAt: dbItem.updated_at ? new Date(dbItem.updated_at).toISOString().split('T')[0] : undefined
    }
  }

  // Load all content for authenticated user
  const loadAllContent = useCallback(async () => {
    if (!user) {
      // Clear data for non-authenticated users
      setVideos([])
      setLinks([])
      setImages([])
      setNotes([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Load all content types in parallel
      const [videosData, linksData, imagesData, notesData] = await Promise.all([
        videosService.getAll(user.id),
        linksService.getAll(user.id),
        imagesService.getAll(user.id),
        notesService.getAll(user.id)
      ])

      // Transform and set data
      setVideos(videosData.map(item => transformDbItem(item, 'video')))
      setLinks(linksData.map(item => transformDbItem(item, 'link')))
      setImages(imagesData.map(item => transformDbItem(item, 'image')))
      setNotes(notesData.map(item => transformDbItem(item, 'note')))
      
    } catch (error) {
      console.error('Failed to load content:', error)
      // On error, set empty arrays but don't show loading
      setVideos([])
      setLinks([])
      setImages([])
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load content when user changes
  useEffect(() => {
    loadAllContent()
  }, [user, loadAllContent])

  const addItem = async (item: Omit<ContentItem, 'id' | 'createdAt'>) => {
    if (!user) {
      // For non-authenticated users, use local storage as fallback
      const newItem: ContentItem = {
        ...item,
        id: `local-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
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
      return
    }

    try {
      let newDbItem
      const dbItem = {
        user_id: user.id,
        title: item.title,
        url: item.url || '',
        content: item.content,
        description: item.description
      }

      switch (item.type) {
        case 'video':
          newDbItem = await videosService.create({
            ...dbItem,
            thumbnail_url: item.thumbnail,
            platform: item.url?.includes('youtube.com') ? 'youtube' : 'other'
          })
          const newVideo = transformDbItem(newDbItem, 'video')
          setVideos(prev => [newVideo, ...prev])
          break
          
        case 'link':
          newDbItem = await linksService.create({
            ...dbItem,
            favicon_url: item.thumbnail
          })
          const newLink = transformDbItem(newDbItem, 'link')
          setLinks(prev => [newLink, ...prev])
          break
          
        case 'image':
          // For regular images (not file uploads), use the standard create method
          newDbItem = await imagesService.create({
            ...dbItem,
            file_path: item.url, // For now, treat URL as file path
            mime_type: 'image/jpeg' // Default, should be determined from actual file
          })
          const newImage = transformDbItem(newDbItem, 'image')
          setImages(prev => [newImage, ...prev])
          break
          
        case 'note':
          newDbItem = await notesService.create({
            user_id: user.id,
            title: item.title,
            content: item.content || item.title || 'New note', // content is required for notes
            tags: [] // Default empty tags
          })
          const newNote = transformDbItem(newDbItem, 'note')
          setNotes(prev => [newNote, ...prev])
          break
      }
    } catch (error) {
      console.error('Failed to add item:', error)
      throw error
    }
  }

  const deleteItem = async (id: string, type: ContentItem['type']) => {
    if (!user) {
      // For non-authenticated users, remove from local state
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
      return
    }

    try {
      // Delete from database
      switch (type) {
        case 'video':
          await videosService.delete(id)
          setVideos(prev => prev.filter(item => item.id !== id))
          break
        case 'link':
          await linksService.delete(id)
          setLinks(prev => prev.filter(item => item.id !== id))
          break
        case 'image':
          await imagesService.delete(id)
          setImages(prev => prev.filter(item => item.id !== id))
          break
        case 'note':
          await notesService.delete(id)
          setNotes(prev => prev.filter(item => item.id !== id))
          break
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
      throw error
    }
  }

  const updateItem = async (id: string, type: ContentItem['type'], updates: Partial<ContentItem>) => {
    if (!user) {
      // For non-authenticated users, update local state
      const updateLocalState = (setter: React.Dispatch<React.SetStateAction<ContentItem[]>>) => {
        setter(prev => prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        ))
      }

      switch (type) {
        case 'video':
          updateLocalState(setVideos)
          break
        case 'link':
          updateLocalState(setLinks)
          break
        case 'image':
          updateLocalState(setImages)
          break
        case 'note':
          updateLocalState(setNotes)
          break
      }
      return
    }

    try {
      const dbUpdates = {
        title: updates.title,
        url: updates.url,
        content: updates.content,
        description: updates.description
      }

      let updatedDbItem
      switch (type) {
        case 'video':
          updatedDbItem = await videosService.update(id, {
            ...dbUpdates,
            thumbnail_url: updates.thumbnail
          })
          const updatedVideo = transformDbItem(updatedDbItem, 'video')
          setVideos(prev => prev.map(item => item.id === id ? updatedVideo : item))
          break
          
        case 'link':
          updatedDbItem = await linksService.update(id, {
            ...dbUpdates,
            favicon_url: updates.thumbnail
          })
          const updatedLink = transformDbItem(updatedDbItem, 'link')
          setLinks(prev => prev.map(item => item.id === id ? updatedLink : item))
          break
          
        case 'image':
          updatedDbItem = await imagesService.update(id, dbUpdates)
          const updatedImage = transformDbItem(updatedDbItem, 'image')
          setImages(prev => prev.map(item => item.id === id ? updatedImage : item))
          break
          
        case 'note':
          updatedDbItem = await notesService.update(id, dbUpdates)
          const updatedNote = transformDbItem(updatedDbItem, 'note')
          setNotes(prev => prev.map(item => item.id === id ? updatedNote : item))
          break
      }
    } catch (error) {
      console.error('Failed to update item:', error)
      throw error
    }
  }

  const refreshData = async () => {
    await loadAllContent()
  }

  return (
    <ContentContext.Provider value={{ 
      videos, 
      links, 
      images, 
      notes, 
      loading,
      addItem, 
      deleteItem, 
      updateItem,
      refreshData 
    }}>
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