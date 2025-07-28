export interface MiniFunctionData {
  id: string
  title: string
  icon: string
  type: 'news' | 'music' | 'alarm' | 'expense' | 'stocks' | 'commute' | 'food' | 'diary'
  isEnabled: boolean
  lastUpdated: string
  data?: NewsItem[] | MusicRecommendation[] | AlarmData | ExpenseData | DiaryData | StockData | CommuteData | RestaurantData
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

export interface StockItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
  lastUpdated: string
}

export interface StockData {
  watchlist: StockItem[]
  lastUpdated: string
}

export interface CommuteRoute {
  id: string
  name: string
  origin: string
  destination: string
  duration: number // 분 단위
  distance: number // 미터 단위
  trafficDuration: number // 실시간 교통상황 반영 시간
  lastUpdated: string
}

export interface CommuteData {
  routes: CommuteRoute[]
  currentRoute?: CommuteRoute
  lastUpdated: string
}

export interface RestaurantItem {
  id: string
  name: string
  category: string
  rating: number
  reviewCount: number
  distance: string
  priceRange: string
  location: string
  specialties: string[]
  isOpen: boolean
  openHours?: string
}

export interface RestaurantData {
  nearbyRestaurants: RestaurantItem[]
  userLocation?: string
  lastUpdated: string
}

export type MiniFunctionType = MiniFunctionData['type']