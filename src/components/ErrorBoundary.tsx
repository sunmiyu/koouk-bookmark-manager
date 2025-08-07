'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided, otherwise default error UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div 
          className="error-boundary-container"
          style={{
            padding: 'var(--space-6)',
            margin: 'var(--space-4)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-error)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center'
          }}
        >
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h2 style={{ 
              color: 'var(--text-error)',
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              marginBottom: 'var(--space-2)'
            }}>
              Something went wrong
            </h2>
            <p style={{ 
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-sm)',
              lineHeight: '1.5'
            }}>
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-primary)'
              }}
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: 'var(--bg-error)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              Refresh Page
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: 'var(--space-4)', textAlign: 'left' }}>
              <summary style={{ 
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                marginBottom: 'var(--space-2)'
              }}>
                Error Details (Development)
              </summary>
              <pre style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'monospace',
                overflow: 'auto',
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap'
              }}>
                {this.state.error.stack || this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Context-specific error boundary
export function ContextErrorBoundary({ 
  children, 
  contextName 
}: { 
  children: ReactNode
  contextName: string 
}) {
  return (
    <ErrorBoundary
      fallback={
        <div style={{
          padding: 'var(--space-4)',
          margin: 'var(--space-2)',
          backgroundColor: 'var(--bg-warning)',
          border: '1px solid var(--border-warning)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-warning)'
        }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>
            {contextName} context failed to load. Some features may not work properly.
          </p>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error(`${contextName} context error:`, error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}