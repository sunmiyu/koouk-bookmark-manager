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
    <div className="min-h-screen apple-page relative">
      {/* Frosted translucent header */}
      <motion.header 
        className="apple-header px-8 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.01 }}
          >
            <img 
              src="/koouk-logo.svg" 
              alt="KOOUK" 
              className="h-7 w-auto opacity-90"
            />
          </motion.div>

          <motion.button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="apple-button-ghost"
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
              className="apple-heading-xl font-semibold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Personal Knowledge
              <span className="block font-bold" style={{ WebkitTextStroke: '0 transparent' }}>Management</span>
            </motion.h1>

            <motion.p 
              className="apple-subtitle mb-12 max-w-2xl mx-auto"
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
                className="apple-button-primary"
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

        {/* Feature Cards */}
        <motion.section 
          className="grid md:grid-cols-3 gap-8 md:gap-10 mb-28 pt-14 border-t apple-divider"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="text-center apple-card p-6 md:p-7 apple-elevated">
            <h3 className="text-sm font-semibold mb-2 tracking-wide" style={{ color: 'var(--apple-text)' }}>
              Smart Folders
            </h3>
            <p className="text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
              자동으로 분류되는 스마트 폴더링
            </p>
          </div>
          <div className="text-center apple-card p-6 md:p-7 apple-elevated">
            <h3 className="text-sm font-semibold mb-2 tracking-wide" style={{ color: 'var(--apple-text)' }}>
              Share Place
            </h3>
            <p className="text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
              다른 사용자와 정보 공유
            </p>
          </div>
          <div className="text-center apple-card p-6 md:p-7 apple-elevated">
            <h3 className="text-sm font-semibold mb-2 tracking-wide" style={{ color: 'var(--apple-text)' }}>
              Quick Save
            </h3>
            <p className="text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
              즉시 저장 가능한 입력창
            </p>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          className="text-center pb-16 pt-24 border-t apple-divider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <div className="flex items-center justify-center mb-5">
            <img 
              src="/koouk-logo.svg" 
              alt="KOOUK" 
              className="h-5 w-auto opacity-70"
            />
          </div>
          <p className="text-xs tracking-wide" style={{ color: 'var(--apple-text-secondary)' }}>
            © 2024 Personal Knowledge Management
          </p>
        </motion.footer>
      </main>
    </div>
  )
}