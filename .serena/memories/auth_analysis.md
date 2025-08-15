# 인증 시스템 분석 및 문제점

## 현재 인증 구조
1. **AuthContext.tsx**: 기본 인증 컨텍스트 (163-272줄 로직)
2. **useOptimisticAuth.ts**: Netflix 스타일 낙관적 인증 훅
3. **auth/callback/page.tsx**: OAuth 콜백 처리 페이지

## 발견된 주요 문제

### 1. Gmail 로그인 Callback 문제
- **문제**: 로그인 후 callback이 정상적으로 동작하지 않음
- **원인**: 
  - 두 개의 다른 인증 시스템 (AuthContext vs useOptimisticAuth) 병존
  - redirectTo URL 설정이 일관되지 않음
  - Callback 페이지에서 복잡한 인증 처리 로직

### 2. 인증 성능 문제
- **문제**: 로그인 프로세스가 오래 걸림
- **원인**:
  - AuthContext.tsx:77에서 2초 setTimeout으로 데이터 마이그레이션
  - AuthContext.tsx:122에서 100ms setTimeout으로 사용자 데이터 로드
  - useOptimisticAuth.ts:310에서 100ms setTimeout으로 상태 검증
  - 중복된 사용자 데이터 로딩 로직

## 코드 위치
- 인증 로직: `src/components/auth/AuthContext.tsx:26-272`
- 낙관적 인증: `src/hooks/useOptimisticAuth.ts:90-366`  
- Callback 처리: `src/app/auth/callback/page.tsx:6-143`
- Supabase 설정: `src/lib/supabase.ts:13-33`