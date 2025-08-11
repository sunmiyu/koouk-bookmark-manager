'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Folder, Home } from 'lucide-react'
import { FolderItem } from '@/types/folder'

interface FolderBreadcrumbProps {
  folders: FolderItem[]
  currentPath: string[]
  onNavigate: (folderId: string, folderName: string) => void
}

export default function FolderBreadcrumb({ folders, currentPath, onNavigate }: FolderBreadcrumbProps) {
  // 현재 경로의 폴더들 정보 생성
  const breadcrumbItems = currentPath.map((folderId) => {
    const folder = findFolderById(folders, folderId)
    return {
      id: folderId,
      name: folder?.name || 'Unknown',
      color: folder?.color || '#6B7280'
    }
  })

  // 루트 항목 추가
  const allItems = [
    { id: 'root', name: '홈', color: '#3B82F6' },
    ...breadcrumbItems
  ]

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
        {allItems.map((item, index) => (
          <div key={item.id} className="flex items-center flex-shrink-0">
            {/* 브레드크럼 아이템 */}
            <motion.button
              onClick={() => {
                if (item.id === 'root') {
                  onNavigate('', 'Home')
                } else {
                  onNavigate(item.id, item.name)
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              {/* 아이콘 */}
              {item.id === 'root' ? (
                <Home size={16} className="text-blue-600" />
              ) : (
                <div 
                  className="w-4 h-4 rounded flex items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  <Folder size={10} color="white" />
                </div>
              )}
              
              {/* 폴더명 */}
              <span 
                className={`text-sm font-medium ${
                  index === allItems.length - 1 
                    ? 'text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.name}
              </span>
            </motion.button>

            {/* 화살표 구분자 */}
            {index < allItems.length - 1 && (
              <ChevronRight size={14} className="text-gray-400 mx-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// 폴더 ID로 폴더 찾기 (재귀)
function findFolderById(folders: FolderItem[], id: string): FolderItem | null {
  for (const folder of folders) {
    if (folder.id === id) {
      return folder
    }
    
    // 하위 폴더에서 찾기
    const subfolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
    const found = findFolderById(subfolders, id)
    if (found) {
      return found
    }
  }
  return null
}