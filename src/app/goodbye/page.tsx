'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Home } from 'lucide-react'

export default function GoodbyePage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
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
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="mb-6">
          <Image 
            src="/koouk-logo.svg" 
            alt="KOOUK" 
            width={80}
            height={20}
            className="h-5 w-auto mx-auto"
          />
        </div>

        <h1 className="text-lg font-medium text-gray-900 mb-2">
          See you soon
        </h1>
        
        <p className="text-gray-600 text-sm mb-6">
          Thanks for using KOOUK
        </p>
        
        <div className="bg-gray-50 rounded-md p-4 mb-6">
          <p className="text-xs text-gray-600 mb-2">
            Redirecting in
          </p>
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center mx-auto">
            <span className="text-sm font-medium">
              {countdown}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => router.push('/')}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </button>
          
          <button
            onClick={() => router.back()}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}