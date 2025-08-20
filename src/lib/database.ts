import { supabase } from './supabase'
import { Database } from '@/types/database'
import { handleSupabaseError } from '@/utils/errorHandler'

type Tables = Database['public']['Tables']
// type Folders = Tables['folders']
// type StorageItems = Tables['storage_items']
// type Bookmarks = Tables['bookmarks']
// type SharedFolders = Tables['shared_folders']
// type UserSettings = Tables['user_settings']

/**
 * 데이터베이스 서비스 헬퍼 함수들
 */
export class DatabaseService {
  /**
   * Validate user authentication and ownership
   */
  private static async validateUserAccess(userId?: string): Promise<string> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        throw new Error('Authentication required - please sign in to continue')
      }
      
      if (userId && user.id !== userId) {
        throw new Error('Access denied - you can only access your own data')
      }
      
      return user.id
    } catch (error) {
      // Handle network/connection errors gracefully
      if (error instanceof Error && error.message.includes('Authentication required')) {
        throw error
      }
      console.warn('Auth validation failed, treating as unauthenticated:', error)
      throw new Error('Authentication required - please sign in to continue')
    }
  }

  /**
   * Supabase 쿼리를 안전하게 실행하는 래퍼 함수
   */
  private static async executeQuery<T>(
    queryFn: () => unknown,
    operation: string,
    requiresAuth: boolean = true
  ): Promise<T> {
    try {
      // Check authentication for protected operations
      if (requiresAuth) {
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser()
          if (authError || !user) {
            throw new Error('Authentication required - please sign in to continue')
          }
        } catch (authError) {
          console.warn('Auth check failed in executeQuery:', authError)
          throw new Error('Authentication required - please sign in to continue')
        }
      }

      const result = await queryFn()
      const { data, error } = result
      if (error) {
        const message = handleSupabaseError(error, operation)
        throw new Error(message)
      }
      if (data === null && requiresAuth) {
        throw new Error('데이터를 찾을 수 없습니다.')
      }
      return data
    } catch (error) {
      if (error instanceof Error && 
          (error.message.includes('로그인이 필요합니다') || 
           error.message.includes('Authentication required'))) {
        throw error
      }
      const message = handleSupabaseError(error, operation)
      throw new Error(message)
    }
  }
  // === 사용자 관련 ===
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        const message = handleSupabaseError(error, 'getCurrentUser')
        throw new Error(message)
      }
      if (!user) throw new Error('User not authenticated')
      return user
    } catch (error) {
      if (error instanceof Error && error.message.includes('로그인이 필요합니다')) {
        throw error
      }
      const message = handleSupabaseError(error, 'getCurrentUser')
      throw new Error(message)
    }
  }

  static async getUserProfile(userId: string) {
    return this.executeQuery(
      () => supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single(),
      'getUserProfile'
    )
  }

  static async updateUserProfile(userId: string, updates: Tables['users']['Update']) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // === 사용자 설정 ===
  static async getUserSettings(userId: string) {
    try {
      return await this.executeQuery(
        () => supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single(),
        'getUserSettings'
      )
    } catch {
      // 설정이 없으면 기본값으로 생성
      return this.createUserSettings(userId)
    }
  }

  static async createUserSettings(userId: string, settings?: Partial<Tables['user_settings']['Insert']>) {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        ...settings
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateUserSettings(userId: string, updates: Tables['user_settings']['Update']) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // === 폴더 관련 ===
  static async getUserFolders(userId: string) {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select(`
          *,
          storage_items (*)
        `)
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      
      if (error) {
        const message = handleSupabaseError(error, 'getUserFolders')
        throw new Error(message)
      }
      
      return data || []
    } catch (error) {
      const message = handleSupabaseError(error, 'getUserFolders')
      throw new Error(message)
    }
  }

  static async createFolder(userId: string, folderData: Omit<Tables['folders']['Insert'], 'user_id'>) {
    console.log('🗂️ Creating folder for user:', userId, 'with data:', folderData)
    
    try {
      // Validate user authentication and ownership
      const validatedUserId = await this.validateUserAccess(userId)
      console.log('🔐 User validated:', validatedUserId)

      // 일반 supabase client 사용 (RLS 정책 적용)
      const { data, error } = await supabase
        .from('folders')
        .insert({
          user_id: userId,
          ...folderData
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ Folder creation error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }
      
      console.log('✅ Folder created successfully:', data)
      return data
    } catch (error) {
      console.error('❌ Create folder catch block:', error)
      throw error
    }
  }

  static async updateFolder(folderId: string, updates: Tables['folders']['Update']) {
    const { data, error } = await supabase
      .from('folders')
      .update(updates)
      .eq('id', folderId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteFolder(folderId: string) {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
    
    if (error) throw error
  }

  // === 저장 아이템 관련 ===
  static async getFolderItems(folderId: string) {
    const { data, error } = await supabase
      .from('storage_items')
      .select('*')
      .eq('folder_id', folderId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async createStorageItem(userId: string, itemData: Omit<Tables['storage_items']['Insert'], 'user_id'>) {
    console.log('📝 Creating storage item for user:', userId, 'with data:', itemData)
    
    try {
      // Validate user authentication and ownership
      const validatedUserId = await this.validateUserAccess(userId)
      
      // 일반 supabase client 사용 (RLS 정책 적용)
      const { data, error } = await supabase
        .from('storage_items')
        .insert({
          user_id: validatedUserId,
          ...itemData
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ Storage item creation error:', error)
        throw error
      }
      
      console.log('✅ Storage item created successfully:', data)
      return data
    } catch (error) {
      console.error('❌ Storage item creation failed:', error)
      throw error
    }
  }

  static async updateStorageItem(itemId: string, updates: Tables['storage_items']['Update']) {
    const { data, error } = await supabase
      .from('storage_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteStorageItem(itemId: string) {
    const { error } = await supabase
      .from('storage_items')
      .delete()
      .eq('id', itemId)
    
    if (error) throw error
  }

  // === 북마크 관련 ===
  static async getUserBookmarks(userId: string) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async createBookmark(userId: string, bookmarkData: Omit<Tables['bookmarks']['Insert'], 'user_id'>) {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        ...bookmarkData
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateBookmark(bookmarkId: string, updates: Tables['bookmarks']['Update']) {
    const { data, error } = await supabase
      .from('bookmarks')
      .update(updates)
      .eq('id', bookmarkId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteBookmark(bookmarkId: string) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId)
    
    if (error) throw error
  }

  // 사용자가 공유한 폴더의 ID 목록을 가져오는 함수
  static async getUserSharedFolderIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('shared_folders')
      .select('folder_id')
      .eq('user_id', userId)
      .not('folder_id', 'is', null)
    
    if (error) throw error
    return data.map(item => item.folder_id).filter(Boolean) as string[]
  }

  // === 공유 폴더 관련 ===
  static async getPublicSharedFolders() {
    return this.executeQuery(
      () => supabase
        .from('shared_folders')
        .select(`
          *,
          users!user_id (name, avatar_url, is_verified)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false }),
      'getPublicSharedFolders',
      false // Public data doesn't require authentication
    )
  }

  static async getUserSharedFolders(userId: string) {
    const { data, error } = await supabase
      .from('shared_folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async createSharedFolder(userId: string, sharedFolderData: Omit<Tables['shared_folders']['Insert'], 'user_id'>) {
    const { data, error } = await supabase
      .from('shared_folders')
      .insert({
        user_id: userId,
        ...sharedFolderData
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateSharedFolder(sharedFolderId: string, updates: Tables['shared_folders']['Update']) {
    const { data, error } = await supabase
      .from('shared_folders')
      .update(updates)
      .eq('id', sharedFolderId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 🎯 folder_id로 기존 공유 폴더 찾기 (업데이트용)
  static async getSharedFolderByFolderId(userId: string, folderId: string) {
    const { data, error } = await supabase
      .from('shared_folders')
      .select('*')
      .eq('user_id', userId)
      .eq('folder_id', folderId)
      .single()
    
    if (error) {
      // 데이터가 없는 경우는 에러가 아님
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  }

  // 🎯 폴더 공유 또는 업데이트 (통합 함수)
  static async shareOrUpdateFolder(userId: string, folderId: string, sharedFolderData: Omit<Tables['shared_folders']['Insert'], 'user_id' | 'folder_id'>) {
    try {
      // 기존 공유 확인
      const existingShare = await this.getSharedFolderByFolderId(userId, folderId)
      
      if (existingShare) {
        // 기존 공유 업데이트
        console.log('🔄 Updating existing shared folder:', existingShare.id)
        return await this.updateSharedFolder(existingShare.id, {
          ...sharedFolderData,
          // updated_at은 자동으로 갱신됨
        })
      } else {
        // 새 공유 생성
        console.log('🆕 Creating new shared folder for:', folderId)
        return await this.createSharedFolder(userId, {
          folder_id: folderId,
          ...sharedFolderData
        })
      }
    } catch (error) {
      console.error('Error in shareOrUpdateFolder:', error)
      throw error
    }
  }

  // === 검색 기록 ===
  static async addSearchHistory(userId: string, searchData: Omit<Tables['search_history']['Insert'], 'user_id'>) {
    const { data, error } = await supabase
      .from('search_history')
      .insert({
        user_id: userId,
        ...searchData
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getRecentSearches(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('search_history')
      .select('search_query, search_scope')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }

  // === 피드백 ===
  static async createFeedback(userId: string | null, feedbackData: Omit<Tables['feedback']['Insert'], 'user_id'>) {
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: userId,
        ...feedbackData
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}