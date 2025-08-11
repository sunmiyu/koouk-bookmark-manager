'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'
import { useCrossPlatformState } from '@/hooks/useCrossPlatformState'
import { useRef, useEffect } from 'react'

interface BreadcrumbNavigationProps {
  onNavigate?: (folderId: string) => void
}

export default function BreadcrumbNavigation({ onNavigate }: BreadcrumbNavigationProps) {
  // 새로운 트리 방식에서는 브레드크럼이 필요 없으므로 간단한 헤더만 표시
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
            <Home size={14} color="#3B82F6" />
          </div>
          <span className="text-sm font-semibold text-gray-800">내 폴더</span>
        </div>
      </div>
    </div>
  )
}