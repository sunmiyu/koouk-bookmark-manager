import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-6xl font-bold mb-4">404</h2>
        <h1 className="text-2xl font-bold mb-4">페이지를 찾을 수 없습니다</h1>
        <p className="text-gray-400 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-block"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}