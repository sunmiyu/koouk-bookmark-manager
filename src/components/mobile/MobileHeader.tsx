'use client'


import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import SearchInterface from '@/components/ui/SearchInterface'

interface MobileHeaderProps {
  activeTab: 'dashboard' | 'my-folder' | 'marketplace' | 'bookmarks'
  searchQuery: string
  onSearchChange: (query: string) => void
  onShowFeedbackModal: () => void
  onShowUserMenu: () => void
  onLogoClick?: () => void
}

export default function MobileHeader({
  activeTab,
  searchQuery,
  onSearchChange,
  onShowFeedbackModal,
  onShowUserMenu,
  onLogoClick
}: MobileHeaderProps) {
  const { user } = useAuth()

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick()
    } else {
      // 기본값: Dashboard로 이동
      window.location.href = '/'
    }
  }

  return (
    <div className="flex items-center justify-between h-16 min-h-[64px] safe-area-px-4 sm:safe-area-px-6 bg-white border-b border-gray-200">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0">
        <button 
          onClick={handleLogoClick}
          className="hover:opacity-80 transition-all duration-150 active:scale-95 select-none"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          <Image 
            src="/koouk-logo.svg" 
            alt="KOOUK" 
            width={80}
            height={20}
            className="h-5 w-auto"
          />
        </button>
      </div>

      {/* Right side elements - Touch-optimized spacing */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Enhanced Search Interface - Always show */}
        <SearchInterface
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchScope={activeTab === 'my-folder' ? 'my-folder' : activeTab === 'marketplace' ? 'market-place' : 'bookmarks'}
          placeholder="Search..."
          language="en"
        />

        {/* Feedback Button - Touch-optimized */}
        <button 
          onClick={onShowFeedbackModal}
          className="flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-150 sm:gap-1.5 sm:px-3 sm:py-2 sm:w-auto active:scale-95 select-none"
          title="Feedback"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Feedback</span>
        </button>

        {/* User Account - Touch-optimized */}
        <div className="relative">
          <button
            onClick={onShowUserMenu}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] p-2 hover:bg-gray-50 rounded-md transition-all duration-150 cursor-pointer active:scale-95 select-none"
            type="button"
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}