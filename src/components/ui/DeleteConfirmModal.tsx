'use client'

import { Trash2, AlertTriangle, X } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  type: 'folder' | 'bookmark' | 'content'
  title: string
  message: string
  itemName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmModal({
  isOpen,
  type,
  title,
  message,
  itemName,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'folder':
        return <AlertTriangle className="w-6 h-6 text-red-500" />
      case 'bookmark':
        return <Trash2 className="w-6 h-6 text-orange-500" />
      case 'content':
        return <Trash2 className="w-6 h-6 text-gray-500" />
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'folder':
        return 'bg-red-500 hover:bg-red-600'
      case 'bookmark':
        return 'bg-orange-500 hover:bg-orange-600'
      case 'content':
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const getConfirmText = () => {
    switch (type) {
      case 'folder':
        return '휴지통으로 이동'
      case 'bookmark':
        return '삭제'
      case 'content':
        return '삭제'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">{message}</p>
            
            {type === 'folder' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">주의사항</p>
                    <p>폴더 내 모든 콘텐츠가 함께 휴지통으로 이동됩니다.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 아이템명 표시 */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-600">삭제할 항목:</p>
            <p className="font-medium text-gray-900 truncate">{itemName}</p>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                onConfirm()
                onCancel()
              }}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${getButtonColor()}`}
            >
              {getConfirmText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}