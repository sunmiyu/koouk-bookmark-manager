'use client'

import { useState } from 'react'

interface AITool {
  name: string
  desc: string
  url: string
  icon: string
  category: 'popular' | 'creative' | 'development' | 'business'
  isFavorite?: boolean
  isRecent?: boolean
}

const AI_TOOLS: AITool[] = [
  // Popular
  { name: 'ChatGPT', desc: 'Conversational AI assistant', url: 'https://chat.openai.com', icon: '🤖', category: 'popular', isFavorite: true, isRecent: true },
  { name: 'Claude', desc: 'AI assistant by Anthropic', url: 'https://claude.ai', icon: '🧠', category: 'popular', isFavorite: true },
  { name: 'Perplexity', desc: 'AI-powered search engine', url: 'https://www.perplexity.ai', icon: '🔍', category: 'popular', isRecent: true },
  { name: 'Notion AI', desc: 'AI-powered writing assistant', url: 'https://www.notion.so/product/ai', icon: '📝', category: 'popular', isFavorite: true },
  
  // Creative
  { name: 'Midjourney', desc: 'AI image generation', url: 'https://www.midjourney.com', icon: '🎨', category: 'creative', isFavorite: true },
  { name: 'DALL-E 2', desc: 'AI image generation by OpenAI', url: 'https://openai.com/dall-e-2', icon: '🖼️', category: 'creative' },
  { name: 'Runway', desc: 'AI video generation & editing', url: 'https://runwayml.com', icon: '🎬', category: 'creative', isRecent: true },
  { name: 'Adobe Firefly', desc: 'Adobe\'s generative AI', url: 'https://www.adobe.com/kr/products/firefly.html', icon: '🔥', category: 'creative' },
  { name: 'Canva AI', desc: 'Design with AI assistance', url: 'https://www.canva.com/ai-image-generator/', icon: '✨', category: 'creative' },
  { name: 'Leonardo.ai', desc: 'AI image & video generation', url: 'https://leonardo.ai', icon: '🎭', category: 'creative' },
  
  // Development
  { name: 'GitHub Copilot', desc: 'AI pair programmer', url: 'https://github.com/features/copilot', icon: '👨‍💻', category: 'development', isFavorite: true },
  { name: 'Cursor', desc: 'AI-powered code editor', url: 'https://www.cursor.sh', icon: '⚡', category: 'development', isRecent: true },
  { name: 'v0 by Vercel', desc: 'Generate UI with AI', url: 'https://v0.dev', icon: '🎯', category: 'development' },
  { name: 'Codeium', desc: 'Free AI code completion', url: 'https://codeium.com', icon: '💫', category: 'development' },
  { name: 'Tabnine', desc: 'AI code assistant', url: 'https://tabnine.com', icon: '🔧', category: 'development' },
  { name: 'Replit AI', desc: 'AI-powered coding environment', url: 'https://replit.com/ai', icon: '🚀', category: 'development' },
  
  // Business
  { name: 'Copy.ai', desc: 'AI copywriting & content generator', url: 'https://www.copy.ai', icon: '📄', category: 'business' },
  { name: 'Jasper', desc: 'AI content marketing platform', url: 'https://www.jasper.ai', icon: '💼', category: 'business' },
  { name: 'Grammarly', desc: 'AI writing assistant & grammar checker', url: 'https://www.grammarly.com', icon: '✍️', category: 'business' },
  { name: 'Gamma', desc: 'AI presentation maker', url: 'https://gamma.app', icon: '📊', category: 'business', isRecent: true },
  { name: 'Otter.ai', desc: 'AI meeting transcription', url: 'https://www.otter.ai', icon: '🎙️', category: 'business' },
  { name: 'Zapier AI', desc: 'AI automation & workflows', url: 'https://zapier.com/ai', icon: '⚙️', category: 'business' }
]

export default function AIWorkspaceContent() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'popular' | 'creative' | 'development' | 'business'>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set(AI_TOOLS.filter(t => t.isFavorite).map(t => t.name)))

  const categories = [
    { id: 'all', label: 'All Tools', icon: '🌟', count: AI_TOOLS.length },
    { id: 'popular', label: 'Popular', icon: '🔥', count: AI_TOOLS.filter(t => t.category === 'popular').length },
    { id: 'creative', label: 'Creative', icon: '🎨', count: AI_TOOLS.filter(t => t.category === 'creative').length },
    { id: 'development', label: 'Development', icon: '💻', count: AI_TOOLS.filter(t => t.category === 'development').length },
    { id: 'business', label: 'Business', icon: '💼', count: AI_TOOLS.filter(t => t.category === 'business').length }
  ]

  const filteredTools = activeCategory === 'all' 
    ? AI_TOOLS 
    : AI_TOOLS.filter(tool => tool.category === activeCategory)

  const favoriteTools = AI_TOOLS.filter(tool => favorites.has(tool.name))
  const recentTools = AI_TOOLS.filter(tool => tool.isRecent)

  const toggleFavorite = (toolName: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(toolName)) {
      newFavorites.delete(toolName)
    } else {
      newFavorites.add(toolName)
    }
    setFavorites(newFavorites)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-800/50">
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-2">AI Workspace</h2>
          <p className="text-sm text-gray-400">Your personalized toolkit for productivity and creativity</p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400 mb-1">{AI_TOOLS.length}</div>
            <div className="text-xs text-gray-300">AI Tools</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400 mb-1">{favoriteTools.length}</div>
            <div className="text-xs text-gray-300">Favorites</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-400 mb-1">{recentTools.length}</div>
            <div className="text-xs text-gray-300">Recent</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-400 mb-1">4</div>
            <div className="text-xs text-gray-300">Categories</div>
          </div>
        </div>
      </div>

      {/* Quick Access - Favorites & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Favorites */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-800/50">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            ⭐ Favorites
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {favoriteTools.slice(0, 4).map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-700/50 transition-colors group"
              >
                <span className="text-lg">{tool.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                    {tool.name}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{tool.desc}</div>
                </div>
                <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-800/50">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            🕐 Recently Used
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {recentTools.slice(0, 4).map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-700/50 transition-colors group"
              >
                <span className="text-lg">{tool.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                    {tool.name}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{tool.desc}</div>
                </div>
                <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-800/50">
        <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Browse by Category</h3>
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as 'all' | 'popular' | 'creative' | 'development' | 'business')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              {category.icon} {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredTools.map((tool) => (
            <div key={tool.name} className="bg-gray-800/30 rounded-lg p-3 sm:p-4 hover:bg-gray-700/50 transition-all duration-200 group">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <span className="text-xl sm:text-2xl">{tool.icon}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleFavorite(tool.name)
                  }}
                  className={`text-lg transition-colors ${
                    favorites.has(tool.name) ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
                  }`}
                >
                  {favorites.has(tool.name) ? '★' : '☆'}
                </button>
              </div>
              
              <h4 className="text-xs sm:text-sm font-semibold text-white mb-1 sm:mb-2 group-hover:text-blue-300 transition-colors line-clamp-1">
                {tool.name}
              </h4>
              <p className="text-xs text-gray-400 mb-3 sm:mb-4 line-clamp-2 leading-relaxed hidden sm:block">
                {tool.desc}
              </p>
              
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Open Tool
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}