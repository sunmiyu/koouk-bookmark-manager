import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Set CORS headers
  const response = NextResponse.next()
  
  // Allowed domains
  const allowedOrigins = [
    'https://www.koouk.im',
    'https://koouk.im',
    'http://localhost:3000',
    'http://localhost:3001'
  ]
  
  const origin = request.headers.get('origin')
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  
  // Detect suspicious activity
  const suspiciousPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'scanner'
  ]
  const isSuspicious = suspiciousPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  )
  
  // CORS validation
  if (origin && !allowedOrigins.includes(origin)) {
    // Security event logging (server-side cannot call GA directly, log only)
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
  
  // Log suspicious activity
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
  
  // Handle preflight requests
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