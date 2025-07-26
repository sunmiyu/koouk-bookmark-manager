import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // CORS 헤더 설정
  const response = NextResponse.next()
  
  // 허용할 도메인들
  const allowedOrigins = [
    'https://koouk.vercel.app',
    'https://koouk-clone.vercel.app', 
    'http://localhost:3000',
    'http://localhost:3001'
  ]
  
  const origin = request.headers.get('origin')
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  // Preflight 요청 처리
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers })
  }
  
  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}