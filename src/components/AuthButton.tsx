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
      <div className="flex items-center gap-2">
        {/* 사용자 프로필 아바타 */}
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="text-right">
          <div className="responsive-text-sm text-white">
            {session.user?.name?.split(' ')[0] || 'User'}
          </div>
          <button
            onClick={() => signOut()}
            className="responsive-text-xs text-gray-400 hover:text-white transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="text-gray-400 hover:text-white transition-colors"
      title="Gmail로 로그인"
    >
      {/* 사람 아이콘만 */}
      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    </button>
  )
}