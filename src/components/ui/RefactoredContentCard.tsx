'use client'

import { BaseContentCard } from './cards/BaseContentCard'
import { CardPreview } from './cards/CardPreview'
import { ContentType, ContentMetadata } from '@/types/content'
import { getEffectiveTitle } from '@/utils/titleUtils'

interface RefactoredContentCardProps {
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
 * 리팩토링된 콘텐츠 카드 컴포넌트
 * BaseContentCard + CardPreview를 조합한 깔끔한 구조
 */
export function RefactoredContentCard({
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
}: RefactoredContentCardProps) {
  // 효과적인 제목 계산
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

// 호환성을 위한 기본 export (기존 코드가 이 이름으로 import할 수 있도록)
export default RefactoredContentCard

// ContentGrid와 ContentList도 함께 export (기존과 동일)
export function ContentGrid({ children, layout = 'grid' }: { children: React.ReactNode; layout?: 'grid' | 'list' }) {
  if (layout === 'list') {
    return (
      <div className="divide-y divide-gray-100">
        {children}
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5 px-3 py-2">
      {children}
    </div>
  )
}

export function ContentList({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2 p-4">
      {children}
    </div>
  )
}