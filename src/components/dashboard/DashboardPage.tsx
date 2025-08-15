'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthContext'
import { Folder, Bookmark, Share, Download } from 'lucide-react'

interface DashboardStats {
  myFolders: number
  bookmarks: number
  sharedFolders: number
  receivedFolders: number
}

export default function DashboardPage({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    myFolders: 0,
    bookmarks: 0,
    sharedFolders: 0,
    receivedFolders: 0
  })

  useEffect(() => {
    // Load actual stats from localStorage and database
    const loadStats = () => {
      try {
        // My Folders count
        const folders = localStorage.getItem('koouk-folders')
        const myFoldersCount = folders ? JSON.parse(folders).length : 0

        // Bookmarks count
        const bookmarks = localStorage.getItem('koouk-bookmarks')
        const bookmarksCount = bookmarks ? JSON.parse(bookmarks).length : 0

        // Shared/Received folders (mock data for now)
        const sharedCount = Math.floor(Math.random() * 5) + 1
        const receivedCount = Math.floor(Math.random() * 8) + 2

        setStats({
          myFolders: myFoldersCount,
          bookmarks: bookmarksCount,
          sharedFolders: sharedCount,
          receivedFolders: receivedCount
        })
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      }
    }

    loadStats()
  }, [])

  const statsCards = [
    {
      title: "My Folders",
      count: stats.myFolders,
      icon: <Folder className="w-8 h-8 text-blue-500" />,
      description: "Personal collections",
      color: "bg-blue-50 border-blue-200",
      onClick: () => onNavigate('my-folder')
    },
    {
      title: "Bookmarks",
      count: stats.bookmarks,
      icon: <Bookmark className="w-8 h-8 text-green-500" />,
      description: "Saved websites",
      color: "bg-green-50 border-green-200",
      onClick: () => onNavigate('bookmarks')
    },
    {
      title: "Shared",
      count: stats.sharedFolders,
      icon: <Share className="w-8 h-8 text-purple-500" />,
      description: "Folders you shared",
      color: "bg-purple-50 border-purple-200",
      onClick: () => onNavigate('marketplace')
    },
    {
      title: "Received",
      count: stats.receivedFolders,
      icon: <Download className="w-8 h-8 text-orange-500" />,
      description: "Folders from community",
      color: "bg-orange-50 border-orange-200",
      onClick: () => onNavigate('marketplace')
    }
  ]



  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div
            key={index}
            onClick={card.onClick}
            className={`${card.color} rounded-2xl p-6 border-2 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              {card.icon}
              <span className="text-3xl font-bold text-gray-900">
                {card.count}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {card.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {card.description}
            </p>
          </div>
        ))}
      </div>


    </div>
  )
}