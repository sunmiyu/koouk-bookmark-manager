'use client'

import { useAuth } from '@/components/auth/AuthContext'
import Image from 'next/image'
import { Folder, Bookmark, Store, ArrowRight, Sparkles, Users, Shield, Zap } from 'lucide-react'

export default function LandingPage() {
  const { signIn } = useAuth()

  const mainFeatures = [
    {
      icon: <Folder className="w-5 h-5 text-blue-600" />,
      title: "My Folder",
      description: "Organize everything you find on the internet",
      subtitle: "Your digital collection hub",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconBg: "bg-blue-100"
    },
    {
      icon: <Bookmark className="w-5 h-5 text-green-600" />,
      title: "Bookmarks", 
      description: "Save favorites for quick access",
      subtitle: "Never lose a great find again",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      iconBg: "bg-green-100"
    },
    {
      icon: <Store className="w-5 h-5 text-purple-600" />,
      title: "Market Place",
      description: "Discover curated collections from community",
      subtitle: "Connect through shared interests", 
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconBg: "bg-purple-100"
    }
  ]

  const benefits = [
    {
      icon: <Zap className="w-4 h-4 text-yellow-600" />,
      text: "Easy Easy Super Easy"
    },
    {
      icon: <Users className="w-4 h-4 text-blue-600" />,
      text: "1200+ shared collections"
    },
    {
      icon: <Shield className="w-4 h-4 text-green-600" />,
      text: "Secure & Private"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="pt-16 pb-12 px-6">
        <div className="max-w-md mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <Image 
              src="/koouk-logo.svg" 
              alt="KOOUK" 
              width={120}
              height={30}
              className="h-8 w-auto mx-auto"
            />
          </div>

          {/* Hero Text */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Your Personal
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Lifestyle Hub
            </span>
          </h1>
          
          <p className="text-gray-600 text-base mb-6 leading-relaxed">
            Notion은 어렵다 → Koouk은 직관적이어서 배울 필요 없다
          </p>

          {/* Benefits */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-1">
                {benefit.icon}
                <span className="text-xs text-gray-600 hidden sm:inline">
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={signIn}
            className="w-full bg-black text-white py-4 px-6 rounded-2xl font-medium text-base hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <span>Sign in with Google</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <p className="text-xs text-gray-500 mt-3">
            Free forever • No credit card required
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 pb-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Everything you need in one place
            </h2>
            <p className="text-sm text-gray-600">
              3초 안에 이해할 수 있는 직관적인 디자인
            </p>
          </div>

          <div className="space-y-4">
            {mainFeatures.map((feature, index) => (
              <div 
                key={index}
                className={`border-2 rounded-2xl p-4 transition-all duration-200 ${feature.color}`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`${feature.iconBg} p-2 rounded-xl`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-xs mb-1">
                      {feature.description}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {feature.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-500 text-xs">
            <Sparkles className="w-3 h-3" />
            <span>Mobile-First Design</span>
            <span>•</span>
            <span>감성적 UI</span>
            <span>•</span>
            <span>즉시 사용 가능</span>
          </div>
        </div>
      </div>
    </div>
  )
}