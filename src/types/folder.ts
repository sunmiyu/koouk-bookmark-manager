// 폴더 기반 스토리지 시스템 타입 정의

export interface FolderItem {
  id: string
  name: string
  type: 'folder'
  parentId?: string
  children: (FolderItem | StorageItem)[]
  createdAt: string
  updatedAt: string
  color?: string // 폴더 색상 테마
  icon?: string  // 사용자 지정 아이콘
}

export interface StorageItem {
  id: string
  name: string
  type: 'url' | 'image' | 'video' | 'document' | 'memo'
  content: string
  url?: string
  thumbnail?: string
  tags: string[]
  description?: string
  folderId: string // 속해있는 폴더 ID
  createdAt: string
  updatedAt: string
  wordCount?: number // 문서/메모용
  metadata?: {
    fileSize?: number
    duration?: number // 비디오용
    dimensions?: { width: number; height: number } // 이미지용
    wordCount?: number // 문서/메모용
    thumbnail?: string // YouTube 썸네일 등
    platform?: string // 'youtube', 'vimeo' 등
    fileType?: string // MIME 타입
    fileName?: string // 원본 파일명
    [key: string]: unknown // 추가 메타데이터
  }
}

export interface FolderTree {
  root: FolderItem[]
  selectedFolderId?: string
  expandedFolders: Set<string>
}

// 기본 템플릿
export const defaultFolderTemplates = {
  general: [
    { name: 'Work', icon: 'Briefcase', color: '#3B82F6' },
    { name: 'Personal', icon: 'User', color: '#8B5CF6' },
    { name: 'Learning', icon: 'BookOpen', color: '#10B981' },
    { name: 'Archive', icon: 'Archive', color: '#6B7280' }
  ],
  parent: [
    { name: '패션', icon: 'Shirt', color: '#EC4899' },
    { name: '재테크', icon: 'TrendingUp', color: '#F59E0B' },
    { name: '아이교육', icon: 'GraduationCap', color: '#8B5CF6' },
    { name: '레시피', icon: 'ChefHat', color: '#10B981' },
    { name: '여행지', icon: 'MapPin', color: '#3B82F6' },
    { name: '다이어트', icon: 'Heart', color: '#EF4444' }
  ],
  professional: [
    { name: '투자', icon: 'TrendingUp', color: '#F59E0B' },
    { name: '골프', icon: 'Target', color: '#10B981' },
    { name: '건강', icon: 'Activity', color: '#EF4444' },
    { name: '맛집', icon: 'UtensilsCrossed', color: '#F97316' },
    { name: '취미', icon: 'Gamepad2', color: '#8B5CF6' },
    { name: '뉴스', icon: 'Newspaper', color: '#6B7280' }
  ],
  student: [
    { name: '패션', icon: 'Shirt', color: '#EC4899' },
    { name: '취업', icon: 'Briefcase', color: '#3B82F6' },
    { name: '운동', icon: 'Dumbbell', color: '#EF4444' },
    { name: '게임', icon: 'Gamepad2', color: '#8B5CF6' },
    { name: '데이트', icon: 'Heart', color: '#F43F5E' },
    { name: '여행', icon: 'Plane', color: '#06B6D4' }
  ]
}

// 유틸리티 함수들
export const createFolder = (name: string, parentId?: string, template?: { color?: string; icon?: string }): FolderItem => ({
  id: `folder_${Date.now()}_${Math.random().toString(36).substring(2)}`,
  name,
  type: 'folder',
  parentId,
  children: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  color: template?.color || '#6B7280',
  icon: template?.icon || 'Folder'
})

// 초기화된 빈 폴더 생성 (온보딩 완료 후)
export const createInitialFolders = (): FolderItem[] => {
  return [
    createFolder('Folder1', undefined, { color: '#3B82F6', icon: 'Folder' }),
    createFolder('Folder2', undefined, { color: '#10B981', icon: 'Folder' }),
    createFolder('Folder3', undefined, { color: '#F59E0B', icon: 'Folder' })
  ]
}

// 더미 데이터 (샘플 학습용)
export const createDummyFolders = (): FolderItem[] => {
  // Initialize empty array for folders to be created
  
  // 재테크 폴더
  const investFolder = createFolder('재테크', undefined, { color: '#F59E0B', icon: 'TrendingUp' })
  const stockFolder = createFolder('주식', investFolder.id, { color: '#EF4444', icon: 'BarChart3' })
  const realEstateFolder = createFolder('부동산', investFolder.id, { color: '#10B981', icon: 'Building' })
  
  // 주식 폴더 내용
  stockFolder.children = [
    createStorageItem('삼성전자 분석 리포트', 'document', '삼성전자의 2024년 실적 분석과 투자 전망에 대한 상세 리포트입니다.', stockFolder.id),
    createStorageItem('주식 투자 기본 가이드', 'url', 'https://example.com/stock-guide', stockFolder.id),
    createStorageItem('테슬라 실적 발표 영상', 'video', 'https://youtube.com/watch?v=tesla-earnings', stockFolder.id)
  ]
  
  // 부동산 폴더 내용
  realEstateFolder.children = [
    createStorageItem('부동산 시장 동향', 'document', '2024년 부동산 시장 분석 및 투자 포인트', realEstateFolder.id),
    createStorageItem('아파트 매매 체크리스트', 'memo', '1. 입지 확인\n2. 교통 편의성\n3. 학군 정보\n4. 향후 개발 계획', realEstateFolder.id)
  ]
  
  investFolder.children = [stockFolder, realEstateFolder]
  
  // 패션 폴더
  const fashionFolder = createFolder('패션', undefined, { color: '#EC4899', icon: 'Shirt' })
  fashionFolder.children = [
    createStorageItem('2024 봄 트렌드', 'url', 'https://example.com/fashion-trend', fashionFolder.id),
    createStorageItem('코디 참고 이미지', 'image', '/images/fashion-coord.jpg', fashionFolder.id),
    createStorageItem('패션 쇼핑몰 추천', 'memo', '• 무신사\n• 스타일쉐어\n• 브랜디\n• 29CM', fashionFolder.id)
  ]
  
  // 뷰티 폴더
  const beautyFolder = createFolder('뷰티', undefined, { color: '#F97316', icon: 'Sparkles' })
  beautyFolder.children = [
    createStorageItem('메이크업 튜토리얼', 'video', 'https://youtube.com/watch?v=makeup-tutorial', beautyFolder.id),
    createStorageItem('스킨케어 루틴', 'document', '아침/저녁 스킨케어 단계별 가이드', beautyFolder.id),
    createStorageItem('화장품 리뷰', 'url', 'https://example.com/cosmetic-review', beautyFolder.id)
  ]
  
  // 육아 폴더
  const parentingFolder = createFolder('육아', undefined, { color: '#8B5CF6', icon: 'Baby' })
  const englishEduFolder = createFolder('영어 교육 방법', parentingFolder.id, { color: '#3B82F6', icon: 'BookOpen' })
  const mathEduFolder = createFolder('수학 교육 방법', parentingFolder.id, { color: '#10B981', icon: 'Calculator' })
  const disciplineFolder = createFolder('훈육법', parentingFolder.id, { color: '#EF4444', icon: 'Shield' })
  
  // 영어 교육 내용
  englishEduFolder.children = [
    createStorageItem('파닉스 교육법', 'document', '단계별 파닉스 학습 방법과 교재 추천', englishEduFolder.id),
    createStorageItem('영어 동화책 읽기', 'video', 'https://youtube.com/watch?v=english-story', englishEduFolder.id),
    createStorageItem('영어 교육 앱 추천', 'memo', '• 링구아키즈\n• 키즈잉글리시\n• ABC마우스', englishEduFolder.id)
  ]
  
  // 수학 교육 내용
  mathEduFolder.children = [
    createStorageItem('수학 놀이 활동', 'document', '연령별 수학 개념을 놀이로 배우는 방법', mathEduFolder.id),
    createStorageItem('수학 교구 활용법', 'url', 'https://example.com/math-tools', mathEduFolder.id)
  ]
  
  // 훈육법 내용
  disciplineFolder.children = [
    createStorageItem('긍정적 훈육 방법', 'document', '아이의 자존감을 높이는 훈육 기법', disciplineFolder.id),
    createStorageItem('떼쓰기 대처법', 'memo', '1. 냉정함 유지\n2. 아이 감정 인정\n3. 대안 제시\n4. 일관성 유지', disciplineFolder.id),
    createStorageItem('훈육 관련 책 추천', 'url', 'https://example.com/parenting-books', disciplineFolder.id)
  ]
  
  parentingFolder.children = [englishEduFolder, mathEduFolder, disciplineFolder]
  
  // 음식 레시피 폴더
  const recipeFolder = createFolder('음식 레시피', undefined, { color: '#10B981', icon: 'ChefHat' })
  recipeFolder.children = [
    createStorageItem('김치찌개 레시피', 'document', '재료: 김치, 돼지고기, 두부...\n조리법: 1. 김치볶기 2. 물 붓기...', recipeFolder.id),
    createStorageItem('파스타 만들기 영상', 'video', 'https://youtube.com/watch?v=pasta-recipe', recipeFolder.id),
    createStorageItem('디저트 레시피 모음', 'url', 'https://example.com/dessert-recipes', recipeFolder.id)
  ]
  
  // 지역 맛집 폴더
  const restaurantFolder = createFolder('지역 맛집', undefined, { color: '#F97316', icon: 'UtensilsCrossed' })
  const seoulFolder = createFolder('서울 성북구 맛집', restaurantFolder.id, { color: '#EF4444', icon: 'MapPin' })
  const incheonFolder = createFolder('인천 맛집', restaurantFolder.id, { color: '#3B82F6', icon: 'MapPin' })
  const personalFolder = createFolder('풍자의 또간집 리스트', restaurantFolder.id, { color: '#8B5CF6', icon: 'Heart' })
  
  // 서울 성북구 맛집
  seoulFolder.children = [
    createStorageItem('성북동 맛있는 칼국수집', 'memo', '주소: 서울시 성북구\n메뉴: 칼국수 8000원\n특징: 진한 국물', seoulFolder.id),
    createStorageItem('돈암동 고기집', 'url', 'https://example.com/seoul-bbq', seoulFolder.id),
    createStorageItem('맛집 사진', 'image', '/images/restaurant-seoul.jpg', seoulFolder.id)
  ]
  
  // 인천 맛집
  incheonFolder.children = [
    createStorageItem('인천 짜장면 맛집', 'document', '인천 차이나타운의 전통 짜장면집 추천 리스트', incheonFolder.id),
    createStorageItem('송도 카페 추천', 'memo', '• 스타벅스 센트럴파크점\n• 투썸플레이스\n• 로컬 카페 모음', incheonFolder.id)
  ]
  
  // 개인 맛집 리스트
  personalFolder.children = [
    createStorageItem('또 가고 싶은 곳', 'memo', '1. 강남 이탈리안 레스토랑\n2. 홍대 타코집\n3. 을지로 술집', personalFolder.id),
    createStorageItem('맛집 영상 리뷰', 'video', 'https://youtube.com/watch?v=restaurant-review', personalFolder.id)
  ]
  
  restaurantFolder.children = [seoulFolder, incheonFolder, personalFolder]
  
  // 타입별 샘플 모음 폴더 (각 타입 3개씩)
  const sampleFolder = createFolder('타입별 샘플 모음', undefined, { color: '#6B7280', icon: 'Folder' })
  sampleFolder.children = [
    // Video 타입 3개
    createStorageItem('React 18 완벽 가이드', 'video', 'https://youtube.com/watch?v=jN4kvDQ0cI8', sampleFolder.id, {
      thumbnail: 'https://img.youtube.com/vi/jN4kvDQ0cI8/mqdefault.jpg',
      platform: 'youtube',
      duration: 3600
    }),
    createStorageItem('Next.js 13 새로운 기능', 'video', 'https://youtube.com/watch?v=__mSgDEOyv8', sampleFolder.id, {
      thumbnail: 'https://img.youtube.com/vi/__mSgDEOyv8/mqdefault.jpg',
      platform: 'youtube',
      duration: 1800
    }),
    createStorageItem('TypeScript 실무 활용법', 'video', 'https://youtube.com/watch?v=1jMJDbq7ZX4', sampleFolder.id, {
      thumbnail: 'https://img.youtube.com/vi/1jMJDbq7ZX4/mqdefault.jpg',
      platform: 'youtube',
      duration: 2400
    }),
    
    // Image 타입 3개
    createStorageItem('UI 디자인 레퍼런스', 'image', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop', sampleFolder.id, {
      dimensions: { width: 800, height: 600 },
      fileSize: 245760
    }),
    createStorageItem('색상 팔레트 가이드', 'image', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop', sampleFolder.id, {
      dimensions: { width: 800, height: 600 },
      fileSize: 189340
    }),
    createStorageItem('타이포그래피 예시', 'image', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop', sampleFolder.id, {
      dimensions: { width: 800, height: 600 },
      fileSize: 324580
    }),
    
    // URL/Link 타입 3개
    createStorageItem('MDN Web Docs', 'url', 'https://developer.mozilla.org', sampleFolder.id, {
      platform: 'web',
      fileType: 'text/html'
    }),
    createStorageItem('GitHub 코드 저장소', 'url', 'https://github.com/facebook/react', sampleFolder.id, {
      platform: 'github',
      fileType: 'text/html'
    }),
    createStorageItem('Stack Overflow 질문', 'url', 'https://stackoverflow.com/questions/tagged/javascript', sampleFolder.id, {
      platform: 'stackoverflow',
      fileType: 'text/html'
    }),
    
    // Document 타입 3개
    createStorageItem('프로젝트 기획서', 'document', `# 웹 애플리케이션 개발 프로젝트

## 1. 프로젝트 개요
- 목표: 현대적인 웹 애플리케이션 개발
- 기간: 2024년 1월 ~ 3월
- 팀원: 개발자 3명, 디자이너 1명

## 2. 기술 스택
- Frontend: React 18, TypeScript, Tailwind CSS
- Backend: Node.js, Express, MongoDB
- 배포: Vercel, Railway

## 3. 주요 기능
- 사용자 인증 시스템
- 실시간 데이터 동기화
- 반응형 웹 디자인
- PWA 지원`, sampleFolder.id, {
      wordCount: 87,
      fileType: 'text/markdown'
    }),
    
    createStorageItem('회의록 - 2024년 1월', 'document', `# 개발팀 주간 회의록
날짜: 2024년 1월 15일
참석자: 김개발, 이디자인, 박기획

## 논의사항
1. 새로운 기능 개발 일정 검토
2. 사용자 피드백 분석 결과 공유
3. 다음 스프린트 계획 수립

## 결정사항
- React 18로 업그레이드 진행
- 디자인 시스템 구축 우선순위 상향
- 테스트 자동화 도입

## 액션 아이템
- [김개발] React 18 마이그레이션 가이드 작성
- [이디자인] 컴포넌트 라이브러리 설계
- [박기획] 사용자 스토리 업데이트`, sampleFolder.id, {
      wordCount: 124,
      fileType: 'text/markdown'
    }),
    
    createStorageItem('개발 가이드라인', 'document', `# 코딩 컨벤션 가이드

## JavaScript/TypeScript
- 변수명: camelCase 사용
- 함수명: 동사 + 명사 형태
- 상수: UPPER_SNAKE_CASE
- 인터페이스: PascalCase (I 접두사 없음)

## React 컴포넌트
- 파일명: PascalCase.tsx
- Props 인터페이스: ComponentNameProps
- 기본 export 사용

## CSS/Styling
- Tailwind CSS 클래스 우선 사용
- 커스텀 CSS는 최소화
- 반응형 디자인 필수 적용

## Git 커밋 메시지
- feat: 새로운 기능 추가
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포매팅`, sampleFolder.id, {
      wordCount: 96,
      fileType: 'text/markdown'
    }),
    
    // Memo 타입 3개
    createStorageItem('오늘의 할 일', 'memo', `✅ 오늘 완료할 작업들

1. 프로젝트 회의 참석 (오전 10시)
2. 새로운 기능 개발 시작
3. 코드 리뷰 요청사항 반영
4. 문서 업데이트
5. 테스트 케이스 작성

💡 중요한 포인트
- 사용자 경험 개선에 집중
- 코드 품질 유지
- 팀원과의 소통 강화`, sampleFolder.id, {
      wordCount: 45
    }),
    
    createStorageItem('아이디어 메모', 'memo', `💭 새로운 기능 아이디어

🚀 앱 개선 방안
- 다크모드 테마 추가
- 키보드 단축키 지원
- 오프라인 모드 구현
- 실시간 협업 기능

🎨 UI/UX 개선
- 애니메이션 효과 추가
- 모바일 최적화
- 접근성 향상
- 사용자 온보딩 개선

📊 데이터 분석
- 사용자 행동 추적
- A/B 테스트 도입
- 성능 모니터링`, sampleFolder.id, {
      wordCount: 52
    }),
    
    createStorageItem('학습 노트', 'memo', `📚 오늘 배운 것들

✨ React 18의 새로운 기능들
- Concurrent Rendering
- Automatic Batching  
- Suspense for Data Fetching
- New Hooks (useId, useDeferredValue)

🔧 TypeScript 팁
- Utility Types 활용
- Generic 타입 추론
- Conditional Types
- Template Literal Types

💡 성능 최적화
- Code Splitting
- Lazy Loading
- Memoization
- Bundle Size 분석`, sampleFolder.id, {
      wordCount: 48
    })
  ]
  
  return [investFolder, fashionFolder, beautyFolder, parentingFolder, recipeFolder, restaurantFolder, sampleFolder]
}

export const createStorageItem = (
  name: string,
  type: StorageItem['type'],
  content: string,
  folderId: string,
  metadata?: StorageItem['metadata']
): StorageItem => ({
  id: `item_${Date.now()}_${Math.random().toString(36).substring(2)}`,
  name,
  type,
  content,
  folderId,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  metadata
})