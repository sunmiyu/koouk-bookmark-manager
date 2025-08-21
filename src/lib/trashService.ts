'use client'

import { supabase } from './supabase'

export interface TrashItem {
  id: string
  user_id: string
  item_type: 'folder' | 'bookmark' | 'content'
  item_id: string
  item_data: any
  deleted_at: string
  expires_at: string
  original_name: string
}

export class TrashService {
  /**
   * 아이템을 휴지통으로 이동
   */
  static async moveToTrash(
    userId: string,
    type: 'folder' | 'bookmark' | 'content',
    itemId: string,
    itemData: any,
    originalName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30일 후

      // 휴지통에 추가
      const { error: trashError } = await supabase
        .from('trash_items')
        .insert({
          user_id: userId,
          item_type: type,
          item_id: itemId,
          item_data: itemData,
          deleted_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          original_name: originalName
        })

      if (trashError) throw trashError

      // 원본 아이템을 삭제 상태로 마킹 (실제 삭제는 하지 않음)
      if (type === 'folder') {
        const { error: folderError } = await supabase
          .from('folders')
          .update({ 
            deleted_at: now.toISOString(),
            is_deleted: true 
          })
          .eq('id', itemId)
          .eq('user_id', userId)

        if (folderError) throw folderError

        // 폴더 내 모든 아이템도 삭제 마킹
        const { error: itemsError } = await supabase
          .from('folder_items')
          .update({ 
            deleted_at: now.toISOString(),
            is_deleted: true 
          })
          .eq('folder_id', itemId)

        if (itemsError) throw itemsError
      }

      return { success: true }

    } catch (error) {
      console.error('Error moving to trash:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 휴지통에서 복원
   */
  static async restoreFromTrash(
    userId: string,
    trashId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 휴지통 아이템 가져오기
      const { data: trashItem, error: fetchError } = await supabase
        .from('trash_items')
        .select('*')
        .eq('id', trashId)
        .eq('user_id', userId)
        .single()

      if (fetchError || !trashItem) {
        throw new Error('휴지통 아이템을 찾을 수 없습니다')
      }

      // 원본 아이템 복원
      if (trashItem.item_type === 'folder') {
        const { error: restoreError } = await supabase
          .from('folders')
          .update({ 
            deleted_at: null,
            is_deleted: false 
          })
          .eq('id', trashItem.item_id)
          .eq('user_id', userId)

        if (restoreError) throw restoreError

        // 폴더 내 아이템들도 복원
        const { error: itemsRestoreError } = await supabase
          .from('folder_items')
          .update({ 
            deleted_at: null,
            is_deleted: false 
          })
          .eq('folder_id', trashItem.item_id)

        if (itemsRestoreError) throw itemsRestoreError
      }

      // 휴지통에서 제거
      const { error: deleteError } = await supabase
        .from('trash_items')
        .delete()
        .eq('id', trashId)
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      return { success: true }

    } catch (error) {
      console.error('Error restoring from trash:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 휴지통 아이템 목록 조회
   */
  static async getTrashItems(userId: string): Promise<TrashItem[]> {
    try {
      const { data, error } = await supabase
        .from('trash_items')
        .select('*')
        .eq('user_id', userId)
        .order('deleted_at', { ascending: false })

      if (error) throw error
      return data || []

    } catch (error) {
      console.error('Error fetching trash items:', error)
      return []
    }
  }

  /**
   * 영구 삭제
   */
  static async permanentDelete(
    userId: string,
    trashId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 휴지통에서만 제거 (원본은 이미 삭제된 상태)
      const { error } = await supabase
        .from('trash_items')
        .delete()
        .eq('id', trashId)
        .eq('user_id', userId)

      if (error) throw error

      return { success: true }

    } catch (error) {
      console.error('Error permanently deleting:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 만료된 휴지통 아이템 자동 정리
   */
  static async cleanupExpiredItems(): Promise<void> {
    try {
      const now = new Date().toISOString()
      
      const { error } = await supabase
        .from('trash_items')
        .delete()
        .lt('expires_at', now)

      if (error) throw error

    } catch (error) {
      console.error('Error cleaning up expired trash items:', error)
    }
  }
}