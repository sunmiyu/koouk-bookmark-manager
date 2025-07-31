'use client'

import { useState, useEffect } from 'react'
import WeatherOnly from '@/components/WeatherOnly'
import TimeDisplay from '@/components/TimeDisplay'
import FeedbackBoard from '@/components/FeedbackBoard'
import InfoInputSection from '@/components/InfoInputSection'
import TodoSection from '@/components/TodoSection'
import LinkSection from '@/components/LinkSection'
import VideoSection from '@/components/VideoSection'
import ImageSection from '@/components/ImageSection'
import NotesSection from '@/components/NotesSection'
import AuthButton from '@/components/AuthButton'
import KooukLogo from '@/components/KooukLogo'
import SearchBar from '@/components/SearchBar'
import Link from 'next/link'
import { ContentProvider } from '@/contexts/ContentContext'
import MiniFunctionsArea from '@/components/MiniFunctionsArea'
import SplashScreen from '@/components/SplashScreen'

type TabType = 'summary' | 'today' | 'dashboard' | 'contents' | 'popular'

function HomeContent() {
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  const [isLoading, setIsLoading] = useState(true)

  // Simulate app initialization
  useEffect(() => {
    const initializeApp = async () => {
      // Simulate loading time for demo
      await new Promise(resolve => setTimeout(resolve, 500))
      // Here you would typically load:
      // - User authentication
      // - User preferences
      // - Initial data
      // - etc.
    }
    
    initializeApp()
  }, [])

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen onComplete={() => setIsLoading(false)} />
  }

  return (
    <ContentProvider>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto py-4 max-w-md px-4">
          <header className="mb-12">
            {/* Professional Header Container */}
            <div className="bg-black rounded-xl p-6">
              <div className="flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center">
                  <KooukLogo />
                </div>
                
                {/* Right: Weather, Time & Account */}
                <div className="flex items-center gap-3">
                  {/* Weather & Time */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-black rounded-lg">
                      <WeatherOnly />
                    </div>
                    <div className="w-px h-6 bg-gray-700"></div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-lg">
                      <TimeDisplay />
                    </div>
                  </div>
                  <AuthButton />
                </div>
              </div>
            </div>
          </header>

          {/* Professional Tab Navigation */}
          <div className="mb-12 mt-6">
            <div className="">
              <nav className="-mb-px flex items-center space-x-12" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`py-4 px-1 border-b-2 font-medium text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'summary'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    Summary
                  </div>
                </button>
                <div className="w-px h-6 bg-gray-600"></div>
                <button
                  onClick={() => setActiveTab('today')}
                  className={`py-4 px-1 border-b-2 font-medium text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'today'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    Today
                  </div>
                </button>
                <div className="w-px h-6 bg-gray-600"></div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-4 px-1 border-b-2 font-medium text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    Mini
                  </div>
                </button>
                <div className="w-px h-6 bg-gray-600"></div>
                <button
                  onClick={() => setActiveTab('contents')}
                  className={`py-4 px-1 border-b-2 font-medium text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'contents'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    Storage
                  </div>
                </button>
                <div className="w-px h-6 bg-gray-600"></div>
                <button
                  onClick={() => setActiveTab('popular')}
                  className={`py-4 px-1 border-b-2 font-medium text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'popular'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    AI Link
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <main>
            {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* Stats Overview - Table Style */}
                <div className="bg-black rounded-xl p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white">Dashboard Summary</h2>
                    <p className="text-sm text-gray-400">Your productivity overview</p>
                  </div>
                  
                  {/* Stats Grid - 2x2 */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">12</div>
                      <div className="text-sm text-gray-300">Total Todos</div>
                      <div className="text-xs text-gray-500">3 completed today</div>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">6</div>
                      <div className="text-sm text-gray-300">Mini Functions</div>
                      <div className="text-xs text-gray-500">Active tools</div>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">24</div>
                      <div className="text-sm text-gray-300">Content Items</div>
                      <div className="text-xs text-gray-500">Links, videos, notes</div>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">18</div>
                      <div className="text-sm text-gray-300">This Week</div>
                      <div className="text-xs text-gray-500">Actions completed</div>
                    </div>
                  </div>
                </div>

                {/* Activity Table */}
                <div className="bg-black rounded-xl p-6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-white">Recent Activity</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-white">Todo completed</span>
                      </div>
                      <span className="text-xs text-gray-400">2h ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-sm text-white">Link added</span>
                      </div>
                      <span className="text-xs text-gray-400">4h ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-sm text-white">Music updated</span>
                      </div>
                      <span className="text-xs text-gray-400">6h ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-sm text-white">Expense logged</span>
                      </div>
                      <span className="text-xs text-gray-400">1d ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-sm text-white">Video saved</span>
                      </div>
                      <span className="text-xs text-gray-400">1d ago</span>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="bg-black rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">System Status</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-gray-300">All systems operational</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Last sync</div>
                      <div className="text-sm text-white">2 min ago</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'today' && (
              <div className="space-y-8">
                {/* Today's Todos Section - Mobile Optimized */}
                <TodoSection />
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Mini Functions Section - Mobile Optimized */}
                <div className="bg-black rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-white">Mini Functions</h2>
                        <p className="text-sm text-gray-400">Quick access to your active tools</p>
                      </div>
                      <button 
                        className="text-gray-400 hover:text-white transition-all cursor-pointer"
                        onClick={() => {/* Navigate to full mini functions page */}}
                        title="Mini Functions 관리"
                      >
                        ⚙️
                      </button>
                    </div>
                  </div>
                  
                  {/* Active Functions Grid - 2x2 for Mobile */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Weather */}
                    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🌤️</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm">Weather</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">Seoul, KR</div>
                      <div className="text-lg font-bold text-white">22°C</div>
                      <div className="text-xs text-gray-400">Partly Cloudy</div>
                    </div>
                    
                    {/* Time */}
                    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">⏰</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm">Time</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white">3:45 PM</div>
                      <div className="text-xs text-gray-400">Thursday, Jan 31</div>
                    </div>
                    
                    {/* Music */}
                    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🎵</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm">Music</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-1">Now Playing</div>
                      <div className="text-sm font-medium text-white truncate">Chill Jazz Playlist</div>
                      <div className="text-xs text-gray-400">3 recommendations</div>
                    </div>
                    
                    {/* News */}
                    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">📰</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm">News</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-1">Headlines</div>
                      <div className="text-sm font-medium text-white">5 new articles</div>
                      <div className="text-xs text-gray-400">Updated 10 min ago</div>
                    </div>
                    
                    {/* Expense Tracker */}
                    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">💰</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm">Expense</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-1">Today</div>
                      <div className="text-sm font-medium text-white">₩34,500</div>
                      <div className="text-xs text-gray-400">5 transactions</div>
                    </div>
                    
                    {/* Stocks */}
                    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">📈</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm">Stocks</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-1">KOSPI</div>
                      <div className="text-sm font-medium text-green-400">+1.2%</div>
                      <div className="text-xs text-gray-400">Market open</div>
                    </div>
                  </div>
                  
                  {/* View All Functions Button */}
                  <button 
                    className="w-full flex items-center justify-center gap-2 p-3 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg transition-colors border border-gray-700/50"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="font-medium text-gray-300">Manage All Functions</span>
                  </button>
                </div>

                {/* Function Stats */}
                <div className="bg-black rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Function Stats</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-white font-medium">6</span>
                          <span className="text-gray-400">active</span>
                        </div>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-white font-medium">12</span>
                          <span className="text-gray-400">available</span>
                        </div>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-white font-medium">24</span>
                          <span className="text-gray-400">updates</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/10 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs font-medium">Running</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contents' && (
              <div className="space-y-6">
                {/* Add Content Section */}
                <div className="bg-black rounded-xl p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white">Add Content</h2>
                    <p className="text-sm text-gray-400">Save links, notes, videos, and images</p>
                  </div>
                  <InfoInputSection />
                </div>
                
                {/* Storage Overview */}
                <div className="bg-black rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Storage</h2>
                      <p className="text-sm text-gray-400">Your saved content</p>
                    </div>
                    <SearchBar />
                  </div>
                  
                  {/* Storage Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-blue-400 mb-1">8</div>
                      <div className="text-sm text-gray-300">Links</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-green-400 mb-1">5</div>
                      <div className="text-sm text-gray-300">Videos</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-purple-400 mb-1">12</div>
                      <div className="text-sm text-gray-300">Notes</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-yellow-400 mb-1">7</div>
                      <div className="text-sm text-gray-300">Images</div>
                    </div>
                  </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-4">
                  <LinkSection />
                  <VideoSection />
                  <NotesSection />
                  <ImageSection />
                </div>
              </div>
            )}

            {activeTab === 'popular' && (
              <div className="space-y-6">
                {/* AI Tools Overview */}
                <div className="bg-black rounded-xl p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white">AI Tools</h2>
                    <p className="text-sm text-gray-400">Curated collection of useful AI tools</p>
                  </div>
                  
                  {/* Category Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-blue-400 mb-1">8</div>
                      <div className="text-sm text-gray-300">Writing</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-green-400 mb-1">6</div>
                      <div className="text-sm text-gray-300">Design</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-purple-400 mb-1">5</div>
                      <div className="text-sm text-gray-300">Code</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-yellow-400 mb-1">4</div>
                      <div className="text-sm text-gray-300">Productivity</div>
                    </div>
                  </div>
                </div>

                {/* Writing Tools */}
                <div className="bg-black rounded-xl p-6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-white">✍️ Writing & Content</h3>
                  </div>
                  <div className="space-y-3">
                    <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">ChatGPT</div>
                        <div className="text-xs text-gray-400">Conversational AI assistant</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Claude</div>
                        <div className="text-xs text-gray-400">AI assistant by Anthropic</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.notion.so/product/ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Notion AI</div>
                        <div className="text-xs text-gray-400">AI-powered writing assistant</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                  </div>
                </div>

                {/* Design Tools */}
                <div className="bg-black rounded-xl p-6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-white">🎨 Design & Creative</h3>
                  </div>
                  <div className="space-y-3">
                    <a href="https://www.midjourney.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Midjourney</div>
                        <div className="text-xs text-gray-400">AI image generation</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.canva.com/ai-image-generator/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Canva AI</div>
                        <div className="text-xs text-gray-400">Design with AI assistance</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.figma.com/ai/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Figma AI</div>
                        <div className="text-xs text-gray-400">AI-powered design tools</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                  </div>
                </div>

                {/* Code Tools */}
                <div className="bg-black rounded-xl p-6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-white">💻 Development & Code</h3>
                  </div>
                  <div className="space-y-3">
                    <a href="https://github.com/features/copilot" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">GitHub Copilot</div>
                        <div className="text-xs text-gray-400">AI pair programmer</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.cursor.sh" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Cursor</div>
                        <div className="text-xs text-gray-400">AI-powered code editor</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://v0.dev" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">v0 by Vercel</div>
                        <div className="text-xs text-gray-400">Generate UI with AI</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                  </div>
                </div>

                {/* Productivity Tools */}
                <div className="bg-black rounded-xl p-6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-white">⚡ Productivity & Business</h3>
                  </div>
                  <div className="space-y-3">
                    <a href="https://www.perplexity.ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Perplexity</div>
                        <div className="text-xs text-gray-400">AI-powered search engine</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://gamma.app" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Gamma</div>
                        <div className="text-xs text-gray-400">AI presentation maker</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.otter.ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Otter.ai</div>
                        <div className="text-xs text-gray-400">AI meeting transcription</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </main>

          <footer className="mt-16">
            {/* Professional Footer Container */}
            <div className="bg-black rounded-xl p-6">
              <div className="flex flex-col items-center justify-between gap-3">
                {/* Mobile stacked layout */}
                <div className="flex flex-col items-center gap-3 w-full">
                  {/* Logo & Copyright */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-400 font-medium whitespace-nowrap">Koouk Dashboard © 2025</span>
                  </div>
                  
                  {/* Navigation Links */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="w-px h-4 bg-gray-700"></div>
                    <Link 
                      href="/privacy-policy" 
                      className="text-gray-400 hover:text-white transition-colors font-medium whitespace-nowrap"
                    >
                      Privacy Policy
                    </Link>
                    <div className="w-px h-4 bg-gray-700"></div>
                    <FeedbackBoard />
                    <div className="w-px h-4 bg-gray-700"></div>
                    <span className="text-gray-400 font-medium whitespace-nowrap">
                      Your Daily Hub
                    </span>
                  </div>
                </div>
                
                {/* Status Indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/10 rounded-lg flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium whitespace-nowrap">All Systems Operational</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ContentProvider>
  )
}

export default function Home() {
  return <HomeContent />
}
