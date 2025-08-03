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
import MiniFunctionsAccordion from '@/components/MiniFunctionsAccordion'
import Link from 'next/link'
import { ContentProvider } from '@/contexts/ContentContext'
import SplashScreen from '@/components/SplashScreen'
import { TodayTodosProvider } from '@/contexts/TodayTodosContext'
import TodayTodoCard from '@/components/TodayTodoCard'
import TemperatureGraph from '@/components/TemperatureGraph'
import { useWeatherData } from '@/hooks/useWeatherData'
// import { useMiniFunctions } from '@/contexts/MiniFunctionsContext'
// import { useUserPlan } from '@/contexts/UserPlanContext'
import { useSearch } from '@/contexts/SearchContext'
import { useLanguage } from '@/contexts/LanguageContext'

type TabType = 'summary' | 'today' | 'dashboard' | 'contents' | 'popular'

function HomeContent() {
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  const [isLoading, setIsLoading] = useState(false)
  const { weatherData } = useWeatherData()
  // const { availableFunctions, enabledFunctions } = useMiniFunctions()
  // const { currentPlan } = useUserPlan()
  const { searchResults } = useSearch()
  const { t } = useLanguage()

  // Handle URL parameters and splash screen logic
  useEffect(() => {
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab') as TabType
    if (tabParam && ['summary', 'today', 'dashboard', 'contents', 'popular'].includes(tabParam)) {
      setActiveTab(tabParam)
      // Clean up URL parameter after setting the tab
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }

    // Check if splash has been shown in this session or if coming from internal navigation
    const hasShownSplash = sessionStorage.getItem('splashShown')
    const isInternalNavigation = tabParam === 'dashboard' // Coming back from mini-functions
    
    if (!hasShownSplash && !isInternalNavigation) {
      setIsLoading(true)
      const initializeApp = async () => {
        // Simulate loading time for demo
        await new Promise(resolve => setTimeout(resolve, 500))
        sessionStorage.setItem('splashShown', 'true')
        setIsLoading(false)
      }
      initializeApp()
    }
  }, [])

  // Show splash screen while loading (only on first visit)
  if (isLoading) {
    return <SplashScreen onComplete={() => setIsLoading(false)} />
  }

  return (
    <TodayTodosProvider>
      <ContentProvider>
        <div className="min-h-screen bg-black text-white">
        <div className="w-full mx-auto py-2 sm:py-4 px-4 sm:px-6">
          <header className="mb-8 sm:mb-12 lg:mb-16">
            {/* Professional Header Container */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-800/50">
              <div className="flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center">
                  <KooukLogo />
                </div>
                
                {/* Right: Weather, Time & Account - Responsive Stack */}
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  {/* Weather & Time - Hide on very small screens, show abbreviated */}
                  <div className="hidden xs:flex items-center gap-2 sm:gap-3 lg:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700/30">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.005 4.005 0 003 15z" />
                      </svg>
                      <WeatherOnly />
                    </div>
                    <div className="w-px h-6 sm:h-8 bg-gray-600 hidden sm:block"></div>
                    <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700/30">
                      <TimeDisplay />
                    </div>
                  </div>
                  
                  {/* Language Switcher & Auth - Always visible */}
                  <LanguageSwitcher compact={true} className="mr-1 sm:mr-2 lg:mr-3" />
                  <AuthButton />
                </div>
              </div>
              
              {/* Mobile Weather & Time Row - Show on very small screens */}
              <div className="xs:hidden mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.005 4.005 0 003 15z" />
                  </svg>
                  <WeatherOnly />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <TimeDisplay />
                </div>
              </div>
            </div>
          </header>

          {/* Search Bar */}
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <SearchBar compactMode={true} className="max-w-full pl-10 sm:pl-12" />
            </div>
          </div>

          {/* Search Results or Tab Content */}
          {searchResults ? (
            <div className="mb-8">
              <SearchResults />
            </div>
          ) : (
            <>
              {/* Enhanced Tab Navigation with Icons */}
              <div className="mb-8 sm:mb-12 lg:mb-16 mt-6 sm:mt-8">
            <div className="bg-gray-900/30 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border border-gray-800/50">
              <nav className="flex items-center justify-between" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'summary'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="hidden xs:inline">{t('summary')}</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('today')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'today'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="hidden xs:inline">{t('todos')}</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="hidden xs:inline">{t('dashboard')}</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('contents')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'contents'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="hidden xs:inline">{t('contents')}</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('popular')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'popular'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span className="hidden xs:inline">{t('popular')}</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <main>
            {activeTab === 'summary' && (
              <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12">
                {/* Temperature Trend Section */}
                <div className="mb-4">
                  <TemperatureGraph />
                </div>

                {/* Today's Focus Section */}
                <div className="mb-4">
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-800/50">
                    <div className="mb-6 sm:mb-8">
                      <h2 className="text-base sm:text-lg font-semibold text-white mb-2">
                        Today&apos;s ({new Date().getMonth() + 1}/{new Date().getDate()} {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]})
                      </h2>
                    </div>
                    
                    {/* Today's Todo Card - Synchronized */}
                    <TodayTodoCard />
                  </div>
                </div>

                {/* Recent Activity Section */}
                <div className="mb-4">
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-800/50">
                    <div className="mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Recent Activity</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
                        <span className="text-base font-medium text-white">Todo completed</span>
                        <span className="text-sm text-gray-400 font-medium">2h ago</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
                        <span className="text-base font-medium text-white">Link added</span>
                        <span className="text-sm text-gray-400 font-medium">4h ago</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
                        <span className="text-base font-medium text-white">Music updated</span>
                        <span className="text-sm text-gray-400 font-medium">6h ago</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
                        <span className="text-base font-medium text-white">Expense logged</span>
                        <span className="text-sm text-gray-400 font-medium">1d ago</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-3">
                        <span className="text-base font-medium text-white">Video saved</span>
                        <span className="text-sm text-gray-400 font-medium">1d ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Stats Section */}
                <div className="mb-4">
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-800/50">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Dashboard Stats</h3>
                      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
                          <span className="text-white font-bold text-sm sm:text-base">12</span>
                          <span className="text-gray-300 text-xs sm:text-sm">todos</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 bg-purple-400 rounded-full"></div>
                          <span className="text-white font-bold text-sm sm:text-base">6</span>
                          <span className="text-gray-300 text-xs sm:text-sm">functions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                          <span className="text-white font-bold text-sm sm:text-base">24</span>
                          <span className="text-gray-300 text-xs sm:text-sm">items</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                          <span className="text-white font-bold text-sm sm:text-base">18</span>
                          <span className="text-gray-300 text-xs sm:text-sm">weekly</span>
                        </div>
                      </div>
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
              <MiniFunctionsAccordion />
            )}

            {activeTab === 'contents' && (
              <div className="space-y-6">
                {/* Add Content Section */}
                <div className="bg-black rounded-xl p-6">
                  <InfoInputSection />
                </div>
                
                {/* Storage Overview */}
                <div className="bg-black rounded-xl p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white">Storage</h2>
                  </div>
                  
                  {/* Storage Stats */}
                  <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 text-center">
                      <div className="text-lg sm:text-xl font-bold text-blue-400 mb-1">8</div>
                      <div className="text-xs sm:text-sm text-gray-300">Links</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 text-center">
                      <div className="text-lg sm:text-xl font-bold text-green-400 mb-1">5</div>
                      <div className="text-xs sm:text-sm text-gray-300">Videos</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 text-center">
                      <div className="text-lg sm:text-xl font-bold text-purple-400 mb-1">12</div>
                      <div className="text-xs sm:text-sm text-gray-300">Notes</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 text-center">
                      <div className="text-lg sm:text-xl font-bold text-yellow-400 mb-1">7</div>
                      <div className="text-xs sm:text-sm text-gray-300">Images</div>
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
                  </div>
                  
                  {/* Category Stats */}
                  <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6">
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
                    <a href="https://www.grammarly.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Grammarly</div>
                        <div className="text-xs text-gray-400">AI writing assistant & grammar checker</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.copy.ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Copy.ai</div>
                        <div className="text-xs text-gray-400">AI copywriting & content generator</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.jasper.ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Jasper</div>
                        <div className="text-xs text-gray-400">AI content marketing platform</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://quillbot.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">QuillBot</div>
                        <div className="text-xs text-gray-400">AI paraphrasing & writing tool</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                  </div>
                </div>

                {/* Design Tools */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50">
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎨</span>
                      <h3 className="text-base font-semibold text-white">Design & Creative</h3>
                    </div>
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
                    <a href="https://openai.com/dall-e-2" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">DALL-E 2</div>
                        <div className="text-xs text-gray-400">AI image generation by OpenAI</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://stability.ai/stable-diffusion" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Stable Diffusion</div>
                        <div className="text-xs text-gray-400">Open-source AI art generator</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.adobe.com/kr/products/firefly.html" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Adobe Firefly</div>
                        <div className="text-xs text-gray-400">Adobe&apos;s generative AI</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://leonardo.ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Leonardo.ai</div>
                        <div className="text-xs text-gray-400">AI image & video generation</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://runwayml.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Runway</div>
                        <div className="text-xs text-gray-400">AI video generation & editing</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                  </div>
                </div>

                {/* Code Tools */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50">
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💻</span>
                      <h3 className="text-base font-semibold text-white">Development & Code</h3>
                    </div>
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
                    <a href="https://codeium.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Codeium</div>
                        <div className="text-xs text-gray-400">Free AI code completion</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://tabnine.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Tabnine</div>
                        <div className="text-xs text-gray-400">AI code assistant</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://replit.com/ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Replit AI</div>
                        <div className="text-xs text-gray-400">AI-powered coding environment</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.sourcegraph.com/cody" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Sourcegraph Cody</div>
                        <div className="text-xs text-gray-400">AI coding assistant</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                  </div>
                </div>

                {/* Productivity Tools */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50">
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚡</span>
                      <h3 className="text-base font-semibold text-white">Productivity & Business</h3>
                    </div>
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
                    <a href="https://zapier.com/ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Zapier AI</div>
                        <div className="text-xs text-gray-400">AI automation & workflows</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://monday.com/ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Monday.com AI</div>
                        <div className="text-xs text-gray-400">AI project management</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.microsoft.com/en-us/microsoft-365/copilot" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Microsoft Copilot</div>
                        <div className="text-xs text-gray-400">AI assistant for Office 365</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.salesforce.com/products/einstein/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Salesforce Einstein</div>
                        <div className="text-xs text-gray-400">AI for CRM & sales</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.loom.com/ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Loom AI</div>
                        <div className="text-xs text-gray-400">AI-powered video messaging</div>
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
