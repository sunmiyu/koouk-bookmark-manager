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
import SimpleStorageContent from '@/components/SimpleStorageContent'
import TemperatureGraph from '@/components/TemperatureGraph'
import WeatherWidget from '@/components/WeatherWidget'
import OnboardingFlow from '@/components/OnboardingFlow'
import SwipeIndicator from '@/components/SwipeIndicator'
import LayoutOptimizer from '@/components/LayoutOptimizer'
import BetaFeaturesPreview from '@/components/BetaFeaturesPreview'
import ToastContainer from '@/components/ToastContainer'
import LoadingOverlay from '@/components/LoadingOverlay'
import LandingPage from '@/components/LandingPage'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { useAuth } from '@/contexts/AuthContext'
// import { useWeatherData } from '@/hooks/useWeatherData' // 삭제됨
// import { useUserPlan } from '@/contexts/UserPlanContext'
import { useSearch } from '@/contexts/SearchContext'
import { useLanguage } from '@/contexts/LanguageContext'
// import { useSectionVisibility } from '@/contexts/SectionVisibilityContext'

type TabType = 'dashboard' | 'storage'

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
  
  // Authentication
  const { user, loading: authLoading } = useAuth()
  const isAuthenticated = !!user
  
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
  const tabs: TabType[] = ['dashboard', 'storage']
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
    if (tabParam && ['dashboard', 'storage'].includes(tabParam)) {
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Koouk...</p>
        </div>
      </div>
    )
  }

  return (
    <LoadingProvider>
      <ToastProvider position="top-right" maxToasts={5}>
        {/* Show Landing Page if not authenticated */}
        {!isAuthenticated ? (
          <LandingPage />
        ) : (
          /* Show Dashboard if authenticated */
        <SectionVisibilityProvider>
          <TodayTodosProvider>
            <ContentProvider>
          <LayoutOptimizer onLayoutChange={setLayoutOptimizations}>
        <div className={`min-h-screen flex justify-center layout-transition ${getOptimizedLayoutClasses()} ${shouldShowBottomNav ? 'has-bottom-nav' : ''}`} style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)' }}>
        <div className="w-full max-w-[1200px] main-container" style={{ padding: 'var(--space-lg) var(--space-md)' }}>
          <header className="comfortable-spacing relative z-50" style={{ marginBottom: 'var(--space-2xl)' }}>
            {/* Modern, comfortable header */}
            <div style={{ padding: 'var(--space-lg)', background: 'transparent', border: 'none' }}>
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
              {/* Modern Tab Navigation */}
              <div className="comfortable-spacing" style={{ marginBottom: 'var(--space-2xl)', marginTop: 'var(--space-xl)' }}>
            <div style={{ padding: 'var(--space-sm)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
              <nav className="flex items-center" aria-label="Navigation tabs">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex-1 tab-button transition-all duration-200 ${
                    activeTab === 'dashboard' ? 'active' : ''
                  }`}
                  style={{ 
                    padding: 'var(--space-md)', 
                    borderRadius: 'var(--radius-lg)',
                    background: activeTab === 'dashboard' ? 'var(--color-background)' : 'transparent',
                    border: 'none',
                    color: activeTab === 'dashboard' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    fontWeight: activeTab === 'dashboard' ? '600' : '500',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" style={{ color: activeTab === 'dashboard' ? 'var(--color-accent)' : 'currentColor' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="hidden xs:inline">Your Dashboard</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('storage')}
                  className={`flex-1 tab-button transition-all duration-200 ${
                    activeTab === 'storage' ? 'active' : ''
                  }`}
                  style={{ 
                    padding: 'var(--space-md)', 
                    borderRadius: 'var(--radius-lg)',
                    background: activeTab === 'storage' ? 'var(--color-background)' : 'transparent',
                    border: 'none',
                    color: activeTab === 'storage' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    fontWeight: activeTab === 'storage' ? '600' : '500',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" style={{ color: activeTab === 'storage' ? 'var(--color-accent)' : 'currentColor' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="hidden xs:inline">Your Collection</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content with Swipe Support */}
          <main ref={setSwipeRef} className="relative overflow-hidden">
            <div className="transition-transform duration-300 ease-out">
            {activeTab === 'dashboard' && (
              <div className="flex flex-col comfortable-spacing" style={{ gap: 'var(--space-2xl)' }}>
                {/* Daily Cards Section - Core feature */}
                <div style={{ 
                  background: 'var(--color-surface)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-xl)', 
                  padding: 'var(--space-sm)' 
                }}>
                  <CollapsibleSection 
                    sectionKey="dailyCards" 
                    title="Today's Focus"
                    showGlobalControls={true}
                    className="modern-section"
                    headerClassName=""
                    icon={
                      <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    }
                  >
                    <EnhancedDailyCards />
                  </CollapsibleSection>
                </div>

                {/* Information Sections */}
                <div style={{ gap: 'var(--space-xl)' }} className="space-y-8">
                  {/* News and Music Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* News - Primary content */}
                    <div className="lg:col-span-2">
                      <div style={{ 
                        background: 'var(--color-surface)', 
                        border: '1px solid var(--color-border)', 
                        borderRadius: 'var(--radius-xl)', 
                        padding: 'var(--space-sm)' 
                      }}>
                        <CollapsibleSection 
                          sectionKey="news" 
                          title="What's Happening"
                          className="h-fit modern-section"
                          headerClassName=""
                          icon={
                            <svg className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          }
                        >
                          <MainNewsSection />
                        </CollapsibleSection>
                      </div>
                    </div>

                    {/* Music - Secondary content */}
                    <div className="lg:col-span-1">
                      <div style={{ 
                        background: 'var(--color-surface)', 
                        border: '1px solid var(--color-border)', 
                        borderRadius: 'var(--radius-xl)', 
                        padding: 'var(--space-sm)',
                        opacity: '0.8'
                      }} className="hover:opacity-100 transition-opacity duration-200">
                        <CollapsibleSection 
                          sectionKey="music" 
                          title="Sounds"
                          className="h-fit modern-section"
                          icon={
                            <svg className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                          }
                        >
                          <MainMusicSection />
                        </CollapsibleSection>
                      </div>
                    </div>
                  </div>

                  {/* Market Overview Section - Secondary feature */}
                  <div style={{ marginTop: 'var(--space-2xl)' }}>
                    <div style={{ 
                      background: 'var(--color-surface)', 
                      border: '1px solid var(--color-border)', 
                      borderRadius: 'var(--radius-xl)', 
                      padding: 'var(--space-sm)',
                      opacity: '0.7'
                    }} className="hover:opacity-100 transition-opacity duration-200">
                      <CollapsibleSection 
                        sectionKey="market" 
                        title="Market Pulse"
                        className="modern-section"
                        icon={
                          <svg className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 0 01-2-2z" />
                          </svg>
                        }
                      >
                        <MarketOverview />
                      </CollapsibleSection>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {activeTab === 'storage' && (
              <SimpleStorageContent />
            )}
            </div>
          </main>
            </>
          )}

          <footer style={{ marginTop: 'var(--space-3xl)' }}>
            {/* Modern, comfortable footer */}
            <div style={{ 
              background: 'var(--color-surface)', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-xl)', 
              padding: 'var(--space-xl)' 
            }}>
              <div className="flex flex-col items-center justify-between comfortable-spacing">
                {/* Clean layout */}
                <div className="flex flex-col items-center w-full" style={{ gap: 'var(--space-lg)' }}>
                  {/* Logo & Copyright */}
                  <div className="flex items-center" style={{ gap: 'var(--space-md)' }}>
                    <div style={{ 
                      width: '1.5rem', 
                      height: '1.5rem', 
                      background: 'var(--color-accent)', 
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg className="w-3 h-3" style={{ color: 'var(--color-background)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-secondary)',
                      fontWeight: '500'
                    }}>Koouk — Your comfortable workspace © 2025</span>
                  </div>
                  
                  {/* Navigation Links */}
                  <div className="flex items-center text-sm" style={{ gap: 'var(--space-lg)' }}>
                    <Link 
                      href="/privacy-policy" 
                      style={{ 
                        color: 'var(--color-text-tertiary)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: '500',
                        textDecoration: 'none'
                      }}
                      className="hover:opacity-80 transition-opacity"
                    >
                      Privacy
                    </Link>
                    <div style={{ 
                      width: '1px', 
                      height: '1rem', 
                      background: 'var(--color-border)' 
                    }}></div>
                    <FeedbackBoard />
                    <div style={{ 
                      width: '1px', 
                      height: '1rem', 
                      background: 'var(--color-border)' 
                    }}></div>
                    <span style={{ 
                      color: 'var(--color-text-tertiary)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: '500'
                    }}>
                      Made with care
                    </span>
                  </div>
                </div>
                
                {/* Status Indicator */}
                <div className="flex items-center" style={{ 
                  gap: 'var(--space-xs)', 
                  padding: 'var(--space-sm) var(--space-md)', 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  borderRadius: 'var(--radius-lg)' 
                }}>
                  <div style={{ 
                    width: '0.5rem', 
                    height: '0.5rem', 
                    background: 'var(--color-success)', 
                    borderRadius: '50%' 
                  }} className="animate-soft-pulse"></div>
                  <span style={{ 
                    color: 'var(--color-success)', 
                    fontSize: 'var(--text-xs)', 
                    fontWeight: '500' 
                  }}>Everything&apos;s running smoothly</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
        </div>
        
        {/* Swipe Indicator for Mobile */}
        <SwipeIndicator 
          currentTab={activeTab}
          totalTabs={2}
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
        )}
        
        {/* Global Toast and Loading - Available for both Landing and Dashboard */}
        <ToastContainer />
        <LoadingOverlay />
      </ToastProvider>
    </LoadingProvider>
  )
}

export default function Home() {
  return <HomeContent />
}
