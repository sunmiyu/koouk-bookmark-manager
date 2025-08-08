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

// 더미 데이터
export const createDummyFolders = (): FolderItem[] => {
  const folders: FolderItem[] = []
  
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
  
  return [investFolder, fashionFolder, beautyFolder, parentingFolder, recipeFolder, restaurantFolder]
}

export const createStorageItem = (
  name: string,
  type: StorageItem['type'],
  content: string,
  folderId: string
): StorageItem => ({
  id: `item_${Date.now()}_${Math.random().toString(36).substring(2)}`,
  name,
  type,
  content,
  folderId,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})