'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface SortOption {
  value: string
  label: string
  description: string
}

interface SortOptionsProps {
  options: SortOption[]
  selectedSort: string
  onSortChange: (sort: string) => void
}

export default function SortOptions({
  options,
  selectedSort,
  onSortChange
}: SortOptionsProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const selectedOption = options.find(opt => opt.value === selectedSort)

  const handleSortSelect = (value: string) => {
    onSortChange(value)
    setShowDropdown(false)
  }

  return (
    <>
      {/* 데스크톱 정렬 드롭다운 */}
      <div className="hidden sm:block relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>{selectedOption?.label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
        
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  selectedSort === option.value ? 'bg-gray-50 font-medium' : ''
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 모바일 정렬 드롭다운 */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>{selectedOption?.label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
        
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  selectedSort === option.value ? 'bg-gray-50 font-medium' : ''
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 클릭 외부 영역으로 드롭다운 닫기 */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  )
}