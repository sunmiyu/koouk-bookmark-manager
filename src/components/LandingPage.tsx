'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { ArrowRight } from 'lucide-react'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
        }
      })
      
      if (authError) {
        console.error('로그인 실패: 다시 시도해주세요')
      }
    } catch {
      console.error('연결 오류: 인터넷 연결을 확인해주세요')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Minimal subtle background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Header */}
      <motion.header 
        className="relative z-10 px-8 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.01 }}
          >
            <img 
              src="/koouk-logo.svg" 
              alt="KOOUK" 
              className="h-8 w-auto"
            />
          </motion.div>

          <motion.button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium text-black hover:text-gray-600 transition-colors border border-black hover:bg-black hover:text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Loading...' : 'Sign In'}
          </motion.button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-8">
        <div className="text-center pt-24 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-light text-black mb-8 tracking-wide leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Personal Knowledge
              <span className="block font-normal">Management</span>
            </motion.h1>

            <motion.p 
              className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              체계적으로 저장하고 관리하는 개인 저장소
            </motion.p>

            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="group px-12 py-3 bg-black text-white font-medium text-sm tracking-wide hover:bg-gray-800 transition-colors duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading
                  </div>
                ) : (
                  <>
                    Get Started
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Features */}
        <motion.section 
          className="grid md:grid-cols-3 gap-16 mb-32 pt-16 border-t border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="text-center">
            <h3 className="text-sm font-medium text-black mb-3 tracking-wide uppercase">
              Smart Folders
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              자동으로 분류되는 스마트 폴더링
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-black mb-3 tracking-wide uppercase">
              Share Place
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              다른 사용자와 정보 공유
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-black mb-3 tracking-wide uppercase">
              Quick Save
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              즉시 저장 가능한 입력창
            </p>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          className="text-center pb-16 pt-32 border-t border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/koouk-logo.svg" 
              alt="KOOUK" 
              className="h-5 w-auto opacity-60"
            />
          </div>
          <p className="text-gray-400 text-xs tracking-wide uppercase">
            © 2024 Personal Knowledge Management
          </p>
        </motion.footer>
      </main>
    </div>
  )
}