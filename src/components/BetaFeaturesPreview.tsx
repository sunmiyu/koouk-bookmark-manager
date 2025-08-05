'use client'

import { useState } from 'react'

interface BetaFeature {
  id: string
  title: string
  description: string
  icon: string
  status: 'coming-soon' | 'beta' | 'preview'
  category: 'ai' | 'productivity' | 'automation' | 'integration'
  estimatedRelease: string
  features: string[]
  demoAvailable?: boolean
}

const betaFeatures: BetaFeature[] = [
  {
    id: 'ai-assistant',
    title: 'AI Personal Assistant',
    description: 'Smart AI helper that learns from your daily patterns to provide personalized suggestions and automate routine tasks.',
    icon: '🤖',
    status: 'beta',
    category: 'ai',
    estimatedRelease: 'Q2 2025',
    features: [
      'Natural language task creation',
      'Smart scheduling suggestions',
      'Context-aware reminders',
      'Daily summary generation'
    ],
    demoAvailable: true
  },
  {
    id: 'smart-automation',
    title: 'Smart Automation Rules',
    description: 'Create intelligent workflows that automatically organize your content and trigger actions based on your behavior.',
    icon: '⚡',
    status: 'coming-soon',
    category: 'automation',
    estimatedRelease: 'Q3 2025',
    features: [
      'Auto-tagging of saved content',
      'Smart categorization',
      'Trigger-based actions',
      'Cross-platform syncing'
    ]
  },
  {
    id: 'analytics-dashboard',
    title: 'Productivity Analytics',
    description: 'Comprehensive insights into your productivity patterns with AI-powered recommendations for improvement.',
    icon: '📊',
    status: 'preview',
    category: 'productivity',
    estimatedRelease: 'Q1 2025',
    features: [
      'Time tracking analysis',
      'Goal achievement metrics',
      'Habit formation insights',
      'Weekly/monthly reports'
    ]
  },
  {
    id: 'team-collaboration',
    title: 'Team Collaboration Hub',
    description: 'Share boards, collaborate on projects, and sync progress with team members in real-time.',
    icon: '👥',
    status: 'coming-soon',
    category: 'productivity',
    estimatedRelease: 'Q4 2025',
    features: [
      'Shared workspaces',
      'Real-time collaboration',
      'Team activity feeds',
      'Permission management'
    ]
  },
  {
    id: 'voice-commands',
    title: 'Voice Commands & Dictation',
    description: 'Control your dashboard and create content using natural voice commands powered by advanced speech recognition.',
    icon: '🎤',
    status: 'beta',
    category: 'ai',
    estimatedRelease: 'Q2 2025',
    features: [
      'Voice note creation',
      'Hands-free navigation',
      'Smart transcription',
      'Multi-language support'
    ],
    demoAvailable: true
  },
  {
    id: 'api-integrations',
    title: 'Advanced API Integrations',
    description: 'Connect with 100+ popular services including Notion, Trello, Slack, and more with bidirectional sync.',
    icon: '🔗',
    status: 'preview',
    category: 'integration',
    estimatedRelease: 'Q1 2025',
    features: [
      'Notion synchronization',
      'Slack notifications',
      'Google Workspace integration',
      'Custom webhook support'
    ]
  }
]

const categories = [
  { id: 'all', label: 'All Features', icon: '🎯' },
  { id: 'ai', label: 'AI & ML', icon: '🤖' },
  { id: 'productivity', label: 'Productivity', icon: '📈' },
  { id: 'automation', label: 'Automation', icon: '⚡' },
  { id: 'integration', label: 'Integrations', icon: '🔗' }
]

export default function BetaFeaturesPreview() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFeature, setSelectedFeature] = useState<BetaFeature | null>(null)

  const filteredFeatures = selectedCategory === 'all' 
    ? betaFeatures 
    : betaFeatures.filter(feature => feature.category === selectedCategory)

  const getStatusColor = (status: BetaFeature['status']) => {
    switch (status) {
      case 'beta':
        return 'bg-green-600/20 text-green-400 border-green-500/30'
      case 'preview':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/30'
      case 'coming-soon':
        return 'bg-orange-600/20 text-orange-400 border-orange-500/30'
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusLabel = (status: BetaFeature['status']) => {
    switch (status) {
      case 'beta':
        return 'Beta'
      case 'preview':
        return 'Preview'
      case 'coming-soon':
        return 'Coming Soon'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Beta Features Preview</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Get an early look at upcoming features and tools that will supercharge your productivity workflow
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map(feature => (
          <div
            key={feature.id}
            className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer group"
            onClick={() => setSelectedFeature(feature)}
          >
            {/* Feature Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                    {feature.title}
                  </h3>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(feature.status)}`}>
                    {getStatusLabel(feature.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {feature.description}
            </p>

            {/* Key Features */}
            <div className="space-y-2 mb-4">
              <h4 className="text-xs font-medium text-gray-300">Key Features:</h4>
              <ul className="space-y-1">
                {feature.features.slice(0, 2).map((item, index) => (
                  <li key={index} className="text-xs text-gray-400 flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
                {feature.features.length > 2 && (
                  <li className="text-xs text-gray-500">
                    +{feature.features.length - 2} more features
                  </li>
                )}
              </ul>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Est. {feature.estimatedRelease}
              </span>
              {feature.demoAvailable && (
                <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                  Demo Available
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Detail Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{selectedFeature.icon}</div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedFeature.title}</h2>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-2 ${getStatusColor(selectedFeature.status)}`}>
                      {getStatusLabel(selectedFeature.status)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                <p className="text-gray-400">{selectedFeature.description}</p>
              </div>

              {/* All Features */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedFeature.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-purple-400 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Release Info */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Category:</span>
                    <div className="text-white font-medium capitalize">{selectedFeature.category}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Estimated Release:</span>
                    <div className="text-white font-medium">{selectedFeature.estimatedRelease}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedFeature.demoAvailable ? (
                  <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                    Try Demo
                  </button>
                ) : (
                  <button className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium cursor-not-allowed">
                    Demo Not Available
                  </button>
                )}
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
                  Get Notified
                </button>
              </div>

              {/* Beta Access CTA */}
              {selectedFeature.status === 'beta' && (
                <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🚀</div>
                    <div>
                      <h4 className="text-white font-semibold">Beta Access Available!</h4>
                      <p className="text-gray-300 text-sm">
                        This feature is currently in beta testing. Join now to get early access.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Early Access CTA */}
      <div className="text-center bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-xl p-6">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-semibold text-white mb-2">Want Early Access?</h3>
        <p className="text-gray-400 mb-4">
          Join our beta program to get first access to new features and help shape the future of Koouk
        </p>
        <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200">
          Join Beta Program
        </button>
      </div>
    </div>
  )
}