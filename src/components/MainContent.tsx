'use client'

import { SectionType, NoteType } from '@/app/page'
import DailyCardContent from '@/components/DailyCardContent'
import BigNoteEditor from '@/components/BigNoteEditor'

type MainContentProps = {
  activeSection: SectionType
  selectedNoteId: string | null
  onNoteSelect: (noteId: string | null) => void
}

export default function MainContent({ activeSection, selectedNoteId, onNoteSelect }: MainContentProps) {
  const renderContent = () => {
    switch (activeSection) {
      case 'dailyCard':
        return <DailyCardContent />
      
      case 'bigNote':
        return <BigNoteEditor noteId={selectedNoteId} />
      
      case 'storage-url':
        return <StoragePage type="url" title="URL Storage" icon="🔗" />
      
      case 'storage-images':
        return <StoragePage type="images" title="이미지 Storage" icon="🖼️" />
      
      case 'storage-videos':
        return <StoragePage type="videos" title="영상(유튜브) Storage" icon="🎥" />
      
      case 'storage-restaurants':
        return <StoragePage type="restaurants" title="맛집 Storage" icon="🍽️" />
      
      case 'storage-travel':
        return <StoragePage type="travel" title="여행가고 싶은곳 Storage" icon="✈️" />
      
      case 'storage-karaoke':
        return <StoragePage type="karaoke" title="노래방List Storage" icon="🎤" />
      
      case 'info-stocks':
        return <InfoPage type="stocks" title="주식 정보" icon="📈" />
      
      case 'info-news':
        return <InfoPage type="news" title="뉴스" icon="📰" />
      
      case 'info-music':
        return <InfoPage type="music" title="음악추천" icon="🎵" />
      
      case 'info-language':
        return <InfoPage type="language" title="외국어 공부" icon="🌍" />
      
      case 'info-commute':
        return <InfoPage type="commute" title="출근길 현황" icon="🚌" />
      
      case 'info-motivation':
        return <InfoPage type="motivation" title="동기부여" icon="💪" />
      
      case 'info-aitools':
        return <InfoPage type="aitools" title="AI tool link 모음" icon="🤖" />
      
      default:
        return <DailyCardContent />
    }
  }

  return (
    <div className="h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {renderContent()}
    </div>
  )
}

// Storage Page Component
function StoragePage({ type, title, icon }: { type: string, title: string, icon: string }) {
  return (
    <div className="h-full" style={{ padding: 'var(--space-6)' }}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{icon}</span>
          <h1 style={{ 
            fontSize: 'var(--text-2xl)', 
            fontWeight: '700', 
            color: 'var(--text-primary)' 
          }}>
            {title}
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6 min-h-96" style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-light)'
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">{icon}</div>
          <h3 style={{ 
            fontSize: 'var(--text-xl)', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            {title}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            이 섹션은 아직 구현중입니다.
          </p>
        </div>
      </div>
    </div>
  )
}

// Info Page Component
function InfoPage({ type, title, icon }: { type: string, title: string, icon: string }) {
  return (
    <div className="h-full" style={{ padding: 'var(--space-6)' }}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{icon}</span>
          <h1 style={{ 
            fontSize: 'var(--text-2xl)', 
            fontWeight: '700', 
            color: 'var(--text-primary)' 
          }}>
            {title}
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6 min-h-96" style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-light)'
      }}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">{icon}</div>
          <h3 style={{ 
            fontSize: 'var(--text-xl)', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            {title}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            이 섹션은 아직 구현중입니다.
          </p>
        </div>
      </div>
    </div>
  )
}