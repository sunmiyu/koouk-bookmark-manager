'use client'

import { useState } from 'react'

interface DeleteConfirmation {
  show: boolean
  type: 'folder' | 'bookmark' | 'content'
  item: any
  title: string
  message: string
  onConfirm: () => void
}

export function useDeleteConfirmation() {
  const [confirmModal, setConfirmModal] = useState<DeleteConfirmation | null>(null)

  const showDeleteConfirmation = (
    type: 'folder' | 'bookmark' | 'content',
    item: any,
    onConfirm: () => void
  ) => {
    let title = ''
    let message = ''

    switch (type) {
      case 'folder':
        title = '폴더 삭제'
        message = `"${item.name}" 폴더와 내부의 모든 콘텐츠가 휴지통으로 이동됩니다. 30일 후 자동으로 영구 삭제됩니다.`
        break
      case 'bookmark':
        title = '북마크 삭제'
        message = `"${item.title}" 북마크를 삭제하시겠습니까?`
        break
      case 'content':
        title = '콘텐츠 삭제'
        message = `"${item.title}" 콘텐츠를 삭제하시겠습니까?`
        break
    }

    setConfirmModal({
      show: true,
      type,
      item,
      title,
      message,
      onConfirm
    })
  }

  const hideDeleteConfirmation = () => {
    setConfirmModal(null)
  }

  return {
    confirmModal,
    showDeleteConfirmation,
    hideDeleteConfirmation
  }
}