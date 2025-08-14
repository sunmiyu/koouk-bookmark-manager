'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

interface InstallPromptProps {
  onDismiss?: () => void
}

export default function InstallPrompt({ onDismiss }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [platform, setPlatform] = useState<'desktop' | 'mobile' | 'unknown'>('unknown')

  useEffect(() => {
    // PWA 설치 상태 확인
    const checkInstallStatus = () => {
      // 스탠드얼론 모드 확인
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (navigator as { standalone?: boolean }).standalone === true ||
                        document.referrer.includes('android-app://')
      
      setIsStandalone(standalone)
      
      // 플랫폼 감지
      const userAgent = navigator.userAgent.toLowerCase()
      if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
        setPlatform('mobile')
      } else {
        setPlatform('desktop')
      }
    }

    checkInstallStatus()

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // 설치 프롬프트를 보여줄지 결정
      const lastDismissed = localStorage.getItem('koouk-install-dismissed')
      const installCount = parseInt(localStorage.getItem('koouk-install-attempts') || '0')
      
      // 3번 이상 거절했거나, 최근 24시간 내에 거절한 경우 표시 안 함
      if (installCount >= 3) return
      if (lastDismissed && Date.now() - parseInt(lastDismissed) < 24 * 60 * 60 * 1000) return
      
      // 처음 방문이거나, 충분한 시간이 지난 후에만 표시
      setTimeout(() => {
        setShowPrompt(true)
      }, 10000) // 10초 후 표시
    }

    // 앱 설치 완료 감지
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      localStorage.setItem('koouk-app-installed', 'true')
      localStorage.removeItem('koouk-install-dismissed')
      localStorage.removeItem('koouk-install-attempts')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // 직접 설치 프롬프트가 없는 경우 안내 모달 표시
      showInstallGuide()
      return
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA 설치 승인됨')
        setShowPrompt(false)
        setIsInstalled(true)
      } else {
        console.log('PWA 설치 거절됨')
        handleDismiss()
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('설치 프롬프트 오류:', error)
      showInstallGuide()
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    
    // 거절 횟수 및 시간 기록
    const attempts = parseInt(localStorage.getItem('koouk-install-attempts') || '0')
    localStorage.setItem('koouk-install-attempts', (attempts + 1).toString())
    localStorage.setItem('koouk-install-dismissed', Date.now().toString())
    
    onDismiss?.()
  }

  const showInstallGuide = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isChrome = /Chrome/.test(navigator.userAgent)
    
    let message = ''
    if (isIOS) {
      message = 'Safari에서 공유 버튼을 누르고 "홈 화면에 추가"를 선택해주세요.'
    } else if (isChrome) {
      message = 'Chrome 브라우저의 메뉴(⋮)에서 "앱 설치"를 선택해주세요.'
    } else {
      message = '브라우저 설정에서 이 사이트를 홈 화면에 추가할 수 있습니다.'
    }
    
    alert(message)
    handleDismiss()
  }

  // 이미 설치되었거나 스탠드얼론 모드면 표시 안 함
  if (isInstalled || isStandalone || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                {platform === 'mobile' ? (
                  <Smartphone className="w-5 h-5 text-white" />
                ) : (
                  <Monitor className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  앱으로 설치하세요
                </h3>
                <p className="text-xs text-gray-500">
                  더 빠르고 편리하게
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Koouk을 {platform === 'mobile' ? '홈 화면' : '데스크톱'}에 설치하여 
            네이티브 앱처럼 사용해보세요.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 px-3 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              나중에
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-2 px-3 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              설치
            </button>
          </div>
        </div>
        
        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      </div>
    </div>
  )
}