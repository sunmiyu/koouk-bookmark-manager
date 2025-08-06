'use client'

import { useState } from 'react'
import { SectionType, NoteType } from '@/app/page'

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
    <div className="h-full" style={{ padding: 'var(--space-4)' }}>
      <div className="space-y-6">
        {/* Daily Card Section */}
        <div>
          <button
            onClick={() => onSectionChange('dailyCard')}
            className={`w-full text-left mb-3 p-3 rounded-lg transition-colors ${
              activeSection === 'dailyCard' ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-gray-50'
            }`}
            style={{
              backgroundColor: activeSection === 'dailyCard' ? 'var(--accent-light)' : 'transparent',
              color: activeSection === 'dailyCard' ? 'var(--accent)' : 'var(--text-primary)',
              fontWeight: activeSection === 'dailyCard' ? '600' : '500'
            }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Daily Card
            </div>
          </button>
          
          <div className="ml-4 space-y-2">
            <label className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={dailyCardState.todo}
                onChange={() => handleDailyCardToggle('todo')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Todo card</span>
            </label>
            
            <label className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={dailyCardState.diary}
                onChange={() => handleDailyCardToggle('diary')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Diary</span>
            </label>
            
            <label className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={dailyCardState.budget}
                onChange={() => handleDailyCardToggle('budget')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Budget</span>
            </label>
            
            <label className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={dailyCardState.goalTracker}
                onChange={() => handleDailyCardToggle('goalTracker')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Goal Tracker</span>
            </label>
          </div>
        </div>

        {/* Big Note Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: '600', 
              color: 'var(--text-primary)' 
            }}>
              Big Note
            </h3>
            <button
              onClick={addNewNote}
              className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center hover:bg-blue-600 transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              +
            </button>
          </div>
          
          <div className="space-y-1">
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => handleNoteClick(note.id)}
                className={`w-full text-left p-2 rounded transition-colors ${
                  selectedNoteId === note.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: selectedNoteId === note.id ? 'var(--accent-light)' : 'transparent',
                  color: selectedNoteId === note.id ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)'
                }}
              >
                📝 {note.title}
              </button>
            ))}
          </div>
        </div>

        {/* Storage Section */}
        <div>
          <h3 style={{ 
            fontSize: 'var(--text-base)', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-3)'
          }}>
            Storage
          </h3>
          
          <div className="space-y-1">
            {storageItems.map(item => (
              <button
                key={item.key}
                onClick={() => onSectionChange(item.key)}
                className={`w-full text-left p-2 rounded transition-colors flex items-center gap-2 ${
                  activeSection === item.key ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: activeSection === item.key ? 'var(--accent-light)' : 'transparent',
                  color: activeSection === item.key ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box Section */}
        <div>
          <h3 style={{ 
            fontSize: 'var(--text-base)', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-3)'
          }}>
            Info Box
          </h3>
          
          <div className="space-y-1">
            {infoBoxItems.map(item => (
              <button
                key={item.key}
                onClick={() => onSectionChange(item.key)}
                className={`w-full text-left p-2 rounded transition-colors flex items-center gap-2 ${
                  activeSection === item.key ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: activeSection === item.key ? 'var(--accent-light)' : 'transparent',
                  color: activeSection === item.key ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}