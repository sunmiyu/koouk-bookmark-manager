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
    { name: '쇼핑', icon: 'ShoppingBag', color: '#EC4899' },
    { name: '저축', icon: 'PiggyBank', color: '#F59E0B' },
    { name: '아이교육', icon: 'GraduationCap', color: '#8B5CF6' },
    { name: '요리', icon: 'ChefHat', color: '#10B981' },
    { name: '여행지', icon: 'MapPin', color: '#3B82F6' },
    { name: '다이어트', icon: 'Apple', color: '#EF4444' }
  ],
  professional: [
    { name: '비즈니스', icon: 'Building2', color: '#F59E0B' },
    { name: '골프', icon: 'Target', color: '#10B981' },
    { name: '건강', icon: 'Activity', color: '#EF4444' },
    { name: '카페', icon: 'Coffee', color: '#F97316' },
    { name: '취미', icon: 'Gamepad2', color: '#8B5CF6' },
    { name: '뉴스', icon: 'Newspaper', color: '#6B7280' }
  ],
  student: [
    { name: '스타일', icon: 'Palette', color: '#EC4899' },
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
    createStorageItem('삼성전자 분석 리포트', 'document', '삼성전자 2024년 3분기 실적 분석\n\n■ 주요 성과\n• 매출: 79조 1,000억원 (전년 동기 대비 17.3% 증가)\n• 영업이익: 9조 1,800억원 (전년 동기 대비 277.4% 증가)\n• 반도체 부문 회복세 지속\n\n■ 투자 포인트\n1. 메모리 반도체 업황 개선\n2. AI 칩 수요 급증 대응\n3. 파운드리 사업 성장 가속화\n\n■ 목표주가: 95,000원 (기존 80,000원에서 상향)', stockFolder.id),
    createStorageItem('한국투자증권 리서치 리포트', 'url', 'https://securities.koreainvestment.com', stockFolder.id),
    createStorageItem('워렌 버핏 투자 철학', 'video', 'https://www.youtube.com/watch?v=PjTOnQ4PYSc', stockFolder.id)
  ]
  
  // 부동산 폴더 내용
  realEstateFolder.children = [
    createStorageItem('2024 부동산 시장 전망', 'document', '2024년 부동산 시장 전망 및 투자 가이드\n\n📈 시장 현황\n• 수도권 아파트 평균 매매가: 7억 2,000만원\n• 전세 가격 상승률: 연 3.2%\n• 거래량: 전년 동기 대비 15% 증가\n\n🏢 지역별 특징\n- 강남3구: 안정적 상승세, 프리미엄 지속\n- 마포/용산: 재개발 호재로 상승 잠재력 높음\n- 송파/강동: 교통 인프라 개선으로 주목\n\n💡 투자 포인트\n1. 입지: 지하철역 10분 이내\n2. 교육: 학군 인프라 완비 지역\n3. 개발: 향후 5년 내 개발 계획 유무\n4. 인구: 젊은 층 유입이 활발한 지역', realEstateFolder.id),
    createStorageItem('아파트 매매 체크리스트', 'memo', '🏠 아파트 매매 필수 체크리스트\n\n✅ 기본 정보\n• 준공년도: 15년 이내\n• 세대수: 500세대 이상 (관리비 분산)\n• 주차대수: 세대당 1.2대 이상\n• 층수/향: 중간층, 남향 선호\n\n✅ 입지 조건\n• 지하철역: 도보 10분 이내\n• 버스정류장: 5분 이내\n• 대형마트: 15분 이내\n• 병원: 종합병원 20분 이내\n\n✅ 교육 환경\n• 초등학교: 도보 10분 이내\n• 학원가: 중·고등학원 밀집 지역\n• 도서관: 구립/시립 도서관 접근성\n\n✅ 법적 체크\n• 등기부등본 확인\n• 건축물대장 열람\n• 토지이용계획 확인\n• 재개발/재건축 계획', realEstateFolder.id)
  ]
  
  investFolder.children = [stockFolder, realEstateFolder]
  
  // 패션 폴더
  const fashionFolder = createFolder('패션', undefined, { color: '#EC4899', icon: 'Shirt' })
  fashionFolder.children = [
    createStorageItem('보그 2024 패션 트렌드', 'url', 'https://www.vogue.com/fashion/trends', fashionFolder.id),
    createStorageItem('가을 코디 룩북', 'image', 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F4c%2F8f%2F0a%2F4c8f0a8d9e8c9f7d4b2a1e3c8d5f9e6b.jpg&type=sc960_832', fashionFolder.id),
    createStorageItem('패션 쇼핑몰 추천', 'memo', '👕 온라인 쇼핑몰 베스트\n\n🔥 인기 브랜드몰\n• 무신사 - 스트릿/캐주얼 브랜드 집약\n• W컨셉 - 디자이너 브랜드 위주\n• 스타일난다 - 20-30대 트렌디 아이템\n• 29CM - 감성적이고 유니크한 브랜드\n\n💎 럭셔리/하이엔드\n• 네타포르테 - 해외 럭셔리 브랜드\n• 르봉마르셰 - 편집샵 스타일\n• 바이마 - 해외 직구 플랫폼\n\n💰 가성비 쇼핑몰\n• 브랜디 - 20대 여성 의류\n• 스타일쉐어 - 개인 브랜드 입점\n• 지그재그 - 할인 정보 모음', fashionFolder.id)
  ]
  
  // 뷰티 폴더
  const beautyFolder = createFolder('뷰티', undefined, { color: '#F97316', icon: 'Sparkles' })
  beautyFolder.children = [
    createStorageItem('올리브영 메이크업 튜토리얼', 'video', 'https://www.youtube.com/watch?v=36YnV9STBqc', beautyFolder.id),
    createStorageItem('뷰티 제품 비교 이미지', 'image', 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fcdn.pixabay.com%2Fphoto%2F2017%2F08%2F07%2F14%2F58%2Fmakeup-2604173_960_720.jpg&type=sc960_832', beautyFolder.id),
    createStorageItem('스킨케어 루틴 가이드', 'document', '🧴 완벽한 스킨케어 루틴 가이드\n\n🌅 아침 루틴 (5단계)\n1. 폼 클렌징: 순한 성분의 폼클렌저\n2. 토너: 수분 공급용 토너 사용\n3. 에센스/세럼: 비타민C 세럼 (항산화)\n4. 수분크림: 가벼운 젤 타입\n5. 선크림: SPF30 이상 (필수!)\n\n🌙 저녁 루틴 (7단계)\n1. 첫 번째 클렌징: 오일/밤 클렌저\n2. 두 번째 클렌징: 폼 클렌저\n3. 토너: 진정/수분 토너\n4. 에센스: 회복/재생 에센스\n5. 세럼: 레티놀/나이아신아마이드\n6. 아이크림: 전용 아이크림\n7. 수분크림: 진한 영양크림\n\n💡 추천 브랜드\n• 토너: 라로슈포제, 아벤느\n• 세럼: 더오디너리, 폴라초이스\n• 크림: 세타필, 바닐라코', beautyFolder.id),
    createStorageItem('올리브영 할인 정보', 'url', 'https://www.oliveyoung.co.kr/store/display/getMCategoryList.do?dispCatNo=100000100010001', beautyFolder.id)
  ]
  
  // 육아 폴더
  const parentingFolder = createFolder('육아', undefined, { color: '#8B5CF6', icon: 'Baby' })
  const englishEduFolder = createFolder('영어 교육 방법', parentingFolder.id, { color: '#3B82F6', icon: 'BookOpen' })
  const mathEduFolder = createFolder('수학 교육 방법', parentingFolder.id, { color: '#10B981', icon: 'Calculator' })
  const disciplineFolder = createFolder('훈육법', parentingFolder.id, { color: '#EF4444', icon: 'Shield' })
  
  // 영어 교육 내용
  englishEduFolder.children = [
    createStorageItem('파닉스 교육법 완전정리', 'document', '📚 단계별 파닉스 교육 가이드\n\n🎯 1단계 (4-5세): 알파벳 인식\n• 알파벳 노래 부르기\n• 대문자/소문자 구분하기\n• 알파벳 순서 외우기\n\n🎯 2단계 (5-6세): 기본 소리\n• a, e, i, o, u 모음 소리\n• b, c, d 등 자음 소리\n• CVC 단어 (cat, dog, sun)\n\n🎯 3단계 (6-7세): 조합 소리\n• ch, sh, th 소리\n• 이중모음 ai, oa, ee\n• 간단한 문장 읽기\n\n📖 추천 교재\n• Jolly Phonics 시리즈\n• Oxford Reading Tree\n• 리틀팩스 파닉스', englishEduFolder.id),
    createStorageItem('영어 동화 읽어주기', 'video', 'https://www.youtube.com/watch?v=gqn6T7Lrisw', englishEduFolder.id),
    createStorageItem('영어 교육 앱 추천', 'memo', '📱 아이 영어 교육 앱 베스트\n\n🏆 무료 앱\n• ABC Kids - 알파벳 학습\n• Khan Academy Kids - 종합학습\n• YouTube Kids - 영어 동영상\n\n💎 유료 앱 (월 구독)\n• 리틀팩스 - 동화책 + 게임\n• 페어리베이비 - 영어동요\n• 키즈잉글리시 - 파닉스 전문\n\n💡 사용 팁\n- 하루 15-20분 제한\n- 부모와 함께 사용\n- 아이가 좋아하는 캐릭터 찾기', englishEduFolder.id)
  ]
  
  // 수학 교육 내용
  mathEduFolder.children = [
    createStorageItem('연령별 수학 놀이 활동', 'document', '🔢 놀이로 배우는 수학 개념\n\n👶 3-4세: 기초 개념\n• 크기 비교: 큰 공, 작은 공\n• 색깔 분류: 빨간 블록, 파란 블록\n• 모양 인식: 동그라미, 세모, 네모\n• 1-5까지 세기\n\n🧒 5-6세: 수 개념\n• 1-20까지 순서대로 세기\n• 간단한 덧셈: 사탕 2개 + 1개 = 3개\n• 패턴 찾기: 빨강-파랑-빨강-파랑\n• 시계 읽기: 정각 개념\n\n👦 7-8세: 연산 기초\n• 10 이하 덧셈/뺄셈\n• 구구단 2,5,10단\n• 길이/무게 측정\n• 동전 계산하기\n\n🎮 추천 활동\n• 레고 블록으로 패턴 만들기\n• 요리하며 계량 배우기\n• 보드게임으로 수 세기', mathEduFolder.id),
    createStorageItem('수학 교구 쇼핑몰', 'url', 'https://www.mathkit.co.kr', mathEduFolder.id),
    createStorageItem('몬테소리 수학교구', 'image', 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1503676260728-1c00da094a0b%3Fixlib%3Drb-4.0.3%26ixid%3DM3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%253D%253D&type=sc960_832', mathEduFolder.id)
  ]
  
  // 훈육법 내용
  disciplineFolder.children = [
    createStorageItem('긍정적 훈육 방법', 'document', '아이의 자존감을 높이는 훈육 기법', disciplineFolder.id),
    createStorageItem('떼쓰기 대처법', 'memo', '1. 냉정함 유지\n2. 아이 감정 인정\n3. 대안 제시\n4. 일관성 유지', disciplineFolder.id),
    createStorageItem('훈육 관련 책 추천', 'url', 'https://example.com/parenting-books', disciplineFolder.id)
  ]
  
  parentingFolder.children = [englishEduFolder, mathEduFolder, disciplineFolder]
  
  // Food Recipe folder
  const recipeFolder = createFolder('Food Recipe', undefined, { color: '#10B981', icon: 'ChefHat' })
  recipeFolder.children = [
    createStorageItem('김치찌개 황금 레시피', 'document', '🍲 김치찌개 황금 레시피 (4인분)\n\n📝 재료\n주재료:\n• 신김치 300g (1/4포기)\n• 돼지삼겹살 200g\n• 두부 1/2모\n• 대파 1대\n• 양파 1/2개\n\n양념:\n• 고춧가루 1큰술\n• 다진마늘 1큰술\n• 간장 1큰술\n• 참기름 1작은술\n\n🔥 조리법\n1. 김치는 한입 크기로 자르고, 돼지고기는 한입 크기로 썰기\n2. 팬에 참기름을 두르고 돼지고기를 볶아 기름이 나올 때까지\n3. 김치를 넣고 함께 볶아 신맛을 날리기 (3-4분)\n4. 물 400ml 붓고 끓어오르면 고춧가루, 다진마늘, 간장 추가\n5. 20분 끓인 후 두부, 대파, 양파 넣고 5분 더 끓이기\n\n💡 포인트\n- 신김치일수록 맛있음\n- 돼지고기 기름이 국물 맛의 핵심\n- 마지막에 청양고추 추가하면 더 맛있음', recipeFolder.id),
    createStorageItem('백종원 파스타 레시피', 'video', 'https://www.youtube.com/watch?v=V3AdEeMiKTk', recipeFolder.id),
    createStorageItem('디저트 카페 이미지', 'image', 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1551024506-0bccd828d307%3Fixlib%3Drb-4.0.3%26ixid%3DM3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%253D%253D&type=sc960_832', recipeFolder.id),
    createStorageItem('만개의 레시피', 'url', 'https://www.10000recipe.com/', recipeFolder.id)
  ]
  
  // 지역 맛집 폴더
  const restaurantFolder = createFolder('지역 맛집', undefined, { color: '#F97316', icon: 'UtensilsCrossed' })
  const seoulFolder = createFolder('서울 성북구 맛집', restaurantFolder.id, { color: '#EF4444', icon: 'MapPin' })
  const incheonFolder = createFolder('인천 맛집', restaurantFolder.id, { color: '#3B82F6', icon: 'MapPin' })
  const personalFolder = createFolder('풍자의 또간집 리스트', restaurantFolder.id, { color: '#8B5CF6', icon: 'Heart' })
  
  // 서울 성북구 맛집
  seoulFolder.children = [
    createStorageItem('성북동 손칼국수 맛집', 'memo', '🍜 성북동 할머니 손칼국수\n\n📍 기본 정보\n• 주소: 서울시 성북구 성북동 123-45\n• 전화: 02-123-4567\n• 영업시간: 오전 7시 - 오후 8시\n• 휴무일: 일요일\n\n🍽️ 메뉴 & 가격\n• 손칼국수: 8,000원\n• 들깨칼국수: 9,000원\n• 만두: 6,000원\n• 김치: 무료 무한리필\n\n⭐ 특징\n- 50년 전통의 손칼국수 전문점\n- 직접 뽑은 면발의 쫄깃함\n- 진짜 사골 우린 깊은 국물\n- 동네 숨은 맛집, 항상 대기줄\n\n💡 팁\n- 오전 11시 이전 방문 추천 (대기 적음)\n- 주차 어려움, 대중교통 이용\n- 현금 결제만 가능', seoulFolder.id),
    createStorageItem('망원동 맛집 영상', 'video', 'https://www.youtube.com/watch?v=FLgKDgj_3Nw', seoulFolder.id),
    createStorageItem('한옥마을 맛집 사진', 'image', 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1551218808-94e220e084d2%3Fixlib%3Drb-4.0.3%26ixid%3DM3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%253D%253D&type=sc960_832', seoulFolder.id),
    createStorageItem('성북구 맛집 지도', 'url', 'https://map.naver.com/p/search/%EC%84%B1%EB%B6%81%EA%B5%AC%20%EB%A7%9B%EC%A7%91', seoulFolder.id)
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