'use client'


import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthContext'
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
    <div className="flex items-center justify-between h-12 min-h-[48px] px-3 bg-white border-b border-gray-200">
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

      {/* Right side elements - Compact for mobile */}
      <div className="flex items-center gap-2">
        {/* Enhanced Search Interface - Always show */}
        <SearchInterface
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchScope={activeTab === 'my-folder' ? 'my-folder' : activeTab === 'marketplace' ? 'market-place' : 'bookmarks'}
          placeholder="Search..."
          language="en"
        />

        {/* Feedback Button - Match PC style exactly */}
        <button 
          onClick={onShowFeedbackModal}
          className="flex items-center justify-center w-8 h-8 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-150 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:w-auto sm:h-auto active:scale-95 select-none"
          title="Feedback"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Feedback</span>
        </button>

        {/* User Account - Mobile Implementation */}
        <div className="relative">
          <button
            onClick={onShowUserMenu}
            className="flex items-center gap-1 p-1 hover:bg-gray-50 rounded-md transition-all duration-150 cursor-pointer active:scale-95 select-none"
            type="button"
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-medium">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}