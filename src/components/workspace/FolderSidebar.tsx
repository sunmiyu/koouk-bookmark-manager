'use client'

import React, { useState } from 'react'
import { Folder, FolderOpen, Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { Folder as FolderType } from '@/types/core'

interface FolderSidebarProps {
  folders: FolderType[]
  selectedFolderId: string | null
  onSelectFolder: (folderId: string) => void
  onCreateFolder: (name: string, parentId?: string) => void
  onDeleteFolder: (folderId: string) => void
}

export default function FolderSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder
}: FolderSidebarProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName('')
      setShowCreateForm(false)
    }
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const rootFolders = folders.filter(f => !f.parentId)
  const getSubfolders = (parentId: string) => folders.filter(f => f.parentId === parentId)

  const renderFolder = (folder: FolderType, level = 0) => {
    const isSelected = selectedFolderId === folder.id
    const isExpanded = expandedFolders.has(folder.id)
    const subfolders = getSubfolders(folder.id)
    const hasSubfolders = subfolders.length > 0

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center space-x-2 px-3 py-2 text-sm cursor-pointer rounded-lg ${
            isSelected 
              ? 'bg-accent text-accent-foreground' 
              : 'text-secondary hover:text-primary hover:bg-surface-hover'
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {hasSubfolders && (
            <button
              onClick={() => toggleFolder(folder.id)}
              className="p-0.5 hover:bg-surface-hover rounded"
            >
              {isExpanded ? (
                <FolderOpen className="w-4 h-4" />
              ) : (
                <Folder className="w-4 h-4" />
              )}
            </button>
          )}
          
          {!hasSubfolders && <Folder className="w-4 h-4" />}
          
          <span 
            onClick={() => onSelectFolder(folder.id)}
            className="flex-1 truncate"
          >
            {folder.name}
          </span>
          
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            <button
              onClick={() => onDeleteFolder(folder.id)}
              className="p-1 hover:bg-red-100 rounded text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        {hasSubfolders && isExpanded && (
          <div>
            {subfolders.map(subfolder => renderFolder(subfolder, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Create Folder Button */}
      <div className="mb-4">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-hover rounded-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Folder</span>
          </button>
        ) : (
          <form onSubmit={handleCreateFolder} className="space-y-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="input text-sm"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="btn-primary text-xs px-3 py-1"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewFolderName('')
                }}
                className="btn-secondary text-xs px-3 py-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Folders List */}
      <div className="space-y-1">
        {rootFolders.length > 0 ? (
          rootFolders.map(folder => renderFolder(folder))
        ) : (
          <div className="text-center py-8">
            <Folder className="w-8 h-8 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No folders yet</p>
            <p className="text-xs text-muted">Create your first folder to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}