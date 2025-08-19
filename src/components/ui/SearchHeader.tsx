'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface SearchHeaderProps {
  title: string
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  showViewToggle?: boolean
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  actionButton?: {
    label: string
    onClick: () => void
    icon?: string
  }
  className?: string
}

// 🎨 PERFECTION: Consistent header across all content areas
export default function SearchHeader({
  title,
  searchPlaceholder = "Search...",
  onSearch,
  showViewToggle = true,
  viewMode = 'grid',
  onViewModeChange,
  actionButton,
  className = ""
}: SearchHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <div className={`bg-white border-b border-gray-200 px-6 py-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Left: Title and Search */}
        <div className="flex-1 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-6">
          <h1 className="text-base font-semibold text-gray-900 flex-shrink-0">
            {title}
          </h1>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border-0 focus:bg-white transition-colors placeholder-gray-400"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm">🔍</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          
          {/* View Mode Toggle */}
          {showViewToggle && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <motion.button
                onClick={() => onViewModeChange?.('grid')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-base">⊞</span>
              </motion.button>
              <motion.button
                onClick={() => onViewModeChange?.('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-base">☰</span>
              </motion.button>
            </div>
          )}

          {/* Action Button */}
          {actionButton && (
            <motion.button
              onClick={actionButton.onClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {actionButton.icon && (
                <span className="text-base">{actionButton.icon}</span>
              )}
              <span>{actionButton.label}</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}

// 🎯 PERFECTION: Filter pills for categories
export function FilterPills({ 
  filters, 
  activeFilter, 
  onFilterChange 
}: {
  filters: Array<{ id: string; label: string; count?: number }>
  activeFilter: string
  onFilterChange: (filterId: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 px-6 py-3 bg-gray-50 border-b border-gray-200">
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            activeFilter === filter.id
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{filter.label}</span>
          {filter.count !== undefined && (
            <span className={`px-1.5 py-0.5 text-xs rounded-full ${
              activeFilter === filter.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {filter.count}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  )
}