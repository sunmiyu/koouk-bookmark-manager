'use client'

import { SectionType } from '@/app/page'
import DailyCardContent from '@/components/DailyCardContent'
import BigNoteEditor from '@/components/BigNoteEditor'
import URLStorage from '@/components/storage/URLStorage'
import ImageStorage from '@/components/storage/ImageStorage'
import VideoStorage from '@/components/storage/VideoStorage'
import RestaurantStorage from '@/components/storage/RestaurantStorage'
import TravelStorage from '@/components/storage/TravelStorage'
import StocksInfo from '@/components/info/StocksInfo'
import NewsInfo from '@/components/info/NewsInfo'
import MusicInfo from '@/components/info/MusicInfo'
import AIToolsInfo from '@/components/info/AIToolsInfo'
import TalkTalkContent from '@/components/TalkTalkContent'
import { DailyCardState } from '@/components/DailyCardContent'

type MainContentProps = {
  activeSection: SectionType
  selectedNoteId: string | null
  onNoteSelect: (noteId: string | null) => void
  dailyCardState?: DailyCardState
}

export default function MainContent({ activeSection, selectedNoteId, dailyCardState }: MainContentProps) {
  const renderContent = () => {
    switch (activeSection) {
      case 'dailyCard':
        return <DailyCardContent cardState={dailyCardState} />
      
      case 'bigNote':
        return <BigNoteEditor noteId={selectedNoteId} />
      
      case 'storage-url':
        return <URLStorage />
      
      case 'storage-images':
        return <ImageStorage />
      
      case 'storage-videos':
        return <VideoStorage />
      
      case 'storage-restaurants':
        return <RestaurantStorage />
      
      case 'storage-travel':
        return <TravelStorage />
      
      case 'storage-karaoke':
        return <StoragePage type="karaoke" title="노래방List Storage" icon="🎤" />
      
      case 'info-stocks':
        return <StocksInfo />
      
      case 'info-news':
        return <NewsInfo />
      
      case 'info-music':
        return <MusicInfo />
      
      case 'info-language':
        return <InfoPage type="language" title="외국어 공부" icon="🌍" />
      
      case 'info-commute':
        return <InfoPage type="commute" title="출근길 현황" icon="🚌" />
      
      case 'info-motivation':
        return <InfoPage type="motivation" title="동기부여" icon="💪" />
      
      case 'info-aitools':
        return <AIToolsInfo />
      
      case 'talkTalk':
        return <TalkTalkContent />
      
      default:
        return <DailyCardContent />
    }
  }

  return (
    <div className="h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-[1200px] mx-auto h-full">
        {renderContent()}
      </div>
    </div>
  )
}

// Storage Page Component
function StoragePage({ title, icon }: { type: string, title: string, icon: string }) {
  return (
    <div className="h-full" style={{ padding: 'var(--space-4) var(--space-3)' }}>
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <span style={{ fontSize: 'var(--text-2xl)' }}>{icon}</span>
          <h1 style={{ 
            fontSize: 'var(--text-xl)', 
            fontWeight: '700', 
            color: 'var(--text-primary)' 
          }}>
            {title}
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-lg border min-h-64 md:min-h-96" style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-light)',
        padding: 'var(--space-4)'
      }}>
        <div className="text-center py-8 md:py-12">
          <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)' }}>{icon}</div>
          <h3 style={{ 
            fontSize: 'var(--text-lg)', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            {title}
          </h3>
          <p style={{ 
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)'
          }}>
            이 섹션은 아직 구현중입니다.
          </p>
        </div>
      </div>
    </div>
  )
}

// Info Page Component
function InfoPage({ type, title, icon }: { type: string, title: string, icon: string }) {
  const getContent = () => {
    switch (type) {
      case 'language':
        return {
          description: '언어 학습 도구와 자료들을 관리하세요',
          features: [
            '📚 학습 자료 북마크',
            '🗓️ 학습 일정 관리', 
            '📝 단어장 만들기',
            '🎯 학습 목표 설정',
            '📈 진행상황 추적'
          ]
        }
      case 'commute':
        return {
          description: '출퇴근길 정보를 한눈에 확인하세요',
          features: [
            '🚌 버스 실시간 정보',
            '🚇 지하철 운행 상황',
            '🚗 교통 상황 확인',
            '⏰ 예상 소요시간',
            '🗺️ 최적 경로 추천'
          ]
        }
      case 'motivation':
        return {
          description: '매일의 동기부여와 영감을 관리하세요',
          features: [
            '💭 매일의 동기부여 문구',
            '🎯 목표 설정 및 추적',
            '📸 영감을 주는 이미지',
            '📝 성취 기록하기',
            '🏆 달성 현황 시각화'
          ]
        }
      default:
        return {
          description: '곧 출시 예정인 기능입니다',
          features: ['준비중...']
        }
    }
  }

  const content = getContent()

  return (
    <div className="h-full" style={{ 
      padding: 'var(--space-6) var(--space-4)',
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* Header */}
      <div className="mb-6 md:mb-12">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 'var(--text-2xl)' }}>{icon}</span>
          <div>
            <h1 style={{ 
              fontSize: 'var(--text-2xl)',
              fontWeight: '300',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: '1.2',
              marginBottom: 'var(--space-1)'
            }}>
              {title}
            </h1>
            <p style={{ 
              fontSize: 'var(--text-md)',
              color: 'var(--text-secondary)',
              fontWeight: '400',
              lineHeight: '1.5'
            }}>
              {content.description}
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div style={{ 
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-subtle)',
        textAlign: 'center' as const
      }}>
        <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>{icon}</div>
        
        <h3 style={{ 
          fontSize: 'var(--text-xl)',
          fontWeight: '400',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-3)',
          letterSpacing: '-0.01em'
        }}>
          {title}
        </h3>
        
        <p style={{ 
          fontSize: 'var(--text-md)',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-6)',
          lineHeight: '1.6'
        }}>
          곧 출시 예정입니다
        </p>

        {/* Features Preview */}
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-4)'
        }}>
          <h4 style={{ 
            fontSize: 'var(--text-md)',
            fontWeight: '500',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-3)',
            letterSpacing: '-0.01em'
          }}>
            예정 기능
          </h4>
          <div className="space-y-2">
            {content.features.map((feature, index) => (
              <div key={index} style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                textAlign: 'left' as const,
                padding: 'var(--space-1) 0'
              }}>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-muted)',
          color: 'var(--text-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          fontSize: 'var(--text-sm)',
          fontWeight: '400'
        }}>
          💡 이 기능에 대한 아이디어나 제안이 있으시다면 언제든 알려주세요!
        </div>
      </div>
    </div>
  )
}