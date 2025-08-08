'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import FolderWorkspace from './FolderWorkspace'
import SharePlace from './SharePlace'

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
    <div className="min-h-screen bg-white">
      {/* Vercel-style Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
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

            {/* Search Bar - Vercel style */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* User Account - Vercel style */}
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
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('my-folder')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'my-folder'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Folder
            </button>
            <button
              onClick={() => setActiveTab('share-place')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'share-place'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Market Place
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-8">
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