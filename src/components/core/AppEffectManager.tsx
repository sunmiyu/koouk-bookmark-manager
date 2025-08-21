'use client'

import { useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useAppState } from './AppStateManager'
import { useAppEventHandlers } from './AppEventHandlers'
import { useToast } from '@/hooks/useToast'

/**
 * App의 모든 useEffect를 관리하는 커스텀 훅
 * 메모리 누수 방지를 위한 cleanup 함수들을 포함
 */
export function useAppEffectManager() {
  const { user } = useAuth()
  const { showSuccess } = useToast()
  const { activeTab, setActiveTab } = useAppState()
  const { loadUserData, handleImportFolder } = useAppEventHandlers()

  // 🎯 디버깅: activeTab 변경 감지
  useEffect(() => {
    console.log('🎯 App activeTab changed to:', activeTab)
  }, [activeTab])

  // 👤 사용자 로그인 상태 변경 감지
  useEffect(() => {
    if (!user) {
      return
    }

    // 로그인 후 My Folder 탭으로 이동
    setActiveTab('my-folder')
    loadUserData()
  }, [user, setActiveTab, loadUserData])

  // 🔄 큐된 Import 처리 (오프라인 동기화)
  useEffect(() => {
    const processQueuedImports = async () => {
      if (!user?.id || !navigator.onLine) return
      
      try {
        const queuedImports = JSON.parse(localStorage.getItem('koouk-queued-imports') || '[]')
        if (queuedImports.length === 0) return
        
        console.log(`📤 Processing ${queuedImports.length} queued imports...`)
        
        for (const queued of queuedImports) {
          if (queued.userId === user.id) {
            await handleImportFolder(queued.sharedFolder)
          }
        }
        
        // 처리된 import 삭제
        localStorage.removeItem('koouk-queued-imports')
        showSuccess(`✅ Processed ${queuedImports.length} queued imports!`)
        
      } catch (error) {
        console.error('Failed to process queued imports:', error)
      }
    }

    // 사용자 로그인 시 & 온라인 상태일 때 처리
    if (user && navigator.onLine) {
      processQueuedImports()
    }

    // 온라인 이벤트 리스너
    const handleOnline = () => {
      if (user) processQueuedImports()
    }

    window.addEventListener('online', handleOnline)
    
    // ✅ CLEANUP: 메모리 누수 방지
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [user, showSuccess, handleImportFolder])

  // 📱 모바일 환경에서 viewport 변경 감지
  useEffect(() => {
    const handleResize = () => {
      // 모바일에서 키보드가 열릴 때 viewport 높이 조정
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    
    // ✅ CLEANUP: 메모리 누수 방지
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 🌐 네트워크 상태 변화 감지
  useEffect(() => {
    const handleOffline = () => {
      console.log('📱 App went offline')
    }

    const handleOnlineStatus = () => {
      console.log('📱 App came online')
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnlineStatus)
    
    // ✅ CLEANUP: 메모리 누수 방지
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnlineStatus)
    }
  }, [])

  // ⌨️ 키보드 단축키 이벤트
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape 키로 모달들 닫기
      if (event.key === 'Escape') {
        // 여기서 필요한 모달 닫기 로직을 구현할 수 있음
        console.log('🔍 Escape key pressed')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    // ✅ CLEANUP: 메모리 누수 방지
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // 💾 브라우저 탭 닫힐 때 처리
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // 저장되지 않은 데이터가 있는 경우 경고
      const hasUnsavedChanges = false // 실제 로직에서는 상태 확인
      
      if (hasUnsavedChanges) {
        event.preventDefault()
        return (event.returnValue = '')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // ✅ CLEANUP: 메모리 누수 방지
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // 반환값은 없음 (effects만 관리)
  return null
}