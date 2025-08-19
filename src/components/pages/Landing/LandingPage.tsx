'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import Image from 'next/image'
import { Folder, Bookmark, Store, ArrowRight, Sparkles, Users, Shield, Zap } from 'lucide-react'
import { useState } from 'react'

export default function LandingPage() {
  const { signIn } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)

  // 🚀 FIX 1: 로딩 상태가 있는 로그인 함수
  const handleSignIn = async () => {
    if (isSigningIn) return // 중복 클릭 방지
    
    try {
      setIsSigningIn(true)
      await signIn()
    } catch (error) {
      console.error('로그인 실패:', error)
      // 에러 처리는 AuthContext에서 담당
    } finally {
      setIsSigningIn(false)
    }
  }

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
      icon: <Zap className="w-4 h-4 text-gray-600" />,
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="pt-16 pb-12 px-6">
        <div className="max-w-md mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <Image 
              src="/koouk-logo.svg" 
              alt="KOOUK - Your Personal Lifestyle Hub" 
              width={120}
              height={30}
              className="h-8 w-auto mx-auto"
              priority // 🚀 FIX 2: 로고 우선 로딩
            />
          </div>

          {/* Hero Text */}
          <h1 className="text-lg font-semibold text-gray-900 mb-3">
            Your Personal
            <span className="block text-gray-900">
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
            onClick={handleSignIn}
            disabled={isSigningIn} // 🚀 FIX 3: 로딩 중 비활성화
            className={`w-full py-4 px-6 rounded-2xl font-medium text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2 ${
              isSigningIn 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' // 로딩 중 스타일
                : 'bg-black text-white hover:bg-gray-800' // 기본 스타일
            }`}
          >
            {isSigningIn ? (
              <>
                {/* 🚀 FIX 4: 로딩 스피너 */}
                <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in with Google</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
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
                role="article" // 🚀 FIX 5: 접근성 개선
                aria-labelledby={`feature-${index}`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`${feature.iconBg} p-2 rounded-xl`} aria-hidden="true">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 id={`feature-${index}`} className="font-semibold text-gray-900 text-sm mb-1">
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
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            <span>Mobile-First Design</span>
            <span aria-hidden="true">•</span>
            <span>감성적 UI</span>
            <span aria-hidden="true">•</span>
            <span>즉시 사용 가능</span>
          </div>
        </div>
      </div>
    </div>
  )
}