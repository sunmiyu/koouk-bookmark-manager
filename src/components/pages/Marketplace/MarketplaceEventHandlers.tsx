'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/useToast'
import { DatabaseService } from '@/lib/database'
import { SharedFolder } from '@/types/share'
import { createFolder } from '@/types/folder'
import { useMarketplaceState } from './MarketplaceStateManager'

/**
 * MarketPlace의 모든 이벤트 핸들러를 관리하는 커스텀 훅
 */
export function useMarketplaceEventHandlers(onImportFolder?: (folder: SharedFolder) => void) {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const {
    sharedFolders,
    selectedCategory,
    sortOrder,
    localSearchQuery,
    setSharedFolders,
    setFilteredFolders,
    setIsLoading,
    setEditModalOpen,
    setEditingFolder,
    setShowImportModal,
    setSelectedFolderForImport,
    setShowSuccessOverlay,
    setSuccessMessage
  } = useMarketplaceState()

  // 📊 데이터 로딩
  const loadMarketplaceData = async () => {
    try {
      setIsLoading(true)
      console.log('Loading marketplace data...')
      
      let convertedFolders: SharedFolder[] = []
      let userSharedFolders: SharedFolder[] = []

      // 공개 폴더 로드
      try {
        console.log('Loading public shared folders...')
        const dbSharedFolders = await DatabaseService.getPublicSharedFolders()
        
        convertedFolders = await Promise.all(
          (dbSharedFolders as any[]).map(async (dbFolder) => {
            const author = dbFolder.users ? {
              id: dbFolder.user_id,
              name: dbFolder.users.name || 'Anonymous',
              avatar: dbFolder.users.avatar_url || '👤',
              verified: dbFolder.users.is_verified
            } : {
              id: 'unknown',
              name: 'Anonymous',
              avatar: '',
              verified: false
            }

            return {
              id: dbFolder.id,
              title: dbFolder.title,
              description: dbFolder.description,
              author,
              category: dbFolder.category as SharedFolder['category'],
              createdAt: dbFolder.created_at,
              updatedAt: dbFolder.updated_at,
              isPublic: dbFolder.is_public,
              tags: dbFolder.tags,
              coverImage: dbFolder.cover_image,
              stats: typeof dbFolder.stats === 'object' ? dbFolder.stats as SharedFolder['stats'] : {
                views: 0,
                likes: 0,
                helpful: 0,
                notHelpful: 0,
                shares: 0,
                downloads: 0
              },
              folder: createFolder(dbFolder.title)
            }
          })
        )
        console.log('✅ Public folders loaded:', convertedFolders.length)
      } catch (publicError) {
        console.error('❌ Failed to load public folders:', publicError)
      }

      // 사용자 공유 폴더 로드
      if (user?.id) {
        try {
          console.log('👤 Loading user shared folders for:', user.email)
          const dbUserSharedFolders = await DatabaseService.getUserSharedFolders(user.id)
          
          userSharedFolders = (dbUserSharedFolders as any[]).map(dbFolder => ({
            id: dbFolder.id,
            title: dbFolder.title,
            description: dbFolder.description,
            author: {
              id: user.id,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'You',
              avatar: user.user_metadata?.avatar_url || '👤',
              verified: true
            },
            category: dbFolder.category as SharedFolder['category'],
            createdAt: dbFolder.created_at,
            updatedAt: dbFolder.updated_at,
            isPublic: dbFolder.is_public,
            tags: dbFolder.tags,
            coverImage: dbFolder.cover_image,
            stats: typeof dbFolder.stats === 'object' ? dbFolder.stats as SharedFolder['stats'] : {
              views: 0,
              likes: 0,
              helpful: 0,
              notHelpful: 0,
              shares: 0,
              downloads: 0
            },
            folder: createFolder(dbFolder.title)
          }))
          console.log('✅ User shared folders loaded:', userSharedFolders.length)
        } catch (userError) {
          console.error('❌ Failed to load user shared folders:', userError)
        }
      }

      // 모든 폴더 합치기
      const allFolders = [...convertedFolders, ...userSharedFolders]
      console.log('📊 Total folders:', allFolders.length)
      
      setSharedFolders(allFolders)
      
    } catch (error) {
      console.error('Failed to load marketplace data:', error)
      showError('Failed to load marketplace data')
    } finally {
      setIsLoading(false)
    }
  }

  // 🔍 필터링 및 정렬 적용
  const applyFiltersAndSort = () => {
    let filtered = [...sharedFolders]

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(folder => folder.category === selectedCategory)
    }

    // 검색 쿼리 필터링
    if (localSearchQuery.trim()) {
      const query = localSearchQuery.toLowerCase()
      filtered = filtered.filter(folder =>
        folder.title.toLowerCase().includes(query) ||
        folder.description.toLowerCase().includes(query) ||
        folder.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 정렬 적용
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'popular':
          return (b.stats.likes + b.stats.downloads) - (a.stats.likes + a.stats.downloads)
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'helpful':
          return b.stats.helpful - a.stats.helpful
        default:
          return 0
      }
    })

    setFilteredFolders(filtered)
  }

  // 📥 폴더 Import 핸들러
  const handleImportFolder = async (sharedFolder: SharedFolder) => {
    if (!user?.id) {
      showError('Please sign in to import folders')
      return
    }

    try {
      setShowImportModal(false)
      setSelectedFolderForImport(null)
      
      // Import 성공 메시지
      setSuccessMessage(`"${sharedFolder.title}" imported successfully!`)
      setShowSuccessOverlay(true)
      
      // 3초 후 자동 숨김
      setTimeout(() => {
        setShowSuccessOverlay(false)
      }, 3000)

      // 상위 컴포넌트로 전달
      onImportFolder?.(sharedFolder)
      
    } catch (error) {
      console.error('Failed to import folder:', error)
      showError('Failed to import folder')
    }
  }

  // ✏️ 폴더 편집 핸들러
  const handleEditFolder = async (updatedFolder: SharedFolder) => {
    if (!user?.id) {
      showError('Please sign in to edit folders')
      return
    }

    try {
      // 데이터베이스 업데이트 (실제 구현 필요)
      // await DatabaseService.updateSharedFolder(user.id, updatedFolder.id, updatedFolder)
      
      // 로컬 상태 업데이트
      const updatedFolders = sharedFolders.map(folder =>
        folder.id === updatedFolder.id ? updatedFolder : folder
      )
      
      setSharedFolders(updatedFolders)
      setEditModalOpen(false)
      setEditingFolder(null)
      showSuccess('Folder updated successfully!')
      
    } catch (error) {
      console.error('Failed to update folder:', error)
      showError('Failed to update folder')
    }
  }

  // 🗑️ 폴더 삭제 핸들러
  const handleDeleteFolder = async (folderId: string) => {
    if (!user?.id) {
      showError('Please sign in to delete folders')
      return
    }

    if (!confirm('Are you sure you want to delete this shared folder?')) {
      return
    }

    try {
      // 데이터베이스에서 삭제 (실제 구현 필요)
      // await DatabaseService.deleteSharedFolder(user.id, folderId)
      
      // 로컬 상태에서 제거
      const updatedFolders = sharedFolders.filter(folder => folder.id !== folderId)
      setSharedFolders(updatedFolders)
      showSuccess('Folder deleted successfully!')
      
    } catch (error) {
      console.error('Failed to delete folder:', error)
      showError('Failed to delete folder')
    }
  }

  // 👍 좋아요 토글 핸들러
  const handleLikeToggle = async (folderId: string) => {
    if (!user?.id) {
      showError('Please sign in to like folders')
      return
    }

    try {
      // 데이터베이스 업데이트 (실제 구현 필요)
      // await DatabaseService.toggleFolderLike(user.id, folderId)
      
      // 로컬 상태 업데이트
      const updatedFolders = sharedFolders.map(folder => {
        if (folder.id === folderId) {
          return {
            ...folder,
            stats: {
              ...folder.stats,
              likes: folder.stats.likes + 1 // 간단한 증가 (실제로는 토글 로직 필요)
            }
          }
        }
        return folder
      })
      
      setSharedFolders(updatedFolders)
      
    } catch (error) {
      console.error('Failed to toggle like:', error)
      showError('Failed to like folder')
    }
  }

  return {
    // 데이터 로딩
    loadMarketplaceData,
    applyFiltersAndSort,
    
    // 폴더 관리
    handleImportFolder,
    handleEditFolder,
    handleDeleteFolder,
    handleLikeToggle,
    
    // 모달 헬퍼
    openImportModal: (folder: SharedFolder) => {
      setSelectedFolderForImport(folder)
      setShowImportModal(true)
    },
    
    openEditModal: (folder: SharedFolder) => {
      setEditingFolder(folder)
      setEditModalOpen(true)
    }
  }
}