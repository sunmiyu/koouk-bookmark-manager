'use client'

import Link from 'next/link'

export default function GlobalError({
  error, // eslint-disable-line @typescript-eslint/no-unused-vars
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-gray-400 mb-8">
              An error occurred while rendering this page.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => reset()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Try again
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}