# 📁 KOOUK Project - Claude Working Manual

## 📋 **ESSENTIAL DOCUMENTATION**

### 📊 **Complete User Flow & System Connections**
**👉 READ FIRST**: [`CLAUDE-USERFLOW.md`](./CLAUDE-USERFLOW.md) - Comprehensive user flow report covering:
- 🔐 Authentication flow (login/logout with all connection pages)
- 🧭 Navigation & tab functions (Dashboard, My Folder, Marketplace, Bookmarks)
- 📁 Content management flows and data conversions
- 🔄 Folder sharing system (My Folder ↔ Marketplace)
- 📊 Content card type conversions and database schema connections
- 🛠️ Available tools in `_backup` folder (check here first!)

## 🚨 **CURRENT STATUS & URGENT PLAN**

### 📊 **현재 상황 (2025-08-18)**
- **문제**: 오랜 편집으로 코드 복잡도 증가, 중복 파일들, 불필요한 최적화로 인한 유지보수 어려움
- **해결**: All-New Version 개발 계획 수립 완료
- **방향**: 안정적인 DB 연결 유지하면서 깔끔한 새 버전 구축

### 🎯 **KOOUK All-New Version 개발 계획**

## **📁 새로운 폴더 구조 (핵심만 남기기)**

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 관련
│   │   ├── login/page.tsx        
│   │   └── callback/page.tsx     
│   ├── api/                      # API 엔드포인트 
│   │   ├── auth/                 # 인증 API
│   │   ├── folders/              # 폴더 관리
│   │   ├── items/                # 아이템 관리  
│   │   ├── meta/                 # 메타데이터 추출
│   │   └── external/             # 외부 API (YouTube, 뉴스)
│   ├── page.tsx                  # 메인 앱
│   ├── layout.tsx                # 루트 레이아웃
│   └── globals.css               # 전역 스타일
├── components/                   # UI 컴포넌트 
│   ├── auth/                     # 인증 관련
│   │   ├── AuthProvider.tsx      # 인증 컨텍스트
│   │   └── LoginButton.tsx       # 로그인 버튼
│   ├── layout/                   # 레이아웃
│   │   ├── Header.tsx            # 헤더
│   │   ├── Navigation.tsx        # 네비게이션
│   │   └── MobileNav.tsx         # 모바일 네비게이션
│   ├── pages/                    # 페이지별 컴포넌트
│   │   ├── Dashboard/            # 대시보드
│   │   ├── MyFolder/             # 내 폴더
│   │   ├── Marketplace/          # 마켓플레이스
│   │   └── Bookmarks/            # 북마크
│   └── ui/                       # 재사용 UI
│       ├── Button.tsx            # 버튼
│       ├── Modal.tsx             # 모달
│       ├── FolderCard.tsx        # 폴더 카드
│       └── ItemCard.tsx          # 아이템 카드
├── lib/                          # 핵심 라이브러리
│   ├── auth.ts                   # 안정적인 인증 관리
│   ├── database.ts               # DB 서비스 (안정성 중점)
│   ├── supabase.ts               # Supabase 클라이언트
│   └── api-client.ts             # API 호출 라이브러리
├── hooks/                        # 커스텀 훅
│   ├── useAuth.ts                # 인증 훅 (단순화)
│   ├── useFolders.ts             # 폴더 관리 훅
│   └── useItems.ts               # 아이템 관리 훅
├── types/                        # TypeScript 타입
│   ├── auth.ts                   # 인증 타입
│   ├── database.ts               # DB 타입
│   └── app.ts                    # 앱 타입
└── utils/                        # 유틸리티
    ├── constants.ts              # 상수
    ├── formatters.ts             # 포맷터
    └── validators.ts             # 유효성 검사
```

## **❌ 제거할 파일들 (불필요한 복잡성)**

```bash
# 사용하지 않는 페이지들
src/app/pricing/
src/app/privacy/  
src/app/account/
src/app/goodbye/
src/app/settings/

# 복잡한 최적화 코드들  
src/lib/fastAuth.ts                    # 너무 복잡
src/hooks/useOptimizedAuth.ts          # 과도한 최적화
src/components/analytics/              # 복잡한 분석
src/lib/search-engine.ts               # 과도한 검색엔진
src/utils/dataMigration.ts             # 불필요한 마이그레이션

# 중복/과도한 UI 컴포넌트들
src/components/core/AppSimple.tsx      # 중복
src/components/mobile/QuickAccessBar.tsx  # 복잡
src/components/ui/PWAInstallPrompt.tsx # 중복
src/components/ui/SearchInterface.tsx   # 과도한 검색 UI

# 복잡한 모달들 (단순화 필요)
src/components/ui/BigNoteModal.tsx     # 복잡
src/components/ui/EditSharedFolderModal.tsx  # 복잡
src/components/ui/ShareFolderModal.tsx # 복잡
```

## **✅ 핵심 유지할 파일들**

```bash
# 핵심 앱 구조
src/app/page.tsx                       # 메인 앱 (단순화)
src/app/layout.tsx                     # 루트 레이아웃
src/components/core/App.tsx            # 메인 앱 컴포넌트 (단순화)

# 인증 시스템 (단순화)  
src/components/auth/AuthContext.tsx    # 인증 컨텍스트 (단순화)
src/lib/supabase.ts                    # Supabase 클라이언트 (안정화)
src/lib/database.ts                    # DB 서비스 (안정화)

# 4개 핵심 페이지
src/components/dashboard/DashboardPage.tsx
src/components/workspace/MyFolderContent.tsx  
src/components/workspace/MarketPlace.tsx
src/components/workspace/Bookmarks.tsx

# 핵심 API
src/app/api/meta/route.ts              # 메타데이터 추출
src/app/api/youtube/route.ts           # YouTube API  
src/app/api/news/                      # 뉴스 API

# 핵심 타입 & 유틸
src/types/database.ts                  # DB 타입
src/types/folder.ts                    # 폴더 타입
src/utils/youtube.ts                   # YouTube 유틸
```

## **🛣️ 5단계 구현 로드맵** 

### **Phase 1: 🏗️ 기초 인프라 구축 (안정성 최우선)**

```bash
# 1.1 새 Next.js 프로젝트 생성
npx create-next-app@latest koouk-v2 --typescript --tailwind --app

# 1.2 핵심 의존성 설치 (검증된 버전만)
npm install @supabase/supabase-js
npm install lucide-react
npm install framer-motion

# 1.3 기본 폴더 구조 생성
mkdir -p src/{components/{auth,layout,pages,ui},lib,hooks,types,utils}
```

**우선순위 파일들:**
1. `src/lib/supabase.ts` - **안정적인** Supabase 연결
2. `src/components/auth/AuthProvider.tsx` - **단순한** 인증 컨텍스트  
3. `src/lib/database.ts` - **핵심** DB 서비스만
4. `src/app/layout.tsx` - 기본 레이아웃
5. `src/components/layout/Header.tsx` - 헤더 + 네비게이션

### **Phase 2: 🎯 핵심 기능 구현**

```bash
# 2.1 메인 탭 구조
src/components/pages/Dashboard/index.tsx
src/components/pages/MyFolder/index.tsx  
src/components/pages/Marketplace/index.tsx
src/components/pages/Bookmarks/index.tsx

# 2.2 기본 UI 컴포넌트
src/components/ui/Button.tsx
src/components/ui/Modal.tsx
src/components/ui/FolderCard.tsx
src/components/ui/ItemCard.tsx

# 2.3 데이터 관리 훅
src/hooks/useFolders.ts
src/hooks/useItems.ts
```

### **Phase 3: 🔌 외부 연동**

```bash
# 3.1 API 엔드포인트
src/app/api/meta/route.ts       # 메타데이터 추출 (기존 활용)
src/app/api/youtube/route.ts    # YouTube API (기존 활용) 
src/app/api/news/route.ts       # 뉴스 API (기존 활용)

# 3.2 유틸리티
src/utils/youtube.ts            # YouTube 헬퍼 (기존 활용)
src/utils/metadata.ts           # 메타데이터 헬퍼
```

### **Phase 4: ⚡ 고급 기능**

```bash
# 4.1 검색 (단순화)
src/components/ui/SearchBar.tsx
src/hooks/useSearch.ts

# 4.2 공유 기능 (단순화)
src/components/ui/ShareModal.tsx
src/app/api/share/route.ts

# 4.3 PWA (기본만)
public/manifest.json
src/components/layout/PWAHead.tsx
```

### **Phase 5: 🎨 폴리싱**

```bash
# 5.1 반응형 완성
src/components/layout/MobileNav.tsx
src/hooks/useDevice.ts

# 5.2 에러 처리
src/components/ui/ErrorBoundary.tsx
src/utils/errorHandler.ts

# 5.3 성능 최적화 (필요한 것만)
- React.memo 적용 
- 이미지 최적화
- 코드 스플리팅
```

## **🔧 새 프로젝트 핵심 원칙**

1. **🎯 단순성**: 복잡한 최적화 제거, 핵심 기능에 집중
2. **🛡️ 안정성**: 검증된 패턴 사용, 과도한 실험 금지  
3. **📱 반응형**: 모바일 퍼스트, 단순한 네비게이션
4. **🔒 보안**: 안정적인 인증, 검증된 Supabase 패턴
5. **⚡ 성능**: 필요한 최적화만, 과도한 캐싱 제거

## **🚀 구현 시작 방법**

**옵션 1: 즉시 시작** 
```bash
git checkout -b feature/koouk-v2-clean
# Phase 1부터 단계별 구현 시작
```

**옵션 2: 점진적 개선**
- 현재 프로젝트에서 불필요한 파일들부터 정리
- 한 탭씩 새로운 구조로 리팩토링

**옵션 3: 기존 자산 활용**
- DB, 환경변수, API 그대로 활용
- 핵심 파일들만 단순화해서 새 버전 구축

---

## 🎯 **KOOUK Project Goals & User Flow**

### 📋 프로젝트 개요
**미션**: "Notion은 어렵다 → Koouk은 직관적이어서 배울 필요 없다"

개인 정보 관리의 복잡함을 해결하고, 누구나 3초 안에 이해할 수 있는 직관적인 Personal Storage Hub 제공

### 🎯 핵심 가치
- **Easy Easy Super Easy**: 학습 곡선 제거, 즉시 사용 가능
- **Mobile-First**: 스마트폰 중심의 사용 패턴 최적화
- **직관적 단순함**: 복잡한 기능보다 명확하고 간단한 기능
- **감성적 디자인**: 차분하고 따뜻하며 편안한 느낌의 UI

---

## 📁 **4개 핵심 탭 기능 & 디자인 컨셉**

### 1. **🏠 Dashboard** - 개인 허브의 중심
#### 💡 디자인 컨셉: "나만의 디지털 서재"
- **레이아웃**: 격자형 카드 대시보드 (3×2 또는 2×3)
- **시각적 테마**: 따뜻한 아이보리와 차분한 베이지 톤
- **핵심 카드들**:
  - **📊 내 통계 카드**: 폴더 수, 아이템 수, 최근 활동 (숫자 강조)
  - **⚡ 빠른 액션**: "새 폴더 만들기", "링크 저장하기", "메모 작성" (큰 버튼)
  - **📈 활동 요약**: 주간/월간 추가한 콘텐츠, 방문 빈도 (차트형)
  - **🔖 최근 북마크**: 최근 저장한 링크 3개 (썸네일 + 제목)
  - **📁 인기 폴더**: 가장 많이 사용하는 폴더 TOP 3 (아이콘 + 이름)
  - **🎯 오늘의 목표**: 간단한 할 일이나 메모 (포스트잇 스타일)

#### 🎨 UI 스타일
- **카드 디자인**: 둥근 모서리(16px), 미묘한 그림자, 호버시 살짝 떠오름
- **색상**: 백그라운드 #FEFEFE, 카드 #FFFFFF, 텍스트 #2D3748
- **타이포그래피**: 대형 숫자는 bold, 설명 텍스트는 medium
- **애니메이션**: 카드 호버시 transform scale(1.02), 부드러운 transition

---

### 2. **📁 My Folder** - 개인 정보 관리의 중심
#### 💡 디자인 컨셉: "디지털 서랍장과 작업대"
- **레이아웃**: 좌측 폴더 트리 + 우측 콘텐츠 영역 (Desktop) / 전환형 (Mobile)
- **시각적 테마**: 깔끔한 화이트와 소프트 그레이 조합

#### 🌳 폴더 트리 영역 (좌측)
- **폴더 아이콘**: 📁 (닫힌 상태) → 📂 (열린 상태), 계층별 들여쓰기
- **인터랙션**: 
  - 폴더명 호버시 배경 연한 회색 (#F8F9FA)
  - 선택된 폴더는 파란색 배경 (#EBF8FF) + 좌측 파란 선
  - 우클릭으로 "이름 변경", "삭제", "공유" 메뉴
- **드래그 앤 드롭**: 드래그시 반투명 + 드롭 존 하이라이트

#### 📄 콘텐츠 영역 (우측)
- **뷰 모드**:
  - **그리드 뷰**: 2×2 또는 3×3 카드 형태 (기본)
  - **리스트 뷰**: 한 줄씩 나열 (제목 + 설명 + 메타정보)
- **콘텐츠 카드**:
  - **링크**: 파비콘 + 썸네일 + 제목 + 도메인명
  - **메모**: 📝 아이콘 + 첫 줄 미리보기 + 작성일
  - **이미지**: 썸네일 + 파일명 + 크기
  - **문서**: 📄 아이콘 + 파일명 + 확장자 표시

#### 🎨 UI 스타일
- **폴더 트리**: 배경 #FAFBFC, 테두리 #E2E8F0
- **콘텐츠 카드**: 배경 #FFFFFF, 테두리 #E2E8F0, 호버시 그림자 강화
- **빠른 추가 버튼**: 우하단 고정 원형 버튼 (+ 아이콘)

---

### 3. **🛍️ Marketplace** - 집단 지성의 보물창고
#### 💡 디자인 컨셉: "세련된 디지털 갤러리"
- **레이아웃**: 필터 바 + 무한 스크롤 그리드
- **시각적 테마**: 모던하고 트렌디한 느낌, 콘텐츠가 주인공

#### 🔍 상단 필터 영역
- **카테고리 태그**: 버블 형태의 선택 가능한 태그들
  - 선택됨: 검은 배경 + 흰 텍스트
  - 미선택: 흰 배경 + 회색 텍스트 + 회색 테두리
- **정렬 드롭다운**: "인기순 ⬇️", "최신순 ⬇️", "도움순 ⬇️"
- **검색바**: 우측 상단, 돋보기 아이콘 + placeholder

#### 📱 콘텐츠 그리드
- **카드 크기**: 정사각형 또는 3:4 비율
- **카드 구성**:
  - **상단**: 콘텐츠 썸네일 또는 대표 이미지
  - **중간**: 폴더명 (굵게) + 간단한 설명
  - **하단**: 작성자명 + 다운로드 수 + ❤️ 좋아요 수
- **호버 효과**: 카드 살짝 확대 + 그림자 진해짐

#### 🎯 소셜 기능
- **좋아요 버튼**: ❤️ 아이콘, 클릭시 빨간색으로 변화
- **다운로드 버튼**: ⬇️ 아이콘, 클릭시 "복사됨!" 토스트
- **제작자 프로필**: 아바타 + 이름, 클릭시 해당 유저의 다른 폴더들

#### 🎨 UI 스타일
- **배경**: 순수 흰색 (#FFFFFF)
- **카드**: 배경 #FFFFFF, 테두리 #E5E7EB, 그림자 subtle
- **액센트 컬러**: 좋아요 #EF4444, 다운로드 #10B981

---

### 4. **🔖 Bookmarks** - 웹에서 발견한 보물들
#### 💡 디자인 컨셉: "개인 북마크 컬렉션 박물관"
- **레이아웃**: 상단 카테고리 탭 + 하단 북마크 그리드
- **시각적 테마**: 아늑하고 정돈된 라이브러리 느낌

#### 📑 카테고리 탭 영역
- **탭 디자인**: 
  - 선택된 탭: 검은 배경 + 흰 텍스트 + 하단 검은 선
  - 미선택 탭: 투명 배경 + 회색 텍스트
- **카테고리**: All, Tech, Design, News, Entertainment, Education, etc.
- **자동 분류**: AI가 자동으로 카테고리 추천 (사용자가 확정)

#### 🌐 북마크 카드
- **카드 레이아웃**:
  - **썸네일**: 웹사이트 스크린샷 또는 대표 이미지
  - **파비콘**: 좌상단 작은 사이트 아이콘
  - **제목**: 굵은 글씨, 2줄 제한
  - **설명**: 연한 글씨, 1-2줄 미리보기
  - **URL**: 도메인명만 표시 (작은 글씨)
  - **저장일**: 우하단 작은 날짜

#### ⭐ 즐겨찾기 시스템
- **별 아이콘**: ⭐ 클릭으로 즐겨찾기 토글
- **즐겨찾기 필터**: 상단에 "⭐ 즐겨찾기만" 토글 버튼
- **최근 추가**: "📅 최근 추가된 북마크" 별도 섹션

#### 🎨 UI 스타일
- **배경**: 아이보리 화이트 (#FEFEFE)
- **카드**: 깔끔한 흰색 배경, 미묘한 그림자
- **썸네일**: 둥근 모서리(8px), aspect-ratio 16:10
- **호버 효과**: 카드 살짝 위로 이동 + 그림자 진해짐

---

### 📱 **공통 모바일 디자인 원칙**

#### 🔄 네비게이션
- **하단 탭바**: 4개 탭, 아이콘 + 텍스트 조합
- **스와이프 제스처**: 좌우 스와이프로 탭 전환
- **상단 헤더**: 로고 + 유저 프로필, 깔끔하고 미니멀

#### ✋ 터치 최적화
- **버튼 크기**: 최소 44px 높이 보장
- **여백**: 충분한 터치 영역과 여백
- **피드백**: 터치시 즉각적인 시각적 피드백

#### 🎯 일관성
- **카드 디자인**: 모든 탭에서 동일한 카드 스타일 기반
- **색상 시스템**: 동일한 색상 팔레트 사용
- **타이포그래피**: 일관된 글꼴 크기와 가중치

---

## 🎨 **Design Philosophy**

### Core Principle: "직관적 단순함" with Designer Mindset

#### 핵심 철학
- **Notion은 어렵다** → **Koouk은 직관적이어서 배울 필요 없다**
- **복잡한 기능** → **명확하고 간단한 기능**
- **판단 기준**: "처음 보는 사람이 3초 안에 이해할 수 있는가?"

#### ✅ 디자이너 마인드 (지향)
- **전체 통일감이 최우선**
- **과감한 디자인 결정**으로 일관성 확보
- **사용자 경험** 중심의 자유로운 개선
- **언제든 바꿀 수 있다**는 마음으로 과감하게!

### 감성적 디자인 가이드라인

#### 기본 색상 팔레트
- **주요 배경**: 순수한 흰색 (#FFFFFF) - 깔끔하고 직관적
- **보조 배경**: 밝은 회색 (#F9FAFB, #F3F4F6) - 구분감 제공
- **테두리**: 연한 회색 (#E5E7EB, #D1D5DB) - 미묘한 경계선
- **텍스트 기본**: 진한 검정 (#000000) - 선택된 상태, 중요한 제목
- **텍스트 보조**: 부드러운 회색 (#374151, #6B7280) - 일반 텍스트

#### 인터랙티브 요소
- **선택/활성 상태**: 검정색 배경 + 흰색 텍스트 (`bg-black text-white`)
- **호버 상태**: 연한 회색 배경 (`hover:bg-gray-50`, `hover:bg-gray-100`)
- **카드**: 흰색 배경 + 미묘한 테두리 (`bg-white border border-gray-200`)

#### 시각적 부드러움
- 모든 모서리: border-radius 12px 이상 (둥글고 부드럽게)
- 그림자: 부드럽고 자연스러운 box-shadow
- 그라디언트: 미묘한 그라디언트 배경 적용
- 넉넉한 패딩과 마진 (여유로운 공간감)

**목표: 차분하고 따뜻하며 편안한 느낌의 "감성있는" UI**

---

## 🛠 **Technical Stack**

### Frontend
- **Next.js 15.4.4**: App Router, TypeScript
- **Tailwind CSS**: Mobile-first 반응형 디자인
- **Framer Motion**: 부드러운 애니메이션
- **Lucide React**: 일관된 아이콘 시스템

### Backend & Auth
- **Supabase**: 인증, 데이터베이스, 실시간 기능
- **Environment Variables**: 현재 설정 그대로 활용
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://bpbfmitcwvqadtefgmek.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  ```

### 상태 관리
- **React Context**: 전역 상태 관리 (단순화)
- **localStorage**: 로컬 데이터 영속성
- **Custom Hooks**: useFolders, useItems, useAuth (단순화)

---

## 📈 **Success Metrics**

### 사용자 경험
- **첫 사용 완료율**: 90% 이상
- **평균 세션 시간**: 5분 이상
- **재방문율**: 주간 70% 이상

### 기능별 성과
- **폴더 생성률**: 사용자당 평균 3개 이상
- **콘텐츠 추가율**: 폴더당 평균 10개 이상
- **공유 참여율**: 사용자의 20% 이상 Market Place 기여

---

## 💡 **Implementation Guidelines**

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

---

## 🎯 **최종 비전**

**"세상의 모든 정보가 3초 안에 내 손 안에"**

KOOUK은 단순한 정보 관리 도구를 넘어, 개인의 지식과 커뮤니티의 지혜가 만나는 플랫폼입니다. 

복잡한 기능보다는 직관적인 단순함으로, 
누구나 쉽게 사용할 수 있는 개인 정보 허브가 되어 
사용자의 디지털 라이프를 더욱 풍요롭게 만들고자 합니다.

---

## 📝 **Working Notes**

### Latest Issues Fixed (2025-08-18)
✅ OAuth callback page 개선 - 제대로 세션 처리
✅ AuthContext 안정성 강화 - 무한 로딩 방지
✅ CSS @import 문제 해결 - Turbopack 버그 우회
✅ 보안 취약점 수정 - 11개 고위험 이슈 해결

### Environment Status
- ✅ Supabase 연결 정상
- ✅ 환경변수 설정 완료
- ✅ 개발 서버 실행 가능 (localhost:3000)

### Database Schema
- ✅ 기존 Supabase 스키마 활용 가능
- ✅ RLS 정책 설정 완료
- ✅ 사용자 인증 플로우 검증됨

---

*"모든 코드는 언제든 수정할 수 있다. 하지만 좋은 사용자 경험은 한번에 만들어져야 한다."*

**항상 사용자 관점에서, 디자이너의 눈으로 접근하세요! 🎨✨**