'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function GoodbyePage() {
  const router = useRouter()

  useEffect(() => {
    // 3초 후 홈페이지로 리다이렉트
    const timer = setTimeout(() => {
      router.push('/')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        {/* Logo */}
        <div className="mb-8">
          <Image 
            src="/koouk-logo.svg" 
            alt="KOOUK" 
            width={120}
            height={30}
            className="h-8 w-auto mx-auto opacity-80"
          />
        </div>

        {/* Goodbye Message */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
            <span className="text-3xl">👋</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bye Bye!
          </h1>
          
          <p className="text-gray-600 text-lg mb-6">
            Thank you for using KOOUK
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to home page...
          </p>
        </div>

        {/* Manual Redirect Button */}
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Go to Home
        </button>
      </div>
    </div>
  )
}