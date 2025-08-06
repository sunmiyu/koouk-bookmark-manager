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
    { key: 'storage-travel' as SectionType, label: '여행가고 싶은곳', icon: '✈️' }
  ]

  const infoBoxItems = [
    { key: 'info-stocks' as SectionType, label: '주식', icon: '📈' },
    { key: 'info-news' as SectionType, label: '뉴스', icon: '📰' }
  ]

  return (
    <div className="h-full" style={{ 
      padding: '2rem 1.5rem',
      backgroundColor: '#FAFAF9'
    }}>
      <div className="space-y-6">
        {/* Daily Card Section */}
        <div>
          <button
            onClick={() => onSectionChange('dailyCard')}
            className="w-full text-left transition-all duration-300 ease-out"
            style={{
              backgroundColor: activeSection === 'dailyCard' ? '#FFFFFF' : 'transparent',
              color: activeSection === 'dailyCard' ? '#1A1A1A' : '#6B7280',
              fontWeight: activeSection === 'dailyCard' ? '500' : '400',
              fontSize: '0.95rem',
              borderRadius: '0.875rem',
              padding: '0.875rem 1.125rem',
              border: activeSection === 'dailyCard' ? '1px solid #F0EDE8' : '1px solid transparent',
              letterSpacing: '-0.01em',
              boxShadow: activeSection === 'dailyCard' ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeSection !== 'dailyCard') {
                e.currentTarget.style.backgroundColor = '#F8F8F7'
                e.currentTarget.style.color = '#1A1A1A'
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== 'dailyCard') {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#6B7280'
              }
            }}
          >
            Daily Card
          </button>
          
          <div className="mt-3 ml-2 space-y-1">
            <label className="flex items-center gap-3 py-1.5 px-2 cursor-pointer transition-colors rounded-lg hover:bg-white/60" style={{
              color: '#6B7280',
              fontSize: '0.85rem'
            }}>
              <input
                type="checkbox"
                checked={dailyCardState.todo}
                onChange={() => handleDailyCardToggle('todo')}
                className="w-3.5 h-3.5 rounded"
                style={{ accentColor: 'var(--text-primary)' }}
              />
              <span style={{ fontWeight: '400', letterSpacing: '0.01em' }}>Todo card</span>
            </label>
            
            <label className="flex items-center gap-3 py-1.5 px-2 cursor-pointer transition-colors rounded-lg hover:bg-white/60" style={{
              color: '#6B7280',
              fontSize: '0.85rem'
            }}>
              <input
                type="checkbox"
                checked={dailyCardState.diary}
                onChange={() => handleDailyCardToggle('diary')}
                className="w-3.5 h-3.5 rounded"
                style={{ accentColor: 'var(--text-primary)' }}
              />
              <span style={{ fontWeight: '400', letterSpacing: '0.01em' }}>Diary</span>
            </label>
            
            <label className="flex items-center gap-3 py-1.5 px-2 cursor-pointer transition-colors rounded-lg hover:bg-white/60" style={{
              color: '#6B7280',
              fontSize: '0.85rem'
            }}>
              <input
                type="checkbox"
                checked={dailyCardState.budget}
                onChange={() => handleDailyCardToggle('budget')}
                className="w-3.5 h-3.5 rounded"
                style={{ accentColor: 'var(--text-primary)' }}
              />
              <span style={{ fontWeight: '400', letterSpacing: '0.01em' }}>Budget</span>
            </label>
            
            <label className="flex items-center gap-3 py-1.5 px-2 cursor-pointer transition-colors rounded-lg hover:bg-white/60" style={{
              color: '#6B7280',
              fontSize: '0.85rem'
            }}>
              <input
                type="checkbox"
                checked={dailyCardState.goalTracker}
                onChange={() => handleDailyCardToggle('goalTracker')}
                className="w-3.5 h-3.5 rounded"
                style={{ accentColor: 'var(--text-primary)' }}
              />
              <span style={{ fontWeight: '400', letterSpacing: '0.01em' }}>Goal Tracker</span>
            </label>
          </div>
        </div>

        {/* Big Note Section */}
        <div>
          <div className="flex items-center justify-between p-3" style={{
            backgroundColor: activeSection === 'bigNote' ? 'var(--bg-card)' : 'transparent',
            borderRadius: 'var(--radius-lg)'
          }}>
            <span style={{
              color: 'var(--text-primary)',
              fontWeight: activeSection === 'bigNote' ? '600' : '500',
              fontSize: 'var(--text-base)'
            }}>
              Big Note
            </span>
            <button
              onClick={addNewNote}
              className="w-6 h-6 rounded-full text-sm flex items-center justify-center transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-light)'
              }}
            >
              +
            </button>
          </div>
          
          <div className="mt-2 ml-4 space-y-1">
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => handleNoteClick(note.id)}
                className="w-full text-left p-2 transition-colors"
                style={{
                  backgroundColor: selectedNoteId === note.id ? 'var(--bg-secondary)' : 'transparent',
                  color: selectedNoteId === note.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: selectedNoteId === note.id ? '500' : '400',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {note.title}
              </button>
            ))}
          </div>
        </div>

        {/* Storage Section */}
        <div>
          <button
            onClick={() => onSectionChange('storage-url')}
            className="w-full text-left p-3 transition-all duration-200"
            style={{
              backgroundColor: activeSection.startsWith('storage') ? 'var(--bg-card)' : 'transparent',
              color: 'var(--text-primary)',
              fontWeight: activeSection.startsWith('storage') ? '600' : '500',
              fontSize: 'var(--text-base)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            Storage
          </button>
          
          <div className="mt-2 ml-4 space-y-1">
            {storageItems.map(item => (
              <button
                key={item.key}
                onClick={() => onSectionChange(item.key)}
                className="w-full text-left p-2 transition-colors"
                style={{
                  backgroundColor: activeSection === item.key ? 'var(--bg-secondary)' : 'transparent',
                  color: activeSection === item.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: activeSection === item.key ? '500' : '400',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box Section */}
        <div>
          <button
            onClick={() => onSectionChange('info-stocks')}
            className="w-full text-left p-3 transition-all duration-200"
            style={{
              backgroundColor: activeSection.startsWith('info') ? 'var(--bg-card)' : 'transparent',
              color: 'var(--text-primary)',
              fontWeight: activeSection.startsWith('info') ? '600' : '500',
              fontSize: 'var(--text-base)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            Info Box
          </button>
          
          <div className="mt-2 ml-4 space-y-1">
            {infoBoxItems.map(item => (
              <button
                key={item.key}
                onClick={() => onSectionChange(item.key)}
                className="w-full text-left p-2 transition-colors"
                style={{
                  backgroundColor: activeSection === item.key ? 'var(--bg-secondary)' : 'transparent',
                  color: activeSection === item.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: activeSection === item.key ? '500' : '400',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* TalkTalk Section */}
        <div>
          <button
            onClick={() => onSectionChange('talkTalk')}
            className="w-full text-left transition-all duration-300 ease-out"
            style={{
              backgroundColor: activeSection === 'talkTalk' ? '#FFFFFF' : 'transparent',
              color: activeSection === 'talkTalk' ? '#1A1A1A' : '#6B7280',
              fontWeight: activeSection === 'talkTalk' ? '500' : '400',
              fontSize: '0.95rem',
              borderRadius: '0.875rem',
              padding: '0.875rem 1.125rem',
              border: activeSection === 'talkTalk' ? '1px solid #F0EDE8' : '1px solid transparent',
              letterSpacing: '-0.01em',
              boxShadow: activeSection === 'talkTalk' ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeSection !== 'talkTalk') {
                e.currentTarget.style.backgroundColor = '#F8F8F7'
                e.currentTarget.style.color = '#1A1A1A'
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== 'talkTalk') {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#6B7280'
              }
            }}
          >
            TalkTalk
          </button>
        </div>
      </div>
    </div>
  )
}