'use client'

import { useState, useEffect } from 'react'
import { FolderItem } from '@/types/folder'
// import { SharedFolder } from '@/types/share'
import { motion } from 'framer-motion'
import { Folder, Bookmark, Share2, TrendingUp, Users, Star } from 'lucide-react'

interface DashboardProps {
  onNavigateToSection?: (section: 'my-folder' | 'marketplace' | 'bookmarks') => void
}

export default function Dashboard({ onNavigateToSection }: DashboardProps) {
  const [stats, setStats] = useState({
    myFolders: 0,
    myFiles: 0,
    bookmarks: 0,
    sharedFolders: 0,
    totalMarketplaceFolders: 350
  })

  useEffect(() => {
    const loadStats = () => {
      try {
        // Load My Folders data
        const savedFolders = localStorage.getItem('koouk-folders')
        let myFolders = 0
        let myFiles = 0
        
        if (savedFolders) {
          const folders: FolderItem[] = JSON.parse(savedFolders)
          myFolders = folders.length
          myFiles = folders.reduce((total, folder) => total + folder.children.length, 0)
        }

        // Load Bookmarks data
        const savedBookmarks = localStorage.getItem('koouk-bookmarks')
        const bookmarks = savedBookmarks ? JSON.parse(savedBookmarks).length : 0

        // Load Shared Folders data
        const savedSharedFolders = localStorage.getItem('koouk-shared-folders')
        const sharedFolders = savedSharedFolders ? JSON.parse(savedSharedFolders).length : 0

        setStats({
          myFolders,
          myFiles,
          bookmarks,
          sharedFolders,
          totalMarketplaceFolders: 350 + sharedFolders // Mock total + user's shared
        })
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }

    loadStats()
  }, [])

  const statCards = [
    {
      title: 'My Folders',
      description: `You have ${stats.myFolders} folders, ${stats.myFiles} files`,
      icon: Folder,
      color: 'blue',
      section: 'my-folder' as const,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
    {
      title: 'Bookmarks',
      description: `You have ${stats.bookmarks} bookmarks`,
      icon: Bookmark,
      color: 'green',
      section: 'bookmarks' as const,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-900'
    },
    {
      title: 'Market Place',
      description: `You shared ${stats.sharedFolders} folders, now KOOUK has ${stats.totalMarketplaceFolders} folders to share`,
      icon: Share2,
      color: 'purple',
      section: 'marketplace' as const,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-900'
    }
  ]

  return (
    <div className="flex-1 px-4 py-6 lg:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">K</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome to KOOUK
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Your personal knowledge organization toolkit
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${card.bgColor} rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
              onClick={() => onNavigateToSection?.(card.section)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${card.textColor} mb-1`}>
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-500">
                <span>Click to explore →</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 rounded-xl p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigateToSection?.('my-folder')}
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all text-left"
            >
              <Folder className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-sm text-gray-900">Create Folder</div>
                <div className="text-xs text-gray-500">Start organizing</div>
              </div>
            </button>
            <button
              onClick={() => onNavigateToSection?.('marketplace')}
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all text-left"
            >
              <Share2 className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-sm text-gray-900">Explore Market</div>
                <div className="text-xs text-gray-500">Find collections</div>
              </div>
            </button>
            <button
              onClick={() => onNavigateToSection?.('bookmarks')}
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all text-left"
            >
              <Bookmark className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-sm text-gray-900">View Bookmarks</div>
                <div className="text-xs text-gray-500">Quick access</div>
              </div>
            </button>
            <button className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all text-left">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-medium text-sm text-gray-900">Community</div>
                <div className="text-xs text-gray-500">Join discussions</div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-gray-500"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-4 h-4 fill-current text-yellow-400" />
            <span className="text-sm">Welcome to your knowledge workspace</span>
          </div>
          <p className="text-xs">
            Start by creating your first folder or explore what others have shared
          </p>
        </motion.div>
      </div>
    </div>
  )
}