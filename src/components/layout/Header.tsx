'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'

export default function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image 
                src="/koouk-logo.svg" 
                alt="KOOUK" 
                width={100}
                height={24}
                className="h-6 w-auto"
              />
            </Link>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <MessageCircle size={20} />
              </button>

              {user ? (
                <div className="flex items-center space-x-3">
                  {user.user_metadata?.avatar_url ? (
                    <Image 
                      src={user.user_metadata.avatar_url} 
                      alt="Profile" 
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={signOut}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                  Sign in with Google
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}