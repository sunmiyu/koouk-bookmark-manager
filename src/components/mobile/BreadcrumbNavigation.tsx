'use client'

import { Home } from 'lucide-react'

interface BreadcrumbNavigationProps {
  onNavigate?: (folderId: string) => void
}

export default function BreadcrumbNavigation({}: BreadcrumbNavigationProps) {
  // Hide this component entirely since we now have unified header
  return null
}