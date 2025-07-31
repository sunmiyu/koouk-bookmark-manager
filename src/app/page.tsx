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

type TabType = 'summary' | 'today' | 'dashboard' | 'contents' | 'popular'

function HomeContent() {
  const [activeTab, setActiveTab] = useState<TabType>('summary')

  return (
    <ContentProvider>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto responsive-p-md py-4 sm:py-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-12">
            {/* Professional Header Container */}
            <div className="bg-black rounded-xl p-6">
              <div className="flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center">
                  <KooukLogo />
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
              <nav className="-mb-px flex items-center space-x-12" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`py-4 px-1 border-b-2 font-medium text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'summary'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    Summary
                  </div>
                </button>
                <div className="w-px h-6 bg-gray-600"></div>
                <button
                  onClick={() => setActiveTab('today')}
                  className={`py-4 px-1 border-b-2 font-medium text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'today'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    Today
                  </div>
                </button>
                <div className="w-px h-6 bg-gray-600"></div>
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
                <div className="w-px h-6 bg-gray-600"></div>
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
                <div className="w-px h-6 bg-gray-600"></div>
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
            {activeTab === 'summary' && (
              <div className="space-y-12">
                {/* Overview Stats */}
                <div className="bg-black rounded-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Overview</h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Todos Stats */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="font-medium text-white">Todos</h3>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">12</div>
                      <div className="text-sm text-gray-400">3 completed today</div>
                    </div>

                    {/* Mini Functions Stats */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="font-medium text-white">Mini Functions</h3>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">6</div>
                      <div className="text-sm text-gray-400">Active functions</div>
                    </div>

                    {/* Contents Stats */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <h3 className="font-medium text-white">Content Items</h3>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">24</div>
                      <div className="text-sm text-gray-400">Links, videos, images, notes</div>
                    </div>

                    {/* Activity Stats */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <h3 className="font-medium text-white">This Week</h3>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">18</div>
                      <div className="text-sm text-gray-400">Actions completed</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-black rounded-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm text-white">Completed todo: &quot;Review project documents&quot;</div>
                        <div className="text-xs text-gray-400">2 hours ago</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm text-white">Added new link: &quot;React Best Practices Guide&quot;</div>
                        <div className="text-xs text-gray-400">4 hours ago</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm text-white">Music recommendations updated</div>
                        <div className="text-xs text-gray-400">6 hours ago</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm text-white">Added expense: Lunch $12.50</div>
                        <div className="text-xs text-gray-400">Yesterday</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm text-white">Saved YouTube video: &quot;Next.js 15 New Features&quot;</div>
                        <div className="text-xs text-gray-400">Yesterday</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-black rounded-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button 
                      onClick={() => setActiveTab('dashboard')}
                      className="p-4 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center mb-3">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="font-medium text-white">Add Todo</div>
                      <div className="text-sm text-gray-400">Create a new task</div>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('contents')}
                      className="p-4 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center mb-3">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div className="font-medium text-white">Save Content</div>
                      <div className="text-sm text-gray-400">Add links, notes, media</div>
                    </button>
                    
                    <button className="p-4 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg transition-colors text-left">
                      <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center mb-3">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="font-medium text-white">Settings</div>
                      <div className="text-sm text-gray-400">Customize your dashboard</div>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('popular')}
                      className="p-4 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-yellow-600/20 rounded-lg flex items-center justify-center mb-3">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div className="font-medium text-white">AI Tools</div>
                      <div className="text-sm text-gray-400">Explore useful AI tools</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'today' && (
              <div className="space-y-8">
                {/* Today's Focus Section */}
                <div className="bg-black rounded-xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-white">Today&apos;s Focus</h2>
                        <p className="text-sm text-gray-400">Your most important tasks for today</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Priority Todos - Mobile Optimized */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <input
                        type="checkbox"
                        className="rounded w-6 h-6 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-offset-0 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="text-base font-medium text-white">Complete project presentation</div>
                        <div className="text-sm text-gray-400">Due in 2 hours</div>
                      </div>
                      <div className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-md font-medium">
                        High
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <input
                        type="checkbox"
                        className="rounded w-6 h-6 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-offset-0 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="text-base font-medium text-white">Review team feedback</div>
                        <div className="text-sm text-gray-400">Before 5 PM</div>
                      </div>
                      <div className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-md font-medium">
                        Medium
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                      <input
                        type="checkbox"
                        checked
                        className="rounded w-6 h-6 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-offset-0 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="text-base font-medium text-gray-500 line-through">Update project documentation</div>
                        <div className="text-sm text-gray-500">Completed at 2:30 PM</div>
                      </div>
                      <div className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-md font-medium">
                        Done
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Add Task */}
                  <div className="border-t border-gray-700/50 pt-4">
                    <button 
                      onClick={() => setActiveTab('dashboard')}
                      className="w-full flex items-center gap-3 p-4 bg-blue-600/10 hover:bg-blue-600/20 rounded-lg transition-colors border border-blue-600/20"
                    >
                      <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-blue-400">Add Quick Task</div>
                        <div className="text-sm text-gray-400">Create a new todo for today</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Active Tools - Mobile Optimized 2x2 Grid */}
                <div className="bg-black rounded-xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Active Tools</h2>
                      <p className="text-sm text-gray-400">Quick access to your functions</p>
                    </div>
                  </div>
                  
                  {/* 2x2 Grid for Mobile */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Weather */}
                    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🌤️</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm">Weather</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">22°C Partly Cloudy</div>
                    </div>
                    
                    {/* Time */}
                    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">⏰</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm">Time</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">3:45 PM</div>
                    </div>
                    
                    {/* Music */}
                    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🎵</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm">Music</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">Jazz playlist</div>
                    </div>
                    
                    {/* News */}
                    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">📰</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm">News</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">5 new headlines</div>
                    </div>
                  </div>
                  
                  {/* View All Functions Button */}
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg transition-colors border border-gray-700/50"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="font-medium text-gray-300">View All Functions</span>
                  </button>
                </div>

                {/* Quick Stats Bar */}
                <div className="bg-black rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Quick Stats</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-white font-medium">12</span>
                          <span className="text-gray-400">todos</span>
                        </div>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-white font-medium">6</span>
                          <span className="text-gray-400">functions</span>
                        </div>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-white font-medium">24</span>
                          <span className="text-gray-400">items</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/10 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
