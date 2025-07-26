import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getIP } from '@/lib/rateLimit'

export async function GET(request: NextRequest) {
  try {
    // IP 기반 Rate Limiting
    const ip = getIP(request)
    const rateLimitResult = await checkRateLimit('global', ip)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
          }
        }
      )
    }
    
    // 성공 응답
    return NextResponse.json({
      message: 'API call successful!',
      ip,
      remaining: rateLimitResult.remaining,
      limit: rateLimitResult.limit,
      timestamp: new Date().toISOString(),
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST 요청에 대해서는 더 엄격한 제한
export async function POST(request: NextRequest) {
  try {
    const ip = getIP(request)
    
    // 민감한 작업에 더 엄격한 제한 적용
    const rateLimitResult = await checkRateLimit('sensitive', ip)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded for POST requests',
          message: 'Too many POST requests. Please wait before trying again.',
        },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    
    return NextResponse.json({
      message: 'POST request successful!',
      data: body,
      remaining: rateLimitResult.remaining,
    })
    
  } catch (error) {
    console.error('POST API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}