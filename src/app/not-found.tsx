import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-6xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>404</h2>
          <h1 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Page Not Found
          </h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            The page you requested does not exist or has been moved.
          </p>
        </div>
        
        <Link 
          href="/" 
          className="btn-primary inline-block"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}