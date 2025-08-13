'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface Category {
  value: string
  label: string
  emoji?: string
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  showDropdownOnMobile?: boolean // 모바일에서 드롭다운 사용 여부
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  showDropdownOnMobile = true
}: CategoryFilterProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const selectedCategoryLabel = categories.find(cat => cat.value === selectedCategory)?.label

  const handleCategorySelect = (value: string) => {
    onCategoryChange(value)
    setShowDropdown(false)
  }

  return (
    <>
      {/* 모바일 드롭다운 (showDropdownOnMobile이 true일 때) */}
      {showDropdownOnMobile && (
        <div className="sm:hidden mb-4">
          <div className="flex-1 relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>{selectedCategoryLabel}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {/* 드롭다운 메뉴 */}
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
              >
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleCategorySelect(category.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      selectedCategory === category.value 
                        ? 'bg-black text-white hover:bg-gray-800' 
                        : 'text-gray-700'
                    }`}
                  >
                    {category.emoji && <span className="mr-2">{category.emoji}</span>}
                    {category.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* 데스크톱 카테고리 버튼들 - 통일된 텍스트 크기 */}
      <div className="hidden sm:block mb-6 pb-3 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                selectedCategory === category.value
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.emoji && <span className="mr-1">{category.emoji}</span>}
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}