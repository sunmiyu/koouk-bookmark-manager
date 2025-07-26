'use client'

import { useState } from 'react'
import Weather from '@/components/Weather'
import InfoInputSection from '@/components/InfoInputSection'
import TodoSection from '@/components/TodoSection'
import VideoSection from '@/components/VideoSection'
import ImageSection from '@/components/ImageSection'
import NotesSection from '@/components/NotesSection'
import LinkSection from '@/components/LinkSection'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto responsive-p-md py-4 sm:py-6">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between responsive-gap-md mb-4 sm:mb-6">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center responsive-gap-sm mb-2">
                <h1 className="responsive-text-3xl font-bold">Koouk</h1>
                <span className="text-gray-400 responsive-text-lg hidden sm:inline">All your bookmarks in one place</span>
              </div>
              <span className="text-gray-400 responsive-text-base sm:hidden">All your bookmarks in one place</span>
            </div>
            <div className="text-left sm:text-right">
              <div className="responsive-text-sm text-gray-400">Guest</div>
            </div>
          </div>
          <Weather />
        </header>

        <InfoInputSection />

        <main className="space-y-6 sm:space-y-8">
          <TodoSection />
          
          <div className="space-y-6 sm:space-y-8">
            <h2 className="responsive-text-xl font-semibold">Content Sections</h2>
            
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
