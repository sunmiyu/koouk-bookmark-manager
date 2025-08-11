'use client'

import Link from 'next/link'
import { ArrowLeft, User, Shield, Bell, HelpCircle, FileText, LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/components/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LanguageToggle from '@/components/ui/LanguageToggle'

export default function Settings() {
  const t = useTranslations('settings')
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">{t('backToKoouk')}</span>
            </Link>
            <div className="h-4 w-px bg-gray-300" />
            <h1 className="text-lg font-semibold text-gray-900">{t('title')}</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="max-w-2xl">
          {/* User Profile Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('account')}</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-semibold">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {user?.email?.split('@')[0] || t('user')}
                  </h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                {t('editProfile')}
              </button>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Account & Security */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('accountSecurity')}</h3>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <User className="w-4 h-4" />
                  {t('profileInfo')}
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <Shield className="w-4 h-4" />
                  {t('passwordSecurity')}
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('preferences')}</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <Bell className="w-4 h-4" />
                  {t('notifications')}
                </button>
                
                {/* Language Settings */}
                <div className="px-4 py-3">
                  <LanguageToggle variant="full" position="settings" />
                </div>
              </div>
            </div>

            {/* Support & Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('supportLegal')}</h3>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <HelpCircle className="w-4 h-4" />
                  {t('helpCenter')}
                </button>
                <Link 
                  href="/privacy"
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <FileText className="w-4 h-4" />
                  {t('privacyPolicy')}
                </Link>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                {t('signOut')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}