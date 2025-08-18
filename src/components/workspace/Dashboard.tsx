'use client'

import { useState, useEffect } from 'react'
import { FolderItem } from '@/types/folder'
// import { SharedFolder } from '@/types/share'
import { motion } from 'framer-motion'
import { Folder, Bookmark, Share2, Star } from 'lucide-react'

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
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 lg:mb-12"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-2xl font-bold">K</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Welcome to KOOUK
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Your personal knowledge organization toolkit
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12 lg:mb-16">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${card.bgColor} rounded-xl p-3 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
              onClick={() => onNavigateToSection?.(card.section)}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`w-8 h-8 sm:w-12 sm:h-12 ${card.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${card.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm sm:text-base font-semibold ${card.textColor} mb-0.5 sm:mb-1`}>
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:mt-4 flex items-center text-xs text-gray-500">
                <span>Click to explore →</span>
              </div>
            </motion.div>
          ))}
        </div>


        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-500"
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