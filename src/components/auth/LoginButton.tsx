'use client'

import { useAuthCompat } from './AuthProvider'

export default function LoginButton() {
  const { signIn, loading } = useAuthCompat()

  return (
    <button
      onClick={signIn}
      disabled={loading}
      className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  )
}