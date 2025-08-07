'use client'

import { useState, useEffect } from 'react'
import KooukLogo from '@/components/KooukLogo'
import EnhancedWeatherWidget from '@/components/EnhancedWeatherWidget'
import EnhancedTimeDisplay from '@/components/EnhancedTimeDisplay'
import AuthButton from '@/components/AuthButton'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'
import RightPanel from '@/components/RightPanel'
import { useAuth } from '@/contexts/AuthContext'
import LandingPage from '@/components/LandingPage'
import LoadingSpinner from '@/components/LoadingSpinner'
import { LoadingProvider } from '@/contexts/LoadingContext'
import LoadingOverlay from '@/components/LoadingOverlay'
import { useOnboardingTour } from '@/hooks/useOnboardingTour'
import SearchButton from '@/components/SearchButton'
import { DailyCardState } from '@/components/DailyCardContent'

export type SectionType = 
  | 'dailyCard'
  | 'bigNote' 
  | 'storage-url'
  | 'storage-images'
  | 'storage-videos' 
  | 'storage-restaurants'
  | 'storage-travel'
  | 'storage-karaoke'
  | 'info-stocks'
  | 'info-news'
  | 'info-music'
  | 'info-language'
  | 'info-commute'
  | 'info-motivation'
  | 'info-aitools'
  | 'talkTalk'

export type NoteType = {
  id: string
  title: string
  content: string
  images: string[]
  createdAt: string
  updatedAt: string
}

// Memoized style objects to prevent unnecessary re-renders
const mainContainerStyle = {
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)'
}

const headerStyle = {
  padding: 'var(--space-4) 0',
  backgroundColor: 'var(--bg-card)',
  borderColor: 'var(--border-light)',
}

const desktopSidebarStyle = {
  borderColor: 'var(--border-light)',
  backgroundColor: 'var(--bg-card)'
}

const rightPanelStyle = {
  borderColor: '#F0EDE8',
  backgroundColor: '#FAFAF9'
}

const mobileSidebarOverlayStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.3)'
}

const tourButtonBaseStyle = {
  backgroundColor: 'transparent',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-light)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--text-xs)',
  fontWeight: '500'
}


function HomeContent() {
  const [activeSection, setActiveSection] = useState<SectionType>('dailyCard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // 모바일 기본값: 닫힘
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [dailyCardState, setDailyCardState] = useState<DailyCardState>({
    todo: true,
    diary: true,
    budget: false,
    goalTracker: false
  })
  
  // Authentication
  const { user, loading: authLoading } = useAuth()
  const isAuthenticated = !!user
  
  // Onboarding tour
  const { startTour, shouldShowTour } = useOnboardingTour()
  
  // 인증 완료 후 온보딩 투어 자동 시작
  useEffect(() => {
    if (isAuthenticated && shouldShowTour()) {
      // 약간의 지연 후 투어 시작 (페이지 렌더링 완료 후)
      const timer = setTimeout(() => {
        startTour()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, shouldShowTour, startTour])

  // Show loading while checking authentication
  if (authLoading) {
    return <LoadingSpinner size="lg" text="Loading Koouk..." />
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <LandingPage />
  }

  return (
    <LoadingProvider>
      {/* New Koouk Layout */}
        <div className="min-h-screen flex flex-col" style={mainContainerStyle}>
            {/* Container with max width - 더 넓은 화면 */}
            <div className="w-full max-w-[1600px] mx-auto px-3 md:px-5">
              {/* Header */}
              <header className="w-full border-b" style={headerStyle}>
                {/* Mobile Layout: 2 rows */}
                <div className="md:hidden">
                  {/* First Row: Hamburger + Logo + Account */}
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-4">
                      {/* Sidebar Toggle Button */}
                      <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                        style={{
                          color: 'var(--text-secondary)',
                          backgroundColor: sidebarCollapsed ? 'var(--bg-secondary)' : 'transparent'
                        }}
                        aria-label={sidebarCollapsed ? '사이드바 열기' : '사이드바 닫기'}
                        aria-expanded={!sidebarCollapsed}
                        aria-controls="mobile-sidebar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                      
                      <KooukLogo />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={startTour}
                        className="md:hidden transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--space-2) var(--space-3)',
                          fontSize: 'var(--text-xs)'
                        }}
                        onTouchStart={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                        }}
                        onTouchEnd={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <span>투어</span>
                      </button>
                      <AuthButton />
                    </div>
                  </div>

                  {/* Second Row: Weather + Time */}
                  <div className="flex items-center justify-between w-full">
                    <EnhancedWeatherWidget />
                    <EnhancedTimeDisplay />
                  </div>
                </div>

                {/* Desktop Layout: 1 row */}
                <div className="hidden md:flex items-center justify-between w-full" style={{ height: '70px' }}>
                  {/* Left: Hamburger + Logo */}
                  <div className="flex items-center gap-4">
                    {/* Sidebar Toggle Button */}
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                      style={{
                        color: 'var(--text-secondary)',
                        backgroundColor: sidebarCollapsed ? 'var(--bg-secondary)' : 'transparent'
                      }}
                      aria-label={sidebarCollapsed ? '사이드바 열기' : '사이드바 닫기'}
                      aria-expanded={!sidebarCollapsed}
                      aria-controls="desktop-sidebar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    
                    <KooukLogo />
                  </div>

                  {/* Center: Weather + Time */}
                  <div className="flex items-center gap-6">
                    <EnhancedWeatherWidget />
                    <EnhancedTimeDisplay />
                  </div>

                  {/* Right: Account + Tour */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={startTour}
                      className="hidden md:flex items-center gap-2 transition-all duration-200 ease-out"
                      style={tourButtonBaseStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                        e.currentTarget.style.color = 'var(--text-primary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                      }}
                    >
                      <span>\ud83c\udf93</span>
                      <span>\ud22c\uc5b4 \ub2e4\uc2dc\ubcf4\uae30</span>
                    </button>
                    <AuthButton />
                  </div>
                </div>
              </header>

              {/* Main Layout: Sidebar + Content */}
              <div className="flex flex-1 overflow-hidden relative">
                {/* Desktop Sidebar */}
                <div 
                  id="desktop-sidebar"
                  className="hidden md:block transition-all duration-300 border-r w-64 sidebar-tour-target"
                  style={desktopSidebarStyle}
                  role="navigation"
                  aria-label="Main navigation"
                >
                  <div className="h-full overflow-y-auto">
                    <Sidebar 
                      activeSection={activeSection}
                      onSectionChange={setActiveSection}
                      selectedNoteId={selectedNoteId}
                      onNoteSelect={setSelectedNoteId}
                      dailyCardState={dailyCardState}
                      onDailyCardStateChange={setDailyCardState}
                    />
                  </div>
                </div>

                {/* Mobile Sidebar Overlay */}
                {!sidebarCollapsed && (
                  <>
                    {/* Backdrop - 반투명 오버레이 */}
                    <div 
                      className="md:hidden fixed inset-0 z-40"
                      style={mobileSidebarOverlayStyle}
                      onClick={() => setSidebarCollapsed(true)}
                    />
                    
                    {/* Sidebar - 그림자 효과 추가 */}
                    <div 
                      id="mobile-sidebar"
                      className="md:hidden fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300"
                      style={{ 
                        backgroundColor: 'var(--bg-card)',
                        transform: sidebarCollapsed ? 'translateX(-100%)' : 'translateX(0)',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
                      }}
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="sidebar-title"
                    >
                      <div className="h-full overflow-y-auto">
                        {/* Close button */}
                        <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
                          <button
                            onClick={() => setSidebarCollapsed(true)}
                            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            aria-label="사이드바 닫기"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <Sidebar 
                          activeSection={activeSection}
                          onSectionChange={(section) => {
                            setActiveSection(section)
                            setSidebarCollapsed(true) // 모바일에서 메뉴 선택 시 사이드바 닫기
                          }}
                          selectedNoteId={selectedNoteId}
                          onNoteSelect={setSelectedNoteId}
                          dailyCardState={dailyCardState}
                          onDailyCardStateChange={setDailyCardState}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Main Content Area with Right Panel */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Main Content */}
                  <div className="flex-1 overflow-y-auto daily-cards-tour-target storage-tour-target">
                    <MainContent 
                      activeSection={activeSection}
                      selectedNoteId={selectedNoteId}
                      onNoteSelect={setSelectedNoteId}
                      dailyCardState={dailyCardState}
                    />
                  </div>

                  {/* Right Panel - 사용자 가이드 */}
                  <div 
                    className="hidden xl:block w-80 border-l overflow-y-auto"
                    style={rightPanelStyle}
                  >
                    <RightPanel activeSection={activeSection} />
                  </div>
                </div>
              </div>
            </div>
        </div>
        
        {/* Global Toast and Loading */}
        <LoadingOverlay />
        
        {/* Universal Search - Floating Button */}
        <SearchButton />
    </LoadingProvider>
  )
}

export default function Home() {
  return <HomeContent />
}