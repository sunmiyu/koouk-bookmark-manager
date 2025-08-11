'use client'

import Link from 'next/link'

export default function GlobalError({
  error, // eslint-disable-line @typescript-eslint/no-unused-vars
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --background: #ffffff;
              --text-primary: #18181b;
              --text-secondary: #71717a;
              --accent: #18181b;
              --accent-hover: #27272a;
              --accent-foreground: #ffffff;
            }
            @media (prefers-color-scheme: dark) {
              :root {
                --background: #09090b;
                --text-primary: #fafafa;
                --text-secondary: #a1a1aa;
                --accent: #fafafa;
                --accent-hover: #f4f4f5;
                --accent-foreground: #09090b;
              }
            }
            .btn-primary {
              background: var(--accent);
              color: var(--accent-foreground);
              border: 1px solid var(--accent);
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              font-weight: 500;
              transition: all 0.15s ease;
              text-decoration: none;
              display: inline-block;
            }
            .btn-primary:hover {
              background: var(--accent-hover);
              transform: translateY(-1px);
            }
            .btn-secondary {
              background: transparent;
              color: var(--text-primary);
              border: 1px solid var(--text-secondary);
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              font-weight: 500;
              transition: all 0.15s ease;
              text-decoration: none;
              display: inline-block;
            }
          `
        }} />
      </head>
      <body style={{ 
        margin: 0, 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: 'var(--background)',
        color: 'var(--text-primary)'
      }}>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem',
                color: 'var(--text-primary)'
              }}>
                오류 발생
              </h2>
              <p style={{ 
                marginBottom: '2rem',
                color: 'var(--text-secondary)',
                fontSize: '1.125rem'
              }}>
                페이지를 렌더링하는 중 오류가 발생했습니다.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => reset()}
                className="btn-primary"
              >
                다시 시도
              </button>
              <Link
                href="/"
                className="btn-secondary"
              >
                홈으로 이동
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}