'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [visitCount, setVisitCount] = useState(0)

  useEffect(() => {
    // PWA가 이미 설치되어 있는지 확인
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return
      }
      
      // iOS Safari 확인
      if ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true) {
        setIsInstalled(true)
        return
      }
    }

    // 방문 횟수 확인 (2회 이상 방문 시 표시)
    const checkVisitCount = () => {
      const stored = localStorage.getItem('koouk-visit-count')
      const count = stored ? parseInt(stored) : 0
      const newCount = count + 1
      setVisitCount(newCount)
      localStorage.setItem('koouk-visit-count', newCount.toString())
    }

    // 이전에 설치 프롬프트를 거부했는지 확인
    const checkIfDismissed = () => {
      const dismissed = localStorage.getItem('koouk-install-dismissed')
      if (dismissed) {
        const dismissedDate = new Date(dismissed)
        const now = new Date()
        const daysDiff = (now.getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24)
        // 7일 후 다시 표시
        if (daysDiff < 7) {
          setIsDismissed(true)
        }
      }
    }

    checkIfInstalled()
    checkVisitCount()
    checkIfDismissed()

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    // 앱이 설치되었을 때
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  useEffect(() => {
    // 조건 확인: 설치되지 않음 + 거부하지 않음 + 2회 이상 방문 + 설치 프롬프트 가능
    if (!isInstalled && !isDismissed && visitCount >= 2 && deferredPrompt) {
      // 3초 후 표시 (너무 급하지 않게)
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isInstalled, isDismissed, visitCount, deferredPrompt])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ PWA 설치 승인')
      } else {
        console.log('❌ PWA 설치 거부')
        localStorage.setItem('koouk-install-dismissed', new Date().toISOString())
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('PWA 설치 오류:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setIsDismissed(true)
    localStorage.setItem('koouk-install-dismissed', new Date().toISOString())
  }

  // 설치되었거나 표시하지 않는 경우 렌더링하지 않음
  if (isInstalled || !showPrompt) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="mx-4 mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-gray-900 mb-1">
              📱 홈 화면에 추가하세요!
            </h4>
            <p className="text-[10px] text-gray-600 leading-relaxed mb-3">
              앱처럼 빠르게 접근하고 <br/>
              오프라인에서도 사용 가능해요
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>설치하기</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        
        {/* 작은 화살표 포인터 */}
        <div className="flex justify-center mt-2">
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-blue-400"
          >
            ✨
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}