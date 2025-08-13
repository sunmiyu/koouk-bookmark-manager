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
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <Plus size={12} />
        +New
      </button>
    </div>
  )
}