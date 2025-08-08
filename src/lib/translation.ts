// 클라이언트 사이드 번역 라이브러리
// Google Translate API 대신 무료 번역 서비스 활용

interface TranslationCache {
  [key: string]: string
}

class TranslationService {
  private cache: TranslationCache = {}
  private isOnline = true

  constructor() {
    // 네트워크 상태 모니터링
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.isOnline = true)
      window.addEventListener('offline', () => this.isOnline = false)
      this.isOnline = navigator.onLine
    }
  }

  // 무료 번역 API 사용 (MyMemory API)
  async translateText(text: string, from: string = 'auto', to: string = 'en'): Promise<string> {
    if (!text.trim()) return text

    const cacheKey = `${from}-${to}-${text}`
    
    // 캐시에서 찾기
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey]
    }

    // 오프라인이거나 같은 언어면 원문 반환
    if (!this.isOnline || from === to) {
      return text
    }

    try {
      // MyMemory Translation API (무료, API 키 불필요)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
      )
      
      const data = await response.json()
      
      if (data.responseStatus === 200 && data.responseData.translatedText) {
        const translatedText = data.responseData.translatedText
        this.cache[cacheKey] = translatedText
        return translatedText
      }
    } catch (error) {
      console.warn('Translation failed, returning original text:', error)
    }

    return text
  }

  // 언어 감지
  detectLanguage(text: string): 'ko' | 'en' | 'unknown' {
    const koreanRegex = /[ㄱ-ㅎ가-힣]/
    const englishRegex = /[a-zA-Z]/

    const hasKorean = koreanRegex.test(text)
    const hasEnglish = englishRegex.test(text)

    if (hasKorean && !hasEnglish) return 'ko'
    if (hasEnglish && !hasKorean) return 'en'
    if (hasKorean && hasEnglish) {
      // 혼재된 경우 더 많은 것으로 판단
      const koreanChars = text.match(koreanRegex)?.length || 0
      const englishChars = text.match(englishRegex)?.length || 0
      return koreanChars > englishChars ? 'ko' : 'en'
    }

    return 'unknown'
  }

  // 한국어 → 영어
  async toEnglish(text: string): Promise<string> {
    const lang = this.detectLanguage(text)
    if (lang === 'en') return text
    return this.translateText(text, 'ko', 'en')
  }

  // 영어 → 한국어  
  async toKorean(text: string): Promise<string> {
    const lang = this.detectLanguage(text)
    if (lang === 'ko') return text
    return this.translateText(text, 'en', 'ko')
  }

  // 자동 번역 (언어 감지 후 반대 언어로)
  async autoTranslate(text: string): Promise<{ original: string; translated: string; from: string; to: string }> {
    const detectedLang = this.detectLanguage(text)
    
    let translated: string
    let from: string
    let to: string

    if (detectedLang === 'ko') {
      translated = await this.toEnglish(text)
      from = 'ko'
      to = 'en'
    } else if (detectedLang === 'en') {
      translated = await this.toKorean(text)
      from = 'en' 
      to = 'ko'
    } else {
      // 언어를 알 수 없는 경우 영어로 시도
      translated = await this.toEnglish(text)
      from = 'unknown'
      to = 'en'
    }

    return {
      original: text,
      translated,
      from,
      to
    }
  }

  // 대량 텍스트 번역 (배치 처리)
  async translateBatch(texts: string[], from: string = 'auto', to: string = 'en'): Promise<string[]> {
    const results: string[] = []
    
    // 동시 요청 수 제한 (API 제한 고려)
    const batchSize = 5
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      const promises = batch.map(text => this.translateText(text, from, to))
      
      try {
        const batchResults = await Promise.all(promises)
        results.push(...batchResults)
        
        // API 제한을 위한 딜레이
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (error) {
        console.warn('Batch translation failed:', error)
        results.push(...batch) // 원문 반환
      }
    }

    return results
  }

  // 캐시 관리
  clearCache() {
    this.cache = {}
  }

  getCacheSize(): number {
    return Object.keys(this.cache).length
  }

  // 일반적인 UI 텍스트 번역을 위한 사전 정의
  private uiTranslations: { [key: string]: { ko: string; en: string } } = {
    'search': { ko: '검색', en: 'Search' },
    'search_in': { ko: '다음으로 검색', en: 'Search for' },
    'searching': { ko: '검색중', en: 'Searching' },
    'search_results': { ko: '검색 결과', en: 'Search Results' },
    'suggestions': { ko: '추천', en: 'Suggestions' },
    'recent_searches': { ko: '최근 검색', en: 'Recent Searches' },
    'popular_searches': { ko: '인기 검색어', en: 'Popular Searches' },
    'folder': { ko: '폴더', en: 'Folder' },
    'my_folder': { ko: 'My Folder', en: 'My Folder' },
    'market_place': { ko: 'Market Place', en: 'Market Place' },
    'feedback': { ko: '피드백', en: 'Feedback' },
    'settings': { ko: '설정', en: 'Settings' },
    'sign_out': { ko: '로그아웃', en: 'Sign Out' },
    'clear_all': { ko: 'Clear All', en: 'Clear All' },
    'create_folder': { ko: '폴더 만들기', en: 'Create Folder' },
    'delete': { ko: '삭제', en: 'Delete' },
    'rename': { ko: '이름 변경', en: 'Rename' },
    'share': { ko: '공유', en: 'Share' },
    'document': { ko: '문서', en: 'Document' },
    'memo': { ko: '메모', en: 'Memo' },
    'image': { ko: '이미지', en: 'Image' },
    'video': { ko: '비디오', en: 'Video' },
    'url': { ko: 'URL', en: 'URL' },
    'loading': { ko: '로딩중...', en: 'Loading...' },
    'no_results': { ko: '검색 결과가 없습니다', en: 'No results found' },
    'try_different_keywords': { ko: '다른 키워드로 시도해보세요', en: 'Try different keywords' }
  }

  // UI 텍스트 번역 (즉시 반환)
  getUIText(key: string, lang: 'ko' | 'en' = 'ko'): string {
    return this.uiTranslations[key]?.[lang] || key
  }

  // 모든 UI 텍스트 가져오기
  getAllUITexts(lang: 'ko' | 'en' = 'ko'): { [key: string]: string } {
    const result: { [key: string]: string } = {}
    
    Object.keys(this.uiTranslations).forEach(key => {
      result[key] = this.uiTranslations[key][lang]
    })

    return result
  }
}

// 전역 번역 서비스 인스턴스
export const translationService = new TranslationService()

// 간편한 사용을 위한 헬퍼 함수들
export const t = (key: string, lang: 'ko' | 'en' = 'ko') => translationService.getUIText(key, lang)
export const translateTo = (text: string, targetLang: 'ko' | 'en') => 
  targetLang === 'ko' ? translationService.toKorean(text) : translationService.toEnglish(text)
export const autoTranslate = (text: string) => translationService.autoTranslate(text)
export const detectLang = (text: string) => translationService.detectLanguage(text)