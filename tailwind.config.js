/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 클래스 기반 다크모드 활성화
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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
  plugins: [],
}