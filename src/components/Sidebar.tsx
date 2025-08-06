'use client'

import { useState } from 'react'
import { SectionType, NoteType } from '@/app/page'
import OnboardingFlow from '@/components/OnboardingFlow'
import FeedbackBoard from '@/components/FeedbackBoard'

type SidebarProps = {
  activeSection: SectionType
  onSectionChange: (section: SectionType) => void
  selectedNoteId: string | null
  onNoteSelect: (noteId: string | null) => void
}

type DailyCardState = {
  todo: boolean
  diary: boolean
  budget: boolean
  goalTracker: boolean
}

export default function Sidebar({ activeSection, onSectionChange, selectedNoteId, onNoteSelect }: SidebarProps) {
  const [dailyCardState, setDailyCardState] = useState<DailyCardState>({
    todo: true,
    diary: true,
    budget: false,
    goalTracker: false
  })
  
  const [showOnboarding, setShowOnboarding] = useState(false)

  const [notes, setNotes] = useState<NoteType[]>([
    { id: '1', title: 'note1', content: '', images: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', title: 'note2', content: '', images: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '3', title: 'note3', content: '', images: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ])

  const handleDailyCardToggle = (key: keyof DailyCardState) => {
    setDailyCardState(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const addNewNote = () => {
    const newNote: NoteType = {
      id: Date.now().toString(),
      title: `note${notes.length + 1}`,
      content: '',
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setNotes(prev => [...prev, newNote])
  }

  const handleNoteClick = (noteId: string) => {
    onNoteSelect(noteId)
    onSectionChange('bigNote')
  }

  const storageItems = [
    { key: 'storage-url' as SectionType, label: 'URL', icon: '🔗' },
    { key: 'storage-images' as SectionType, label: '이미지', icon: '🖼️' },
    { key: 'storage-videos' as SectionType, label: '영상(유튜브)', icon: '🎥' },
    { key: 'storage-restaurants' as SectionType, label: '맛집', icon: '🍽️' },
    { key: 'storage-travel' as SectionType, label: '여행가고 싶은곳', icon: '✈️' },
    { key: 'storage-karaoke' as SectionType, label: '노래방List', icon: '🎤' }
  ]

  const infoBoxItems = [
    { key: 'info-stocks' as SectionType, label: '주식', icon: '📈' },
    { key: 'info-news' as SectionType, label: '뉴스', icon: '📰' },
    { key: 'info-music' as SectionType, label: '음악추천', icon: '🎵' },
    { key: 'info-language' as SectionType, label: '외국어 공부', icon: '🌍' },
    { key: 'info-commute' as SectionType, label: '출근길 현황', icon: '🚌' },
    { key: 'info-motivation' as SectionType, label: '동기부여', icon: '💪' },
    { key: 'info-aitools' as SectionType, label: 'AI tool link 모음', icon: '🤖' }
  ]

  return (
    <>
      <div className="h-full" style={{ padding: 'var(--space-4)' }}>
      <div className="space-y-4">
        {/* Daily Card Section */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm" style={{ 
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          borderColor: 'rgba(59, 130, 246, 0.2)'
        }}>
          <button
            onClick={() => onSectionChange('dailyCard')}
            className={`w-full text-left p-4 rounded-t-xl transition-all duration-200 ${
              activeSection === 'dailyCard' ? 'bg-blue-500 text-white font-bold shadow-md' : 'hover:bg-white hover:bg-opacity-50'
            }`}
            style={{
              backgroundColor: activeSection === 'dailyCard' ? 'var(--accent)' : 'transparent',
              color: activeSection === 'dailyCard' ? 'white' : 'var(--text-primary)',
              fontWeight: activeSection === 'dailyCard' ? '700' : '600',
              fontSize: 'var(--text-base)',
              letterSpacing: '-0.01em'
            }}
          >
            <div className="flex items-center gap-3">
<span>Daily Card</span>
            </div>
          </button>
          
          <div className="px-4 pb-4 pl-6 space-y-1 border-l-4 border-blue-300 ml-3" style={{ borderLeftColor: 'rgba(59, 130, 246, 0.3)' }}>
            <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-60 transition-colors">
              <input
                type="checkbox"
                checked={dailyCardState.todo}
                onChange={() => handleDailyCardToggle('todo')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: '500' }}>Todo card</span>
            </label>
            
            <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-60 transition-colors">
              <input
                type="checkbox"
                checked={dailyCardState.diary}
                onChange={() => handleDailyCardToggle('diary')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: '500' }}>Diary</span>
            </label>
            
            <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-60 transition-colors">
              <input
                type="checkbox"
                checked={dailyCardState.budget}
                onChange={() => handleDailyCardToggle('budget')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: '500' }}>Budget</span>
            </label>
            
            <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-60 transition-colors">
              <input
                type="checkbox"
                checked={dailyCardState.goalTracker}
                onChange={() => handleDailyCardToggle('goalTracker')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: '500' }}>Goal Tracker</span>
            </label>
          </div>
        </div>

        {/* Big Note Section */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm" style={{ 
          backgroundColor: 'rgba(34, 197, 94, 0.05)',
          borderColor: 'rgba(34, 197, 94, 0.2)'
        }}>
          <div className="flex items-center justify-between p-4 rounded-t-xl" style={{
            backgroundColor: activeSection === 'bigNote' ? 'var(--success)' : 'transparent',
            color: activeSection === 'bigNote' ? 'white' : 'var(--text-primary)',
            fontWeight: '600',
            fontSize: 'var(--text-base)',
            letterSpacing: '-0.01em'
          }}>
<span>Big Note</span>
            <button
              onClick={addNewNote}
              className={`w-6 h-6 rounded-full text-sm flex items-center justify-center transition-colors ${
                activeSection === 'bigNote' ? 'bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30' : 'bg-green-500 hover:bg-green-600'
              }`}
              style={{ 
                backgroundColor: activeSection === 'bigNote' ? 'rgba(255, 255, 255, 0.2)' : 'var(--success)',
                color: activeSection === 'bigNote' ? 'white' : 'white'
              }}
            >
              +
            </button>
          </div>
          
          <div className="px-4 pb-4 pl-6 space-y-1 border-l-4 border-green-300 ml-3" style={{ borderLeftColor: 'rgba(34, 197, 94, 0.3)' }}>
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => handleNoteClick(note.id)}
className={`w-full text-left p-2 rounded-lg transition-colors ${
                  selectedNoteId === note.id ? 'bg-green-100 text-green-700' : 'hover:bg-white hover:bg-opacity-60'
                }`}
                style={{
                  backgroundColor: selectedNoteId === note.id ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                  color: selectedNoteId === note.id ? 'var(--success)' : 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500'
                }}
              >
                <span>{note.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Storage Section */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm" style={{ 
          backgroundColor: 'rgba(249, 115, 22, 0.05)',
          borderColor: 'rgba(249, 115, 22, 0.2)'
        }}>
          <button
            onClick={() => onSectionChange('storage-url')}
            className={`w-full text-left p-4 rounded-t-xl transition-all duration-200 ${
              activeSection.startsWith('storage') ? 'bg-orange-500 text-white font-bold shadow-md' : 'hover:bg-white hover:bg-opacity-50'
            }`}
            style={{
              backgroundColor: activeSection.startsWith('storage') ? 'rgb(249, 115, 22)' : 'transparent',
              color: activeSection.startsWith('storage') ? 'white' : 'var(--text-primary)',
              fontWeight: activeSection.startsWith('storage') ? '700' : '600',
              fontSize: 'var(--text-base)',
              letterSpacing: '-0.01em'
            }}
          >
<span>Storage</span>
          </button>
          
          <div className="px-4 pb-4 pl-6 space-y-1 border-l-4 border-orange-300 ml-3" style={{ borderLeftColor: 'rgba(249, 115, 22, 0.3)' }}>
            {storageItems.map(item => (
              <button
                key={item.key}
                onClick={() => onSectionChange(item.key)}
className={`w-full text-left p-2 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-60 transition-colors ${
                  activeSection === item.key ? 'bg-orange-100 text-orange-700' : ''
                }`}
                style={{
                  backgroundColor: activeSection === item.key ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                  color: activeSection === item.key ? 'rgb(249, 115, 22)' : 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500'
                }}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box Section */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm" style={{ 
          backgroundColor: 'rgba(147, 51, 234, 0.05)',
          borderColor: 'rgba(147, 51, 234, 0.2)'
        }}>
          <button
            onClick={() => onSectionChange('info-stocks')}
            className={`w-full text-left p-4 rounded-t-xl transition-all duration-200 ${
              activeSection.startsWith('info') ? 'bg-purple-500 text-white font-bold shadow-md' : 'hover:bg-white hover:bg-opacity-50'
            }`}
            style={{
              backgroundColor: activeSection.startsWith('info') ? 'rgb(147, 51, 234)' : 'transparent',
              color: activeSection.startsWith('info') ? 'white' : 'var(--text-primary)',
              fontWeight: activeSection.startsWith('info') ? '700' : '600',
              fontSize: 'var(--text-base)',
              letterSpacing: '-0.01em'
            }}
          >
<span>Info Box</span>
          </button>
          
          <div className="px-4 pb-4 pl-6 space-y-1 border-l-4 border-purple-300 ml-3" style={{ borderLeftColor: 'rgba(147, 51, 234, 0.3)' }}>
            {infoBoxItems.map(item => (
              <button
                key={item.key}
                onClick={() => onSectionChange(item.key)}
className={`w-full text-left p-2 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-60 transition-colors ${
                  activeSection === item.key ? 'bg-purple-100 text-purple-700' : ''
                }`}
                style={{
                  backgroundColor: activeSection === item.key ? 'rgba(147, 51, 234, 0.1)' : 'transparent',
                  color: activeSection === item.key ? 'rgb(147, 51, 234)' : 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500'
                }}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* 하단 구분선과 추가 메뉴들 */}
        <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <div className="space-y-2">
            {/* Onboarding Flow */}
            <button
              onClick={() => setShowOnboarding(true)}
              className="w-full text-left p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-sm"
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: '500'
              }}
            >
              Onboarding Flow
            </button>
            
            {/* 구분선 */}
            <hr className="my-3" style={{ borderColor: 'var(--border-light)' }} />
            
            {/* 개인정보정책 */}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-sm"
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: '500'
              }}
            >
              개인정보정책
            </a>
            
            {/* 피드백 보내기 */}
            <div className="p-2">
              <FeedbackBoard />
            </div>
            
            {/* 계정 정보 */}
            <a
              href="/account"
              className="block w-full text-left p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-sm"
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: '500'
              }}
            >
              계정 정보
            </a>
          </div>
        </div>
      </div>
      </div>
      
      {/* Onboarding Flow Modal */}
      {showOnboarding && (
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      )}
    </>
  )
}