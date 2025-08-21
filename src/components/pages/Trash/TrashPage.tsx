'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, RotateCcw, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/useToast'
import { TrashService, TrashItem } from '@/lib/trashService'

/**
 * 휴지통 페이지 컴포넌트
 * 삭제된 폴더들을 복원하거나 영구 삭제할 수 있음
 */
export default function TrashPage() {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [trashItems, setTrashItems] = useState<TrashItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTrashItems()
  }, [user?.id])

  const loadTrashItems = async () => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      const items = await TrashService.getTrashItems(user.id)
      setTrashItems(items)
    } catch (error) {
      console.error('Failed to load trash items:', error)
      showError('휴지통 로딩에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async (trashItem: TrashItem) => {
    if (!user?.id) return

    try {
      const result = await TrashService.restoreFromTrash(user.id, trashItem.id)
      
      if (result.success) {
        setTrashItems(items => items.filter(item => item.id !== trashItem.id))
        showSuccess(`"${trashItem.original_name}" 복원되었습니다`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Failed to restore item:', error)
      showError('복원에 실패했습니다')
    }
  }

  const handlePermanentDelete = async (trashItem: TrashItem) => {
    if (!user?.id) return
    
    if (!confirm(`"${trashItem.original_name}"을(를) 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      const result = await TrashService.permanentDelete(user.id, trashItem.id)
      
      if (result.success) {
        setTrashItems(items => items.filter(item => item.id !== trashItem.id))
        showSuccess('영구 삭제되었습니다')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Failed to permanently delete:', error)
      showError('영구 삭제에 실패했습니다')
    }
  }

  const getDaysLeft = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffTime = expires.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">휴지통 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Trash2 className="w-6 h-6 text-gray-600" />
          <h1 className="text-xl font-semibold text-gray-900">휴지통</h1>
        </div>
        <p className="text-sm text-gray-600">
          삭제된 폴더들이 30일간 보관됩니다. 이후 자동으로 영구 삭제됩니다.
        </p>
      </div>

      {/* 빈 상태 */}
      {trashItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Trash2 className="w-16 h-16 mx-auto mb-4" />
            <div className="text-lg font-medium">휴지통이 비어있습니다</div>
            <div className="text-sm">삭제된 폴더가 없습니다</div>
          </div>
        </div>
      ) : (
        /* 휴지통 아이템 목록 */
        <div className="space-y-3">
          {trashItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                {/* 아이템 정보 */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📁</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.original_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>삭제일: {new Date(item.deleted_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getDaysLeft(item.expires_at)}일 남음
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex items-center gap-2">
                  {/* 복원 버튼 */}
                  <button
                    onClick={() => handleRestore(item)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    복원
                  </button>
                  
                  {/* 영구 삭제 버튼 */}
                  <button
                    onClick={() => handlePermanentDelete(item)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    영구삭제
                  </button>
                </div>
              </div>

              {/* 만료 경고 */}
              {getDaysLeft(item.expires_at) <= 7 && (
                <div className="mt-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">곧 영구 삭제됩니다</p>
                    <p>
                      {getDaysLeft(item.expires_at)}일 후 이 폴더가 완전히 삭제됩니다. 
                      필요하다면 지금 복원해주세요.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* 정리 안내 */}
      {trashItems.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">자동 정리 안내</p>
              <p>휴지통의 항목들은 30일 후 자동으로 영구 삭제됩니다. 중요한 폴더라면 미리 복원해주세요.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}