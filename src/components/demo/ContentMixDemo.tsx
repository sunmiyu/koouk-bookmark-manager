'use client'

import EnhancedContentCard, { ContentGrid } from '@/components/ui/EnhancedContentCard'

// 🎨 DEMO: Shows how mixed content types create "plenty but organized" feeling
export default function ContentMixDemo() {
  
  // Mock data representing real folder contents
  const mixedContent = [
    // URLs with thumbnails (ideal case)
    {
      type: 'url' as const,
      title: 'GitHub - React Documentation',
      description: 'A JavaScript library for building user interfaces',
      thumbnail: 'https://opengraph.githubassets.com/1/facebook/react',
      url: 'https://react.dev',
      metadata: { domain: 'react.dev' }
    },
    
    // URLs without thumbnails (fallback strategy)
    {
      type: 'url' as const,
      title: 'Advanced TypeScript Tips and Tricks',
      description: 'Learn advanced patterns for better TypeScript development',
      url: 'https://stackoverflow.com/questions/typescript',
      metadata: { domain: 'stackoverflow.com' }
    },
    
    // Images
    {
      type: 'image' as const,
      title: 'Design System Colors.png',
      thumbnail: 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=400',
      metadata: { fileSize: '2.3MB' }
    },
    
    // Videos/YouTube
    {
      type: 'video' as const,
      title: 'React Hooks Explained',
      description: 'Complete guide to React hooks with examples',
      thumbnail: 'https://img.youtube.com/vi/TNhaISOUy6Q/maxresdefault.jpg',
      metadata: { duration: '24:15' }
    },
    
    // Documents
    {
      type: 'document' as const,
      title: 'Project Requirements.pdf',
      description: 'Technical specifications for the new feature',
      metadata: { fileSize: '1.2MB' }
    },
    
    // Memos
    {
      type: 'memo' as const,
      title: 'Meeting Notes - Q1 Planning',
      description: 'Key decisions from the quarterly planning meeting: 1. Focus on mobile experience 2. Implement dark mode 3. Performance optimizations'
    },
    
    // More URLs with different domains
    {
      type: 'url' as const,
      title: 'Figma Design System',
      description: 'Our company design system and component library',
      url: 'https://figma.com/design-systems',
      metadata: { domain: 'figma.com' }
    },
    
    {
      type: 'url' as const,
      title: 'Notion Project Database',
      description: 'Track all our project tasks and deadlines',
      url: 'https://notion.so/workspace',
      metadata: { domain: 'notion.so' }
    },
    
    // More images
    {
      type: 'image' as const,
      title: 'Homepage Mockup.jpg',
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
      metadata: { fileSize: '4.1MB' }
    },
    
    // Another video
    {
      type: 'video' as const,
      title: 'Team Standup Recording',
      description: 'Weekly team sync - discussing sprint progress',
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
      metadata: { duration: '45:30' }
    },
    
    // More documents
    {
      type: 'document' as const,
      title: 'API Documentation.md',
      description: 'Complete API reference with examples',
      metadata: { fileSize: '856KB' }
    },
    
    // URL from different domain
    {
      type: 'url' as const,
      title: 'Google Drive Shared Folder',
      description: 'Team resources and shared documents',
      url: 'https://drive.google.com/drive/folders',
      metadata: { domain: 'drive.google.com' }
    },
    
    // Another memo
    {
      type: 'memo' as const,
      title: 'Design Ideas Brainstorm',
      description: 'Random thoughts on improving user experience: voice commands, gesture controls, AI assistance'
    },
    
    // URL with domain-based fallback
    {
      type: 'url' as const,
      title: 'LinkedIn Article on UX Design',
      description: 'Best practices for mobile-first design approach',
      url: 'https://linkedin.com/pulse/ux-design-tips',
      metadata: { domain: 'linkedin.com' }
    },
    
    // More varied content
    {
      type: 'image' as const,
      title: 'Team Photo.png',
      thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
      metadata: { fileSize: '3.7MB' }
    }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6">
      
      {/* 📊 DEMO HEADER */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Mixed Content Demo - "Development Resources" Folder
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          {mixedContent.length} items • Shows how different content types create visual harmony
        </p>
        
        {/* 🏷️ CONTENT TYPE LEGEND */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">🔗 URLs ({mixedContent.filter(item => item.type === 'url').length})</span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">🖼️ Images ({mixedContent.filter(item => item.type === 'image').length})</span>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">📺 Videos ({mixedContent.filter(item => item.type === 'video').length})</span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">📄 Documents ({mixedContent.filter(item => item.type === 'document').length})</span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">📝 Memos ({mixedContent.filter(item => item.type === 'memo').length})</span>
        </div>
      </div>

      {/* 🎯 MAIN CONTENT GRID - The "plenty but organized" layout */}
      <ContentGrid>
        {mixedContent.map((item, index) => (
          <EnhancedContentCard
            key={index}
            type={item.type}
            title={item.title}
            description={item.description}
            thumbnail={item.thumbnail}
            url={item.url}
            metadata={item.metadata}
            onClick={() => console.log('Clicked:', item.title)}
            size="medium"
            layout="grid"
          />
        ))}
      </ContentGrid>

      {/* 📝 DESIGN NOTES */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          🎨 Design Strategy Results
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">✅ Visual Harmony Achieved:</h3>
            <ul className="space-y-1">
              <li>• Consistent card sizes create order</li>
              <li>• Mixed content feels "plenty but organized"</li>
              <li>• Domain-based colors add visual richness</li>
              <li>• Typography creates hierarchy</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">🎯 URL Fallback Strategies:</h3>
            <ul className="space-y-1">
              <li>• Domain initials with consistent colors</li>
              <li>• Text-focused cards when no image</li>
              <li>• Icons provide visual anchors</li>
              <li>• Metadata adds information density</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}