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
import { useUserPlan } from '@/contexts/UserPlanContext'
import { useLanguage } from '@/contexts/LanguageContext'
import MiniFunctionsArea from '@/components/MiniFunctionsArea'
import { trackEvents } from '@/lib/analytics'

function HomeContent() {
  const { currentPlan, upgradeToProPlan } = useUserPlan()
  const { t } = useLanguage()

  const handleProClick = () => {
    if (currentPlan === 'free') {
      const confirmed = confirm(t('upgrade_to_pro'))
      if (confirmed) {
        upgradeToProPlan()
        trackEvents.upgradePlan('free', 'pro')
        alert(t('upgraded_successfully'))
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
              {/* Pro + Login 버튼 */}
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
          <MiniFunctionsArea />
          
          {/* Horizontal divider between Mini Functions and Todos */}
          <div className="border-t border-gray-800"></div>
          
          <TodoSection />
          
          {/* Horizontal divider between Todos and Contents */}
          <div className="border-t border-gray-800 my-6 sm:my-8"></div>

          {/* Info input section */}
          <InfoInputSection />
          
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
            <p className="mt-2">
              <a 
                href="mailto:support@koouk.im?bcc=tjsalg1@gmail.com&subject=Koouk 피드백&body=필요한 기능 제안이나 수정 보완할 점을 알려주세요:" 
                className="text-green-400 hover:text-green-300 hover:underline text-sm"
              >
                📧 피드백 보내기
              </a>
            </p>
            <p className="mt-1 text-xs text-gray-600">
              필요한 기능 제안, 수정 보완할 점을 보내주시면 적극 반영하겠습니다!
            </p>
            <p className="mt-2 text-xs">Your everyday moments dashboard</p>
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
