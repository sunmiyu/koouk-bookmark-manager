'use client'

import { useState } from 'react'
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

type TabType = 'dashboard' | 'contents'

function HomeContent() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  return (
    <ContentProvider>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto responsive-p-md py-4 sm:py-6">
          <header className="mb-8">
            {/* Professional Header Container */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                {/* Left: Logo & Info */}
                <div className="flex items-center gap-6">
                  <KooukLogo />
                  
                  {/* Weather & Time with modern styling */}
                  <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/50">
                      <WeatherOnly />
                    </div>
                    <div className="w-px h-6 bg-gray-700"></div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/50">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <TimeDisplay />
                    </div>
                  </div>
                </div>
                
                {/* Right: Controls & Account */}
                <div className="flex items-center gap-3">
                  <Link 
                    href="/mini-functions"
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-all cursor-pointer flex items-center gap-2 border border-gray-700 hover:border-gray-600 shadow-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    <span className="hidden sm:inline">Controls</span>
                  </Link>
                  <AuthButton />
                </div>
              </div>
            </div>
          </header>

          {/* Professional Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-800">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h6m-6 0v-2m6 2v2m0-2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-6 0V3a2 2 0 112 0v2m0 4h6m-6 4h6" />
                    </svg>
                    Dashboard
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Todos & Mini Functions
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('contents')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'contents'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1h1m0 0V3a2 2 0 112 0v1h1a2 2 0 011 1v1M9 7h6" />
                    </svg>
                    Contents Storage
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Links, Notes, Media & Files
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <main>
            {activeTab === 'dashboard' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Todos Section */}
                <TodoSection />
                
                {/* Horizontal divider between Todos and Mini Functions */}
                <div className="border-t border-gray-800"></div>
                
                {/* Mini Functions Section */}
                <MiniFunctionsArea />
              </div>
            )}

            {activeTab === 'contents' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Info input section */}
                <InfoInputSection />
                
                {/* Contents Section */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                  {/* Professional Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-600/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1h1m0 0V3a2 2 0 112 0v1h1a2 2 0 011 1v1M9 7h6" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">Contents Storage</h2>
                        <p className="text-sm text-gray-400">Your saved links, notes, media & files</p>
                      </div>
                    </div>
                    
                    <div className="w-48 sm:w-64 flex-shrink-0">
                      <SearchBar />
                    </div>
                  </div>
                  
                  {/* Content Sections Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <LinkSection />
                    <NotesSection />
                    <VideoSection />
                    <ImageSection />
                  </div>
                </div>
              </div>
            )}
          </main>

          <footer className="mt-12 sm:mt-16">
            {/* Professional Footer Container */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left: Logo & Copyright */}
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-400">
                    <div className="font-medium text-white">Koouk Dashboard</div>
                    <div className="text-xs">© 2025 All rights reserved</div>
                  </div>
                </div>
                
                {/* Center: Navigation Links */}
                <div className="flex items-center gap-6 text-sm">
                  <Link 
                    href="/privacy-policy" 
                    className="text-gray-400 hover:text-white transition-colors font-medium"
                  >
                    Privacy Policy
                  </Link>
                  <div className="w-px h-4 bg-gray-700"></div>
                  <FeedbackBoard />
                  <div className="w-px h-4 bg-gray-700"></div>
                  <span className="text-gray-400 font-medium">
                    Your Daily Hub
                  </span>
                </div>
                
                {/* Right: Status Indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/10 rounded-lg border border-green-500/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">All Systems Operational</span>
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
