# 🎨 KOOUK Design Philosophy

## Core Principle: "직관적 단순함" with Designer Mindset

### 핵심 철학
- **Notion은 어렵다** → **Koouk은 직관적이어서 배울 필요 없다**
- **복잡한 기능** → **명확하고 간단한 기능**
- **판단 기준**: "처음 보는 사람이 3초 안에 이해할 수 있는가?"

### Main Value: "easy easy super easy"
- Notion은 템플릿이 다양하지만 배우는데 오래 걸림
- 많이 쓰는 템플릿 기준으로 한눈에 보이고 직관적으로 사용 가능

---

## Design Mindset Philosophy

### 🚫 보수적 접근 방식 (지양)
- 기존 코드를 건드리기 두려워함
- 작은 변경만 시도
- "안전한" 수정에만 집중
- 일관성보다 안정성 우선

### ✅ 디자이너 마인드 (지향)
- **전체 통일감이 최우선**
- **과감한 디자인 결정**으로 일관성 확보
- **사용자 경험** 중심의 자유로운 개선
- **언제든 바꿀 수 있다**는 마음으로 과감하게!

---

## 감성적 디자인 가이드라인

### 모바일 우선 색상 시스템

#### 기본 색상 팔레트
- **주요 배경**: 순수한 흰색 (#FFFFFF) - 깔끔하고 직관적
- **보조 배경**: 밝은 회색 (#F9FAFB, #F3F4F6) - 구분감 제공
- **테두리**: 연한 회색 (#E5E7EB, #D1D5DB) - 미묘한 경계선
- **텍스트 기본**: 진한 검정 (#000000) - 선택된 상태, 중요한 제목
- **텍스트 보조**: 부드러운 회색 (#374151, #6B7280) - 일반 텍스트
- **텍스트 비활성**: 연한 회색 (#9CA3AF) - 보조 정보

#### 인터랙티브 요소
- **선택/활성 상태**: 검정색 배경 + 흰색 텍스트 (`bg-black text-white`)
- **호버 상태**: 연한 회색 배경 (`hover:bg-gray-50`, `hover:bg-gray-100`)
- **드롭다운**: 흰색 배경 + 그림자 (`bg-white shadow-lg`)
- **카드**: 흰색 배경 + 미묘한 테두리 (`bg-white border border-gray-200`)

#### 그라데이션 효과
- **카드/이미지 영역**: `bg-gradient-to-br from-gray-50 to-gray-100`
- **웰컴 섹션**: `bg-gradient-to-r from-white/90 to-amber-50/90`

### 시각적 부드러움
- 모든 모서리: border-radius 12px 이상 (둥글고 부드럽게)
- 그림자: 부드럽고 자연스러운 box-shadow (harsh하지 않게)
- 그라디언트: 미묘한 그라디언트 배경 적용

### 공간감과 여백
- 넉넉한 패딩과 마진 (여유로운 공간감)
- 카드 간 충분한 간격
- 텍스트 줄 간격: line-height 1.6 이상

### 인터랙션 애니메이션
- 호버 시 부드러운 scale 효과 (transform: scale(1.02))
- transition duration: 300ms 이상
- easing: ease-out 사용

### 참고 디자인 스타일
- Airbnb, Notion, Linear의 부드러운 UI
- Material Design 3의 자연스러운 곡선
- Apple HIG의 여백감
- Saint Laurent 같이 절제된 무채색 아름다움

**목표: 차분하고 따뜻하며 편안한 느낌의 "감성있는" UI**

---

## Design System Priorities

### 1. Visual Consistency (시각적 일관성)
- 색상 시스템 통일
- 타이포그래피 체계화
- 간격/여백 표준화
- 컴포넌트 스타일 통일

### 2. User Experience (사용자 경험)
- Less is More 원칙
- Progressive Disclosure
- Natural Navigation Flow
- Responsive & Mobile-First

### 3. Design Decisions (디자인 결정)
- **통일감** > 개별 컴포넌트 완성도
- **전체 플로우** > 부분 최적화  
- **사용자 관점** > 기술적 제약
- **디자인 시스템** > 임시방편

---

## Personal Storage Hub 전용 레이아웃 가이드라인

### 중앙 정렬 레이아웃
1. **모든 컨텐츠는 화면 중앙 정렬**
   - 스크린 확장/축소 시에도 항상 가운데 유지
   - `max-width` + `margin: 0 auto` 구조 사용
   - 왼쪽 정렬 방식 지양

### 반응형 디자인 원칙
2. **완전 반응형 대응**
   - 모든 스크린 사이즈에 최적화
   - **모바일 최소 기준**: 320px (iPhone SE 기준)
   - 모바일-first 접근법 적용

### 미니멀 보더 철학
3. **테두리 최소화**
   - 가급적 테두리(border) 사용 금지
   - 구분이 필요한 경우: 그림자, 배경색 차이, 여백으로 대체
   - 부드러운 시각적 구분선 선호

### 여백 시스템
4. **균등한 좌우 여백**
   - **모바일**: 최소 16px (1rem) 좌우 여백
   - **PC**: 최소 24px (1.5rem) 좌우 여백
   - 화면 끝까지 붙지 않도록 항상 여유 공간 확보

### 스크롤바 숨김
5. **스크롤바 비가시화**
   - 모든 스크롤 영역에서 스크롤바 숨김
   - 기능은 유지하되 시각적으로 제거
   - `.scrollbar-hide` 클래스 활용

### 텍스트 크기 표준
6. **카카오톡 기반 모바일 텍스트 사이즈**
   - **모바일 기준**: 카카오톡 앱의 텍스트 크기 체계 준용
   - **기본 본문**: 16px (카카오톡 채팅 텍스트 크기)
   - **작은 텍스트**: 14px (카카오톡 시간 표시)
   - **큰 제목**: 18px (카카오톡 상단 제목)
   - **버튼 텍스트**: 16px (카카오톡 버튼 크기)
   - iOS 줌 방지를 위한 최소 16px 준수

---

## 현대 웹 디자인 트렌드 자동 적용

### 모바일 UX
- 오버레이는 반투명 배경 (rgba)
- 터치 영역 최소 44px
- 스와이프 제스처 지원
- 안전 영역(safe area) 고려

### 현대적 시각 효과
- 적절한 그림자 (box-shadow)
- 부드러운 애니메이션 (transition)
- 둥근 모서리 (border-radius)
- 호버 효과

### 색상 & 타이포그래피
- 충분한 대비율 (WCAG 기준)
- 계층적 텍스트 크기
- 적절한 줄 간격
- 브랜드 색상 일관성

### 레이아웃 & 간격
- 8px 그리드 시스템
- 적절한 패딩과 마진
- 반응형 간격 조정
- 컨텐츠 최대 너비 제한

### 인터랙션
- 로딩 상태 표시
- 피드백 애니메이션
- 에러 상태 디자인
- 빈 상태 (empty state) 디자인

---

## 개발 효율성 원칙

### 라이브러리 적극 활용
7. **효율성 우선의 라이브러리 선택**
   - 직접 구현 vs 검증된 라이브러리 사용 시 **라이브러리를 적극 선택**
   - 개발 속도와 안정성을 위해 최적의 도구 활용
   - 예시: 드래그앤드롭 → `@dnd-kit/core`, 애니메이션 → `framer-motion`, 아이콘 → `lucide-react`
   - "바퀴를 다시 발명하지 말자" - 검증된 솔루션 우선 채택

---

## Implementation Guidelines

### When Making Changes:
1. **전체적 관점**에서 접근
2. **디자인 시스템** 차원에서 고민
3. **사용자 여정**을 고려한 결정
4. **일관성**을 위한 과감한 변경

### Don't Be Afraid To:
- 컴포넌트 구조 대폭 수정
- 스타일 시스템 전면 개편
- 레이아웃 완전 재구성
- 기존 패턴 과감히 변경

### CSS 구현 예시
```css
/* 중앙 정렬 컨테이너 */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem; /* PC 여백 */
}

/* 모바일 여백 */
@media (max-width: 768px) {
  .main-container {
    padding: 0 1rem; /* 모바일 여백 */
  }
}

/* 테두리 대신 그림자 */
.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  /* border: none; */
}

/* 스크롤바 숨김 */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 카카오톡 기반 텍스트 사이즈 */
@media (max-width: 768px) {
  .text-base { font-size: 16px; }     /* 기본 본문 */
  .text-sm { font-size: 14px; }       /* 작은 텍스트 */
  .text-lg { font-size: 18px; }       /* 큰 제목 */
  .btn-text { font-size: 16px; }      /* 버튼 텍스트 */
  
  /* iOS 줌 방지 */
  input, textarea, button {
    font-size: 16px !important;
  }
}
```

---

## Remember

> "모든 코드는 언제든 수정할 수 있다. 
> 하지만 좋은 사용자 경험은 한번에 만들어져야 한다."

**전체 목표: "당연히 이렇게 해야 하는" 현대적이고 감성있는 디자인을 자동 적용**

**항상 이 철학을 기억하고 디자이너의 눈으로 접근하세요! 🎨✨**