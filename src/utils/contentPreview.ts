// 🎯 Content Preview Utilities - Smart fallbacks for URL thumbnails

export interface ContentMetadata {
  title: string
  description?: string
  thumbnail?: string
  domain: string
  favicon?: string
}

// 📄 Domain-based color generation for consistent fallbacks
export const generateDomainColor = (domain: string): string => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-indigo-500', 'bg-pink-500', 'bg-teal-500', 'bg-cyan-500',
    'bg-orange-500', 'bg-lime-500', 'bg-violet-500', 'bg-rose-500'
  ]
  
  // Create consistent hash from domain
  const hash = domain.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
  
  return colors[hash % colors.length]
}

// 🎨 Extract domain info for fallback display
export const getDomainInfo = (url: string) => {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace('www.', '')
    
    return {
      domain,
      domainInitial: domain.charAt(0).toUpperCase(),
      domainColor: generateDomainColor(domain),
      subdomain: urlObj.hostname.includes('www.') ? 'www' : null
    }
  } catch {
    return {
      domain: 'unknown',
      domainInitial: '?',
      domainColor: 'bg-gray-500',
      subdomain: null
    }
  }
}

// 🔍 Popular domain patterns for better recognition
export const getPopularDomainIcon = (domain: string): string | null => {
  const domainIcons: Record<string, string> = {
    'github.com': '⚡',
    'youtube.com': '▶️',
    'google.com': '🔍',
    'stackoverflow.com': '💡',
    'medium.com': '📰',
    'dev.to': '👨‍💻',
    'figma.com': '🎨',
    'notion.so': '📝',
    'twitter.com': '🐦',
    'linkedin.com': '💼',
    'instagram.com': '📸',
    'facebook.com': '👥',
    'discord.com': '💬',
    'slack.com': '💬',
    'zoom.us': '📹',
    'drive.google.com': '💾',
    'dropbox.com': '📦',
    'spotify.com': '🎵',
    'netflix.com': '🎬',
    'amazon.com': '📦',
    'reddit.com': '🔴'
  }
  
  return domainIcons[domain] || null
}

// 📊 Generate placeholder thumbnail for URLs without images
export const generatePlaceholderThumbnail = (
  title: string, 
  domain: string, 
  description?: string
): string => {
  // This would ideally generate a canvas-based thumbnail
  // For now, return a data URL for a simple colored rectangle
  
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 300
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return ''
  
  // Get domain color
  const domainInfo = getDomainInfo(`https://${domain}`)
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 400, 300)
  gradient.addColorStop(0, '#f3f4f6')
  gradient.addColorStop(1, '#e5e7eb')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 400, 300)
  
  // Add domain initial
  ctx.fillStyle = '#374151'
  ctx.font = 'bold 120px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText(domainInfo.domainInitial, 200, 180)
  
  // Add domain name
  ctx.fillStyle = '#6b7280'
  ctx.font = '24px system-ui'
  ctx.fillText(domain, 200, 240)
  
  return canvas.toDataURL()
}

// 🎯 Extract meaningful info for content cards
export const processContentForDisplay = (
  type: string,
  title: string,
  url?: string,
  description?: string,
  thumbnail?: string
) => {
  const processed = {
    title: title.length > 60 ? title.substring(0, 57) + '...' : title,
    description: description && description.length > 120 
      ? description.substring(0, 117) + '...' 
      : description,
    thumbnail,
    domainInfo: url ? getDomainInfo(url) : null,
    typeIcon: getPopularDomainIcon(url ? getDomainInfo(url).domain : '') || getDefaultTypeIcon(type)
  }
  
  return processed
}

// 📄 Default type icons
const getDefaultTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'url': '🔗',
    'image': '🖼️', 
    'video': '📺',
    'document': '📄',
    'memo': '📝',
    'folder': '📁'
  }
  
  return icons[type] || '📄'
}

// 🎨 Generate CSS classes for domain-based styling
export const getDomainStyling = (domain: string) => {
  const baseColor = generateDomainColor(domain)
  
  return {
    backgroundColor: baseColor,
    textColor: 'text-white',
    borderColor: baseColor.replace('bg-', 'border-'),
    hoverColor: baseColor.replace('500', '600')
  }
}

// 🔧 Utility to check if URL is likely to have good thumbnails
export const urlLikelyHasThumbnail = (url: string): boolean => {
  const domain = getDomainInfo(url).domain
  
  // Domains that typically provide good Open Graph images
  const goodThumbnailDomains = [
    'youtube.com', 'github.com', 'medium.com', 'dev.to',
    'linkedin.com', 'twitter.com', 'facebook.com',
    'instagram.com', 'dribbble.com', 'behance.net',
    'figma.com', 'notion.so', 'airtable.com'
  ]
  
  return goodThumbnailDomains.some(goodDomain => domain.includes(goodDomain))
}