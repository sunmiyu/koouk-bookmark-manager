'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, User, Settings, LogOut, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import FolderWorkspace from './FolderWorkspace'
import SharePlace from './SharePlace'
import SearchInterface from './SearchInterface'

export default function MainWorkspace() {
  const [activeTab, setActiveTab] = useState<'my-folder' | 'share-place'>('my-folder')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
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
                <img 
                  src="/koouk-logo.svg" 
                  alt="KOOUK" 
                  className="h-6 w-auto"
                />
              </div>

              {/* Right side elements */}
              <div className="flex items-center gap-3">
                {/* Enhanced Search Interface */}
                <SearchInterface
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchScope={activeTab === 'my-folder' ? 'my-folder' : 'market-place'}
                  placeholder="Search..."
                  language="ko"
                />

                {/* Feedback Button */}
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>Feedback</span>
                </button>

                {/* User Account */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
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
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-black">{user?.user_metadata?.name || 'User'}</div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                      </div>
                      
                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
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
                className={`flex-1 py-4 px-8 border-b-2 font-medium text-sm text-center transition-colors ${
                  activeTab === 'my-folder'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Folder
              </button>
              <button
                onClick={() => setActiveTab('share-place')}
                className={`flex-1 py-4 px-8 border-b-2 font-medium text-sm text-center transition-colors ${
                  activeTab === 'share-place'
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
          <FolderWorkspace searchQuery={searchQuery} />
        ) : (
          <SharePlace searchQuery={searchQuery} />
        )}
      </main>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
}