'use client'

import WeatherOnly from '@/components/WeatherOnly'
import TimeDisplay from '@/components/TimeDisplay'
import InfoInputSection from '@/components/InfoInputSection'
import TodoSection from '@/components/TodoSection'
import VideoSection from '@/components/VideoSection'
import ImageSection from '@/components/ImageSection'
import NotesSection from '@/components/NotesSection'
import LinkSection from '@/components/LinkSection'
import AuthButton from '@/components/AuthButton'
import KooukLogo from '@/components/KooukLogo'
import SearchBar from '@/components/SearchBar'
import { ContentProvider } from '@/contexts/ContentContext'
import { UserPlanProvider, useUserPlan } from '@/contexts/UserPlanContext'
import { trackEvents } from '@/lib/analytics'

function HomeContent() {
  const { currentPlan, upgradeToProPlan } = useUserPlan()

  const handleProClick = () => {
    if (currentPlan === 'free') {
      const confirmed = confirm('Upgrade to Pro plan? (Demo: This will simulate upgrading to Pro with 500 items per type)')
      if (confirmed) {
        upgradeToProPlan()
        trackEvents.upgradePlan('free', 'pro')
        alert('🎉 Successfully upgraded to Pro plan! You can now store 500 items per type.')
      }
    } else {
      // Already Pro or Unlimited, go to pricing page
      window.location.href = '/pricing'
    }
  }

  return (
    <ContentProvider>
      <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto responsive-p-md py-4 sm:py-6">
        <header className="mb-6">
          {/* First row: Logo, Weather, Time */}
          <div className="flex items-end justify-between mb-4">
            <KooukLogo />
            
            <div className="flex items-center gap-4 text-gray-300">
              <WeatherOnly />
              <span className="text-gray-500">|</span>
              <TimeDisplay />
            </div>
          </div>
          
          {/* Second row: Search, Pro, Account */}
          <div className="flex items-center gap-4">
            {/* 모바일: 전체 너비 서치바 */}
            <div className="sm:hidden flex-1">
              <SearchBar />
            </div>
            
            {/* 데스크톱: 오른쪽 정렬된 요소들 */}
            <div className="hidden sm:flex items-center gap-4 ml-auto">
              {/* Search bar - Pro+Login 버튼 간격만큼 왼쪽에 배치 */}
              <div className="w-48">
                <SearchBar />
              </div>
              
              {/* Pro button */}
              <button
                onClick={handleProClick}
                className={`w-16 py-1 text-white text-sm font-medium rounded-full transition-all duration-200 h-[24px] flex items-center justify-center flex-shrink-0 ${
                  currentPlan === 'free' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : currentPlan === 'pro'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {currentPlan === 'free' ? 'Pro' : currentPlan === 'pro' ? 'Pro✓' : 'Pro+'}
              </button>
              
              {/* Account button */}
              <div className="flex-shrink-0">
                <AuthButton />
              </div>
            </div>
            
            {/* 모바일: Pro + Login 버튼만 */}
            <div className="sm:hidden flex items-center gap-3 ml-auto">
              <button
                onClick={handleProClick}
                className={`w-16 py-1 text-white text-sm font-medium rounded-full transition-all duration-200 h-[24px] flex items-center justify-center flex-shrink-0 ${
                  currentPlan === 'free' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : currentPlan === 'pro'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {currentPlan === 'free' ? 'Pro' : currentPlan === 'pro' ? 'Pro✓' : 'Pro+'}
              </button>
              <div className="flex-shrink-0">
                <AuthButton />
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-6 sm:space-y-8">
          <TodoSection />

          {/* Horizontal divider */}
          <div className="border-t border-gray-800 my-6 sm:my-8"></div>

          {/* Info input section with extra top margin */}
          <div className="mt-8 sm:mt-12">
            <InfoInputSection />
          </div>

          {/* Horizontal divider */}
          <div className="border-t border-gray-800 my-6 sm:my-8"></div>
          
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-2">
              <h2 className="responsive-text-xl font-semibold">Content Sections</h2>
              
              {/* Info icon with tooltip */}
              <div className="relative group">
                <svg className="w-5 h-5 text-green-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Free: 각 타입별 50개 제한 
                  <a href="/pricing" className="text-blue-400 hover:text-blue-300 ml-2">업그레이드 →</a>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </div>
            
            {/* 모바일에서는 세로 스택, 태블릿 이상에서는 가로 스크롤 */}
            <div className="block sm:hidden space-y-6">
              <LinkSection />
              <VideoSection />
              <ImageSection />
              <NotesSection />
            </div>
            
            <div className="hidden sm:flex overflow-x-auto responsive-gap-lg pb-4">
              <div className="flex-shrink-0 min-w-[300px] lg:min-w-[400px]">
                <LinkSection />
              </div>
              <div className="flex-shrink-0 min-w-[300px] lg:min-w-[400px]">
                <VideoSection />
              </div>
              <div className="flex-shrink-0 min-w-[300px] lg:min-w-[400px]">
                <ImageSection />
              </div>
              <div className="flex-shrink-0 min-w-[300px] lg:min-w-[400px]">
                <NotesSection />
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-800">
          <div className="text-center responsive-text-sm text-gray-500">
            <p>Koouk © 2025 All rights reserved</p>
            <p className="mt-2">
              Contact: <a href="mailto:support@koouk.im" className="text-blue-400 hover:underline">support@koouk.im</a>
            </p>
            <p className="mt-2 text-xs">모든 북마크를 한 곳에서</p>
          </div>
        </footer>
      </div>
    </div>
    </ContentProvider>
  )
}

export default function Home() {
  return (
    <UserPlanProvider>
      <HomeContent />
    </UserPlanProvider>
  )
}
