import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-6xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>404</h2>
          <h1 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            페이지를 찾을 수 없습니다
          </h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
        </div>
        
        <Link 
          href="/" 
          className="btn-primary inline-block"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}