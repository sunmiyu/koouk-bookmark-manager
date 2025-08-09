'use client'

import React, { useState, useEffect } from 'react'
import { Search, User, Settings, LogOut, Plus, Grid, List } from 'lucide-react'
import { useAuth } from './auth/AuthContext'
import { Folder, Content } from '@/types/core'
import { folderStorage, contentStorage } from '@/lib/storage'
import { searchEngine } from '@/lib/search'
import FolderSidebar from './workspace/FolderSidebar'
import ContentGrid from './workspace/ContentGrid'
import CoverFlowGrid from './workspace/CoverFlowGrid'
import DragDropZone from './workspace/DragDropZone'
import SearchBar from './workspace/SearchBar'
import QuickInput from './workspace/QuickInput'
import MarketPlace from './workspace/MarketPlace'

export default function MainApp() {
  const { user, signOut } = useAuth()
  const [folders, setFolders] = useState<Folder[]>([])
  const [contents, setContents] = useState<Content[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [viewMode, setViewMode] = useState<'coverflow' | 'grid' | 'list'>('coverflow')
  const [activeTab, setActiveTab] = useState<'workspace' | 'marketplace'>('workspace')
  const [isLoading, setIsLoading] = useState(true)

  // Initialize data
  useEffect(() => {
    if (user) {
      const loadedFolders = folderStorage.getAll().filter(f => f.userId === user.id)
      const loadedContents = contentStorage.getAll().filter(c => c.userId === user.id)
      
      setFolders(loadedFolders)
      setContents(loadedContents)
      
      // Select first folder by default
      if (loadedFolders.length > 0 && !selectedFolderId) {
        setSelectedFolderId(loadedFolders[0].id)
      }
      
      // Initialize search engine
      searchEngine.indexFolders(loadedFolders)
      searchEngine.indexContent(loadedContents)
      
      setIsLoading(false)
    }
  }, [user, selectedFolderId])

  // Get filtered content
  const getFilteredContent = () => {
    let filtered = selectedFolderId 
      ? contents.filter(c => c.folderId === selectedFolderId)
      : contents

    if (searchQuery.trim()) {
      const searchResults = searchEngine.search(searchQuery, {
        type: 'content',
        folderId: selectedFolderId || undefined
      })
      const resultIds = new Set(searchResults.map(r => r.id))
      filtered = filtered.filter(c => resultIds.has(c.id))
    }

    return filtered
  }

  const handleCreateFolder = (name: string, parentId?: string) => {
    if (!user) return

    const newFolder = folderStorage.create({
      name,
      parentId,
      userId: user.id,
      position: folders.length
    })

    const updatedFolders = [...folders, newFolder]
    setFolders(updatedFolders)
    searchEngine.indexFolders(updatedFolders)
    setSelectedFolderId(newFolder.id)
  }

  const handleCreateContent = (content: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'position'>) => {
    if (!user || !selectedFolderId) return

    const newContent = contentStorage.create({
      ...content,
      userId: user.id,
      position: contents.length
    })

    const updatedContents = [...contents, newContent]
    setContents(updatedContents)
    searchEngine.indexContent(updatedContents)
  }

  // Handle multiple file uploads from drag & drop
  const handleFilesUploaded = (newContents: Content[]) => {
    // Contents are already processed and have IDs, just add to state
    const updatedContents = [...contents, ...newContents]
    setContents(updatedContents)
    searchEngine.indexContent(updatedContents)
  }

  const handleDeleteFolder = (folderId: string) => {
    folderStorage.delete(folderId)
    
    // Delete all content in folder
    const folderContents = contents.filter(c => c.folderId === folderId)
    folderContents.forEach(c => contentStorage.delete(c.id))
    
    const updatedFolders = folders.filter(f => f.id !== folderId)
    const updatedContents = contents.filter(c => c.folderId !== folderId)
    
    setFolders(updatedFolders)
    setContents(updatedContents)
    
    // Select first folder if deleted folder was selected
    if (selectedFolderId === folderId && updatedFolders.length > 0) {
      setSelectedFolderId(updatedFolders[0].id)
    }
    
    searchEngine.indexFolders(updatedFolders)
    searchEngine.indexContent(updatedContents)
  }

  const handleDeleteContent = (contentId: string) => {
    contentStorage.delete(contentId)
    const updatedContents = contents.filter(c => c.id !== contentId)
    setContents(updatedContents)
    searchEngine.indexContent(updatedContents)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4" />
          <p className="text-secondary">Loading workspace...</p>
        </div>
      </div>
    )
  }

  const selectedFolder = folders.find(f => f.id === selectedFolderId)
  const filteredContent = getFilteredContent()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="page-header" style={{ 
        borderBottom: '1px solid var(--border)', 
        background: 'var(--background)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50 
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '1.5rem', 
                  height: '1.5rem', 
                  background: 'var(--accent)', 
                  color: 'var(--accent-foreground)', 
                  borderRadius: '0.25rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'bold', 
                  fontSize: '0.875rem' 
                }}>
                  K
                </div>
                <span style={{ fontWeight: '600' }}>Koouk</span>
              </div>
              
              {/* Tab Navigation */}
              <nav className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('workspace')}
                  className={`px-4 py-2 text-sm font-medium rounded ${
                    activeTab === 'workspace'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-secondary hover:text-primary hover:bg-surface-hover'
                  }`}
                >
                  My Workspace
                </button>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`px-4 py-2 text-sm font-medium rounded ${
                    activeTab === 'marketplace'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-secondary hover:text-primary hover:bg-surface-hover'
                  }`}
                >
                  Market Place
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={activeTab === 'workspace' ? "Search my content..." : "Search marketplace..."}
              />
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 bg-surface rounded-full flex items-center justify-center text-sm font-medium surface-hover"
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-10 w-48 bg-surface border border-default rounded-lg shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-default">
                      <div className="text-sm font-medium text-primary">{user?.name}</div>
                      <div className="text-xs text-muted">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-primary hover:bg-surface-hover"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={signOut}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: '1 1 0%', display: 'flex' }}>
        {/* Sidebar - Only show for workspace */}
        {activeTab === 'workspace' && (
          <div style={{ 
            width: '16rem', 
            background: 'var(--surface)', 
            borderRight: '1px solid var(--border)', 
            height: '100vh', 
            overflowY: 'auto' 
          }}>
            <FolderSidebar
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={setSelectedFolderId}
              onCreateFolder={handleCreateFolder}
              onDeleteFolder={handleDeleteFolder}
            />
          </div>
        )}

        {/* Content Area */}
        <div style={{ 
          flex: '1 1 0%', 
          background: 'var(--background)', 
          minHeight: '100vh', 
          padding: '1.5rem' 
        }}>
          {activeTab === 'workspace' ? (
            <>
              {/* Workspace Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-primary">
                    {selectedFolder?.name || 'All Content'}
                  </h1>
                  <p className="text-secondary">
                    {filteredContent.length} {filteredContent.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* View Toggle */}
                  <div className="flex items-center border border-default rounded">
                    <button
                      onClick={() => setViewMode('coverflow')}
                      className={`p-2 ${viewMode === 'coverflow' ? 'bg-accent text-accent-foreground' : 'text-secondary hover:text-primary'}`}
                      title="Cover Flow View"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-secondary hover:text-primary'}`}
                      title="Grid View"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-secondary hover:text-primary'}`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Display */}
              <DragDropZone
                selectedFolderId={selectedFolderId}
                userId={user?.id || ''}
                onFilesUploaded={handleFilesUploaded}
              >
                {viewMode === 'coverflow' ? (
                  <CoverFlowGrid
                    contents={filteredContent}
                    onDelete={handleDeleteContent}
                  />
                ) : (
                  <ContentGrid
                    contents={filteredContent}
                    viewMode={viewMode}
                    onDelete={handleDeleteContent}
                  />
                )}
              </DragDropZone>
            </>
          ) : (
            <MarketPlace searchQuery={searchQuery} />
          )}
        </div>
      </div>

      {/* Quick Input - Only show for workspace */}
      {activeTab === 'workspace' && (
        <QuickInput
          selectedFolderId={selectedFolderId}
          folders={folders}
          onCreateContent={handleCreateContent}
          onSelectFolder={setSelectedFolderId}
        />
      )}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
}