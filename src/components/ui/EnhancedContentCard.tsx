'use client'

/**
 * 🚀 REFACTORED: EnhancedContentCard
 * 이제 BaseContentCard + CardPreview의 조합으로 깔끔하게 구성됨
 * - YouTube 제목 표시 문제 해결
 * - 완전한 삭제/편집 기능 구현  
 * - 중복 코드 제거 및 유틸 함수 분리
 * - 타입 안전성 강화
 */

import { BaseContentCard } from './cards/BaseContentCard'
import { CardPreview } from './cards/CardPreview'
import { ContentType, ContentMetadata } from '@/types/content'
import { getEffectiveTitle } from '@/utils/titleUtils'

interface ContentCardProps {
  type: ContentType
  title: string
  description?: string
  thumbnail?: string
  url?: string
  metadata?: ContentMetadata
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  size?: 'small' | 'medium' | 'large'
  layout?: 'grid' | 'list'
  showActions?: boolean
}

/**
 * ✨ CLEAN & POWERFUL: 새로운 EnhancedContentCard
 * BaseContentCard + CardPreview로 구성된 모듈러 아키텍처
 */
export default function EnhancedContentCard({
  type,
  title,
  description,
  thumbnail,
  url,
  metadata,
  onClick,
  onEdit,
  onDelete,
  size = 'medium',
  layout = 'grid',
  showActions = true
}: ContentCardProps) {
  // 효과적인 제목 계산 (YouTube 제목 문제 해결!)
  const effectiveTitle = getEffectiveTitle(title, type, metadata)
  
  // 공유 상태 확인
  const isShared = type === 'folder' && metadata?.isShared

  // 리스트 레이아웃용 우측 콘텐츠
  const rightContent = layout === 'list' ? (
    <>
      {/* 폴더 아이템 수 */}
      {type === 'folder' && (
        <div className="text-xs text-gray-500 text-right">
          <div>{(metadata?.children?.length || 0)}</div>
          <div>items</div>
        </div>
      )}
      
      {/* 마켓플레이스 통계 */}
      {metadata?.fileSize && typeof metadata.fileSize === 'string' && metadata.fileSize.includes('♥') && (
        <div className="text-xs text-gray-600 text-right">
          <div className="flex items-center gap-1">
            {metadata.fileSize.split(' ').map((stat, i) => (
              <span key={i} className="flex items-center gap-0.5">
                {stat}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* 북마크 즐겨찾기 */}
      {metadata?.fileSize && metadata.fileSize.includes('⭐') && (
        <div className="text-sm">⭐</div>
      )}
    </>
  ) : undefined

  return (
    <BaseContentCard
      type={type}
      title={effectiveTitle}
      onClick={onClick}
      onEdit={onEdit}
      onDelete={onDelete}
      size={size}
      layout={layout}
      showActions={showActions}
      isShared={isShared}
      rightContent={rightContent}
    >
      <CardPreview
        type={type}
        title={effectiveTitle}
        thumbnail={thumbnail}
        url={url}
        metadata={metadata}
        description={description}
        size={size}
        layout={layout}
      />
    </BaseContentCard>
  )
}

// Content Grid component for consistent spacing - responsive to layout mode
export function ContentGrid({ children, layout = 'grid' }: { children: React.ReactNode; layout?: 'grid' | 'list' }) {
  if (layout === 'list') {
    return (
      <div className="divide-y divide-gray-100">
        {children}
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 p-4">
      {children}
    </div>
  )
}

// List view component 
export function ContentList({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2 p-4">
      {children}
    </div>
  )
}