import { supabase } from '@/lib/supabase'
import { FolderItem, StorageItem } from '@/types/folder'
import { SharedFolder } from '@/types/share'

export class DataMigration {
  /**
   * localStorage에서 Supabase로 모든 데이터를 마이그레이션
   */
  static async migrateAllData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('🚀 Starting data migration to Supabase...')

      // 1. 사용자 프로필 생성/업데이트
      await this.migrateUserProfile(user)

      // 2. 사용자 설정 마이그레이션
      await this.migrateUserSettings(user.id)

      // 3. 폴더 및 저장 아이템 마이그레이션
      await this.migrateFoldersAndItems(user.id)

      // 4. 북마크 마이그레이션
      await this.migrateBookmarks(user.id)

      // 5. 공유 폴더 마이그레이션
      await this.migrateSharedFolders(user.id)

      // 6. 검색 기록 마이그레이션
      await this.migrateSearchHistory(user.id)

      console.log('✅ Data migration completed successfully!')
      return { success: true }

    } catch (error) {
      console.error('❌ Migration failed:', error)
      return { success: false, error }
    }
  }

  /**
   * 사용자 프로필 생성/업데이트
   */
  private static async migrateUserProfile(user: { id: string; email?: string; user_metadata?: Record<string, unknown>; email_confirmed_at?: string }) {
    const userPlan = localStorage.getItem('koouk_user_plan') || 'free'

    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        user_plan: userPlan,
        is_verified: user.email_confirmed_at ? true : false
      })

    if (error) {
      console.error('User profile migration failed:', error)
      throw error
    }

    console.log('✅ User profile migrated')
  }

  /**
   * 사용자 설정 마이그레이션
   */
  private static async migrateUserSettings(userId: string) {
    const lastTab = localStorage.getItem('koouk-last-tab') || 'dashboard'
    const selectedFolderId = localStorage.getItem('koouk-selected-folder')
    const visitCount = parseInt(localStorage.getItem('koouk-visit-count') || '0')
    const installDismissed = localStorage.getItem('koouk-install-dismissed')
    const crossPlatformState = localStorage.getItem('koouk-cross-platform-state')

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        last_active_tab: lastTab,
        selected_folder_id: selectedFolderId,
        visit_count: visitCount,
        pwa_install_dismissed_at: installDismissed ? new Date(installDismissed).toISOString() : null,
        cross_platform_state: crossPlatformState ? JSON.parse(crossPlatformState) : {}
      })

    if (error) {
      console.error('User settings migration failed:', error)
      throw error
    }

    console.log('✅ User settings migrated')
  }

  /**
   * 폴더 및 저장 아이템 마이그레이션
   */
  private static async migrateFoldersAndItems(userId: string) {
    const savedFolders = localStorage.getItem('koouk-folders')
    if (!savedFolders) {
      console.log('ℹ️ No folders to migrate')
      return
    }

    const folders: FolderItem[] = JSON.parse(savedFolders)
    const folderIdMap = new Map<string, string>() // old ID -> new ID 매핑

    // 폴더들을 먼저 생성
    for (const folder of folders) {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          user_id: userId,
          name: folder.name,
          color: folder.color || '#3B82F6',
          icon: folder.icon || '📁',
          sort_order: 0
        })
        .select('id')
        .single()

      if (error) {
        console.error('Folder migration failed:', error)
        throw error
      }

      folderIdMap.set(folder.id, data.id)
    }

    // 저장 아이템들 마이그레이션
    for (const folder of folders) {
      const newFolderId = folderIdMap.get(folder.id)
      if (!newFolderId) continue

      for (const item of folder.children) {
        if ('type' in item) { // StorageItem인지 확인
          const storageItem = item as StorageItem

          const { error } = await supabase
            .from('storage_items')
            .insert({
              user_id: userId,
              folder_id: newFolderId,
              name: storageItem.name,
              type: storageItem.type,
              content: storageItem.content,
              url: storageItem.url,
              thumbnail: storageItem.thumbnail,
              tags: storageItem.tags,
              description: storageItem.description,
              word_count: storageItem.wordCount,
              metadata: storageItem.metadata || {},
              sort_order: 0
            })

          if (error) {
            console.error('Storage item migration failed:', error)
            throw error
          }
        }
      }
    }

    console.log(`✅ ${folders.length} folders and their items migrated`)
  }

  /**
   * 북마크 마이그레이션
   */
  private static async migrateBookmarks(userId: string) {
    const savedBookmarks = localStorage.getItem('koouk-bookmarks')
    if (!savedBookmarks) {
      console.log('ℹ️ No bookmarks to migrate')
      return
    }

    const bookmarks = JSON.parse(savedBookmarks)
    
    for (const bookmark of bookmarks) {
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          title: bookmark.title || bookmark.name,
          url: bookmark.url,
          description: bookmark.description,
          thumbnail: bookmark.thumbnail,
          category: bookmark.category,
          tags: bookmark.tags || [],
          is_favorite: bookmark.is_favorite || false,
          sort_order: 0
        })

      if (error) {
        console.error('Bookmark migration failed:', error)
        throw error
      }
    }

    console.log(`✅ ${bookmarks.length} bookmarks migrated`)
  }

  /**
   * 공유 폴더 마이그레이션
   */
  private static async migrateSharedFolders(userId: string) {
    const savedSharedFolders = localStorage.getItem('koouk-shared-folders')
    if (!savedSharedFolders) {
      console.log('ℹ️ No shared folders to migrate')
      return
    }

    const sharedFolders: SharedFolder[] = JSON.parse(savedSharedFolders)
    
    for (const sharedFolder of sharedFolders) {
      const { error } = await supabase
        .from('shared_folders')
        .insert({
          user_id: userId,
          title: sharedFolder.title,
          description: sharedFolder.description,
          cover_image: sharedFolder.coverImage,
          category: sharedFolder.category,
          tags: sharedFolder.tags,
          is_public: sharedFolder.isPublic,
          stats: sharedFolder.stats
        })

      if (error) {
        console.error('Shared folder migration failed:', error)
        throw error
      }
    }

    console.log(`✅ ${sharedFolders.length} shared folders migrated`)
  }

  /**
   * 검색 기록 마이그레이션
   */
  private static async migrateSearchHistory(userId: string) {
    const recentSearches = localStorage.getItem('recent-searches')
    if (!recentSearches) {
      console.log('ℹ️ No search history to migrate')
      return
    }

    const searches = JSON.parse(recentSearches)
    
    for (const search of searches) {
      const { error } = await supabase
        .from('search_history')
        .insert({
          user_id: userId,
          search_query: search.query || search,
          search_scope: search.scope || 'all',
          results_count: search.results_count || 0
        })

      if (error) {
        console.error('Search history migration failed:', error)
        throw error
      }
    }

    console.log(`✅ ${searches.length} search histories migrated`)
  }

  /**
   * 마이그레이션 후 localStorage 정리
   */
  static async cleanupLocalStorage() {
    const keysToRemove = [
      'koouk-folders',
      'koouk-selected-folder',
      'koouk-shared-folders',
      'koouk-last-tab',
      'koouk-bookmarks',
      'koouk-user-plan',
      'koouk-visit-count',
      'koouk-install-dismissed',
      'recent-searches',
      'koouk-cross-platform-state',
      'koouk-storage-items'
    ]

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    console.log('✅ localStorage cleaned up')
  }

  /**
   * 마이그레이션 상태 확인
   */
  static async checkMigrationStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { migrated: false, reason: 'Not authenticated' }

      // 사용자 프로필 존재 확인
      const { data: userProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!userProfile) {
        return { migrated: false, reason: 'User profile not found' }
      }

      // 폴더 데이터 존재 확인
      const { data: folders } = await supabase
        .from('folders')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      const localFolders = localStorage.getItem('koouk-folders')
      
      if (localFolders && (!folders || folders.length === 0)) {
        return { migrated: false, reason: 'Local data exists but not in database' }
      }

      return { migrated: true }

    } catch (error) {
      return { migrated: false, reason: error }
    }
  }
}