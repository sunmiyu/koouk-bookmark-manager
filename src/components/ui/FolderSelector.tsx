'use client'

import { Plus } from 'lucide-react'
import { FolderItem } from '@/types/folder'

interface FolderSelectorProps {
  folders: FolderItem[]
  selectedFolderId?: string
  onFolderSelect: (folderId: string) => void
  onCreateFolder: () => void
  className?: string
}

export default function FolderSelector({
  folders,
  selectedFolderId,
  onFolderSelect,
  onCreateFolder,
  className = ''
}: FolderSelectorProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => onFolderSelect(folder.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
            selectedFolderId === folder.id 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: selectedFolderId === folder.id ? 'white' : folder.color }}
          />
          {folder.name}
        </button>
      ))}
      
      {/* +New 폴더 생성 버튼 */}
      <button
        onClick={onCreateFolder}
        className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <Plus size={14} />
        +New
      </button>
    </div>
  )
}