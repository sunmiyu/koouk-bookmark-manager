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
          <header className="mb-6">
            {/* First row: Logo, Weather, Time */}
            <div className="flex items-center justify-between mb-4 h-12">
              <KooukLogo />
              
              <div className="flex items-center gap-4 text-gray-300">
                <WeatherOnly />
                <span className="text-gray-500">|</span>
                <TimeDisplay />
              </div>
            </div>
            
            {/* Second row: Controls & Account */}
            <div className="flex items-center justify-end gap-4">
              <Link 
                href="/mini-functions"
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Controls
              </Link>
              <AuthButton />
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
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="section-title">Contents Storage</h2>
                    <div className="w-48 sm:w-64 flex-shrink-0">
                      <SearchBar />
                    </div>
                  </div>
                  
                  {/* Content Sections Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    <LinkSection />
                    <NotesSection />
                    <VideoSection />
                    <ImageSection />
                  </div>
                </div>
              </div>
            )}
          </main>

          <footer className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-800">
            <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1 flex-nowrap">
              <span className="whitespace-nowrap">Koouk 2025 All rights reserved</span>
              <span className="mx-1">|</span>
              <Link href="/privacy-policy" className="hover:text-gray-300 underline whitespace-nowrap">
                Privacy Policy
              </Link>
              <span className="mx-1">|</span>
              <FeedbackBoard />
              <span className="mx-1">|</span>
              <span className="text-white hover:text-gray-300 transition-colors whitespace-nowrap">
                Your daily Dashboard
              </span>
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
