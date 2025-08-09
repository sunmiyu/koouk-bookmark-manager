'use client'

import React, { useState, useEffect } from 'react'
import { Search, X, ArrowLeft } from 'lucide-react'
import { Content } from '@/types/core'
import CoverFlowCard from './CoverFlowCard'

interface SearchResultsProps {
  query: string
  onClose: () => void
  onBackToWorkspace: () => void
  workspaceResults: Content[]
  marketplaceResults: Content[]
  onDeleteContent: (id: string) => void
  onContentClick?: (content: Content) => void
}

export default function SearchResults({
  query,
  onClose,
  onBackToWorkspace,
  workspaceResults,
  marketplaceResults,
  onDeleteContent,
  onContentClick
}: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'workspace' | 'marketplace'>('all')
  const [searchQuery, setSearchQuery] = useState(query)

  useEffect(() => {
    setSearchQuery(query)
  }, [query])

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Trigger new search - this would typically update the results via parent component
      console.log('New search:', searchQuery.trim())
    }
  }

  const getFilteredResults = () => {
    switch (activeTab) {
      case 'workspace':
        return { workspace: workspaceResults, marketplace: [] }
      case 'marketplace':
        return { workspace: [], marketplace: marketplaceResults }
      default:
        return { workspace: workspaceResults, marketplace: marketplaceResults }
    }
  }

  const filteredResults = getFilteredResults()
  const totalResults = workspaceResults.length + marketplaceResults.length

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-default bg-surface px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBackToWorkspace}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
              title="Back to workspace"
            >
              <ArrowLeft className="w-5 h-5 text-secondary" />
            </button>
            
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  placeholder="Search your workspace and marketplace..."
                  className="w-full pl-10 pr-10 py-3 bg-background border border-default rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-surface-hover rounded"
                  >
                    <X className="w-4 h-4 text-muted" />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
              title="Close search"
            >
              <X className="w-5 h-5 text-secondary" />
            </button>
          </div>

          {/* Results summary and filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-primary">
                Search Results for &ldquo;{query}&rdquo;
              </h2>
              <span className="text-sm text-muted">
                {totalResults} results found
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-secondary hover:text-primary hover:bg-surface-hover'
                }`}
              >
                All ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab('workspace')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'workspace'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-secondary hover:text-primary hover:bg-surface-hover'
                }`}
              >
                My Workspace ({workspaceResults.length})
              </button>
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'marketplace'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-secondary hover:text-primary hover:bg-surface-hover'
                }`}
              >
                Market Place ({marketplaceResults.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex max-w-7xl mx-auto">
          {(activeTab === 'all' || activeTab === 'workspace') && filteredResults.workspace.length > 0 && (
            <div className={`${activeTab === 'all' ? 'w-1/2' : 'w-full'} p-6 border-r border-default`}>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-primary mb-2">
                  My Workspace
                </h3>
                <span className="text-sm text-muted">
                  {filteredResults.workspace.length} results
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto scrollbar-hide" style={{ height: 'calc(100vh - 200px)' }}>
                {filteredResults.workspace.map((content, index) => (
                  <CoverFlowCard
                    key={content.id}
                    content={content}
                    index={index}
                    onDelete={onDeleteContent}
                    onClick={onContentClick}
                  />
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'marketplace') && filteredResults.marketplace.length > 0 && (
            <div className={`${activeTab === 'all' ? 'w-1/2' : 'w-full'} p-6`}>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Market Place
                </h3>
                <span className="text-sm text-muted">
                  {filteredResults.marketplace.length} results
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto scrollbar-hide" style={{ height: 'calc(100vh - 200px)' }}>
                {filteredResults.marketplace.map((content, index) => (
                  <CoverFlowCard
                    key={content.id}
                    content={content}
                    index={index}
                    onDelete={onDeleteContent}
                    onClick={onContentClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {totalResults === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Search className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">
                No Results Found
              </h3>
              <p className="text-muted mb-4">
                We couldn&rsquo;t find any content matching &ldquo;{query}&rdquo;. Try adjusting your search terms or browse through your folders.
              </p>
              <button
                onClick={onBackToWorkspace}
                className="btn-primary"
              >
                Back to Workspace
              </button>
            </div>
          </div>
        )}

        {/* Single column empty states */}
        {activeTab === 'workspace' && workspaceResults.length === 0 && marketplaceResults.length > 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Search className="w-12 h-12 text-muted mx-auto mb-3" />
              <h4 className="text-base font-medium text-primary mb-2">
                No Workspace Results
              </h4>
              <p className="text-sm text-muted mb-3">
                No results found in your workspace. Try searching in Market Place instead.
              </p>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="btn-secondary text-sm"
              >
                Search Market Place
              </button>
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && marketplaceResults.length === 0 && workspaceResults.length > 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Search className="w-12 h-12 text-muted mx-auto mb-3" />
              <h4 className="text-base font-medium text-primary mb-2">
                No Market Place Results
              </h4>
              <p className="text-sm text-muted mb-3">
                No results found in Market Place. Check your workspace results instead.
              </p>
              <button
                onClick={() => setActiveTab('workspace')}
                className="btn-secondary text-sm"
              >
                View Workspace Results
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}