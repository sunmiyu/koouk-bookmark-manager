'use client'

import React from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onSearch?: (query: string) => void
}

export default function SearchBar({ value, onChange, placeholder = "Search...", onSearch }: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim() && onSearch) {
      onSearch(value.trim())
    }
  }
  return (
    <div className="relative flex items-center" style={{ minWidth: '300px' }}>
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10" 
        style={{ color: 'var(--text-muted)', pointerEvents: 'none' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        className="search-input"
        style={{
          paddingLeft: '2.5rem',
          paddingRight: value ? '2.5rem' : '0.75rem',
          width: '100%',
          fontSize: '0.9375rem'
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-primary z-10"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}