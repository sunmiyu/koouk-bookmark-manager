import Link from 'next/link'

export default function KooukLogo() {
  return (
    <Link href="/" className="flex items-center h-full hover:opacity-80 transition-opacity cursor-pointer">
      {/* Simple KOOUK text logo */}
      <div className="text-2xl font-bold tracking-wider" style={{ 
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        color: 'var(--color-text-primary)'
      }}>
        KOOUK
      </div>
    </Link>
  )
}