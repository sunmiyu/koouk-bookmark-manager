import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters } from '@/lib/simpleRateLimit'

export async function GET(request: NextRequest) {
  // IP 주소 가져오기
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  
  // Rate Limit 체크
  if (!rateLimiters.global.isAllowed(ip)) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        remaining: rateLimiters.global.getRemaining(ip)
      },
      { status: 429 }
    )
  }
  
  // 성공 응답
  return NextResponse.json({
    message: 'Simple rate limiting works!',
    ip,
    remaining: rateLimiters.global.getRemaining(ip),
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  
  // 민감한 작업에 더 엄격한 제한
  if (!rateLimiters.sensitive.isAllowed(ip)) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded for sensitive operations',
        remaining: rateLimiters.sensitive.getRemaining(ip)
      },
      { status: 429 }
    )
  }
  
  const body = await request.json()
  
  return NextResponse.json({
    message: 'POST request with simple rate limiting works!',
    data: body,
    remaining: rateLimiters.sensitive.getRemaining(ip),
  })
}