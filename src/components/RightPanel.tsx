'use client'

import { useState, useEffect } from 'react'
import { SectionType } from '@/app/page'

interface RightPanelProps {
  activeSection: SectionType
}

interface ProgressItem {
  id: string
  title: string
  completed: boolean
  description: string
}

export default function RightPanel({ activeSection }: RightPanelProps) {
  const [progress, setProgress] = useState<ProgressItem[]>([
    { id: '1', title: '첫 할 일 추가', completed: false, description: 'Daily Cards에서 오늘의 할 일을 추가해보세요' },
    { id: '2', title: '일기 작성', completed: false, description: '하루를 기록하는 습관을 만들어보세요' },
    { id: '3', title: 'URL 저장', completed: false, description: '유용한 링크들을 Storage에 저장하세요' },
    { id: '4', title: '정보 확인', completed: false, description: '주식이나 뉴스 정보를 확인해보세요' }
  ])

  const completedCount = progress.filter(item => item.completed).length
  const progressPercentage = Math.round((completedCount / progress.length) * 100)

  const getSectionGuide = () => {
    switch (activeSection) {
      case 'dailyCard':
        return {
          title: "Daily Cards 가이드",
          description: "매일의 일상을 체계적으로 관리하세요",
          tips: [
            "📝 할 일을 추가하고 체크하여 완료하세요",
            "📔 오늘의 경험과 생각을 일기로 남겨보세요", 
            "💰 예산 관리 기능이 곧 추가됩니다",
            "🎯 목표를 설정하고 달성도를 추적하세요",
            "📅 좌우 스크롤로 다른 날짜도 확인 가능해요"
          ]
        }
      case 'bigNote':
        return {
          title: "Big Note 가이드",
          description: "아이디어와 메모를 자유롭게 기록하세요",
          tips: [
            "📄 새 노트 버튼(+)으로 노트를 추가하세요",
            "✍️ 마크다운 문법을 사용할 수 있어요",
            "🖼️ 이미지도 첨부할 수 있습니다",
            "🔍 노트 제목을 클릭해서 빠르게 이동하세요",
            "💾 자동 저장되니 걱정하지 마세요"
          ]
        }
      case 'storage-url':
      case 'storage-images':
      case 'storage-videos':
      case 'storage-restaurants':
      case 'storage-travel':
        return {
          title: "Storage 가이드", 
          description: "소중한 링크와 정보들을 체계적으로 보관하세요",
          tips: [
            "🔗 URL: 자주 방문하는 사이트들을 저장하세요",
            "🖼️ 이미지: 영감을 주는 이미지들을 모아보세요",
            "🎥 영상: 나중에 볼 유튜브 영상들을 저장하세요",
            "🍽️ 맛집: 가고 싶은 맛집 리스트를 만들어보세요",
            "✈️ 여행: 꿈꾸는 여행지들을 모아두세요"
          ]
        }
      case 'info-stocks':
      case 'info-news':
        return {
          title: "Info Hub 가이드",
          description: "매일 필요한 정보들을 한 곳에서 확인하세요", 
          tips: [
            "📈 주식: 관심 종목의 실시간 정보를 확인하세요",
            "📰 뉴스: 오늘의 주요 뉴스를 빠르게 훑어보세요",
            "🔄 정보는 자동으로 업데이트됩니다",
            "⭐ 즐겨찾기로 중요한 정보를 표시하세요",
            "📊 차트와 그래프로 트렌드를 파악하세요"
          ]
        }
      case 'talkTalk':
        return {
          title: "TalkTalk 가이드",
          description: "매일 새로운 질문으로 소통하고 일상을 나눠보세요",
          tips: [
            "💭 매일 2개의 AI 생성 질문이 제공됩니다",
            "✍️ 댓글은 100자 이내로 간결하게 작성하세요",
            "🕐 질문과 댓글은 24시간 후 새로 갱신됩니다",
            "💬 다른 사람들의 답변을 보며 영감을 얻어보세요",
            "🎯 일상의 소소한 순간들을 기록해보세요"
          ]
        }
      default:
        return {
          title: "Koouk 사용 가이드",
          description: "직관적이고 간단한 개인 대시보드",
          tips: [
            "🏠 Daily Cards로 일상을 체계적으로 관리하세요",
            "📝 Big Note로 아이디어를 자유롭게 기록하세요", 
            "💾 Storage에 소중한 정보들을 저장하세요",
            "📊 Info Hub에서 필요한 정보를 확인하세요",
            "💬 TalkTalk으로 매일의 소소한 이야기를 나눠보세요",
            "✨ 3초 안에 이해할 수 있도록 설계되었어요"
          ]
        }
    }
  }

  const guide = getSectionGuide()

  return (
    <div style={{ 
      padding: '2rem 1.5rem',
      backgroundColor: '#FAFAF9'
    }}>
      <div className="space-y-8">
        {/* 진행상황 카드 */}
        <div 
          className="transition-all duration-300 ease-out"
          style={{ 
            backgroundColor: '#FFFFFF',
            border: '1px solid #F0EDE8',
            borderRadius: '1.25rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="mb-4">
            <h3 style={{ 
              fontSize: '1.1rem',
              fontWeight: '500',
              color: '#1A1A1A',
              letterSpacing: '-0.01em',
              lineHeight: '1.3',
              marginBottom: '0.5rem'
            }}>
              시작하기 진행상황
            </h3>
            <p style={{
              fontSize: '0.85rem',
              color: '#6B7280',
              fontWeight: '400',
              lineHeight: '1.5'
            }}>
              Koouk을 제대로 활용해보세요
            </p>
          </div>

          {/* 진행률 바 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#6B7280',
                fontWeight: '400'
              }}>
                {completedCount}/{progress.length} 완료
              </span>
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#1A1A1A',
                fontWeight: '500'
              }}>
                {progressPercentage}%
              </span>
            </div>
            <div style={{
              backgroundColor: '#F5F3F0',
              borderRadius: '0.5rem',
              height: '0.5rem',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  backgroundColor: '#1A1A1A',
                  height: '100%',
                  borderRadius: '0.5rem',
                  width: `${progressPercentage}%`,
                  transition: 'width 0.3s ease-out'
                }}
              />
            </div>
          </div>

          {/* 체크리스트 */}
          <div className="space-y-3">
            {progress.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <button
                  onClick={() => {
                    setProgress(prev => prev.map(p => 
                      p.id === item.id ? { ...p, completed: !p.completed } : p
                    ))
                  }}
                  className="mt-0.5"
                  style={{
                    width: '1rem',
                    height: '1rem',
                    backgroundColor: item.completed ? '#1A1A1A' : 'transparent',
                    border: `1.5px solid ${item.completed ? '#1A1A1A' : '#D1D5DB'}`,
                    borderRadius: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease-out'
                  }}
                >
                  {item.completed && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <p style={{
                    fontSize: '0.85rem',
                    color: item.completed ? '#6B7280' : '#1A1A1A',
                    fontWeight: '400',
                    lineHeight: '1.3',
                    marginBottom: '0.25rem',
                    textDecoration: item.completed ? 'line-through' : 'none',
                    transition: 'all 0.2s ease-out'
                  }}>
                    {item.title}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9CA3AF',
                    fontWeight: '400',
                    lineHeight: '1.4'
                  }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 가이드 카드 */}
        <div 
          className="transition-all duration-300 ease-out"
          style={{ 
            backgroundColor: '#FFFFFF',
            border: '1px solid #F0EDE8',
            borderRadius: '1.25rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="mb-4">
            <h3 style={{ 
              fontSize: '1.1rem',
              fontWeight: '500',
              color: '#1A1A1A',
              letterSpacing: '-0.01em',
              lineHeight: '1.3',
              marginBottom: '0.5rem'
            }}>
              {guide.title}
            </h3>
            <p style={{
              fontSize: '0.85rem',
              color: '#6B7280',
              fontWeight: '400',
              lineHeight: '1.5'
            }}>
              {guide.description}
            </p>
          </div>

          <div className="space-y-3">
            {guide.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <div style={{
                  width: '0.375rem',
                  height: '0.375rem',
                  backgroundColor: '#D1D5DB',
                  borderRadius: '50%',
                  marginTop: '0.5rem',
                  flexShrink: 0
                }} />
                <p style={{
                  fontSize: '0.85rem',
                  color: '#4B5563',
                  fontWeight: '400',
                  lineHeight: '1.5'
                }}>
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 도움말 카드 */}
        <div 
          className="transition-all duration-300 ease-out"
          style={{ 
            backgroundColor: '#FFFFFF',
            border: '1px solid #F0EDE8',
            borderRadius: '1.25rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="mb-4">
            <h3 style={{ 
              fontSize: '1.1rem',
              fontWeight: '500',
              color: '#1A1A1A',
              letterSpacing: '-0.01em',
              lineHeight: '1.3',
              marginBottom: '0.5rem'
            }}>
              빠른 도움말
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <h4 style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#1A1A1A',
                marginBottom: '0.5rem'
              }}>
                키보드 단축키
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>새 항목 추가</span>
                  <code style={{ 
                    fontSize: '0.75rem', 
                    backgroundColor: '#F5F3F0', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '0.375rem',
                    color: '#1A1A1A'
                  }}>
                    Enter
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>사이드바 토글</span>
                  <code style={{ 
                    fontSize: '0.75rem', 
                    backgroundColor: '#F5F3F0', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '0.375rem',
                    color: '#1A1A1A'
                  }}>
                    Cmd + /
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#1A1A1A',
                marginBottom: '0.5rem'
              }}>
                팁
              </h4>
              <p style={{
                fontSize: '0.8rem',
                color: '#6B7280',
                lineHeight: '1.5'
              }}>
                💡 Koouk은 &ldquo;처음 보는 사람이 3초 안에 이해&rdquo;할 수 있도록 설계되었습니다. 복잡한 기능보다는 직관적이고 간단한 사용법을 추구해요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}