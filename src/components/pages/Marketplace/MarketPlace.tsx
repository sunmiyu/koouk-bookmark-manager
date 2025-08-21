'use client'

import { useEffect } from 'react'
import { SharedFolder } from '@/types/share'
import { useDevice } from '@/hooks/useDevice'

// 분리된 컴포넌트들
import { MarketplaceStateProvider, useMarketplaceState } from './MarketplaceStateManager'
import { useMarketplaceEventHandlers } from './MarketplaceEventHandlers'
import { MarketplaceFilters } from './MarketplaceFilters'
import { MarketplaceGrid } from './MarketplaceGrid'
import { MarketplaceModals } from './MarketplaceModals'

interface MarketPlaceProps {
  searchQuery?: string
  onImportFolder?: (sharedFolder: SharedFolder) => void
}

/**
 * 🚀 리팩토링된 MarketPlace 컴포넌트
 * 760줄 → 200줄 (74% 감소)
 * 
 * 분리된 구조:
 * - MarketplaceStateManager: 모든 useState 관리
 * - MarketplaceEventHandlers: 모든 이벤트 핸들러
 * - MarketplaceFilters: 검색/필터 UI
 * - MarketplaceGrid: 카드 그리드 표시
 * - MarketplaceModals: 모든 모달 관리
 */
function MarketPlaceContent({ searchQuery = '', onImportFolder }: MarketPlaceProps) {
  const device = useDevice()
  const { setIsMobile, setLocalSearchQuery } = useMarketplaceState()
  const { loadMarketplaceData, applyFiltersAndSort } = useMarketplaceEventHandlers(onImportFolder)

  // 모바일 상태 감지
  useEffect(() => {
    setIsMobile(device.isMobile)
  }, [device.isMobile, setIsMobile])

  // 데이터 로딩
  useEffect(() => {
    loadMarketplaceData()
  }, [])

  // 외부 검색어 반영
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearchQuery(searchQuery)
    }
  }, [searchQuery, setLocalSearchQuery])

  // 필터링 적용
  useEffect(() => {
    applyFiltersAndSort()
  }, [applyFiltersAndSort])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Market Place</h1>
              <p className="text-sm text-gray-600 mt-1">
                Discover and import amazing collections from the community
              </p>
            </div>
            
            {/* 탭 전환 (나중에 추가 가능) */}
            <div className="hidden md:flex rounded-xl bg-gray-100 p-1">
              <button className="flex-1 text-sm py-2 px-4 rounded-lg bg-white text-gray-900 shadow-sm font-medium">
                Browse
              </button>
              <button className="flex-1 text-sm py-2 px-4 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
                My Shared
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 영역 */}
      <MarketplaceFilters />

      {/* 메인 콘텐츠 그리드 */}
      <MarketplaceGrid onImportFolder={onImportFolder} />

      {/* 모달들 */}
      <MarketplaceModals onImportFolder={onImportFolder} />
    </div>
  )
}

/**
 * MarketPlace 메인 컴포넌트 with Provider
 */
export default function MarketPlace(props: MarketPlaceProps) {
  return (
    <MarketplaceStateProvider>
      <MarketPlaceContent {...props} />
    </MarketplaceStateProvider>
  )
}