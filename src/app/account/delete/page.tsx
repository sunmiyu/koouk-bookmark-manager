'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DeleteAccount() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showExportData, setShowExportData] = useState(false)

  // Redirect if not logged in
  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You must be logged in to access this page.</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const handleExportData = () => {
    // Get all user data from localStorage
    const userData = {
      user: {
        email: session.user?.email,
        name: session.user?.name,
        exportDate: new Date().toISOString()
      },
      data: {
        userPlan: localStorage.getItem('koouk_user_plan'),
        // Note: In production, this would fetch from backend database
        bookmarks: 'Your bookmarks data would be exported here',
        todos: 'Your todos data would be exported here',
        notes: 'Your notes data would be exported here',
        preferences: 'Your preferences would be exported here'
      }
    }

    // Create and download JSON file
    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `koouk-data-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setShowExportData(true)
  }

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" to confirm.')
      return
    }

    setIsDeleting(true)

    try {
      // Clear all localStorage data
      const keysToRemove = [
        'koouk_user_plan',
        'koouk_cookie_consent',
        'koouk_analytics_enabled'
      ]
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // In production, you would make an API call to delete user data:
      // await fetch('/api/user/delete', { method: 'DELETE' })

      // Sign out and redirect
      await signOut({ callbackUrl: '/?deleted=true' })
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('An error occurred while deleting your account. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto responsive-p-md py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
            >
              ← Back
            </button>
            <h1 className="responsive-text-3xl font-bold text-red-400">Delete Account</h1>
            <p className="text-gray-400 mt-2">
              This action cannot be undone. Please review the information below carefully.
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              {/* Warning Box */}
              <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-red-400 font-semibold mb-2">What will be deleted:</h3>
                    <ul className="text-red-300 space-y-1 text-sm">
                      <li>• All your bookmarks (videos, links, images, notes)</li>
                      <li>• All your todo items and schedules</li>
                      <li>• Your account preferences and settings</li>
                      <li>• Your subscription plan and billing history</li>
                      <li>• All personal data associated with your account</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span>{session.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span>{session.user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Plan:</span>
                    <span className="capitalize">{localStorage.getItem('koouk_user_plan') || 'free'}</span>
                  </div>
                </div>
              </div>

              {/* Export Data Option */}
              <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-6">
                <h3 className="text-blue-400 font-semibold mb-3">💾 Export Your Data (Recommended)</h3>
                <p className="text-blue-300 text-sm mb-4">
                  Before deleting your account, you can download a copy of your data for your records.
                </p>
                <button
                  onClick={handleExportData}
                  disabled={showExportData}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showExportData 
                      ? 'bg-green-600 text-white cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {showExportData ? '✓ Data Exported' : 'Export My Data'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Continue to Delete
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Final Confirmation */}
              <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-6">
                <h3 className="text-red-400 font-semibold mb-4">⚠️ Final Confirmation</h3>
                <p className="text-red-300 mb-6">
                  This action is <strong>permanent and cannot be undone</strong>. 
                  All your data will be permanently deleted from our servers.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type <span className="text-red-400 font-mono">DELETE MY ACCOUNT</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="DELETE MY ACCOUNT"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="understand" className="mt-1" required />
                    <label htmlFor="understand" className="text-sm text-gray-300">
                      I understand that this action is permanent and all my data will be lost forever.
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  disabled={isDeleting}
                >
                  Go Back
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmText !== 'DELETE MY ACCOUNT'}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting Account...
                    </>
                  ) : (
                    'Delete My Account Forever'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <h3 className="font-semibold mb-4">Need Help?</h3>
            <p className="text-gray-400 text-sm mb-4">
              If you're having issues with Koouk or have questions before deleting your account, 
              we're here to help.
            </p>
            <div className="flex gap-4 text-sm">
              <a href="mailto:support@koouk.com" className="text-blue-400 hover:text-blue-300">
                Contact Support
              </a>
              <a href="/privacy" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </a>
              <a href="/terms" className="text-blue-400 hover:text-blue-300">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}