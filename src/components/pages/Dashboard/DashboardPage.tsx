'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useUserProfile } from '@/hooks/useUserProfile'
import ContentCard, { ContentGrid } from '@/components/ui/ContentCard'
import SearchHeader from '@/components/ui/SearchHeader'
import { motion } from 'framer-motion'

interface DashboardStats {
  myFolders: number
  bookmarks: number
  sharedFolders: number
  receivedFolders: number
}

interface RecentActivity {
  id: string
  type: 'folder' | 'bookmark' | 'share'
  title: string
  timestamp: string
  color: string
}

export default function DashboardPage({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user } = useAuth() // 인증만
  const { profile: userProfile } = useUserProfile(user?.id) // 프로필 분리
  const [stats, setStats] = useState<DashboardStats>({
    myFolders: 0,
    bookmarks: 0,
    sharedFolders: 0,
    receivedFolders: 0
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

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

        // Mock recent activity
        setRecentActivity([
          {
            id: '1',
            type: 'folder',
            title: 'Created "Design Resources" folder',
            timestamp: '2 hours ago',
            color: 'text-gray-600'
          },
          {
            id: '2', 
            type: 'bookmark',
            title: 'Bookmarked "React Best Practices"',
            timestamp: '5 hours ago',
            color: 'text-gray-600'
          },
          {
            id: '3',
            type: 'share',
            title: 'Shared folder with community',
            timestamp: '1 day ago',
            color: 'text-gray-600'
          }
        ])
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
      description: "Personal collections",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700",
      trend: "+12% this week",
      onClick: () => onNavigate('my-folder'),
      icon: "📁"
    },
    {
      title: "Bookmarks", 
      count: stats.bookmarks,
      description: "Saved websites",
      color: "bg-green-50 border-green-200 hover:bg-green-100 text-green-700",
      trend: "+8% this week",
      onClick: () => onNavigate('bookmarks'),
      icon: "🔖"
    },
    {
      title: "Shared",
      count: stats.sharedFolders,
      description: "Folders you shared",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700",
      trend: "+23% this week",
      onClick: () => onNavigate('marketplace'),
      icon: "🚀"
    },
    {
      title: "Received",
      count: stats.receivedFolders,
      description: "From community",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700",
      trend: "+15% this week",
      onClick: () => onNavigate('marketplace'),
      icon: "🎁"
    }
  ]

  const quickActions = [
    {
      title: "Create New Folder",
      description: "Start organizing your content",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      action: () => onNavigate('my-folder'),
      icon: "➕"
    },
    {
      title: "Add Bookmark",
      description: "Save a website for later",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      action: () => onNavigate('bookmarks'),
      icon: "🔗"
    },
    {
      title: "Explore Market",
      description: "Discover community content",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      action: () => onNavigate('marketplace'),
      icon: "🌆"
    }
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* 🎨 PERFECTION: Enhanced header with proper hierarchy */}
      <SearchHeader 
        title="Dashboard"
        searchPlaceholder="Search your content..."
        showViewToggle={false}
        actionButton={{
          label: "Quick Add",
          onClick: () => onNavigate('my-folder'),
          icon: "➕"
        }}
      />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, {userProfile?.name || user?.email?.split('@')[0]}! 👋
                </h1>
                <p className="text-base text-gray-600">
                  Here's what's happening with your digital organization
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2 bg-white rounded-full px-4 py-2">
                <span className="text-sm font-medium text-gray-700">
                  {userProfile?.user_plan?.toUpperCase() || 'FREE'} Plan
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 🎨 PERFECTION: Enhanced stats cards with proper content design */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ContentGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((card, index) => (
              <motion.div
                key={index}
                onClick={card.onClick}
                className={`${card.color.replace('text-', 'text-')} rounded-2xl p-6 border-2 cursor-pointer hover:shadow-xl transition-all duration-300 group bg-white`}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl">
                    {card.icon}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {card.count}
                  </span>
                </div>
                
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {card.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3">
                  {card.description}
                </p>

                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500 font-medium">
                    {card.trend}
                  </span>
                </div>
              </motion.div>
            ))}
          </ContentGrid>
        </motion.div>

        <motion.div 
          className="grid lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* 🎨 PERFECTION: Enhanced Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    onClick={action.action}
                    className={`${action.color} rounded-xl p-6 border-2 text-left hover:shadow-lg transition-all duration-300 group`}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="mb-4 w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center text-2xl">
                      {action.icon}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* 🎨 PERFECTION: Enhanced Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <span className="text-2xl">🕒</span>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div 
                  key={activity.id} 
                  className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-sm flex-shrink-0">
                    {activity.type === 'folder' && '📁'}
                    {activity.type === 'bookmark' && '🔖'}
                    {activity.type === 'share' && '🚀'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="w-full mt-4 text-sm text-gray-600 hover:text-gray-700 font-medium">
              View all activity
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}