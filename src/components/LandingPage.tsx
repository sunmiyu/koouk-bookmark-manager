'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToastActions } from '@/contexts/ToastContext'
import LoadingButton from '@/components/LoadingButton'
import KooukLogo from '@/components/KooukLogo'

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { success, error } = useToastActions()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || (!isLogin && !name)) return

    setIsSubmitting(true)
    
    try {
      if (isLogin) {
        // 로그인
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (authError) {
          error('Login Failed', authError.message, { duration: 5000 })
        } else if (data.user) {
          success(
            'Welcome back!',
            `Welcome to Koouk Dashboard, ${data.user.email?.split('@')[0]}`,
            { duration: 3000 }
          )
        }
      } else {
        // 회원가입
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        })
        
        if (authError) {
          error('Signup Failed', authError.message, { duration: 5000 })
        } else if (data.user) {
          success(
            'Account created successfully!',
            data.user.email_confirmed_at 
              ? `Welcome to Koouk Dashboard, ${name}!`
              : 'Please check your email to verify your account',
            { duration: 5000 }
          )
        }
      }
    } catch (err) {
      error(
        'Connection Error',
        'Unable to connect to our servers. Please check your internet connection.',
        { duration: 5000 }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      // 실제 Supabase 구글 OAuth 로그인
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (authError) {
        console.error('Google auth error:', authError)
        error(
          'Google Login Failed',
          authError.message,
          { duration: 5000 }
        )
      }
      // 성공시 리다이렉트가 자동으로 발생함
    } catch (err) {
      console.error('Google auth error:', err)
      error(
        'Connection Error',
        'Unable to connect to Google. Please try again.',
        { duration: 5000 }
      )
    }
  }

  const handleGitHubAuth = async () => {
    try {
      // 실제 Supabase GitHub OAuth 로그인
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (authError) {
        console.error('GitHub auth error:', authError)
        error(
          'GitHub Login Failed',
          authError.message,
          { duration: 5000 }
        )
      }
      // 성공시 리다이렉트가 자동으로 발생함
    } catch (err) {
      console.error('GitHub auth error:', err)
      error(
        'Connection Error',
        'Unable to connect to GitHub. Please try again.',
        { duration: 5000 }
      )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ 
      backgroundColor: 'var(--color-background)', 
      color: 'var(--color-text-primary)' 
    }}>
      <div className="w-full max-w-md">
        {/* Logo and Welcome */}
        <div className="text-center" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="flex justify-center" style={{ marginBottom: 'var(--space-xl)' }}>
            <KooukLogo />
          </div>
          <h1 style={{ 
            fontSize: 'var(--text-3xl)', 
            fontWeight: '700', 
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-sm)',
            letterSpacing: '-0.03em'
          }}>
            Welcome home
          </h1>
          <p style={{ 
            color: 'var(--color-text-secondary)', 
            fontSize: 'var(--text-lg)',
            lineHeight: '1.6',
            fontWeight: '400'
          }}>
            Your comfortable space for everything that matters
          </p>
        </div>

        {/* Auth Card */}
        <div style={{ 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-xl)', 
          padding: 'var(--space-2xl)' 
        }}>
          {/* Toggle Buttons */}
          <div className="flex" style={{ 
            background: 'var(--color-background)', 
            borderRadius: 'var(--radius-xl)', 
            padding: 'var(--space-xs)', 
            marginBottom: 'var(--space-xl)' 
          }}>
            <button
              onClick={() => setIsLogin(true)}
              className="flex-1 font-medium transition-all"
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                background: isLogin ? 'var(--color-accent)' : 'transparent',
                color: isLogin ? 'var(--color-background)' : 'var(--color-text-secondary)',
                fontWeight: isLogin ? '600' : '500',
                fontSize: 'var(--text-sm)',
                border: 'none'
              }}
            >
              Welcome back
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className="flex-1 font-medium transition-all"
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                background: !isLogin ? 'var(--color-accent)' : 'transparent',
                color: !isLogin ? 'var(--color-background)' : 'var(--color-text-secondary)',
                fontWeight: !isLogin ? '600' : '500',
                fontSize: 'var(--text-sm)',
                border: 'none'
              }}
            >
              Join us
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ gap: 'var(--space-lg)' }} className="space-y-4">
            {!isLogin && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: '500', 
                  color: 'var(--color-text-secondary)', 
                  marginBottom: 'var(--space-sm)' 
                }}>
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: 'var(--space-md)',
                    background: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)',
                    transition: 'all 0.2s ease'
                  }}
                  className="focus:border-accent focus:ring-accent"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: 'var(--text-sm)', 
                fontWeight: '500', 
                color: 'var(--color-text-secondary)', 
                marginBottom: 'var(--space-sm)' 
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: 'var(--space-md)',
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)',
                  transition: 'all 0.2s ease'
                }}
                className="focus:border-accent focus:ring-accent"
                required
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: 'var(--text-sm)', 
                fontWeight: '500', 
                color: 'var(--color-text-secondary)', 
                marginBottom: 'var(--space-sm)' 
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                style={{
                  width: '100%',
                  padding: 'var(--space-md)',
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)',
                  transition: 'all 0.2s ease'
                }}
                className="focus:border-accent focus:ring-accent"
                required
              />
            </div>

            <LoadingButton
              type="submit"
              loading={isSubmitting}
              variant="primary"
              size="lg"
              className="w-full mt-6"
              loadingText={isLogin ? "Signing in..." : "Creating account..."}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </LoadingButton>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800/50 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-medium transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleGitHubAuth}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 rounded-xl font-medium transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-gray-400">
            {isLogin ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Sign up for free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-3">
            What you&apos;ll get with Koouk
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm text-gray-400">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span>Organize your links, videos, and notes in one place</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span>Track daily tasks and stay productive</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                </svg>
              </div>
              <span>Get personalized news, weather, and insights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}