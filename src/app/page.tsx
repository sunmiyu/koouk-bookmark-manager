'use client'

import { useState, useEffect } from 'react'
// import WeatherOnly from '@/components/WeatherOnly' // 삭제됨
import TimeDisplay from '@/components/TimeDisplay'
import FeedbackBoard from '@/components/FeedbackBoard'
import InfoInputSection from '@/components/InfoInputSection'
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
import { SectionVisibilityProvider } from '@/contexts/SectionVisibilityContext'
import SplashScreen from '@/components/SplashScreen'
import { TodayTodosProvider } from '@/contexts/TodayTodosContext'
import CollapsibleSection from '@/components/CollapsibleSection'
import SectionControls from '@/components/SectionControls'
import EnhancedDailyCards from '@/components/EnhancedDailyCards'
import MainNewsSection from '@/components/MainNewsSection'
import MainMusicSection from '@/components/MainMusicSection'
import MarketOverview from '@/components/MarketOverview'
import AIWorkspaceContent from '@/components/AIWorkspaceContent'
import TemperatureGraph from '@/components/TemperatureGraph'
// import { useWeatherData } from '@/hooks/useWeatherData' // 삭제됨
// import { useUserPlan } from '@/contexts/UserPlanContext'
import { useSearch } from '@/contexts/SearchContext'
import { useLanguage } from '@/contexts/LanguageContext'

type TabType = 'today' | 'function' | 'storage' | 'popular'

function HomeContent() {
  const [activeTab, setActiveTab] = useState<TabType>('today')
  const [isLoading, setIsLoading] = useState(false)
  // const { weatherData } = useWeatherData() // 더 이상 사용하지 않음
  // const { currentPlan } = useUserPlan()
  const { searchResults } = useSearch()
  const { t } = useLanguage()

  // Handle URL parameters and splash screen logic
  useEffect(() => {
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab') as TabType
    if (tabParam && ['today', 'function', 'storage', 'popular'].includes(tabParam)) {
      setActiveTab(tabParam)
      // Clean up URL parameter after setting the tab
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }

    // Check if splash has been shown in this session or if coming from internal navigation
    const hasShownSplash = sessionStorage.getItem('splashShown')
    const isInternalNavigation = tabParam !== null // Coming back from internal navigation
    
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
    <SectionVisibilityProvider>
      <TodayTodosProvider>
        <ContentProvider>
        <div className="min-h-screen bg-black text-white flex justify-center">
        <div className="w-full max-w-[1200px] py-2 sm:py-4 px-4 sm:px-6">
          <header className="mb-8 sm:mb-12 lg:mb-16 relative z-50">
            {/* Professional Header Container */}
            <div className="p-4 sm:p-6 lg:p-8" style={{ background: 'transparent', border: 'none' }}>
              <div className="flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center">
                  <KooukLogo />
                </div>
                
                {/* Center: Search Bar - Hidden on very small screens */}
                <div className="hidden sm:flex flex-1 justify-center px-4 lg:px-8">
                  <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <SearchBar compactMode={true} className="w-full pl-9 pr-4 py-2 text-sm" />
                  </div>
                </div>

                {/* Right: Time & Account - Responsive Stack */}
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  {/* Time - Always visible now */}
                  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                    <div className="flex items-center gap-1 sm:gap-3 px-1.5 sm:px-3 lg:px-4 py-1 sm:py-2" style={{ background: 'transparent', border: 'none' }}>
                      <TimeDisplay />
                    </div>
                  </div>
                  
                  {/* Language Switcher & Auth - Always visible */}
                  <LanguageSwitcher compact={true} className="mr-1 sm:mr-2 lg:mr-3" />
                  <AuthButton />
                </div>
              </div>
              
              {/* Mobile Search Row - Show on very small screens */}
              <div className="sm:hidden mt-4">
                <div className="px-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <SearchBar compactMode={true} className="w-full pl-9 pr-4 py-2 text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </header>


          {/* Search Results or Tab Content */}
          {searchResults ? (
            <div className="mb-8">
              <SearchResults />
            </div>
          ) : (
            <>
              {/* Enhanced Tab Navigation with Icons */}
              <div className="mb-8 sm:mb-12 lg:mb-16 mt-6 sm:mt-8">
            <div className="p-1.5 sm:p-2" style={{ background: 'transparent', border: 'none' }}>
              <nav className="flex items-center justify-between" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('today')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'today'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="hidden xs:inline">{t('today')}</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('function')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'function'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="hidden xs:inline">Function</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('storage')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'storage'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="hidden xs:inline">Storage</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('popular')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'popular'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span className="hidden xs:inline">Workspace</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <main>
            {activeTab === 'today' && (
              <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12">
                {/* Section Controls */}
                <SectionControls />

                {/* Weather Section */}
                <CollapsibleSection 
                  sectionKey="weather" 
                  title="Weather Forecast"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  }
                >
                  <TemperatureGraph />
                </CollapsibleSection>

                {/* Daily Cards Section */}
                <CollapsibleSection 
                  sectionKey="dailyCards" 
                  title="Daily Cards"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                >
                  <EnhancedDailyCards />
                </CollapsibleSection>

                {/* Information Sections */}
                <div className="space-y-8">
                  {/* News and Music Section - Side by side on desktop */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <CollapsibleSection 
                      sectionKey="news" 
                      title="Today's News"
                      className="h-fit"
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      }
                    >
                      <MainNewsSection />
                    </CollapsibleSection>

                    <CollapsibleSection 
                      sectionKey="music" 
                      title="Music Recommendations"
                      className="h-fit"
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      }
                    >
                      <MainMusicSection />
                    </CollapsibleSection>
                  </div>

                  {/* Market Overview Section */}
                  <CollapsibleSection 
                    sectionKey="market" 
                    title="Market Overview"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    }
                  >
                    <MarketOverview />
                  </CollapsibleSection>
                </div>
              </div>
            )}



            {activeTab === 'function' && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Functions</h3>
                  <p className="text-gray-400">Coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
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
              <AIWorkspaceContent />
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
    </SectionVisibilityProvider>
  )
}

export default function Home() {
  return <HomeContent />
}
