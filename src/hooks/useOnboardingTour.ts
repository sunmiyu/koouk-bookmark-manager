'use client'

import { useCallback } from 'react'

export function useOnboardingTour() {
  const startTour = useCallback(async () => {
    if (typeof window === 'undefined') return
    
    // Dynamic import to avoid SSR issues
    const { default: introJs } = await import('intro.js')
    
    // Load CSS dynamically
    if (!document.querySelector('link[href*="introjs.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/intro.js/introjs.css'
      document.head.appendChild(link)
    }
    
    const intro = introJs()
    
    intro.setOptions({
      nextLabel: '다음 🚀',
      prevLabel: '← 이전',
      skipLabel: '건너뛰기',
      doneLabel: '완료! 🎉',
      showProgress: true,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      scrollToElement: true,
      overlayOpacity: 0.8,
      tooltipClass: 'koouk-intro-tooltip',
      highlightClass: 'koouk-intro-highlight',
      steps: [
        {
          title: '🎉 Koouk에 오신 걸 환영해요!',
          intro: `
            <div style="text-align: center; line-height: 1.6;">
              <p style="margin: 0 0 16px 0; font-size: 16px;">
                안녕하세요! 저는 여러분의 개인 도우미 Koouk이에요 👋
              </p>
              <p style="margin: 0 0 16px 0; color: #6B7280;">
                3초만에 이해할 수 있는 <strong>초간단</strong> 개인 대시보드예요!
              </p>
              <p style="margin: 0; color: #10B981; font-weight: 500;">
                Notion처럼 복잡하지 않으니까 걱정 마세요 😊
              </p>
            </div>
          `
        },
        {
          element: '.sidebar-tour-target',
          title: '📋 여기서 모든 걸 관리해요',
          intro: `
            <div style="line-height: 1.6;">
              <p style="margin: 0 0 12px 0;">
                <strong>Daily Card</strong> - 오늘의 할일, 일기 📝
              </p>
              <p style="margin: 0 0 12px 0;">
                <strong>Storage</strong> - 링크, 사진, 영상 보관 📦
              </p>
              <p style="margin: 0 0 12px 0;">
                <strong>TalkTalk</strong> - 매일 질문과 소통 💬
              </p>
              <p style="margin: 0; color: #6B7280; font-size: 14px;">
                클릭 한 번이면 끝! 어렵지 않죠? 😉
              </p>
            </div>
          `,
          position: 'right'
        },
        {
          element: '.daily-cards-tour-target',
          title: '📅 Daily Cards - 이게 핵심이에요!',
          intro: `
            <div style="line-height: 1.6;">
              <p style="margin: 0 0 12px 0;">
                좌우로 쓸어보세요! 📱 → →
              </p>
              <p style="margin: 0 0 12px 0;">
                <strong>어제-오늘-내일</strong>을 한눈에 볼 수 있어요
              </p>
              <p style="margin: 0 0 12px 0;">
                할 일 적고 → 엔터! <br/>
                일기 쓰고 → 자동저장! 
              </p>
              <p style="margin: 0; color: #10B981; font-weight: 500;">
                진짜 easy easy super easy! 🎯
              </p>
            </div>
          `,
          position: 'bottom'
        },
        {
          element: '.storage-tour-target',
          title: '🏪 Storage - 모든 걸 여기에!',
          intro: `
            <div style="line-height: 1.6;">
              <p style="margin: 0 0 12px 0;">
                <strong>URL</strong> - 링크 붙여넣기 → 저장! 🔗
              </p>
              <p style="margin: 0 0 12px 0;">
                <strong>이미지</strong> - 드래그&드롭 → 저장! 🖼️
              </p>
              <p style="margin: 0 0 12px 0;">
                <strong>영상</strong> - 유튜브 URL → 저장! 🎥
              </p>
              <p style="margin: 0; color: #6B7280; font-size: 14px;">
                복잡한 폼? 그런 건 없어요! 
              </p>
              <p style="margin: 8px 0 0 0; color: #EF4444; font-weight: 500;">
                진짜 1초면 저장 완료! ⚡
              </p>
            </div>
          `,
          position: 'left'
        },
        {
          title: '🚀 이제 시작해볼까요?',
          intro: `
            <div style="text-align: center; line-height: 1.6;">
              <p style="margin: 0 0 16px 0; font-size: 18px;">
                축하해요! 이제 Koouk 마스터예요 🎖️
              </p>
              <p style="margin: 0 0 16px 0;">
                복잡한 건 없어요. 그냥 <strong>직감</strong>대로 클릭하세요!
              </p>
              <p style="margin: 0 0 16px 0; color: #6B7280;">
                막히면 오른쪽 가이드를 보거나 다시 투어를 시작하세요 💡
              </p>
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          padding: 12px; border-radius: 12px; color: white; margin-top: 16px;">
                <strong>✨ 팁: 모든 기능이 "직관적"으로 설계되었어요!</strong>
              </div>
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