'use client'

import { lazy, Suspense, ComponentType } from 'react'
import { LucideProps } from 'lucide-react'

// 자주 사용되는 아이콘들만 즉시 로드
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Link, 
  StickyNote, 
  Folder,
  FolderOpen,
  Plus,
  Search,
  Menu,
  Home
} from 'lucide-react'

// 아이콘 매핑
const iconMap: Record<string, ComponentType<LucideProps>> = {
  'file-text': FileText,
  'image': ImageIcon,
  'video': Video,
  'link': Link,
  'sticky-note': StickyNote,
  'folder': Folder,
  'folder-open': FolderOpen,
  'plus': Plus,
  'search': Search,
  'menu': Menu,
  'home': Home
}

// 동적 아이콘 로더
const loadIcon = (iconName: string) => {
  const iconKey = iconName.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '')
  
  if (iconMap[iconKey]) {
    return iconMap[iconKey]
  }

  // 동적 import로 나머지 아이콘들 로드
  return lazy(() => import('lucide-react').then(module => ({
    default: (module as unknown as Record<string, ComponentType<LucideProps>>)[iconName] || module.HelpCircle
  })))
}

interface DynamicLucideIconProps extends LucideProps {
  name: string
}

export default function DynamicLucideIcon({ name, ...props }: DynamicLucideIconProps) {
  const IconComponent = loadIcon(name)

  return (
    <Suspense fallback={<div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />}>
      <IconComponent {...props} />
    </Suspense>
  )
}