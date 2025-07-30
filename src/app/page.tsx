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

type TabType = 'dashboard' | 'contents' | 'popular'

function HomeContent() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  return (
    <ContentProvider>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto responsive-p-md py-4 sm:py-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-12">
            {/* Professional Header Container */}
            <div className="bg-black rounded-xl p-6">
              <div className="flex items-center justify-between">
                {/* Left: Empty space */}
                <div className="flex items-center">
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
                  <AuthButton />
                </div>
              </div>
            </div>
          </header>

          {/* Professional Tab Navigation */}
          <div className="mb-12 mt-6">
            <div className="">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-4 px-1 border-b-2 font-medium text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    Dashboard
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('contents')}
                  className={`py-4 px-1 border-b-2 font-medium text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'contents'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    Contents Storage
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('popular')}
                  className={`py-4 px-1 border-b-2 font-medium text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'popular'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    AI Tool Link
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <main>
            {activeTab === 'dashboard' && (
              <div className="space-y-12">
                {/* Todos Section */}
                <TodoSection />
                
                {/* Mini Functions Section */}
                <MiniFunctionsArea />
              </div>
            )}

            {activeTab === 'contents' && (
              <div className="space-y-12">
                {/* Info input section */}
                <InfoInputSection />
                
                {/* Contents Section */}
                <div className="bg-black rounded-xl p-8">
                  {/* Professional Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-white">Contents Storage</h2>
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

            {activeTab === 'popular' && (
              <div className="space-y-12">
                {/* AI Tool Link Section */}
                <div className="bg-black rounded-xl p-8">
                  {/* Professional Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white">AI Tool Link</h2>
                    </div>
                  </div>
                  
                  {/* Empty state for now */}
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-yellow-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">AI Tool Link Collection</h3>
                    <p className="text-gray-400">Curated collection of useful AI tools for productivity and creativity</p>
                  </div>
                </div>
              </div>
            )}
          </main>

          <footer className="mt-16">
            {/* Professional Footer Container */}
            <div className="bg-black rounded-xl p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-6">
                {/* All content in one row for PC, stacked for mobile */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full lg:w-auto">
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
                    <div className="w-px h-4 bg-gray-700 hidden sm:block"></div>
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
  )
}

export default function Home() {
  return <HomeContent />
}
