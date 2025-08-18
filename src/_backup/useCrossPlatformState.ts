'use client'

import { useState, useEffect, useCallback } from 'react'

interface NavigationState {
  activeTab: 'my-folder' | 'bookmarks' | 'market-place'
  selectedFolderId: string | undefined
  lastViewedContent: string | undefined
  scrollPositions: { [key: string]: number }
  breadcrumbs: Array<{ id: string; name: string; type: 'folder' }>
  folderEntryMethod: 'breadcrumb' | 'quick-access' | 'direct' | undefined
}

interface UserPreferences {
  viewMode: 'grid' | 'list'
  sortBy: 'recent' | 'oldest' | 'name' | 'type'
  quickAccess: Array<{ id: string; name: string; type: 'folder'; frequency: number }>
}

interface ContentState {
  searchQuery: string
  selectedItems: string[]
  recentlyViewed: string[]
}

interface CrossPlatformState {
  navigation: NavigationState
  preferences: UserPreferences
  content: ContentState
}

const STORAGE_KEY = 'koouk-cross-platform-state'

const defaultState: CrossPlatformState = {
  navigation: {
    activeTab: 'my-folder',
    selectedFolderId: undefined,
    lastViewedContent: undefined,
    scrollPositions: {},
    breadcrumbs: [],
    folderEntryMethod: undefined
  },
  preferences: {
    viewMode: 'grid',
    sortBy: 'recent',
    quickAccess: []
  },
  content: {
    searchQuery: '',
    selectedItems: [],
    recentlyViewed: []
  }
}

export const useCrossPlatformState = () => {
  const [state, setState] = useState<CrossPlatformState>(defaultState)

  // 초기 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsedState = JSON.parse(saved)
          setState(prevState => ({ ...prevState, ...parsedState }))
        } catch (error) {
          console.warn('Failed to parse saved state:', error)
        }
      }
    }
  }, [])

  // 상태 저장
  const saveState = useCallback((newState: Partial<CrossPlatformState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState))
      }
      
      return updatedState
    })
  }, [])

  // 네비게이션 업데이트
  const updateNavigation = useCallback((updates: Partial<NavigationState>) => {
    saveState({
      navigation: { ...state.navigation, ...updates }
    })
  }, [state.navigation, saveState])

  // 사용자 선호도 업데이트
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    saveState({
      preferences: { ...state.preferences, ...updates }
    })
  }, [state.preferences, saveState])

  // 컨텐츠 상태 업데이트
  const updateContent = useCallback((updates: Partial<ContentState>) => {
    saveState({
      content: { ...state.content, ...updates }
    })
  }, [state.content, saveState])

  // Quick Access 관리
  const updateQuickAccess = useCallback((folderId: string, folderName: string) => {
    const currentQuickAccess = [...state.preferences.quickAccess]
    const existingIndex = currentQuickAccess.findIndex(item => item.id === folderId)
    
    if (existingIndex >= 0) {
      // 기존 아이템의 빈도수 증가
      currentQuickAccess[existingIndex].frequency += 1
    } else {
      // 새 아이템 추가 (최대 6개 제한)
      if (currentQuickAccess.length >= 6) {
        // 가장 적게 사용된 항목 제거
        currentQuickAccess.sort((a, b) => a.frequency - b.frequency)
        currentQuickAccess.shift()
      }
      
      currentQuickAccess.push({
        id: folderId,
        name: folderName,
        type: 'folder',
        frequency: 1
      })
    }

    // 빈도수 기준으로 정렬
    currentQuickAccess.sort((a, b) => b.frequency - a.frequency)

    updatePreferences({
      quickAccess: currentQuickAccess
    })
  }, [state.preferences.quickAccess, updatePreferences])

  // 브레드크럼 업데이트
  const updateBreadcrumbs = useCallback((breadcrumbs: NavigationState['breadcrumbs'], entryMethod: NavigationState['folderEntryMethod']) => {
    updateNavigation({
      breadcrumbs,
      folderEntryMethod: entryMethod
    })
  }, [updateNavigation])

  // 스크롤 위치 저장
  const saveScrollPosition = useCallback((key: string, position: number) => {
    updateNavigation({
      scrollPositions: {
        ...state.navigation.scrollPositions,
        [key]: position
      }
    })
  }, [state.navigation.scrollPositions, updateNavigation])

  return {
    state,
    updateNavigation,
    updatePreferences,
    updateContent,
    updateQuickAccess,
    updateBreadcrumbs,
    saveScrollPosition
  }
}