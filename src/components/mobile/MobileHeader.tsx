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
}

export default function MobileHeader({
  activeTab,
  searchQuery,
  onSearchChange,
  onShowFeedbackModal,
  onShowUserMenu
}: MobileHeaderProps) {
  const { user } = useAuth()

  const handleLogoClick = () => {
    // 로고 클릭 시 My Folder 탭으로 이동하는 로직은 부모 컴포넌트에서 처리
    window.location.href = '/'
  }

  return (
    <div className="flex items-center justify-between h-12 min-h-[48px] px-3 bg-white border-b border-gray-200">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0">
        <button 
          onClick={handleLogoClick}
          className="hover:opacity-80 transition-opacity"
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
        {/* Enhanced Search Interface - Smaller for mobile, hide on dashboard */}
        {activeTab !== 'dashboard' && (
          <SearchInterface
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            searchScope={activeTab === 'my-folder' ? 'my-folder' : activeTab === 'marketplace' ? 'market-place' : 'bookmarks'}
            placeholder="Search..."
            language="en"
          />
        )}

        {/* Feedback Button - Icon only on mobile */}
        <button 
          onClick={onShowFeedbackModal}
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
          title="Feedback"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
        </button>

        {/* User Account - Mobile Implementation */}
        <div className="relative">
          <button
            onClick={onShowUserMenu}
            className="flex items-center gap-1 p-1 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
            type="button"
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