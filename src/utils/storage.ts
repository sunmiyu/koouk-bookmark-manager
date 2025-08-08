import { StorageItem } from '@/types/folder'

const STORAGE_KEY = 'koouk-storage-items'

export const storageUtils = {
  // 모든 아이템 로드
  loadItems: (): StorageItem[] => {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load storage items:', error)
      return []
    }
  },

  // 모든 아이템 저장
  saveItems: (items: StorageItem[]) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save storage items:', error)
    }
  },

  // 새 아이템 추가
  addItem: (item: Omit<StorageItem, 'id' | 'createdAt' | 'updatedAt'>): StorageItem => {
    const newItem: StorageItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const currentItems = storageUtils.loadItems()
    const updatedItems = [newItem, ...currentItems]
    storageUtils.saveItems(updatedItems)
    
    return newItem
  },

  // 아이템 업데이트
  updateItem: (id: string, updates: Partial<Omit<StorageItem, 'id' | 'createdAt'>>): StorageItem | null => {
    const currentItems = storageUtils.loadItems()
    const itemIndex = currentItems.findIndex(item => item.id === id)
    
    if (itemIndex === -1) return null

    const updatedItem = {
      ...currentItems[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    currentItems[itemIndex] = updatedItem
    storageUtils.saveItems(currentItems)
    
    return updatedItem
  },

  // 아이템 삭제
  deleteItem: (id: string): boolean => {
    const currentItems = storageUtils.loadItems()
    const filteredItems = currentItems.filter(item => item.id !== id)
    
    if (filteredItems.length === currentItems.length) {
      return false // 아이템을 찾지 못함
    }

    storageUtils.saveItems(filteredItems)
    return true
  },

  // 검색
  searchItems: (query: string, items: StorageItem[]): StorageItem[] => {
    if (!query.trim()) return items

    const lowerQuery = query.toLowerCase()
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.content.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  },

  // URL 메타데이터 추출 (간단한 버전)
  extractUrlMetadata: async (url: string) => {
    try {
      // 간단한 URL 타입 감지
      let type: 'url' | 'video' | 'image' = 'url'
      let thumbnail = ''
      
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        type = 'video'
        // YouTube 썸네일 추출
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
        if (videoId) {
          thumbnail = `https://img.youtube.com/vi/${videoId[1]}/maxresdefault.jpg`
        }
      } else if (url.includes('instagram.com')) {
        type = 'image'
      }

      const domain = new URL(url).hostname.replace('www.', '')
      
      return {
        title: `${domain}`,
        description: `Saved from ${domain}`,
        thumbnail,
        tags: [domain.split('.')[0]],
        type
      }
    } catch (error) {
      console.error('Failed to extract URL metadata:', error)
      return {
        title: url,
        description: 'Saved URL',
        thumbnail: '',
        tags: ['url'],
        type: 'url' as const
      }
    }
  }
}