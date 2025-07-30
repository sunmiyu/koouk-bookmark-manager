'use client'

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
function HomeContent() {

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
          
          {/* Second row: Search, Pro, Account */}
          <div className="flex items-center gap-4">
            {/* 데스크톱: 오른쪽 정렬 */}
            <div className="hidden sm:flex items-center justify-end gap-4 flex-1">
              {/* Search bar - 고정 너비 */}
              <div className="w-64">
                <SearchBar />
              </div>
              {/* Login button */}
              <div className="flex-shrink-0">
                <AuthButton />
              </div>
            </div>
            
            {/* 모바일: 오른쪽 정렬 */}
            <div className="sm:hidden flex items-center justify-end gap-3 flex-1">
              {/* Search bar - 적당한 크기 */}
              <div className="max-w-xs">
                <SearchBar />
              </div>
              <div className="flex-shrink-0">
                <AuthButton />
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-6 sm:space-y-8">
          <MiniFunctionsArea />
          
          {/* Horizontal divider between Mini Functions and Todos */}
          <div className="border-t border-gray-800"></div>
          
          <TodoSection />
          
          {/* Horizontal divider between Todos and Contents */}
          <div className="border-t border-gray-800 my-6 sm:my-8"></div>

          {/* Info input section */}
          <InfoInputSection />
          
          {/* Contents Section */}
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Contents</h2>
            
            {/* Content Sections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <LinkSection />
              <VideoSection />
              <ImageSection />
              <NotesSection />
            </div>
          </div>
        </main>

        <footer className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-800">
          <div className="text-center text-xs text-gray-500">
            <div>
              Koouk 2025 All rights reserved · <FeedbackBoard /> · 
              <Link href="/privacy-policy" className="hover:text-gray-300 underline ml-1">
                개인정보처리방침
              </Link>
            </div>
            <div className="mt-1">
              Your daily Dashboard
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
