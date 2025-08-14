import { NextRequest, NextResponse } from 'next/server'

// Simple memory-based rate limiting for middleware
const requests = new Map<string, { count: number; resetTime: number }>()

function rateLimit(identifier: string, maxRequests = 100, windowMs = 60000) {
  const now = Date.now()
  const requestInfo = requests.get(identifier)

  if (!requestInfo || now > requestInfo.resetTime) {
    requests.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxRequests - 1 }
  }

  if (requestInfo.count >= maxRequests) {
    return { success: false, remaining: 0 }
  }

  requestInfo.count++
  requests.set(identifier, requestInfo)
  return { success: true, remaining: maxRequests - requestInfo.count }
}

export async function middleware(request: NextRequest) {
  // Environment-specific security checks
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Rate limiting for production
  if (isProduction && request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       request.ip || 
                       'anonymous'
    
    try {
      const { success, remaining } = rateLimit(identifier, 100, 60000)
      
      if (!success) {
        return new NextResponse(JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.'
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': remaining.toString(),
          }
        })
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Continue without rate limiting if there's an error
    }
  }
  
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