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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
            {/* Header */}
            <header className="flex items-center justify-between w-full border-b" style={{ 
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-light)',
              height: '70px'
            }}>
              {/* Left: Logo */}
              <div className="flex items-center gap-4">
                {/* Sidebar Toggle Button */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
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
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div 
                className={`transition-all duration-300 border-r ${
                  sidebarCollapsed ? 'w-0' : 'w-80'
                }`}
                style={{ 
                  borderColor: 'var(--border-light)',
                  backgroundColor: 'var(--bg-card)'
                }}
              >
                <div className={`h-full overflow-y-auto ${sidebarCollapsed ? 'hidden' : 'block'}`}>
                  <Sidebar 
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    selectedNoteId={selectedNoteId}
                    onNoteSelect={setSelectedNoteId}
                  />
                </div>
              </div>

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