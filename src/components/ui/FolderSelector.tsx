'use client'

import { Plus } from 'lucide-react'
import { FolderItem } from '@/types/folder'

interface FolderSelectorProps {
  folders: FolderItem[]
  selectedFolderId?: string
  onFolderSelect: (folderId: string) => void
  onCreateFolder: () => void
  onOpenBigNote?: () => void
  className?: string
}

export default function FolderSelector({
  folders,
  selectedFolderId,
  onFolderSelect,
  onCreateFolder,
  onOpenBigNote,
  className = ''
}: FolderSelectorProps) {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => onFolderSelect(folder.id)}
          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium transition-all ${
            selectedFolderId === folder.id 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: selectedFolderId === folder.id ? 'white' : folder.color }}
          />
          {folder.name}
        </button>
      ))}
      
      {/* Action buttons - 모바일 최적화 */}
      <div className="flex gap-1">
        {/* +New 폴더 생성 버튼 */}
        <button
          onClick={onCreateFolder}
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <Plus size={10} />
          +New
        </button>
        
        {/* +Memo 버튼 */}
        {onOpenBigNote && (
          <button
            onClick={onOpenBigNote}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 transition-colors"
          >
            📄
            +Memo
          </button>
        )}
      </div>
    </div>
  )
}