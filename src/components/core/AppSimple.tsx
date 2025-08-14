'use client'

import { useOptimisticAuth } from '@/hooks/useOptimisticAuth'

export default function AppSimple() {
  console.log('🎬 AppSimple rendering...')
  
  try {
    const { user, loading, isOptimistic, signIn, signOut } = useOptimisticAuth()
    
    console.log('🎬 Netflix Auth State:', { user: !!user, loading, isOptimistic, email: user?.email })
    
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">🎬 Netflix Style Test</h1>
          <div className="space-y-2 text-sm">
            <div>User: {user ? user.email : 'Not logged in'}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Optimistic: {isOptimistic ? '⚡ Yes' : 'No'}</div>
          </div>
          
          {!user && (
            <button
              onClick={signIn}
              className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Login with Google
            </button>
          )}
          
          {user && (
            <button
              onClick={signOut}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('🎬 AppSimple error:', error)
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">🎬 Netflix Auth Error</h1>
          <pre className="text-xs bg-white p-4 rounded border">
            {error?.toString()}
          </pre>
        </div>
      </div>
    )
  }
}