/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 클래스 기반 다크모드 활성화
  
  // 컨텐츠 경로 최적화 - 더 정확한 경로 지정
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts}',
    './src/types/**/*.ts',
  ],
  
  // 사용하지 않는 클래스 제거 최적화
  safelist: [
    // 동적으로 생성되는 클래스들만 보호
    'animate-spin',
    'animate-pulse',
    'animate-bounce',
    // 색상 클래스 보호 (동적 색상 생성용)
    {
      pattern: /bg-(red|green|blue|yellow|purple|pink|indigo|gray)-(100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus'],
    },
    {
      pattern: /text-(red|green|blue|yellow|purple|pink|indigo|gray)-(100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus'],
    }
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      colors: {
        // 라이트모드 색상
        light: {
          bg: '#ffffff',
          surface: '#f8f9fa',
          text: '#1a1a1a',
          textSecondary: '#6b7280',
          border: '#e5e7eb'
        },
        // 다크모드 색상 (기존 유지)
        dark: {
          bg: '#000000',
          surface: '#111111', 
          text: '#ffffff',
          textSecondary: '#9ca3af',
          border: '#333333'
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  
  // 성능 최적화 플러그인 및 설정
  plugins: [],
  
  
  // 개발/프로덕션 최적화
  future: {
    hoverOnlyWhenSupported: true, // hover 지원 시에만 활성화
  },
  
  // 빌드 크기 최적화
  corePlugins: {
    // 사용하지 않는 코어 플러그인 비활성화
    preflight: true,
    container: false, // container 클래스 사용 안 함
    accessibility: true,
    pointerEvents: true,
    visibility: true,
  }
}