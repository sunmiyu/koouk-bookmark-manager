'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthContext'
import { Folder, Bookmark, Share, Download, TrendingUp, Clock, Star, Users, Store } from 'lucide-react'

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
  icon: React.ReactNode
  color: string
}

export default function DashboardPage({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user, userProfile } = useAuth()
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
            icon: <Folder className="w-4 h-4" />,
            color: 'text-gray-600'
          },
          {
            id: '2', 
            type: 'bookmark',
            title: 'Bookmarked "React Best Practices"',
            timestamp: '5 hours ago',
            icon: <Bookmark className="w-4 h-4" />,
            color: 'text-gray-600'
          },
          {
            id: '3',
            type: 'share',
            title: 'Shared folder with community',
            timestamp: '1 day ago',
            icon: <Share className="w-4 h-4" />,
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
      icon: <Folder className="w-8 h-8" />,
      description: "Personal collections",
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600",
      trend: "+12% this week",
      trendIcon: <TrendingUp className="w-4 h-4 text-gray-500" />,
      onClick: () => onNavigate('my-folder')
    },
    {
      title: "Bookmarks", 
      count: stats.bookmarks,
      icon: <Bookmark className="w-8 h-8" />,
      description: "Saved websites",
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600",
      trend: "+8% this week",
      trendIcon: <TrendingUp className="w-4 h-4 text-gray-500" />,
      onClick: () => onNavigate('bookmarks')
    },
    {
      title: "Shared",
      count: stats.sharedFolders,
      icon: <Share className="w-8 h-8" />,
      description: "Folders you shared",
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600",
      trend: "+23% this week",
      trendIcon: <TrendingUp className="w-4 h-4 text-gray-500" />,
      onClick: () => onNavigate('marketplace')
    },
    {
      title: "Received",
      count: stats.receivedFolders,
      icon: <Download className="w-8 h-8" />,
      description: "From community",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-600",
      trend: "+15% this week",
      trendIcon: <TrendingUp className="w-4 h-4 text-gray-500" />,
      onClick: () => onNavigate('marketplace')
    }
  ]

  const quickActions = [
    {
      title: "Create New Folder",
      description: "Start organizing your content",
      icon: <Folder className="w-6 h-6 text-gray-600" />,
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
      action: () => onNavigate('my-folder')
    },
    {
      title: "Add Bookmark",
      description: "Save a website for later",
      icon: <Bookmark className="w-6 h-6 text-gray-600" />,
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
      action: () => onNavigate('bookmarks')
    },
    {
      title: "Explore Market",
      description: "Discover community content",
      icon: <Store className="w-6 h-6 text-gray-600" />,
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
      action: () => onNavigate('marketplace')
    }
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {userProfile?.name || user?.email?.split('@')[0]}! 👋
                </h1>
                <p className="text-lg text-gray-600">
                  Here&apos;s what&apos;s happening with your digital organization
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2 bg-white rounded-full px-4 py-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-700">
                  {userProfile?.user_plan?.toUpperCase() || 'FREE'} Plan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div
              key={index}
              onClick={card.onClick}
              className={`${card.color.split(' ').slice(0, 3).join(' ')} rounded-2xl p-6 border-2 cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color.split(' ')[3]} group-hover:scale-110 transition-transform duration-200`}>
                  {card.icon}
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {card.count}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {card.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3">
                {card.description}
              </p>

              <div className="flex items-center space-x-1">
                {card.trendIcon}
                <span className="text-xs text-gray-600 font-medium">
                  {card.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                <Users className="w-6 h-6 text-gray-400" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`${action.color} rounded-xl p-4 border-2 text-left hover:shadow-md transform hover:-translate-y-1 transition-all duration-200 group`}
                  >
                    <div className="mb-3 group-hover:scale-110 transition-transform duration-200">
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                  <div className={`${activity.color} p-2 rounded-full bg-opacity-10`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
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