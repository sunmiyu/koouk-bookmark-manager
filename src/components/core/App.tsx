'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, LogOut, MessageCircle } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '@/lib/supabase'
import WorkspaceContent from '../workspace/WorkspaceContent'
import MarketPlace from '../workspace/MarketPlace'
import SearchInterface from '../ui/SearchInterface'
import FeedbackModal from '../modals/FeedbackModal'

export default function App() {
  const [activeTab, setActiveTab] = useState<'my-folder' | 'marketplace'>('my-folder')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const { user } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setShowUserMenu(false)
  }

  return (
    <div className="min-h-screen bg-white px-4">
      {/* Vercel-style Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="w-full bg-white">
          <div className="max-w-6xl mx-auto px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <button 
                  onClick={() => setActiveTab('my-folder')}
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/koouk-logo.svg" 
                    alt="KOOUK" 
                    className="h-6 w-auto"
                  />
                </button>
              </div>

              {/* Right side elements */}
              <div className="flex items-center gap-3">
                {/* Enhanced Search Interface */}
                <SearchInterface
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchScope={activeTab === 'my-folder' ? 'my-folder' : 'marketplace'}
                  placeholder="Search..."
                  language="ko"
                />

                {/* Feedback Button */}
                <button 
                  onClick={() => setShowFeedbackModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Feedback</span>
                </button>

                {/* User Account */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 p-1.5 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-medium">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                    >
                      <div className="px-3 py-2 border-b border-gray-100">
                        <div className="text-xs font-medium text-black">{user?.email?.split('@')[0] || 'User'}</div>
                        <div className="text-[10px] text-gray-500">{user?.email}</div>
                      </div>
                      
                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Settings
                      </button>
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="w-full bg-white">
          <div className="max-w-6xl mx-auto px-8">
            <div className="flex w-full">
              <button
                onClick={() => setActiveTab('my-folder')}
                className={`flex-1 py-3 px-6 border-b-2 font-medium text-xs text-center transition-colors ${
                  activeTab === 'my-folder'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Folder
              </button>
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`flex-1 py-3 px-6 border-b-2 font-medium text-xs text-center transition-colors ${
                  activeTab === 'marketplace'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Market Place
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 pt-16 pb-8">
        {activeTab === 'my-folder' ? (
          <WorkspaceContent searchQuery={searchQuery} />
        ) : (
          <MarketPlace searchQuery={searchQuery} />
        )}
      </main>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  )
}