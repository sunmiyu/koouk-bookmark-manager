export interface MiniFunctionData {
  id: string
  title: string
  icon: string
  type: 'news' | 'music' | 'alarm' | 'expense' | 'commute' | 'stocks' | 'food' | 'diary'
  isEnabled: boolean
  lastUpdated: string
  data?: any
}

export interface NewsItem {
  title: string
  url: string
  source: string
  publishedAt: string
}

export interface MusicRecommendation {
  title: string
  emoji: string
  url: string
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night'
}

export interface AlarmData {
  id: string
  time: string
  label: string
  enabled: boolean
  nextAlarm?: string
  timeRemaining?: string
}

export interface ExpenseItem {
  id: string
  amount: number
  description: string
  timestamp: string
  category?: string
}

export interface ExpenseData {
  todayTotal: number
  items: ExpenseItem[]
}

export interface DiaryEntry {
  id: string
  date: string
  content: string
  mood?: '😊' | '😐' | '😔' | '😴' | '🔥' | '💪' | '🎉'
  createdAt: string
  updatedAt: string
}

export interface DiaryData {
  todayEntry?: DiaryEntry
  recentEntries: DiaryEntry[]
}

export type MiniFunctionType = MiniFunctionData['type']