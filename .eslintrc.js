module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // PWA와 에러 핸들링에서 필요한 any 타입 허용
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    
    // 접근성 관련 경고를 경고로 변경 (에러가 아닌)
    'jsx-a11y/alt-text': 'warn',
    
    // React Hook 의존성 배열 검사
    'react-hooks/exhaustive-deps': 'warn'
  }
}