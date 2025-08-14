import { supabase } from './supabase'
import { Database } from '@/types/database'

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
  // === 사용자 관련 ===
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) throw new Error('User not authenticated')
    return user
  }

  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
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
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      // 설정이 없으면 기본값으로 생성
      return this.createUserSettings(userId)
    }
    return data
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
    const { data, error } = await supabase
      .from('folders')
      .select(`
        *,
        storage_items (*)
      `)
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async createFolder(userId: string, folderData: Omit<Tables['folders']['Insert'], 'user_id'>) {
    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: userId,
        ...folderData
      })
      .select()
      .single()
    
    if (error) throw error
    return data
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
    const { data, error } = await supabase
      .from('storage_items')
      .insert({
        user_id: userId,
        ...itemData
      })
      .select()
      .single()
    
    if (error) throw error
    return data
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

  // === 공유 폴더 관련 ===
  static async getPublicSharedFolders() {
    const { data, error } = await supabase
      .from('shared_folders')
      .select(`
        *,
        users!user_id (name, avatar_url, is_verified)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
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