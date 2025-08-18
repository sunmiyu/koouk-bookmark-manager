'use client'

import { useAuth } from '@/components/auth/AuthContext'
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth'
import { Folder, Bookmark, Store, ArrowRight, Sparkles, Users, Shield } from 'lucide-react'

export default function OnboardingPage() {
  const { signIn } = useAuth()
  const optimizedAuth = useOptimizedAuth()

  const mainFeatures = [
    {
      icon: <Folder className="w-8 h-8 text-blue-600" />,
      title: "My Folder",
      description: "Organize and save everything you find on the internet in one beautiful place",
      subtitle: "Your digital collection hub",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconBg: "bg-blue-100"
    },
    {
      icon: <Bookmark className="w-8 h-8 text-green-600" />,
      title: "Bookmarks", 
      description: "Save your favorite websites and frequently visited places for quick access",
      subtitle: "Never lose a great find again",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      iconBg: "bg-green-100"
    },
    {
      icon: <Store className="w-8 h-8 text-purple-600" />,
      title: "Market Place",
      description: "Discover curated collections from the community and share your own",
      subtitle: "Connect through shared interests", 
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconBg: "bg-purple-100"
    }
  ]

  const benefits = [
    {
      icon: <Sparkles className="w-6 h-6 text-blue-600" />,
      title: "Smart Organization",
      description: "AI-powered categorization makes finding your content effortless"
    },
    {
      icon: <Users className="w-6 h-6 text-green-600" />,
      title: "Community Driven", 
      description: "Share and discover amazing content from like-minded users"
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: "Secure & Private",
      description: "Your data is encrypted and belongs to you, always"
    }
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Welcome to the future of digital organization
            </div>
            
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Meet <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">KOOUK</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your personal lifestyle management platform. Organize, bookmark, and discover amazing content with the power of community collaboration.
            </p>
            
            <button
              {...optimizedAuth.getLoginButtonProps()}
              className="group inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-2xl text-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {optimizedAuth.isOptimistic ? 'Signing in...' : 'Get Started with Google'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need in one place
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make your digital life more organized and connected
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <div 
              key={index}
              className={`${feature.color} rounded-2xl p-8 border-2 hover:shadow-lg transform hover:-translate-y-2 transition-all duration-300 cursor-default group`}
            >
              <div className={`${feature.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                {feature.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              
              <p className="text-sm font-medium text-gray-500 mb-4">
                {feature.subtitle}
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why thousands choose KOOUK
            </h3>
            <p className="text-lg text-gray-600">
              Join a community that values organization, discovery, and sharing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gray-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  {benefit.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to transform your digital life?
            </h4>
            <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
              Start organizing your digital world today. It&apos;s free to get started and takes less than 30 seconds.
            </p>
            <button
              onClick={signIn}
              className="group inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-2xl text-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign up with Google
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}