'use client'

import { useState } from 'react'
import KooukLogo from '@/components/KooukLogo'
import TimeDisplay from '@/components/TimeDisplay'
import WeatherWidget from '@/components/WeatherWidget'
import AuthButton from '@/components/AuthButton'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'
import { useAuth } from '@/contexts/AuthContext'
import LandingPage from '@/components/LandingPage'
import { ToastProvider } from '@/contexts/ToastContext'
import { LoadingProvider } from '@/contexts/LoadingContext'
import ToastContainer from '@/components/ToastContainer'
import LoadingOverlay from '@/components/LoadingOverlay'

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

export type NoteType = {
  id: string
  title: string
  content: string
  images: string[]
  createdAt: string
  updatedAt: string
}

function HomeContent() {
  const [activeSection, setActiveSection] = useState<SectionType>('dailyCard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // 모바일 기본값: 닫힘
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  
  // Authentication
  const { user, loading: authLoading } = useAuth()
  const isAuthenticated = !!user

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: 'var(--bg-primary)', 
        color: 'var(--text-primary)' 
      }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading Koouk...</p>
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
          /* New Koouk Layout */
          <div className="min-h-screen flex flex-col" style={{ 
            backgroundColor: 'var(--bg-primary)', 
            color: 'var(--text-primary)' 
          }}>
            {/* Container with max width */}
            <div className="w-full max-w-[1400px] mx-auto" style={{ padding: '0 20px' }}>
              {/* Header */}
              <header className="flex items-center justify-between w-full border-b" style={{ 
                padding: 'var(--space-4) 0',
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-light)',
                height: '70px'
              }}>
                {/* Left: Logo */}
                <div className="flex items-center gap-4">
                  {/* Sidebar Toggle Button */}
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors md:hidden"
                    style={{
                      color: 'var(--text-secondary)',
                      backgroundColor: sidebarCollapsed ? 'var(--bg-secondary)' : 'transparent'
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  
                  <KooukLogo />
                </div>

                {/* Right: Weather, Time & Account */}
                <div className="flex items-center gap-3">
                  {/* Weather Widget */}
                  <WeatherWidget />
                  
                  {/* Time Display */}
                  <div className="flex items-center gap-3 px-3 py-2" style={{ 
                    background: 'transparent', 
                    border: 'none' 
                  }}>
                    <TimeDisplay />
                  </div>
                  
                  {/* Language Switcher & Auth */}
                  <LanguageSwitcher compact={true} className="mr-2" />
                  <AuthButton />
                </div>
              </header>

              {/* Main Layout: Sidebar + Content */}
              <div className="flex flex-1 overflow-hidden relative">
                {/* Desktop Sidebar */}
                <div 
                  className="hidden md:block transition-all duration-300 border-r w-80"
                  style={{ 
                    borderColor: 'var(--border-light)',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <div className="h-full overflow-y-auto">
                    <Sidebar 
                      activeSection={activeSection}
                      onSectionChange={setActiveSection}
                      selectedNoteId={selectedNoteId}
                      onNoteSelect={setSelectedNoteId}
                    />
                  </div>
                </div>

                {/* Mobile Sidebar Overlay */}
                {!sidebarCollapsed && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                      onClick={() => setSidebarCollapsed(true)}
                    />
                    
                    {/* Sidebar */}
                    <div 
                      className="md:hidden fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300"
                      style={{ 
                        backgroundColor: 'var(--bg-card)',
                        transform: sidebarCollapsed ? 'translateX(-100%)' : 'translateX(0)'
                      }}
                    >
                      <div className="h-full overflow-y-auto">
                        {/* Close button */}
                        <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
                          <button
                            onClick={() => setSidebarCollapsed(true)}
                            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
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
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto">
                  <MainContent 
                    activeSection={activeSection}
                    selectedNoteId={selectedNoteId}
                    onNoteSelect={setSelectedNoteId}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Global Toast and Loading */}
        <ToastContainer />
        <LoadingOverlay />
      </ToastProvider>
    </LoadingProvider>
  )
}

export default function Home() {
  return <HomeContent />
}