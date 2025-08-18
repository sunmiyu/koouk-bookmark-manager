'use client'

import { useAuth } from '@/components/auth/AuthContext'
import { Folder, Bookmark, Store, ArrowRight, Sparkles, Users, Shield } from 'lucide-react'

export default function OnboardingPage() {
  const { signIn } = useAuth()

  const mainFeatures = [
    {
      icon: <Folder className="w-4 h-4 text-gray-600" />,
      title: "My Folder",
      description: "Organize and save everything you find on the internet in one place",
      subtitle: "Your digital collection hub",
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
      iconBg: "bg-gray-100"
    },
    {
      icon: <Bookmark className="w-4 h-4 text-gray-600" />,
      title: "Bookmarks", 
      description: "Save your favorite websites and frequently visited places for quick access",
      subtitle: "Never lose a great find again",
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
      iconBg: "bg-gray-100"
    },
    {
      icon: <Store className="w-4 h-4 text-gray-600" />,
      title: "Market Place",
      description: "Discover curated collections from the community and share your own",
      subtitle: "Connect through shared interests", 
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
      iconBg: "bg-gray-100"
    }
  ]

  const benefits = [
    {
      icon: <Sparkles className="w-4 h-4 text-gray-600" />,
      title: "Smart Organization",
      description: "AI-powered categorization makes finding your content effortless"
    },
    {
      icon: <Users className="w-4 h-4 text-gray-600" />,
      title: "Community Driven", 
      description: "Share and discover amazing content from like-minded users"
    },
    {
      icon: <Shield className="w-4 h-4 text-gray-600" />,
      title: "Secure & Private",
      description: "Your data is encrypted and belongs to you, always"
    }
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-sm mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              Welcome to digital organization
            </div>
            
            <h1 className="text-lg font-medium text-gray-900 mb-3">
              Meet <span className="text-black">KOOUK</span>
            </h1>
            
            <p className="text-sm text-gray-600 mb-8 max-w-sm mx-auto">
              Your personal lifestyle management platform. Organize, bookmark, and discover amazing content.
            </p>
            
            <button
              onClick={signIn}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Get Started with Google
              <ArrowRight className="ml-2 w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Features Grid - Horizontal Layout */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="text-center mb-6">
          <h2 className="text-base font-medium text-gray-900 mb-2">
            Everything you need in one place
          </h2>
          <p className="text-sm text-gray-600">
            Features designed to make your digital life organized
          </p>
        </div>

        {/* Features in horizontal grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {mainFeatures.map((feature, index) => (
            <div 
              key={index}
              className={`${feature.color} rounded-md p-3 border hover:shadow-sm transition-all duration-200`}
            >
              <div className={`${feature.iconBg} w-6 h-6 rounded-md flex items-center justify-center mb-2`}>
                {feature.icon}
              </div>
              
              <h3 className="text-xs font-medium text-gray-900 mb-1">
                {feature.title}
              </h3>
              
              <p className="text-xs text-gray-700">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits Section - Horizontal */}
        <div className="bg-gray-50 rounded-md p-4 border border-gray-200 mb-4">
          <div className="text-center mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Why choose KOOUK
            </h3>
          </div>

          {/* Benefits in horizontal grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-100 w-6 h-6 rounded-md flex items-center justify-center mx-auto mb-1">
                  {benefit.icon}
                </div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">
                  {benefit.title}
                </h4>
                <p className="text-xs text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gray-100 rounded-md p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              Ready to get started?
            </h4>
            <p className="text-xs text-gray-600 mb-3">
              Start organizing your digital world today
            </p>
            <button
              onClick={signIn}
              className="inline-flex items-center justify-center px-6 py-2 bg-black text-white rounded-md text-xs font-medium hover:bg-gray-800 transition-colors"
            >
              Sign up with Google
              <ArrowRight className="ml-1 w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}