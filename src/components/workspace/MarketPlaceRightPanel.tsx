'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, Clock } from 'lucide-react'
import { SharedContent } from '@/types/core'

// Mock data for top ranked sharing
const MOCK_TOP_RANKED: SharedContent[] = [
  {
    id: 'top-1',
    originalContentId: 'content-top-1',
    title: '서울 숨은 맛집 리스트',
    description: '현지인만 아는 진짜 맛집들을 정리한 완벽한 가이드',
    category: 'lifestyle',
    tags: ['맛집', '서울', '로컬', '추천'],
    authorId: 'user-top-1',
    authorName: '맛집헌터김',
    isPublic: true,
    stats: { views: 15420, likes: 892, downloads: 1244 },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: 'top-2',
    originalContentId: 'content-top-2',
    title: '개발자 취업 완벽 준비',
    description: '실무 경험을 바탕으로 한 개발자 취업 노하우 총정리',
    category: 'learning',
    tags: ['개발자', '취업', 'IT', '면접'],
    authorId: 'user-top-2',
    authorName: 'TechCareerMaster',
    isPublic: true,
    stats: { views: 12300, likes: 678, downloads: 945 },
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-19T11:20:00Z'
  },
  {
    id: 'top-3',
    originalContentId: 'content-top-3',
    title: '주식투자 기초부터 실전까지',
    description: '10년 투자 경험을 바탕으로 한 주식투자 완전 정복',
    category: 'business',
    tags: ['주식', '투자', '재테크', '금융'],
    authorId: 'user-top-3',
    authorName: '투자의신',
    isPublic: true,
    stats: { views: 18650, likes: 1234, downloads: 1876 },
    createdAt: '2024-01-03T09:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z'
  },
  {
    id: 'top-4',
    originalContentId: 'content-top-4',
    title: '육아맘 필수 아이템 리스트',
    description: '3년간 시행착오 겪으며 정리한 육아 필수템 가이드',
    category: 'lifestyle',
    tags: ['육아', '아이템', '엄마', '추천'],
    authorId: 'user-top-4',
    authorName: '슈퍼맘박씨',
    isPublic: true,
    stats: { views: 9840, likes: 567, downloads: 789 },
    createdAt: '2024-01-07T13:30:00Z',
    updatedAt: '2024-01-17T10:15:00Z'
  },
  {
    id: 'top-5',
    originalContentId: 'content-top-5',
    title: 'UI/UX 디자인 트렌드 2024',
    description: '최신 디자인 트렌드와 실무 적용 방법 총정리',
    category: 'design',
    tags: ['디자인', 'UI', 'UX', '트렌드'],
    authorId: 'user-top-5',
    authorName: 'DesignTrendMaster',
    isPublic: true,
    stats: { views: 7230, likes: 445, downloads: 612 },
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  }
]

// Mock data for new shared folders
const MOCK_NEW_SHARED: SharedContent[] = [
  {
    id: 'new-1',
    originalContentId: 'content-new-1',
    title: '2024 해외여행 체크리스트',
    description: '여행 전문가가 정리한 해외여행 완벽 준비 가이드',
    category: 'lifestyle',
    tags: ['여행', '해외', '체크리스트', '준비'],
    authorId: 'user-new-1',
    authorName: '여행중독자',
    isPublic: true,
    stats: { views: 234, likes: 12, downloads: 18 },
    createdAt: '2024-01-20T16:30:00Z',
    updatedAt: '2024-01-20T16:30:00Z'
  },
  {
    id: 'new-2',
    originalContentId: 'content-new-2',
    title: 'React 18 마스터 코스',
    description: '실무에서 바로 쓸 수 있는 React 18 핵심 기능들',
    category: 'learning',
    tags: ['React', '개발', 'Frontend', 'JavaScript'],
    authorId: 'user-new-2',
    authorName: 'ReactExpert',
    isPublic: true,
    stats: { views: 156, likes: 8, downloads: 24 },
    createdAt: '2024-01-20T14:15:00Z',
    updatedAt: '2024-01-20T14:15:00Z'
  },
  {
    id: 'new-3',
    originalContentId: 'content-new-3',
    title: '홈트레이닝 30일 프로그램',
    description: '집에서 할 수 있는 효과적인 30일 홈트레이닝 루틴',
    category: 'lifestyle',
    tags: ['운동', '홈트', '건강', '다이어트'],
    authorId: 'user-new-3',
    authorName: '홈트코치',
    isPublic: true,
    stats: { views: 89, likes: 5, downloads: 12 },
    createdAt: '2024-01-20T12:45:00Z',
    updatedAt: '2024-01-20T12:45:00Z'
  },
  {
    id: 'new-4',
    originalContentId: 'content-new-4',
    title: '부동산 투자 초보 가이드',
    description: '부동산 투자 처음 시작하는 분들을 위한 완벽 가이드',
    category: 'business',
    tags: ['부동산', '투자', '재테크', '초보'],
    authorId: 'user-new-4',
    authorName: '부동산전문가',
    isPublic: true,
    stats: { views: 312, likes: 18, downloads: 35 },
    createdAt: '2024-01-20T10:20:00Z',
    updatedAt: '2024-01-20T10:20:00Z'
  },
  {
    id: 'new-5',
    originalContentId: 'content-new-5',
    title: 'Figma 디자인 시스템 구축',
    description: '효율적인 디자인 시스템 구축을 위한 Figma 활용법',
    category: 'design',
    tags: ['Figma', '디자인시스템', 'UI', '협업'],
    authorId: 'user-new-5',
    authorName: 'FigmaMaster',
    isPublic: true,
    stats: { views: 178, likes: 14, downloads: 22 },
    createdAt: '2024-01-20T08:30:00Z',
    updatedAt: '2024-01-20T08:30:00Z'
  }
]

export default function MarketPlaceRightPanel() {
  const [topRanked, setTopRanked] = useState<SharedContent[]>([])
  const [newShared, setNewShared] = useState<SharedContent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate real-time data loading
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      setTopRanked(MOCK_TOP_RANKED)
      setNewShared(MOCK_NEW_SHARED)
      setLoading(false)
    }
    
    loadData()
  }, [])

  // Remove distracting real-time updates for better UX

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return `${Math.floor(diffInHours / 24)}일 전`
  }

  if (loading) {
    return (
      <div className="w-80 bg-surface border-l border-default p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-background rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-background rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-surface border-l border-default overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Trending Now Section - Simplified */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h3 className="font-medium text-primary">지금 뜨는 콘텐츠</h3>
          </div>
          
          <div className="space-y-2">
            {topRanked.slice(0, 3).map((item, index) => (
              <div
                key={item.id}
                className="group p-3 bg-background rounded-lg border border-default hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {/* Simple Rank Number */}
                  <div className="flex items-center justify-center w-5 h-5 rounded bg-accent/10 text-xs font-medium text-accent">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-primary text-sm line-clamp-2 mb-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">by {item.authorName}</span>
                      <span className="text-xs font-medium text-accent">{formatNumber(item.stats.views)} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* View All Link */}
            <button className="w-full py-2 text-xs text-muted hover:text-accent text-center transition-colors">
              인기 콘텐츠 더보기
            </button>
          </div>
        </div>

        {/* Fresh Content Section - Simplified */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-accent" />
            <h3 className="font-medium text-primary">새로 올라온 콘텐츠</h3>
          </div>
          
          <div className="space-y-2">
            {newShared.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="group p-3 bg-background rounded-lg border border-default hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-primary text-sm line-clamp-1 mb-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">by {item.authorName}</span>
                      <span className="text-xs text-accent font-medium">
                        {getTimeAgo(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* View All Link */}
            <button className="w-full py-2 text-xs text-muted hover:text-accent text-center transition-colors">
              신규 콘텐츠 더보기
            </button>
          </div>
        </div>

        {/* Quick Stats - Simplified */}
        <div className="border-t border-default pt-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-background rounded-lg text-center">
              <div className="text-lg font-semibold text-accent">1,247</div>
              <div className="text-xs text-muted">총 콘텐츠</div>
            </div>
            <div className="p-3 bg-background rounded-lg text-center">
              <div className="text-lg font-semibold text-accent">+28</div>
              <div className="text-xs text-muted">오늘 추가</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}