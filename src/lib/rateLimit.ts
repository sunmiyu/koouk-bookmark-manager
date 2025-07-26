import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Redis 인스턴스 생성 (Upstash 무료 플랜)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Rate Limiter 생성
export const rateLimiters = {
  // API 전체 제한 (IP 기준)
  global: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'), // 시간당 100회
    analytics: true,
  }),
  
  // 민감한 작업 제한 (사용자 기준)
  sensitive: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 분당 10회
    analytics: true,
  }),
  
  // 검색 제한
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'), // 분당 30회
    analytics: true,
  }),
}

// 헬퍼 함수: IP 주소 가져오기
export function getIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// 헬퍼 함수: Rate Limit 체크
export async function checkRateLimit(
  type: keyof typeof rateLimiters,
  identifier: string
) {
  try {
    const result = await rateLimiters[type].limit(identifier)
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset),
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // 에러 시 통과 (서비스 중단 방지)
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: new Date(),
    }
  }
}