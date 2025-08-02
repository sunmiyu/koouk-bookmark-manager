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
import SearchResults from '@/components/SearchResults'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Link from 'next/link'
import { ContentProvider } from '@/contexts/ContentContext'
import SplashScreen from '@/components/SplashScreen'
import { TodayTodosProvider } from '@/contexts/TodayTodosContext'
import TodayTodoCard from '@/components/TodayTodoCard'
import TemperatureGraph from '@/components/TemperatureGraph'
import { useWeatherData } from '@/hooks/useWeatherData'
import { useMiniFunctions } from '@/contexts/MiniFunctionsContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { useSearch } from '@/contexts/SearchContext'
import { useLanguage } from '@/contexts/LanguageContext'

type TabType = 'summary' | 'today' | 'dashboard' | 'contents' | 'popular'

function HomeContent() {
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  const [isLoading, setIsLoading] = useState(true)
  const { weatherData } = useWeatherData()
  const { availableFunctions, enabledFunctions } = useMiniFunctions()
  const { currentPlan } = useUserPlan()
  const { searchResults } = useSearch()
  const { t } = useLanguage()

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
    <TodayTodosProvider>
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
                  <LanguageSwitcher compact={true} className="mr-3" />
                  <AuthButton />
                </div>
              </div>
            </div>
          </header>

          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar compactMode={true} className="max-w-full" />
          </div>

          {/* Search Results or Tab Content */}
          {searchResults ? (
            <div className="mb-8">
              <SearchResults />
            </div>
          ) : (
            <>
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
                    {t('summary')}
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
                    {t('todos')}
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
                    {t('dashboard')}
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
                    {t('contents')}
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
                    {t('popular')}
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <main>
            {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* Temperature Graph */}
                {weatherData?.hourlyData ? (
                  <TemperatureGraph 
                    hourlyData={weatherData.hourlyData}
                    currentTemp={weatherData.weather.current}
                  />
                ) : (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 w-full">
                    <div className="flex items-center justify-center h-32">
                      <div className="text-gray-400 text-sm">Loading temperature data...</div>
                    </div>
                  </div>
                )}

                {/* Today's Focus from Todos */}
                <div className="bg-black rounded-xl p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white">Today&apos;s Focus</h2>
                    <p className="text-sm text-gray-400">Your most important tasks for today</p>
                  </div>
                  
                  {/* Today's Todo Card - Synchronized */}
                  <TodayTodoCard />
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

                {/* Dashboard Stats */}
                <div className="bg-black rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Dashboard Stats</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-white font-medium">12</span>
                          <span className="text-gray-400">todos</span>
                        </div>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-white font-medium">6</span>
                          <span className="text-gray-400">functions</span>
                        </div>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-white font-medium">24</span>
                          <span className="text-gray-400">items</span>
                        </div>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-white font-medium">18</span>
                          <span className="text-gray-400">weekly</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/10 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs font-medium">Active</span>
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
                      <Link href="/settings/mini-functions">
                        <button 
                          className="text-gray-400 hover:text-white transition-all cursor-pointer"
                          title="Mini Functions 관리"
                        >
                          ⚙️
                        </button>
                      </Link>
                    </div>
                  </div>
                  
                  {availableFunctions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">No Mini Functions Available</h3>
                      <p className="text-gray-400 mb-6">Configure your functions to get started</p>
                    </div>
                  ) : (
                    <>
                      {/* Dynamic Functions Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {availableFunctions.slice(0, 6).map((func) => {
                          const isEnabled = enabledFunctions.some(enabled => enabled.id === func.id)
                          const isPremiumFeature = ['news', 'stocks', 'commute', 'food'].includes(func.type)
                          const needsUpgrade = isPremiumFeature && currentPlan === 'free'
                          
                          return (
                            <div key={func.id} className="relative">
                              <div className={`bg-gray-800/50 rounded-lg p-4 transition-colors ${
                                isEnabled && !needsUpgrade ? 'hover:bg-gray-800/70' : ''
                              }`}>
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    func.type === 'news' ? 'bg-red-600/20' :
                                    func.type === 'music' ? 'bg-green-600/20' :
                                    func.type === 'alarm' ? 'bg-purple-600/20' :
                                    func.type === 'expense' ? 'bg-yellow-600/20' :
                                    func.type === 'diary' ? 'bg-pink-600/20' :
                                    func.type === 'stocks' ? 'bg-indigo-600/20' :
                                    func.type === 'commute' ? 'bg-blue-600/20' :
                                    func.type === 'food' ? 'bg-orange-600/20' :
                                    func.type === 'dday' ? 'bg-teal-600/20' :
                                    'bg-gray-600/20'
                                  }`}>
                                    <span className="text-lg">{func.icon}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-white text-sm">{func.title.replace('Today\'s ', '').replace('Mini ', '')}</div>
                                  </div>
                                </div>
                                
                                {isEnabled && !needsUpgrade ? (
                                  // Show active function content
                                  <>
                                    <div className="text-xs text-gray-400 mb-1">
                                      {func.type === 'news' ? 'Headlines' :
                                       func.type === 'music' ? 'Recommendations' :
                                       func.type === 'alarm' ? 'Next alarm' :
                                       func.type === 'expense' ? 'Today' :
                                       func.type === 'diary' ? 'Recent entry' :
                                       func.type === 'stocks' ? 'KOSPI' :
                                       func.type === 'commute' ? 'Route status' :
                                       func.type === 'food' ? 'Nearby' :
                                       func.type === 'dday' ? 'Countdown' :
                                       'Status'}
                                    </div>
                                    <div className="text-sm font-medium text-white">
                                      {func.type === 'news' ? '5 new articles' :
                                       func.type === 'music' ? 'Chill Jazz Playlist' :
                                       func.type === 'alarm' ? '7:30 AM' :
                                       func.type === 'expense' ? '₩34,500' :
                                       func.type === 'diary' ? 'Good day today...' :
                                       func.type === 'stocks' ? '+1.2%' :
                                       func.type === 'commute' ? '35 min' :
                                       func.type === 'food' ? '12 restaurants' :
                                       func.type === 'dday' ? 'D-156' :
                                       'Active'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {func.type === 'news' ? 'Updated 10 min ago' :
                                       func.type === 'music' ? '3 recommendations' :
                                       func.type === 'alarm' ? 'Tomorrow' :
                                       func.type === 'expense' ? '5 transactions' :
                                       func.type === 'diary' ? '2 hours ago' :
                                       func.type === 'stocks' ? 'Market open' :
                                       func.type === 'commute' ? 'Light traffic' :
                                       func.type === 'food' ? 'Within 1km' :
                                       func.type === 'dday' ? 'New Year 2026' :
                                       'Last updated'}
                                    </div>
                                  </>
                                ) : (
                                  // Show inactive function
                                  <div className="text-xs text-gray-500 mb-1">Inactive</div>
                                )}
                              </div>
                              
                              {/* Premium Overlay */}
                              {needsUpgrade && (
                                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
                                  <div className="text-yellow-400 text-lg mb-1">🔒</div>
                                  <div className="text-xs font-medium text-yellow-400 mb-2">Pro Feature</div>
                                  <Link href="/pricing">
                                    <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-lg font-medium transition-colors">
                                      Upgrade
                                    </button>
                                  </Link>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* View All Functions Button */}
                      <Link href="/settings/mini-functions">
                        <button className="w-full flex items-center justify-center gap-2 p-3 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg transition-colors border border-gray-700/50">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          <span className="font-medium text-gray-300">Manage All Functions</span>
                        </button>
                      </Link>
                    </>
                  )}
                </div>

                {/* Function Stats */}
                <div className="bg-black rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Function Stats</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-white font-medium">{enabledFunctions.length}</span>
                          <span className="text-gray-400">active</span>
                        </div>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-white font-medium">{availableFunctions.length}</span>
                          <span className="text-gray-400">available</span>
                        </div>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-white font-medium">{currentPlan === 'unlimited' ? '∞' : currentPlan === 'pro' ? '4' : '0'}</span>
                          <span className="text-gray-400">limit</span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                      currentPlan === 'unlimited' ? 'bg-purple-600/10' :
                      currentPlan === 'pro' ? 'bg-blue-600/10' :
                      'bg-gray-600/10'
                    }`}>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        currentPlan === 'unlimited' ? 'bg-purple-400' :
                        currentPlan === 'pro' ? 'bg-blue-400' :
                        'bg-gray-400'
                      }`}></div>
                      <span className={`text-xs font-medium capitalize ${
                        currentPlan === 'unlimited' ? 'text-purple-400' :
                        currentPlan === 'pro' ? 'text-blue-400' :
                        'text-gray-400'
                      }`}>{currentPlan}</span>
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
            </>
          )}

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
    </TodayTodosProvider>
  )
}

export default function Home() {
  return <HomeContent />
}
