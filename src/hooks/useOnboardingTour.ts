'use client'

import { useCallback } from 'react'

export function useOnboardingTour() {
  const startTour = useCallback(async () => {
    if (typeof window === 'undefined') return
    
    // Dynamic import to avoid SSR issues
    const { default: introJs } = await import('intro.js')
    
    // Load CSS dynamically and wait for it to load
    if (!document.querySelector('link[href*="introjs.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/intro.js/introjs.css'
      document.head.appendChild(link)
      
      // Wait for CSS to load
      await new Promise((resolve) => {
        link.onload = resolve
        setTimeout(resolve, 1000) // Fallback timeout
      })
    }
    
    // Add additional delay to ensure CSS is applied
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Wait for tour target elements to be available
    await new Promise(resolve => {
      const checkElements = () => {
        const sidebar = document.querySelector('.sidebar-tour-target')
        const dailyCards = document.querySelector('.daily-cards-tour-target')
        const storage = document.querySelector('.storage-tour-target')
        
        if (sidebar && dailyCards && storage) {
          resolve(true)
        } else {
          setTimeout(checkElements, 100)
        }
      }
      checkElements()
      // Fallback timeout after 3 seconds
      setTimeout(() => resolve(true), 3000)
    })
    
    const intro = introJs()
    
    // Debug: Check if tooltip elements exist before starting
    intro.onbeforechange(function(targetElement) {
      console.log('Tour step changing to:', targetElement)
      // Always return true to allow progression
      return true
    })
    
    intro.onafterchange(function(targetElement) {
      console.log('Tour step changed to:', targetElement)
      // Apply custom styles after each step change
      setTimeout(() => {
        const tooltip = document.querySelector('.koouk-intro-tooltip') as HTMLElement
        if (tooltip) {
          console.log('Tooltip found, applying styles')
          const style = tooltip.style
          style.zIndex = '2147483647'
          style.position = 'fixed'
        } else {
          console.log('Tooltip not found')
        }
      }, 50)
    })
    
    // Handle tour errors - check if onerror exists
    const introWithError = intro as { onerror?: (callback: (stepIndex: number, reason: string) => boolean) => void }
    if (typeof introWithError.onerror === 'function') {
      introWithError.onerror(function(stepIndex: number, reason: string) {
        console.warn('Tour error at step', stepIndex, ':', reason)
        // Continue to next step or complete tour
        return true
      })
    }
    
    intro.setOptions({
      nextLabel: '다음',
      prevLabel: '이전',
      skipLabel: '건너뛰기',
      doneLabel: '완료',
      showProgress: true,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      scrollToElement: true,
      overlayOpacity: 0.6,
      tooltipClass: 'koouk-intro-tooltip',
      highlightClass: 'koouk-intro-highlight',
      disableInteraction: false,
      tooltipPosition: 'bottom' as const,
      steps: [
        {
          title: 'Koouk에 오신 것을 환영합니다',
          intro: `
            <div style="line-height: 1.6; color: #333333;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">
                개인 라이프스타일을 위한 직관적인 대시보드입니다.
              </p>
              <p style="margin: 0; color: #6B7280; font-size: 14px;">
                복잡한 설정 없이 바로 시작할 수 있습니다.
              </p>
            </div>
          `
        },
        {
          element: '.sidebar-tour-target',
          title: '메뉴',
          intro: `
            <div style="line-height: 1.6; color: #333333;">
              <p style="margin: 0 0 16px 0; color: #333333;">
                Daily Card - 할일과 일기 관리
              </p>
              <p style="margin: 0 0 16px 0; color: #333333;">
                Storage - 링크, 이미지, 영상 보관
              </p>
              <p style="margin: 0 0 16px 0; color: #333333;">
                TalkTalk - 일상 소통
              </p>
              <p style="margin: 0; color: #6B7280; font-size: 14px;">
                직관적인 인터페이스로 설계되었습니다.
              </p>
            </div>
          `,
          position: 'right'
        },
        {
          element: '.daily-cards-tour-target',
          title: 'Daily Cards',
          intro: `
            <div style="line-height: 1.6; color: #333333;">
              <p style="margin: 0 0 16px 0; color: #333333;">
                좌우 스와이프로 어제, 오늘, 내일을 확인할 수 있습니다.
              </p>
              <p style="margin: 0 0 16px 0; color: #333333;">
                할일 입력 후 엔터키를 누르면 저장됩니다.
              </p>
              <p style="margin: 0; color: #6B7280; font-size: 14px;">
                일기는 자동으로 저장됩니다.
              </p>
            </div>
          `,
          position: 'bottom'
        },
        {
          element: '.storage-tour-target',
          title: 'Storage',
          intro: `
            <div style="line-height: 1.6; color: #333333;">
              <p style="margin: 0 0 16px 0; color: #333333;">
                URL - 링크 붙여넣기로 저장
              </p>
              <p style="margin: 0 0 16px 0; color: #333333;">
                이미지 - 드래그 앤 드롭으로 저장
              </p>
              <p style="margin: 0 0 16px 0; color: #333333;">
                영상 - 유튜브 URL로 저장
              </p>
              <p style="margin: 0; color: #6B7280; font-size: 14px;">
                간단한 조작으로 콘텐츠를 보관할 수 있습니다.
              </p>
            </div>
          `,
          position: 'left'
        },
        {
          title: '시작하기',
          intro: `
            <div style="line-height: 1.6; color: #333333;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">
                이제 Koouk을 사용할 준비가 완료되었습니다.
              </p>
              <p style="margin: 0 0 20px 0; color: #333333;">
                직관적인 인터페이스로 자연스럽게 사용하실 수 있습니다.
              </p>
              <p style="margin: 0; color: #6B7280; font-size: 14px;">
                도움이 필요하시면 언제든 투어를 다시 시작하세요.
              </p>
            </div>
          `
        }
      ]
    })

    // 투어 완료 후 로컬스토리지에 저장
    intro.oncomplete(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('koouk-tour-completed', 'true')
        localStorage.setItem('koouk-tour-completed-date', new Date().toISOString())
      }
    })

    // 투어 건너뛰기 시에도 저장
    intro.onexit(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('koouk-tour-completed', 'true')
        localStorage.setItem('koouk-tour-completed-date', new Date().toISOString())
      }
    })

    intro.start()
  }, [])

  const shouldShowTour = useCallback(() => {
    if (typeof window === 'undefined') return false
    
    const tourCompleted = localStorage.getItem('koouk-tour-completed')
    const completedDate = localStorage.getItem('koouk-tour-completed-date')
    
    // 투어를 완료한 적이 없으면 보여주기
    if (!tourCompleted) return true
    
    // 30일 후에는 다시 보여주기 (선택사항)
    if (completedDate) {
      const completed = new Date(completedDate)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - completed.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff > 30) return true
    }
    
    return false
  }, [])

  const resetTour = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('koouk-tour-completed')
      localStorage.removeItem('koouk-tour-completed-date')
    }
  }, [])

  return {
    startTour,
    shouldShowTour,
    resetTour
  }
}