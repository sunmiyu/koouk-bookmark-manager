'use client'

import { useState, useEffect } from 'react'
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
import SearchResults from '@/components/SearchResults'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Link from 'next/link'
import { ContentProvider } from '@/contexts/ContentContext'
import SplashScreen from '@/components/SplashScreen'
import { TodayTodosProvider } from '@/contexts/TodayTodosContext'
import TodayTodoCard from '@/components/TodayTodoCard'
import TemperatureGraph from '@/components/TemperatureGraph'
import { useWeatherData } from '@/hooks/useWeatherData'
import { useMiniFunctions } from '@/contexts/MiniFunctionsContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { useSearch } from '@/contexts/SearchContext'
import { useLanguage } from '@/contexts/LanguageContext'

type TabType = 'summary' | 'today' | 'dashboard' | 'contents' | 'popular'

function HomeContent() {
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  const [isLoading, setIsLoading] = useState(true)
  const { weatherData } = useWeatherData()
  const { availableFunctions, enabledFunctions } = useMiniFunctions()
  const { currentPlan } = useUserPlan()
  const { searchResults } = useSearch()
  const { t } = useLanguage()

  // Simulate app initialization
  useEffect(() => {
    const initializeApp = async () => {
      // Simulate loading time for demo
      await new Promise(resolve => setTimeout(resolve, 500))
      // Here you would typically load:
      // - User authentication
      // - User preferences
      // - Initial data
      // - etc.
    }
    
    initializeApp()
  }, [])

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen onComplete={() => setIsLoading(false)} />
  }

  return (
    <TodayTodosProvider>
      <ContentProvider>
        <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto py-4 max-w-md px-4">
          <header className="mb-16">
            {/* Professional Header Container */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50">
              <div className="flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center">
                  <KooukLogo />
                </div>
                
                {/* Right: Weather, Time & Account */}
                <div className="flex items-center gap-4">
                  {/* Weather & Time */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/30">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.005 4.005 0 003 15z" />
                      </svg>
                      <WeatherOnly />
                    </div>
                    <div className="w-px h-8 bg-gray-600"></div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/30">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <TimeDisplay />
                    </div>
                  </div>
                  <LanguageSwitcher compact={true} className="mr-3" />
                  <AuthButton />
                </div>
              </div>
            </div>
          </header>

          {/* Search Bar */}
          <div className="mb-12">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <SearchBar compactMode={true} className="max-w-full pl-12" />
            </div>
          </div>

          {/* Search Results or Tab Content */}
          {searchResults ? (
            <div className="mb-8">
              <SearchResults />
            </div>
          ) : (
            <>
              {/* Enhanced Tab Navigation with Icons */}
              <div className="mb-16 mt-8">
            <div className="bg-gray-900/30 rounded-2xl p-2 border border-gray-800/50">
              <nav className="flex items-center justify-between" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex-1 py-4 px-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'summary'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="hidden sm:inline">{t('summary')}</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('today')}
                  className={`flex-1 py-4 px-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'today'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="hidden sm:inline">{t('todos')}</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex-1 py-4 px-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="hidden sm:inline">{t('dashboard')}</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('contents')}
                  className={`flex-1 py-4 px-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'contents'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="hidden sm:inline">{t('contents')}</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('popular')}
                  className={`flex-1 py-4 px-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all duration-300 ${
                    activeTab === 'popular'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span className="hidden sm:inline">{t('popular')}</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <main>
            {activeTab === 'summary' && (
              <div className="space-y-10">
                {/* Temperature Graph */}
                {weatherData?.hourlyData ? (
                  <TemperatureGraph 
                    hourlyData={weatherData.hourlyData}
                    currentTemp={weatherData.weather.current}
                  />
                ) : (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 w-full">
                    <div className="flex items-center justify-center h-32">
                      <div className="text-gray-400 text-sm">Loading temperature data...</div>
                    </div>
                  </div>
                )}

                {/* Today's Focus from Todos */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50">
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-white">Today&apos;s Focus</h2>
                    </div>
                    <p className="text-base text-gray-300 ml-11">Your most important tasks for today</p>
                  </div>
                  
                  {/* Today's Todo Card - Synchronized */}
                  <TodayTodoCard />
                </div>

                {/* Activity Table */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <span className="text-base font-medium text-white">Todo completed</span>
                      </div>
                      <span className="text-sm text-gray-400 font-medium">2h ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        </div>
                        <span className="text-base font-medium text-white">Link added</span>
                      </div>
                      <span className="text-sm text-gray-400 font-medium">4h ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                          <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                        </div>
                        <span className="text-base font-medium text-white">Music updated</span>
                      </div>
                      <span className="text-sm text-gray-400 font-medium">6h ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-700/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        </div>
                        <span className="text-base font-medium text-white">Expense logged</span>
                      </div>
                      <span className="text-sm text-gray-400 font-medium">1d ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        </div>
                        <span className="text-base font-medium text-white">Video saved</span>
                      </div>
                      <span className="text-sm text-gray-400 font-medium">1d ago</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white">Dashboard Stats</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                          <span className="text-white font-bold text-lg">12</span>
                          <span className="text-gray-300 text-base">todos</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                          <span className="text-white font-bold text-lg">6</span>
                          <span className="text-gray-300 text-base">functions</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="text-white font-bold text-lg">24</span>
                          <span className="text-gray-300 text-base">items</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <span className="text-white font-bold text-lg">18</span>
                          <span className="text-gray-300 text-base">weekly</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-green-500/20 rounded-xl border border-green-500/30">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-base font-bold">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'today' && (
              <div className="space-y-8">
                {/* Today's Todos Section - Mobile Optimized */}
                <TodoSection />
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Mini Functions Section - Mobile Optimized */}
                <div className="bg-black rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-white">Mini Functions</h2>
                        <p className="text-sm text-gray-400">Quick access to your active tools</p>
                      </div>
                      <Link href="/mini-functions">
                        <button 
                          className="w-12 h-12 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
                          title="Mini Functions 관리"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </Link>
                    </div>
                  </div>
                  
                  {availableFunctions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">No Mini Functions Available</h3>
                      <p className="text-gray-400 mb-6">Configure your functions to get started</p>
                    </div>
                  ) : (
                    <>
                      {/* All 14 Mini Functions Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {[
                          // 로컬 저장 가능 (무료 플랜)
                          { id: 'expenses', name: '가계부', description: '일일 지출 및 수입 관리', icon: '💰', requiresAPI: false, planRequired: 'free', bgColor: 'bg-yellow-600/20' },
                          { id: 'diary', name: '일기', description: '오늘의 감정과 기억 기록', icon: '📝', requiresAPI: false, planRequired: 'free', bgColor: 'bg-pink-600/20' },
                          { id: 'alarms', name: '알람', description: '일상 알람 및 리마인더', icon: '⏰', requiresAPI: false, planRequired: 'free', bgColor: 'bg-purple-600/20' },
                          { id: 'dday', name: 'D-Day', description: '중요한 날짜 카운트다운', icon: '📅', requiresAPI: false, planRequired: 'free', bgColor: 'bg-teal-600/20' },
                          { id: 'song-practice', name: '노래 연습', description: '연습할 노래 목록 관리', icon: '🎤', requiresAPI: false, planRequired: 'free', bgColor: 'bg-green-600/20' },
                          { id: 'anniversaries', name: '기념일', description: '중요한 기념일 관리', icon: '🎉', requiresAPI: false, planRequired: 'free', bgColor: 'bg-red-600/20' },
                          { id: 'goals', name: '목표 세팅', description: '개인 목표 설정 및 관리', icon: '🎯', requiresAPI: false, planRequired: 'free', bgColor: 'bg-blue-600/20' },
                          { id: 'english-study', name: '영어 공부', description: '매일 영어 단어 학습', icon: '📚', requiresAPI: false, planRequired: 'free', bgColor: 'bg-indigo-600/20' },
                          { id: 'unit-converter', name: '단위변환', description: '길이, 무게, 온도 등 단위 변환', icon: '📐', requiresAPI: false, planRequired: 'free', bgColor: 'bg-gray-600/20' },
                          { id: 'world-time', name: '세계시간', description: '여러 시간대 동시 표시', icon: '🌍', requiresAPI: false, planRequired: 'free', bgColor: 'bg-cyan-600/20' },
                          { id: 'exercise-tracker', name: '운동기록', description: '운동 종류별 기록 관리', icon: '💪', requiresAPI: false, planRequired: 'free', bgColor: 'bg-orange-600/20' },
                          { id: 'motivation-quotes', name: '동기부여', description: '매일 새로운 동기부여 메시지', icon: '✨', requiresAPI: false, planRequired: 'free', bgColor: 'bg-purple-600/20' },
                          
                          // API 필요 (유료 플랜)
                          { id: 'news', name: '뉴스', description: '최신 뉴스 헤드라인', icon: '📰', requiresAPI: true, planRequired: 'pro', bgColor: 'bg-red-600/20' },
                          { id: 'stocks', name: '주식', description: '주요 주식 지수 및 정보', icon: '📈', requiresAPI: true, planRequired: 'pro', bgColor: 'bg-green-600/20' },
                        ].map((func) => {
                          const isEnabled = enabledFunctions.some(enabled => enabled.id === func.id)
                          const isPremiumFeature = func.planRequired === 'pro'
                          const needsUpgrade = isPremiumFeature && currentPlan === 'free'
                          
                          return (
                            <div key={func.id} className="relative">
                              <div className={`bg-gray-800/30 rounded-xl p-4 transition-colors border border-gray-700/30 ${
                                isEnabled && !needsUpgrade ? 'hover:bg-gray-800/50' : ''
                              }`}>
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${func.bgColor}`}>
                                    <span className="text-xl">{func.icon}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-white text-base">{func.name}</div>
                                  </div>
                                </div>
                                
                                {isEnabled && !needsUpgrade ? (
                                  // Show active function content
                                  <>
                                    <div className="text-sm text-gray-300 mb-1">
                                      {func.id === 'expenses' ? '오늘 지출' :
                                       func.id === 'diary' ? '최근 일기' :
                                       func.id === 'alarms' ? '다음 알람' :
                                       func.id === 'dday' ? '카운트다운' :
                                       func.id === 'song-practice' ? '연습 목록' :
                                       func.id === 'anniversaries' ? '다가오는 기념일' :
                                       func.id === 'goals' ? '진행 중인 목표' :
                                       func.id === 'english-study' ? '오늘의 단어' :
                                       func.id === 'unit-converter' ? '최근 변환' :
                                       func.id === 'world-time' ? '세계 시간' :
                                       func.id === 'exercise-tracker' ? '오늘 운동' :
                                       func.id === 'motivation-quotes' ? '오늘의 글귀' :
                                       func.id === 'news' ? '헤드라인' :
                                       func.id === 'stocks' ? 'KOSPI' :
                                       '상태'}
                                    </div>
                                    <div className="text-base font-bold text-white mb-1">
                                      {func.id === 'expenses' ? '₩34,500' :
                                       func.id === 'diary' ? '좋은 하루였다...' :
                                       func.id === 'alarms' ? '7:30 AM' :
                                       func.id === 'dday' ? 'D-156' :
                                       func.id === 'song-practice' ? '5곡 연습중' :
                                       func.id === 'anniversaries' ? '생일 D-12' :
                                       func.id === 'goals' ? '3/5 완료' :
                                       func.id === 'english-study' ? 'Achievement' :
                                       func.id === 'unit-converter' ? '1m = 3.3ft' :
                                       func.id === 'world-time' ? 'NYC 08:30' :
                                       func.id === 'exercise-tracker' ? '30분 운동' :
                                       func.id === 'motivation-quotes' ? '"Success is..."' :
                                       func.id === 'news' ? '5개 새 기사' :
                                       func.id === 'stocks' ? '+1.2%' :
                                       'Active'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {func.id === 'expenses' ? '5건 기록' :
                                       func.id === 'diary' ? '2시간 전' :
                                       func.id === 'alarms' ? '내일' :
                                       func.id === 'dday' ? '신정 2026' :
                                       func.id === 'song-practice' ? '이번 주' :
                                       func.id === 'anniversaries' ? '친구 생일' :
                                       func.id === 'goals' ? '60% 진행' :
                                       func.id === 'english-study' ? '고급 단어' :
                                       func.id === 'unit-converter' ? '길이 변환' :
                                       func.id === 'world-time' ? '6개 도시' :
                                       func.id === 'exercise-tracker' ? '주 3회 달성' :
                                       func.id === 'motivation-quotes' ? '매일 업데이트' :
                                       func.id === 'news' ? '10분 전 업데이트' :
                                       func.id === 'stocks' ? '장 열림' :
                                       '최근 업데이트'}
                                    </div>
                                  </>
                                ) : (
                                  // Show inactive function
                                  <>
                                    <div className="text-sm text-gray-400 mb-1">{func.description}</div>
                                    <div className="text-xs text-gray-500">비활성화됨</div>
                                  </>
                                )}
                              </div>
                              
                              {/* Premium Overlay */}
                              {needsUpgrade && (
                                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
                                  <div className="text-yellow-400 text-xl mb-2">🔒</div>
                                  <div className="text-sm font-bold text-yellow-400 mb-3">Pro 기능</div>
                                  <Link href="/pricing">
                                    <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg font-bold transition-colors">
                                      업그레이드
                                    </button>
                                  </Link>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* View All Functions Button */}
                      <Link href="/mini-functions">
                        <button className="w-full flex items-center justify-center gap-3 p-4 bg-gray-800/30 hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-700/30">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          <span className="font-bold text-gray-300 text-base">전체 기능 관리</span>
                        </button>
                      </Link>
                    </>
                  )}
                </div>

                {/* Function Stats */}
                <div className="bg-black rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Function Stats</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-white font-medium">{enabledFunctions.length}</span>
                          <span className="text-gray-400">active</span>
                        </div>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-white font-medium">{availableFunctions.length}</span>
                          <span className="text-gray-400">available</span>
                        </div>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-white font-medium">{currentPlan === 'unlimited' ? '∞' : currentPlan === 'pro' ? '4' : '0'}</span>
                          <span className="text-gray-400">limit</span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                      currentPlan === 'unlimited' ? 'bg-purple-600/10' :
                      currentPlan === 'pro' ? 'bg-blue-600/10' :
                      'bg-gray-600/10'
                    }`}>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        currentPlan === 'unlimited' ? 'bg-purple-400' :
                        currentPlan === 'pro' ? 'bg-blue-400' :
                        'bg-gray-400'
                      }`}></div>
                      <span className={`text-xs font-medium capitalize ${
                        currentPlan === 'unlimited' ? 'text-purple-400' :
                        currentPlan === 'pro' ? 'text-blue-400' :
                        'text-gray-400'
                      }`}>{currentPlan}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contents' && (
              <div className="space-y-6">
                {/* Add Content Section */}
                <div className="bg-black rounded-xl p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white">Add Content</h2>
                    <p className="text-sm text-gray-400">Save links, notes, videos, and images</p>
                  </div>
                  <InfoInputSection />
                </div>
                
                {/* Storage Overview */}
                <div className="bg-black rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Storage</h2>
                      <p className="text-sm text-gray-400">Your saved content</p>
                    </div>
                    <SearchBar />
                  </div>
                  
                  {/* Storage Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-blue-400 mb-1">8</div>
                      <div className="text-sm text-gray-300">Links</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-green-400 mb-1">5</div>
                      <div className="text-sm text-gray-300">Videos</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-purple-400 mb-1">12</div>
                      <div className="text-sm text-gray-300">Notes</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-yellow-400 mb-1">7</div>
                      <div className="text-sm text-gray-300">Images</div>
                    </div>
                  </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-4">
                  <LinkSection />
                  <VideoSection />
                  <NotesSection />
                  <ImageSection />
                </div>
              </div>
            )}

            {activeTab === 'popular' && (
              <div className="space-y-6">
                {/* AI Tools Overview */}
                <div className="bg-black rounded-xl p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white">AI Tools</h2>
                    <p className="text-sm text-gray-400">Curated collection of useful AI tools</p>
                  </div>
                  
                  {/* Category Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-blue-400 mb-1">8</div>
                      <div className="text-sm text-gray-300">Writing</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-green-400 mb-1">6</div>
                      <div className="text-sm text-gray-300">Design</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-purple-400 mb-1">5</div>
                      <div className="text-sm text-gray-300">Code</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-yellow-400 mb-1">4</div>
                      <div className="text-sm text-gray-300">Productivity</div>
                    </div>
                  </div>
                </div>

                {/* Writing Tools */}
                <div className="bg-black rounded-xl p-6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-white">✍️ Writing & Content</h3>
                  </div>
                  <div className="space-y-3">
                    <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">ChatGPT</div>
                        <div className="text-xs text-gray-400">Conversational AI assistant</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Claude</div>
                        <div className="text-xs text-gray-400">AI assistant by Anthropic</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.notion.so/product/ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Notion AI</div>
                        <div className="text-xs text-gray-400">AI-powered writing assistant</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                  </div>
                </div>

                {/* Design Tools */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50">
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎨</span>
                      <h3 className="text-xl font-bold text-white">Design & Creative</h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <a href="https://www.midjourney.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Midjourney</div>
                        <div className="text-xs text-gray-400">AI image generation</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.canva.com/ai-image-generator/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Canva AI</div>
                        <div className="text-xs text-gray-400">Design with AI assistance</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.figma.com/ai/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Figma AI</div>
                        <div className="text-xs text-gray-400">AI-powered design tools</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                  </div>
                </div>

                {/* Code Tools */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50">
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💻</span>
                      <h3 className="text-xl font-bold text-white">Development & Code</h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <a href="https://github.com/features/copilot" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">GitHub Copilot</div>
                        <div className="text-xs text-gray-400">AI pair programmer</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.cursor.sh" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Cursor</div>
                        <div className="text-xs text-gray-400">AI-powered code editor</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://v0.dev" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">v0 by Vercel</div>
                        <div className="text-xs text-gray-400">Generate UI with AI</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                  </div>
                </div>

                {/* Productivity Tools */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50">
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚡</span>
                      <h3 className="text-xl font-bold text-white">Productivity & Business</h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <a href="https://www.perplexity.ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Perplexity</div>
                        <div className="text-xs text-gray-400">AI-powered search engine</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://gamma.app" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Gamma</div>
                        <div className="text-xs text-gray-400">AI presentation maker</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                    <a href="https://www.otter.ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-white">Otter.ai</div>
                        <div className="text-xs text-gray-400">AI meeting transcription</div>
                      </div>
                      <div className="text-xs text-blue-400">→</div>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </main>
            </>
          )}

          <footer className="mt-16">
            {/* Professional Footer Container */}
            <div className="bg-black rounded-xl p-6">
              <div className="flex flex-col items-center justify-between gap-3">
                {/* Mobile stacked layout */}
                <div className="flex flex-col items-center gap-3 w-full">
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
                    <div className="w-px h-4 bg-gray-700"></div>
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
    </TodayTodosProvider>
  )
}

export default function Home() {
  return <HomeContent />
}
