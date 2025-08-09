// Local Storage Management with Supabase Sync
import { Folder, Content, User } from '@/types/core'

const STORAGE_KEYS = {
  USER: 'koouk_user',
  FOLDERS: 'koouk_folders',
  CONTENTS: 'koouk_contents',
  SETTINGS: 'koouk_settings'
} as const

// User Management
export const userStorage = {
  get: (): User | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },

  set: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.USER)
  }
}

// Folder Management
export const folderStorage = {
  getAll: (): Folder[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FOLDERS)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  save: (folders: Folder[]) => {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders))
  },

  create: (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>): Folder => {
    const newFolder: Folder = {
      ...folder,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const folders = folderStorage.getAll()
    folders.push(newFolder)
    folderStorage.save(folders)
    
    return newFolder
  },

  update: (id: string, updates: Partial<Folder>) => {
    const folders = folderStorage.getAll()
    const index = folders.findIndex(f => f.id === id)
    
    if (index !== -1) {
      folders[index] = { 
        ...folders[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      }
      folderStorage.save(folders)
    }
  },

  delete: (id: string) => {
    const folders = folderStorage.getAll()
    const filtered = folders.filter(f => f.id !== id)
    folderStorage.save(filtered)
  }
}

// Content Management
export const contentStorage = {
  getAll: (): Content[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONTENTS)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  getByFolder: (folderId: string): Content[] => {
    return contentStorage.getAll().filter(c => c.folderId === folderId)
  },

  save: (contents: Content[]) => {
    localStorage.setItem(STORAGE_KEYS.CONTENTS, JSON.stringify(contents))
  },

  create: (content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Content => {
    const newContent: Content = {
      ...content,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const contents = contentStorage.getAll()
    contents.push(newContent)
    contentStorage.save(contents)
    
    return newContent
  },

  update: (id: string, updates: Partial<Content>) => {
    const contents = contentStorage.getAll()
    const index = contents.findIndex(c => c.id === id)
    
    if (index !== -1) {
      contents[index] = { 
        ...contents[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      }
      contentStorage.save(contents)
    }
  },

  delete: (id: string) => {
    const contents = contentStorage.getAll()
    const filtered = contents.filter(c => c.id !== id)
    contentStorage.save(filtered)
  }
}

// Utility function to generate unique IDs
function generateId(): string {
  return `koouk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Initialize with sample data if empty
export const initializeSampleData = (userId: string) => {
  const existingFolders = folderStorage.getAll()
  
  if (existingFolders.length === 0) {
    // Create sample folders
    const personalFolder = folderStorage.create({
      name: 'Personal',
      description: 'Personal notes and documents',
      userId,
      position: 0
    })

    const workFolder = folderStorage.create({
      name: 'Work',
      description: 'Work-related content',
      userId,
      position: 1
    })

    const resourcesFolder = folderStorage.create({
      name: 'Resources',
      description: 'Useful links and references',
      userId,
      position: 2
    })

    // Create sample content with new types
    contentStorage.create({
      title: 'Welcome to Koouk',
      body: 'Welcome to your personal knowledge management space!\n\nThis is a text note that demonstrates the new cover flow interface. You can:\n\n• Drag and drop files directly\n• Add images, videos, text files, and web links\n• Navigate with arrow keys or mouse wheel\n• View content in beautiful cards\n\nStart by dragging some files into this space or using the input bar below.',
      type: 'text',
      folderId: personalFolder.id,
      userId,
      position: 0,
      metadata: {
        textContent: 'Welcome to your personal knowledge management space!\n\nThis is a text note that demonstrates the new cover flow interface. You can:\n\n• Drag and drop files directly\n• Add images, videos, text files, and web links\n• Navigate with arrow keys or mouse wheel\n• View content in beautiful cards\n\nStart by dragging some files into this space or using the input bar below.',
        textType: 'text/plain'
      }
    })

    contentStorage.create({
      title: 'Design Inspiration',
      body: 'https://dribbble.com',
      type: 'website',
      folderId: resourcesFolder.id,
      userId,
      position: 0,
      metadata: {
        url: 'https://dribbble.com',
        mimeType: 'text/uri-list'
      }
    })

    contentStorage.create({
      title: 'Development Resources',
      body: 'https://github.com',
      type: 'website',
      folderId: workFolder.id,
      userId,
      position: 1,
      metadata: {
        url: 'https://github.com',
        mimeType: 'text/uri-list'
      }
    })

    contentStorage.create({
      title: 'Project Setup',
      body: '# Project Setup Guide\n\n## Requirements\n- Node.js 18+\n- TypeScript\n- Next.js 15\n\n## Installation\n```bash\nnpm install\nnpm run dev\n```\n\n## Features\n- Drag & Drop Upload\n- Cover Flow Interface\n- Multi-format Support',
      type: 'text',
      folderId: workFolder.id,
      userId,
      position: 2,
      metadata: {
        textContent: '# Project Setup Guide\n\n## Requirements\n- Node.js 18+\n- TypeScript\n- Next.js 15\n\n## Installation\n```bash\nnpm install\nnpm run dev\n```\n\n## Features\n- Drag & Drop Upload\n- Cover Flow Interface\n- Multi-format Support',
        textType: 'text/markdown'
      }
    })
  }
}