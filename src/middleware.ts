import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // CORS 헤더 설정
  const response = NextResponse.next()
  
  // 허용할 도메인들
  const allowedOrigins = [
    'https://www.koouk.im',
    'https://koouk.im',
    'http://localhost:3000',
    'http://localhost:3001'
  ]
  
  const origin = request.headers.get('origin')
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  
  // 의심스러운 활동 감지
  const suspiciousPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'scanner'
  ]
  const isSuspicious = suspiciousPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  )
  
  // CORS 검증
  if (origin && !allowedOrigins.includes(origin)) {
    // 보안 이벤트 로깅 (서버 사이드에서는 직접 GA 호출 불가, 로그만)
    console.warn('🚨 CORS Blocked:', {
      origin,
      endpoint: request.nextUrl.pathname,
      userAgent,
      ip,
      timestamp: new Date().toISOString()
    })
    
    return new Response('CORS policy violation', { 
      status: 403,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  
  // 의심스러운 활동 로깅
  if (isSuspicious) {
    console.warn('⚠️ Suspicious Activity:', {
      userAgent,
      endpoint: request.nextUrl.pathname,
      ip,
      origin,
      timestamp: new Date().toISOString()
    })
  }
  
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