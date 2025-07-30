import Link from 'next/link'

export default function KooukLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 h-full hover:opacity-80 transition-opacity cursor-pointer">
      {/* Professional Logo Icon */}
      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      
      {/* Modern KOOUK text */}
      <div className="flex flex-col">
        <div className="text-3xl font-semibold text-white leading-none tracking-wide">
          Koouk
        </div>
      </div>
    </Link>
  )
}