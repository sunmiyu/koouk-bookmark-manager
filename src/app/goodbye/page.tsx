'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart, ArrowLeft, Home, Sparkles } from 'lucide-react'

export default function GoodbyePage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          {/* Main Card */}
          <div className="bg-white rounded-2xl p-12 shadow-xl border border-gray-200 text-center">
            {/* Logo */}
            <div className="mb-8">
              <Image 
                src="/koouk-logo.svg" 
                alt="KOOUK" 
                width={120}
                height={30}
                className="h-8 w-auto mx-auto opacity-70"
              />
            </div>

            {/* Animated Goodbye Icon */}
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-blue-100 group">
                <span className="text-4xl animate-pulse">👋</span>
                
                {/* Floating sparkles */}
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
                <div className="absolute -bottom-1 -left-2 animate-bounce delay-300">
                  <Heart className="w-5 h-5 text-purple-500 fill-current" />
                </div>
              </div>
            </div>
            
            {/* Main Message */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              See you soon!
            </h1>
            
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              Thanks for using <span className="font-semibold text-blue-600">KOOUK</span> to organize your digital world
            </p>
            
            {/* Countdown */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100">
              <p className="text-sm text-gray-600 mb-2">
                Taking you home in
              </p>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md border border-blue-200">
                <span className="text-2xl font-bold text-blue-600">
                  {countdown}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="group w-full inline-flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Go to Home Now
              </button>
              
              <button
                onClick={() => router.back()}
                className="group w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transform hover:scale-105 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Go Back
              </button>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
              <p className="text-sm text-gray-600">
                Your organized digital life awaits you • Come back anytime
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-green-200/25 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
    </div>
  )
}