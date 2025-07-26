// Redis 없이 메모리 기반 간단한 Rate Limiting
class SimpleRateLimit {
  private requests: Map<string, number[]> = new Map()
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    // 기존 요청 기록 가져오기
    let userRequests = this.requests.get(identifier) || []
    
    // 윈도우 밖의 오래된 요청들 제거
    userRequests = userRequests.filter(time => time > windowStart)
    
    // 제한 확인
    if (userRequests.length >= this.maxRequests) {
      return false
    }
    
    // 새 요청 기록
    userRequests.push(now)
    this.requests.set(identifier, userRequests)
    
    return true
  }
  
  getRemaining(identifier: string): number {
    const now = Date.now()
    const windowStart = now - this.windowMs
    const userRequests = this.requests.get(identifier) || []
    const validRequests = userRequests.filter(time => time > windowStart)
    
    return Math.max(0, this.maxRequests - validRequests.length)
  }
  
  // 메모리 정리 (주기적으로 호출)
  cleanup(): void {
    const now = Date.now()
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => time > now - this.windowMs)
      if (validRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validRequests)
      }
    }
  }
}

// 글로벌 Rate Limiter 인스턴스들
export const rateLimiters = {
  // 1시간에 100회
  global: new SimpleRateLimit(100, 60 * 60 * 1000),
  
  // 1분에 10회 (민감한 작업)
  sensitive: new SimpleRateLimit(10, 60 * 1000),
  
  // 1분에 30회 (검색)
  search: new SimpleRateLimit(30, 60 * 1000),
}

// 5분마다 메모리 정리
setInterval(() => {
  Object.values(rateLimiters).forEach(limiter => limiter.cleanup())
}, 5 * 60 * 1000)