'use client'

// import { useState } from 'react'
import Weather from '@/components/Weather'
import InfoInputSection from '@/components/InfoInputSection'
import TodoSection from '@/components/TodoSection'
import VideoSection from '@/components/VideoSection'
import ImageSection from '@/components/ImageSection'
import NotesSection from '@/components/NotesSection'
import LinkSection from '@/components/LinkSection'
import AuthButton from '@/components/AuthButton'
import KooukLogo from '@/components/KooukLogo'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto responsive-p-md py-4 sm:py-6">
        <header className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <KooukLogo />
            
            {/* 검색바, Pro 플랜, 로그인 버튼 */}
            <div className="flex items-center gap-3">
              {/* 검색바 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search contents here"
                  className="w-48 sm:w-64 px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400 pr-8 text-center"
                />
                <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Pro 플랜 링크 */}
              <a 
                href="/pricing"
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Pro
              </a>
              
              {/* 로그인 버튼 */}
              <AuthButton />
            </div>
          </div>
          <Weather />
        </header>

        <InfoInputSection />

        {/* 구분선 1: 입력란과 Todos 사이 */}
        <div className="border-t border-gray-800 my-6 sm:my-8"></div>

        <main className="space-y-6 sm:space-y-8">
          <TodoSection />

          {/* 구분선 2: Todos와 Content sections 사이 */}
          <div className="border-t border-gray-800 my-6 sm:my-8"></div>
          
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <h2 className="responsive-text-xl font-semibold">Content Sections</h2>
              
              {/* 무료 플랜 제한 안내 */}
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700 self-start sm:self-auto">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Free: 각 타입별 50개 제한</span>
                <a href="/pricing" className="text-blue-400 hover:text-blue-300 font-medium ml-2">
                  업그레이드 →
                </a>
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
  )
}
