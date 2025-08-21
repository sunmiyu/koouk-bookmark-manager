'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { FolderItem, StorageItem } from '@/types/folder'
import { DatabaseService } from '@/lib/database'
import { useToast } from '@/hooks/useToast'
import { useAppState } from './AppStateManager'
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation'
import { useUndoToast } from '@/hooks/useUndoToast'
import { TrashService } from '@/lib/trashService'

/**
 * App의 모든 이벤트 핸들러를 관리하는 커스텀 훅
 * 기능별로 그룹화하여 관리의 편의성을 높임
 */
export function useAppEventHandlers() {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const { showDeleteConfirmation } = useDeleteConfirmation()
  const { showUndoToast } = useUndoToast()
  const {
    folders,
    newFolderName,
    setFolders,
    setSelectedFolderId,
    setCurrentView,
    setShowCreateFolderModal,
    setNewFolderName,
    setIsLoading
  } = useAppState()

  // 🎯 네비게이션 핸들러들
  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId)
    setCurrentView('detail')
  }

  const handleViewChange = (view: 'grid' | 'detail') => {
    setCurrentView(view)
    if (view === 'grid') {
      setSelectedFolderId(undefined)
    }
  }

  const handleReorderFolders = (reorderedFolders: FolderItem[]) => {
    setFolders(reorderedFolders)
    // TODO: Implement database update for folder ordering
  }

  // 🗂️ 폴더 관리 핸들러들
  const handleCreateFolder = async () => {
    if (!user?.id) return
    
    const folderName = newFolderName.trim() || 'New Folder'
    
    try {
      const dbFolder = await DatabaseService.createFolder(user.id, {
        name: folderName,
        color: '#3B82F6',
        icon: '',
        sort_order: 0
      })

      const newFolder: FolderItem = {
        id: dbFolder.id,
        name: dbFolder.name,
        type: 'folder',
        children: [],
        createdAt: dbFolder.created_at,
        updatedAt: dbFolder.updated_at,
        color: dbFolder.color,
        icon: dbFolder.icon
      }
      
      setFolders([newFolder, ...folders])
      setSelectedFolderId(newFolder.id)
      setShowCreateFolderModal(false)
      setNewFolderName('')
      showSuccess(`Folder "${folderName}" created!`)
    } catch (error) {
      console.error('Failed to create folder:', error)
      showError('Failed to create folder')
    }
  }

  const handleEditFolder = async (folderId: string, newName: string) => {
    if (!user?.id) return
    
    try {
      const updatedFolders = folders.map(folder =>
        folder.id === folderId ? { ...folder, name: newName } : folder
      )
      
      setFolders(updatedFolders)
      showSuccess('Folder renamed successfully!')
    } catch (error) {
      console.error('Failed to rename folder:', error)
      showError('Failed to rename folder')
    }
  }

  const handleDeleteFolder = (folderId: string) => {
    if (!user?.id) return
    
    const folder = folders.find(f => f.id === folderId)
    if (!folder) return

    showDeleteConfirmation('folder', folder, () => moveToTrash(folder))
  }

  const moveToTrash = async (folder: FolderItem) => {
    if (!user?.id) return
    
    try {
      const result = await TrashService.moveToTrash(
        user.id,
        'folder',
        folder.id,
        folder,
        folder.name
      )

      if (!result.success) {
        throw new Error(result.error)
      }
      
      const updatedFolders = folders.filter(f => f.id !== folder.id)
      setFolders(updatedFolders)
      
      setSelectedFolderId(undefined)
      setCurrentView('grid')
      
      showSuccess(`"${folder.name}" 폴더가 휴지통으로 이동되었습니다`)
    } catch (error) {
      console.error('Failed to move folder to trash:', error)
      showError('폴더를 휴지통으로 이동하지 못했습니다')
    }
  }

  // 📝 아이템 관리 핸들러들
  const handleAddItem = async (item: StorageItem, folderId: string) => {
    if (!user?.id) return
    
    try {
      const dbItem = await DatabaseService.createStorageItem(user.id, {
        folder_id: folderId,
        name: item.name,
        type: item.type,
        content: item.content,
        url: item.url,
        thumbnail: item.thumbnail,
        tags: item.tags,
        description: item.description,
        word_count: item.wordCount,
        metadata: (item.metadata as any) || {},
        sort_order: 0
      })

      const updatedFolders = folders.map(folder => {
        if (folder.id === folderId) {
          const newStorageItem: StorageItem = {
            id: dbItem.id,
            name: dbItem.name,
            type: dbItem.type as StorageItem['type'],
            content: dbItem.content,
            url: dbItem.url || undefined,
            thumbnail: dbItem.thumbnail || undefined,
            tags: dbItem.tags,
            description: dbItem.description || undefined,
            folderId: dbItem.folder_id,
            createdAt: dbItem.created_at,
            updatedAt: dbItem.updated_at,
            wordCount: dbItem.word_count || undefined,
            metadata: dbItem.metadata as StorageItem['metadata']
          }
          
          return {
            ...folder,
            children: [newStorageItem, ...folder.children],
            updatedAt: new Date().toISOString()
          }
        }
        return folder
      })
      
      setFolders(updatedFolders)
      showSuccess('Item added successfully!')
    } catch (error) {
      console.error('Failed to add item:', error)
      showError('Failed to add item')
    }
  }

  const handleItemDelete = async (itemId: string, folderId: string) => {
    if (!user?.id) return
    
    const folder = folders.find(f => f.id === folderId)
    const item = folder?.children.find(i => i.id === itemId)
    if (!folder || !item) return

    try {
      const updatedFolders = folders.map(f => {
        if (f.id === folderId) {
          return {
            ...f,
            children: f.children.filter(i => i.id !== itemId)
          }
        }
        return f
      })
      
      setFolders(updatedFolders)
      
      await DatabaseService.deleteStorageItem(user.id, itemId)
      
      showUndoToast(
        `"${item.name}" 콘텐츠가 삭제되었습니다`,
        async () => {
          try {
            const restored = await DatabaseService.createStorageItem(user.id, {
              folder_id: folderId,
              name: item.name,
              type: item.type,
              content: item.content,
              url: item.url,
              thumbnail: item.thumbnail,
              tags: item.tags,
              description: item.description,
              word_count: item.wordCount,
              metadata: item.metadata || {},
              sort_order: 0
            })

            const restoredItem: StorageItem = {
              ...item,
              id: restored.id
            }

            setFolders(folders.map(f => {
              if (f.id === folderId) {
                return {
                  ...f,
                  children: [restoredItem, ...f.children]
                }
              }
              return f
            }))

            showSuccess('콘텐츠가 복원되었습니다')
          } catch (error) {
            console.error('Failed to restore item:', error)
            showError('콘텐츠 복원에 실패했습니다')
          }
        }
      )
      
    } catch (error) {
      console.error('Failed to delete item:', error)
      showError('Failed to delete item')
    }
  }

  // 🔄 Import 관리 핸들러들
  const handleImportFolder = async (sharedFolder: any) => {
    if (!user?.id) {
      showError('Please sign in to import folders')
      return
    }

    if (!navigator.onLine) {
      try {
        const queuedImports = JSON.parse(localStorage.getItem('koouk-queued-imports') || '[]')
        queuedImports.push({
          sharedFolder,
          userId: user.id,
          timestamp: Date.now()
        })
        localStorage.setItem('koouk-queued-imports', JSON.stringify(queuedImports))
        showSuccess(`"${sharedFolder.title}" queued for import when online`)
        return
      } catch {
        showError('Failed to queue import for offline sync')
        return
      }
    }

    try {
      const dbFolder = await DatabaseService.createFolder(user.id, {
        name: sharedFolder.title,
        color: sharedFolder.folder?.color || '#3B82F6',
        icon: sharedFolder.folder?.icon || '',
        sort_order: 0
      })

      const items = sharedFolder.folder?.children || []
      const importedItems: StorageItem[] = []

      for (const item of items) {
        try {
          const dbItem = await DatabaseService.createStorageItem(user.id, {
            folder_id: dbFolder.id,
            name: item.name,
            type: item.type,
            content: item.content,
            url: item.url,
            thumbnail: item.thumbnail,
            tags: item.tags,
            description: item.description,
            word_count: item.wordCount,
            metadata: item.metadata || {},
            sort_order: 0
          })

          importedItems.push({
            id: dbItem.id,
            name: dbItem.name,
            type: dbItem.type as StorageItem['type'],
            content: dbItem.content,
            url: dbItem.url || undefined,
            thumbnail: dbItem.thumbnail || undefined,
            tags: dbItem.tags,
            description: dbItem.description || undefined,
            folderId: dbItem.folder_id,
            createdAt: dbItem.created_at,
            updatedAt: dbItem.updated_at,
            wordCount: dbItem.word_count || undefined,
            metadata: dbItem.metadata as StorageItem['metadata']
          })
        } catch (error) {
          console.error(`Failed to import item ${item.name}:`, error)
        }
      }

      const newFolder: FolderItem = {
        id: dbFolder.id,
        name: dbFolder.name,
        type: 'folder',
        children: importedItems,
        createdAt: dbFolder.created_at,
        updatedAt: dbFolder.updated_at,
        color: dbFolder.color,
        icon: dbFolder.icon
      }

      setFolders([newFolder, ...folders])
      showSuccess(`"${sharedFolder.title}" imported successfully!`)
    } catch (error) {
      console.error('Failed to import folder:', error)
      showError('Failed to import folder')
    }
  }

  const handleBatchImport = async (sharedFolders: any[]) => {
    if (!user?.id) {
      showError('Please sign in to import folders')
      return
    }

    if (sharedFolders.length === 0) return

    try {
      showSuccess(`Importing ${sharedFolders.length} folders...`)
      
      const importResults = await Promise.allSettled(
        sharedFolders.map(folder => handleImportFolder(folder))
      )
      
      const successful = importResults.filter(result => result.status === 'fulfilled').length
      const failed = importResults.length - successful
      
      if (failed === 0) {
        showSuccess(`✅ Successfully imported all ${successful} folders!`)
      } else {
        showSuccess(`✅ Imported ${successful} folders, ${failed} failed`)
      }
    } catch (error) {
      console.error('Batch import error:', error)
      showError('Batch import failed. Please try again.')
    }
  }

  // 📊 데이터 로딩 핸들러
  const loadUserData = async () => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      const dbFolders = await DatabaseService.getUserFolders(user.id)
      
      const convertedFolders: FolderItem[] = dbFolders.map(dbFolder => ({
        id: dbFolder.id,
        name: dbFolder.name,
        type: 'folder' as const,
        children: (dbFolder.storage_items || []).map(item => ({
          id: item.id,
          name: item.name,
          type: item.type as StorageItem['type'],
          content: item.content,
          url: item.url || undefined,
          thumbnail: item.thumbnail || undefined,
          tags: item.tags,
          description: item.description || undefined,
          folderId: item.folder_id,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          wordCount: item.word_count || undefined,
          metadata: item.metadata as StorageItem['metadata']
        })),
        createdAt: dbFolder.created_at,
        updatedAt: dbFolder.updated_at,
        color: dbFolder.color,
        icon: dbFolder.icon
      }))

      setFolders(convertedFolders)
    } catch (error) {
      console.error('Failed to load folders:', error)
      showError('Failed to load your folders')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // 네비게이션
    handleFolderSelect,
    handleViewChange,
    handleReorderFolders,
    
    // 폴더 관리
    handleCreateFolder,
    handleEditFolder,
    handleDeleteFolder,
    
    // 아이템 관리
    handleAddItem,
    handleItemDelete,
    
    // Import 관리
    handleImportFolder,
    handleBatchImport,
    
    // 데이터 로딩
    loadUserData
  }
}