'use client'

import { useState } from 'react'

type TabType = 'dashboard' | 'my-folder' | 'marketplace' | 'bookmarks'

interface NavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  user?: any
}

export default function Navigation({ activeTab, onTabChange, user }: NavigationProps) {
  return (
    <div className="flex-1 flex justify-center mx-8">
      <div className="flex space-x-3">
        <button
          onClick={() => onTabChange('my-folder')}
          disabled={!user}
          className={`px-6 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center ${
            activeTab === 'my-folder'
              ? 'bg-black text-white shadow-lg'
              : user 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          My Folder
        </button>
        <button
          onClick={() => onTabChange('bookmarks')}
          disabled={!user}
          className={`px-6 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center ${
            activeTab === 'bookmarks'
              ? 'bg-black text-white shadow-lg'
              : user 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          Bookmarks
        </button>
        <button
          onClick={() => onTabChange('marketplace')}
          disabled={!user}
          className={`px-6 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center ${
            activeTab === 'marketplace'
              ? 'bg-black text-white shadow-lg'
              : user 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          Market Place
        </button>
      </div>
    </div>
  )
}