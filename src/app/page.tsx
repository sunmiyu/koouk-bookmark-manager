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
import { ToastProvider } from '@/contexts/ToastContext'
import { LoadingProvider } from '@/contexts/LoadingContext'
import SplashScreen from '@/components/SplashScreen'
import { TodayTodosProvider } from '@/contexts/TodayTodosContext'
import CollapsibleSection from '@/components/CollapsibleSection'
import EnhancedDailyCards from '@/components/EnhancedDailyCards'
import MainNewsSection from '@/components/MainNewsSection'
import MainMusicSection from '@/components/MainMusicSection'
import MarketOverview from '@/components/MarketOverview'
import AIWorkspaceContent from '@/components/AIWorkspaceContent'
import StorageContent from '@/components/StorageContent'
import TemperatureGraph from '@/components/TemperatureGraph'
import WeatherWidget from '@/components/WeatherWidget'
import OnboardingFlow from '@/components/OnboardingFlow'
import SwipeIndicator from '@/components/SwipeIndicator'
import LayoutOptimizer from '@/components/LayoutOptimizer'
import BetaFeaturesPreview from '@/components/BetaFeaturesPreview'
import ToastContainer from '@/components/ToastContainer'
import LoadingOverlay from '@/components/LoadingOverlay'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
// import { useWeatherData } from '@/hooks/useWeatherData' // 삭제됨
// import { useUserPlan } from '@/contexts/UserPlanContext'
import { useSearch } from '@/contexts/SearchContext'
import { useLanguage } from '@/contexts/LanguageContext'
// import { useSectionVisibility } from '@/contexts/SectionVisibilityContext'

type TabType = 'dashboard' | 'storage' | 'tools' | 'settings'

function HomeContent() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [isLoading, setIsLoading] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [layoutOptimizations, setLayoutOptimizations] = useState<{
    suggestedLayout?: {
      headerCompact?: boolean;
      bottomNavigation?: boolean;
      singleColumn?: boolean;
      reducedPadding?: boolean;
    };
  } | null>(null)
  // const { weatherData } = useWeatherData() // 더 이상 사용하지 않음
  // const { currentPlan } = useUserPlan()
  const { searchResults } = useSearch()
  const { t } = useLanguage()
  // const { applySmartCollapse } = useSectionVisibility()

  const triggerOnboarding = () => {
    localStorage.removeItem('koouk_onboarding_completed')
    setShowOnboarding(true)
  }

  // Tab navigation helpers
  const tabs: TabType[] = ['dashboard', 'storage', 'tools', 'settings']
  const currentTabIndex = tabs.indexOf(activeTab)

  const goToNextTab = () => {
    const nextIndex = (currentTabIndex + 1) % tabs.length
    setActiveTab(tabs[nextIndex])
  }

  const goToPreviousTab = () => {
    const prevIndex = currentTabIndex === 0 ? tabs.length - 1 : currentTabIndex - 1
    setActiveTab(tabs[prevIndex])
  }

  // Setup swipe gestures for mobile navigation
  const { setRef: setSwipeRef } = useSwipeGesture({
    onSwipeLeft: goToNextTab,
    onSwipeRight: goToPreviousTab,
    minDistance: 80,
    preventScroll: false
  })

  // Apply layout optimizations based on analytics
  const getOptimizedLayoutClasses = () => {
    if (!layoutOptimizations) return ''
    
    const { suggestedLayout } = layoutOptimizations
    let classes = ''
    
    if (suggestedLayout?.headerCompact) {
      classes += ' header-compact'
    }
    
    if (suggestedLayout?.singleColumn) {
      classes += ' single-column-layout'
    }
    
    if (suggestedLayout?.reducedPadding) {
      classes += ' reduced-padding'
    }
    
    return classes
  }

  const shouldShowBottomNav = layoutOptimizations?.suggestedLayout?.bottomNavigation

  // Handle URL parameters and splash screen logic
  useEffect(() => {
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab') as TabType
    if (tabParam && ['dashboard', 'storage', 'tools', 'settings'].includes(tabParam)) {
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

  // Smart auto-collapse will be handled by CollapsibleSection components

  // Show splash screen while loading (only on first visit)
  if (isLoading) {
    return <SplashScreen onComplete={() => setIsLoading(false)} />
  }

  return (
    <LoadingProvider>
      <ToastProvider position="top-right" maxToasts={5}>
        <SectionVisibilityProvider>
          <TodayTodosProvider>
            <ContentProvider>
          <LayoutOptimizer onLayoutChange={setLayoutOptimizations}>
        <div className={`min-h-screen bg-black text-white flex justify-center layout-transition ${getOptimizedLayoutClasses()} ${shouldShowBottomNav ? 'has-bottom-nav' : ''}`}>
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

                {/* Right: Weather, Time & Account - Responsive Stack */}
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  {/* Weather Widget - Always visible */}
                  <WeatherWidget />
                  
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
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'dashboard'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="hidden xs:inline">Dashboard</span>
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
                  onClick={() => setActiveTab('tools')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'tools'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="hidden xs:inline">Tools</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'settings'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    <span className="hidden xs:inline">Settings</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content with Swipe Support */}
          <main ref={setSwipeRef} className="relative overflow-hidden">
            <div className="transition-transform duration-300 ease-out">
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12">
                {/* Daily Cards Section - 핵심 기능 강조 */}
                <div className="bg-gradient-to-br from-blue-600/5 to-purple-600/5 border border-blue-500/10 rounded-xl p-1 mb-2">
                  <CollapsibleSection 
                    sectionKey="dailyCards" 
                    title="Daily Cards"
                    showGlobalControls={true}
                    className="bg-gray-900/40 backdrop-blur-sm rounded-lg"
                    headerClassName="border-b border-blue-500/20"
                    icon={
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    }
                  >
                    <EnhancedDailyCards />
                  </CollapsibleSection>
                </div>

                {/* Information Sections */}
                <div className="space-y-8">
                  {/* News Section - 핵심 기능 강조, Music Section - 부가 기능 축소 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* News - 2/3 width for emphasis */}
                    <div className="lg:col-span-2">
                      <div className="bg-gradient-to-br from-green-600/5 to-blue-600/5 border border-green-500/10 rounded-xl p-1">
                        <CollapsibleSection 
                          sectionKey="news" 
                          title="Today's News"
                          className="bg-gray-900/40 backdrop-blur-sm rounded-lg h-fit"
                          headerClassName="border-b border-green-500/20"
                          icon={
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          }
                        >
                          <MainNewsSection />
                        </CollapsibleSection>
                      </div>
                    </div>

                    {/* Music - 1/3 width, reduced prominence */}
                    <div className="lg:col-span-1">
                      <CollapsibleSection 
                        sectionKey="music" 
                        title="Music"
                        className="h-fit opacity-75 hover:opacity-100 transition-opacity duration-200"
                        icon={
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        }
                      >
                        <MainMusicSection />
                      </CollapsibleSection>
                    </div>
                  </div>

                  {/* Market Overview Section - 부가 기능 축소 */}
                  <div className="mt-12">
                    <CollapsibleSection 
                      sectionKey="market" 
                      title="Market Overview"
                      className="opacity-75 hover:opacity-100 transition-opacity duration-200"
                      icon={
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 0 01-2-2z" />
                        </svg>
                      }
                    >
                      <MarketOverview />
                    </CollapsibleSection>
                  </div>
                </div>
              </div>
            )}



            {activeTab === 'tools' && (
              <BetaFeaturesPreview />
            )}

            {activeTab === 'storage' && (
              <StorageContent />
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8">
                {/* Settings Header */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Settings & Preferences</h3>
                  <p className="text-gray-400">Customize your dashboard experience</p>
                </div>

                {/* Settings Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Help & Support */}
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-white">Help & Support</h4>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={triggerOnboarding}
                        className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">Take Tour Again</div>
                            <div className="text-sm text-gray-400">Replay the welcome tutorial</div>
                          </div>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                      <div className="px-4 py-3 bg-gray-800/30 rounded-lg">
                        <div className="text-white font-medium">Documentation</div>
                        <div className="text-sm text-gray-400">Comprehensive guides coming soon</div>
                      </div>
                    </div>
                  </div>

                  {/* Account Settings */}
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-white">Account</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="px-4 py-3 bg-gray-800/30 rounded-lg">
                        <div className="text-white font-medium">Profile Settings</div>
                        <div className="text-sm text-gray-400">Manage your account details</div>
                      </div>
                      <div className="px-4 py-3 bg-gray-800/30 rounded-lg">
                        <div className="text-white font-medium">Privacy & Security</div>
                        <div className="text-sm text-gray-400">Control your data and privacy</div>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-white">Preferences</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="px-4 py-3 bg-gray-800/30 rounded-lg">
                        <div className="text-white font-medium">Notifications</div>
                        <div className="text-sm text-gray-400">Customize alerts and reminders</div>
                      </div>
                      <div className="px-4 py-3 bg-gray-800/30 rounded-lg">
                        <div className="text-white font-medium">Theme & Display</div>
                        <div className="text-sm text-gray-400">Appearance customization</div>
                      </div>
                    </div>
                  </div>

                  {/* Integrations */}
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V5a1 1 0 011-1h3a1 1 0 001-1V4z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-white">Integrations</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="px-4 py-3 bg-gray-800/30 rounded-lg">
                        <div className="text-white font-medium">Connected Apps</div>
                        <div className="text-sm text-gray-400">Spotify, Google, and more</div>
                      </div>
                      <div className="px-4 py-3 bg-gray-800/30 rounded-lg">
                        <div className="text-white font-medium">API Access</div>
                        <div className="text-sm text-gray-400">Developer tools and webhooks</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
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
        
        {/* Swipe Indicator for Mobile */}
        <SwipeIndicator 
          currentTab={activeTab}
          totalTabs={4}
        />
        
        {/* Onboarding Flow */}
        <OnboardingFlow 
          onComplete={() => setShowOnboarding(false)}
        />
          </LayoutOptimizer>
          
          {/* Toast Notifications */}
          <ToastContainer />
          
          {/* Loading Overlay */}
          <LoadingOverlay />
        </ContentProvider>
      </TodayTodosProvider>
    </SectionVisibilityProvider>
    </ToastProvider>
    </LoadingProvider>
  )
}

export default function Home() {
  return <HomeContent />
}
