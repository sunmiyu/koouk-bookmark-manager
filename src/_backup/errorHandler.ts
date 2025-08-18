/**
 * 통합 에러 핸들링 시스템
 * 사용자 친화적 에러 메시지와 로깅을 제공합니다.
 */

export interface ErrorInfo {
  error: Error
  context?: string
  userId?: string
  url?: string
  userAgent?: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface ErrorReport {
  id: string
  message: string
  stack?: string
  context?: string
  userId?: string
  metadata: Record<string, unknown>
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
}

class ErrorHandler {
  private static instance: ErrorHandler
  private errorQueue: ErrorReport[] = []
  private isOnline = true

  private constructor() {
    // 네트워크 상태 감지
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true
        this.flushErrorQueue()
      })
      
      window.addEventListener('offline', () => {
        this.isOnline = false
      })

      // 전역 에러 핸들러
      window.addEventListener('error', (event) => {
        this.handleError({
          error: event.error || new Error(event.message),
          context: `Global error at ${event.filename}:${event.lineno}:${event.colno}`,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          severity: 'medium'
        })
      })

      // Promise rejection 핸들러
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError({
          error: new Error(event.reason),
          context: 'Unhandled Promise Rejection',
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          severity: 'high'
        })
      })
    }
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * 에러를 처리하고 적절한 사용자 메시지를 반환합니다
   */
  handleError(errorInfo: ErrorInfo): string {
    const errorReport = this.createErrorReport(errorInfo)
    
    // 로컬 저장 (오프라인 대비)
    this.storeErrorLocally(errorReport)
    
    // 온라인이면 즉시 전송, 오프라인이면 큐에 저장
    if (this.isOnline) {
      this.sendErrorReport(errorReport)
    } else {
      this.errorQueue.push(errorReport)
    }

    // 콘솔 로깅 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', errorReport)
    }

    return this.getUserFriendlyMessage(errorInfo.error, errorInfo.context)
  }

  /**
   * Supabase 관련 에러 전용 핸들러
   */
  handleSupabaseError(error: unknown, context: string = 'Database operation'): string {
    const severity = this.getSupabaseErrorSeverity(error)
    
    const errorInfo: ErrorInfo = {
      error: error instanceof Error ? error : new Error(String(error)),
      context: `Supabase: ${context}`,
      timestamp: new Date().toISOString(),
      severity
    }

    return this.handleError(errorInfo)
  }

  /**
   * 네트워크 에러 전용 핸들러
   */
  handleNetworkError(error: unknown, context: string = 'Network request'): string {
    const errorInfo: ErrorInfo = {
      error: error instanceof Error ? error : new Error(String(error)),
      context: `Network: ${context}`,
      timestamp: new Date().toISOString(),
      severity: this.isOnline ? 'medium' : 'low' // 오프라인 상태면 심각도 낮춤
    }

    return this.handleError(errorInfo)
  }

  /**
   * PWA 관련 에러 핸들러
   */
  handlePWAError(error: unknown, context: string = 'PWA operation'): string {
    const errorInfo: ErrorInfo = {
      error: error instanceof Error ? error : new Error(String(error)),
      context: `PWA: ${context}`,
      timestamp: new Date().toISOString(),
      severity: 'low' // PWA 에러는 일반적으로 치명적이지 않음
    }

    return this.handleError(errorInfo)
  }

  private createErrorReport(errorInfo: ErrorInfo): ErrorReport {
    return {
      id: this.generateErrorId(),
      message: errorInfo.error.message,
      stack: errorInfo.error.stack,
      context: errorInfo.context,
      userId: errorInfo.userId,
      metadata: {
        url: errorInfo.url || (typeof window !== 'undefined' ? window.location.href : ''),
        userAgent: errorInfo.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
        timestamp: errorInfo.timestamp
      },
      timestamp: errorInfo.timestamp,
      severity: errorInfo.severity,
      resolved: false
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getUserFriendlyMessage(error: Error, context?: string): string {
    const message = error.message.toLowerCase()
    
    // Supabase 에러 메시지
    if (message.includes('not authenticated') || message.includes('jwt')) {
      return '로그인이 필요합니다. 다시 로그인해주세요.'
    }
    
    if (message.includes('permission denied') || message.includes('rls')) {
      return '접근 권한이 없습니다. 관리자에게 문의해주세요.'
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return '네트워크 연결을 확인해주세요. 잠시 후 다시 시도해보세요.'
    }
    
    if (message.includes('timeout')) {
      return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
    }
    
    // PWA 관련 에러
    if (context?.includes('PWA')) {
      return '앱 설치 중 문제가 발생했습니다. 브라우저를 새로고침 후 다시 시도해주세요.'
    }
    
    // 기본 메시지
    return '일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }

  private getSupabaseErrorSeverity(error: unknown): ErrorInfo['severity'] {
    const message = (error as Error)?.message?.toLowerCase() || ''
    
    if (message.includes('not authenticated') || message.includes('jwt')) {
      return 'medium'
    }
    
    if (message.includes('permission denied')) {
      return 'high'
    }
    
    if (message.includes('network') || message.includes('timeout')) {
      return 'low'
    }
    
    return 'medium'
  }

  private storeErrorLocally(errorReport: ErrorReport): void {
    try {
      if (typeof localStorage === 'undefined') return
      
      const storedErrors = localStorage.getItem('koouk_error_reports')
      const errors: ErrorReport[] = storedErrors ? JSON.parse(storedErrors) : []
      
      errors.push(errorReport)
      
      // 최대 50개까지만 저장
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50)
      }
      
      localStorage.setItem('koouk_error_reports', JSON.stringify(errors))
    } catch (error) {
      console.warn('Failed to store error locally:', error)
    }
  }

  private async sendErrorReport(errorReport: ErrorReport): Promise<void> {
    try {
      // Supabase에 에러 리포트 저장
      const response = await fetch('/api/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      })
      
      if (!response.ok) {
        throw new Error('Failed to send error report')
      }
    } catch (error) {
      console.warn('Failed to send error report:', error)
      // 전송 실패시 큐에 다시 추가
      this.errorQueue.push(errorReport)
    }
  }

  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return
    
    const errors = [...this.errorQueue]
    this.errorQueue = []
    
    for (const error of errors) {
      await this.sendErrorReport(error)
    }
  }

  /**
   * 수동으로 에러 큐 플러시
   */
  async syncErrors(): Promise<void> {
    await this.flushErrorQueue()
  }

  /**
   * 로컬에 저장된 에러 리포트 가져오기
   */
  getLocalErrorReports(): ErrorReport[] {
    try {
      if (typeof localStorage === 'undefined') return []
      
      const storedErrors = localStorage.getItem('koouk_error_reports')
      return storedErrors ? JSON.parse(storedErrors) : []
    } catch (error) {
      console.warn('Failed to get local error reports:', error)
      return []
    }
  }

  /**
   * 로컬 에러 리포트 삭제
   */
  clearLocalErrorReports(): void {
    try {
      if (typeof localStorage === 'undefined') return
      localStorage.removeItem('koouk_error_reports')
    } catch (error) {
      console.warn('Failed to clear local error reports:', error)
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const errorHandler = ErrorHandler.getInstance()

// 편의 함수들
export const handleError = (error: Error, context?: string, severity: ErrorInfo['severity'] = 'medium'): string => {
  return errorHandler.handleError({
    error,
    context,
    timestamp: new Date().toISOString(),
    severity
  })
}

export const handleSupabaseError = (error: unknown, context?: string): string => {
  return errorHandler.handleSupabaseError(error, context)
}

export const handleNetworkError = (error: unknown, context?: string): string => {
  return errorHandler.handleNetworkError(error, context)
}

export const handlePWAError = (error: unknown, context?: string): string => {
  return errorHandler.handlePWAError(error, context)
}