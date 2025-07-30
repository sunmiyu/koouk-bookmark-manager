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
          
          {/* Second row: Account */}
          <div className="flex items-center justify-end gap-4">
            <AuthButton />
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
          <div className="mt-6 sm:mt-8">
            <InfoInputSection />
          </div>
          
          {/* Contents Section */}
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="section-title">Contents</h2>
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
