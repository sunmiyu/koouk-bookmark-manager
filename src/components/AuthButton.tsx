'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="responsive-text-sm text-gray-400">
        로딩...
      </div>
    )
  }

  if (session) {
    return (
      <div className="text-right">
        <div className="responsive-text-sm text-white mb-1">
          {session.user?.name || 'User'}
        </div>
        <button
          onClick={() => signOut()}
          className="responsive-text-xs text-gray-400 hover:text-white transition-colors"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="text-right"
    >
      <div className="responsive-text-sm text-gray-400 hover:text-white transition-colors">
        Gmail로 로그인
      </div>
    </button>
  )
}