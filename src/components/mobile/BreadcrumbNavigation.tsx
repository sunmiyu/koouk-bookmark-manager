'use client'

interface BreadcrumbNavigationProps {
  onNavigate?: (folderId: string) => void
}

export default function BreadcrumbNavigation({}: BreadcrumbNavigationProps) {
  // Hide this component entirely since we now have unified header
  return null
}