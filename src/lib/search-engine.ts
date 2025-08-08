import Fuse from 'fuse.js'
import { Index } from 'flexsearch'
import Hangul from 'hangul-js'
import { FolderItem, StorageItem } from '@/types/folder'
import { SharedFolder } from '@/types/share'

// 검색 인덱스 타입 정의
interface SearchableItem {
  id: string
  name: string
  content: string
  type: 'folder' | 'storage' | 'shared'
  category?: string
  tags: string[]
  folderId?: string
  description?: string
}

// 한국어 텍스트 처리 유틸리티
class KoreanTextProcessor {
  // 한글 분해 및 초성 검색 지원
  static disassemble(text: string): string {
    return Hangul.disassemble(text).join('')
  }

  // 초성으로 검색
  static getInitialConsonants(text: string): string {
    const initials = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
    return text.split('').map(char => {
      const code = char.charCodeAt(0)
      if (code >= 0xAC00 && code <= 0xD7A3) {
        const index = Math.floor((code - 0xAC00) / 588)
        return initials[index]
      }
      return char
    }).join('')
  }

  // 한글 자동완성을 위한 유사도 계산
  static getSimilarity(query: string, target: string): number {
    const queryDisassembled = this.disassemble(query.toLowerCase())
    const targetDisassembled = this.disassemble(target.toLowerCase())
    
    // 초성 매칭 점수
    const queryInitials = this.getInitialConsonants(query)
    const targetInitials = this.getInitialConsonants(target)
    
    let score = 0
    
    // 완전 매칭
    if (target.toLowerCase().includes(query.toLowerCase())) {
      score += 100
    }
    
    // 분해된 한글 매칭
    if (targetDisassembled.includes(queryDisassembled)) {
      score += 80
    }
    
    // 초성 매칭
    if (targetInitials.includes(queryInitials)) {
      score += 60
    }
    
    // 부분 매칭
    const commonChars = query.split('').filter(char => target.includes(char)).length
    score += (commonChars / query.length) * 40
    
    return score
  }
}

// 통합 검색 엔진
export class UniversalSearchEngine {
  private fuseIndex: Fuse<SearchableItem>
  private flexSearchIndex: Index
  private items: SearchableItem[] = []

  constructor() {
    // Fuse.js 설정 (한국어 지원 강화)
    this.fuseIndex = new Fuse([], {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'content', weight: 0.3 },
        { name: 'description', weight: 0.2 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold: 0.3, // 더 관대한 매칭
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 1,
      ignoreLocation: true,
      useExtendedSearch: true
    })

    // FlexSearch 설정 (빠른 검색을 위한)
    this.flexSearchIndex = new Index({
      preset: 'match',
      tokenize: 'forward',
      resolution: 1
    })
  }

  // 데이터 인덱싱
  indexFolders(folders: FolderItem[]) {
    const items: SearchableItem[] = []
    
    const processFolders = (folderList: FolderItem[], parentPath = '') => {
      for (const folder of folderList) {
        const fullPath = parentPath ? `${parentPath} > ${folder.name}` : folder.name
        
        // 폴더 자체 인덱싱
        items.push({
          id: folder.id,
          name: folder.name,
          content: fullPath,
          type: 'folder',
          tags: [],
          description: `폴더: ${fullPath}`
        })

        // 폴더 내 아이템들 인덱싱
        folder.children.forEach(child => {
          if (child.type !== 'folder') {
            const item = child as StorageItem
            items.push({
              id: item.id,
              name: item.name,
              content: item.content,
              type: 'storage',
              tags: item.tags,
              folderId: folder.id,
              description: item.description || ''
            })
          }
        })

        // 하위 폴더 재귀 처리
        const subfolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
        if (subfolders.length > 0) {
          processFolders(subfolders, fullPath)
        }
      }
    }

    processFolders(folders)
    this.updateIndex(items)
  }

  // 공유 폴더 인덱싱
  indexSharedFolders(sharedFolders: SharedFolder[]) {
    const items: SearchableItem[] = sharedFolders.map(folder => ({
      id: folder.id,
      name: folder.title,
      content: folder.description,
      type: 'shared',
      category: folder.category,
      tags: folder.tags,
      description: folder.description
    }))

    this.updateIndex([...this.items, ...items])
  }

  private updateIndex(items: SearchableItem[]) {
    this.items = items
    
    // Fuse 인덱스 업데이트
    this.fuseIndex.setCollection(items)
    
    // FlexSearch 인덱스 업데이트
    items.forEach((item, index) => {
      const searchText = `${item.name} ${item.content} ${item.description || ''} ${item.tags.join(' ')}`
      this.flexSearchIndex.add(index, searchText)
    })
  }

  // 통합 검색 (한국어/영어 모두 지원)
  search(query: string, options: {
    type?: 'folder' | 'storage' | 'shared' | 'all'
    category?: string
    limit?: number
    useKoreanFeatures?: boolean
  } = {}): SearchableItem[] {
    if (!query.trim()) return []

    const {
      type = 'all',
      category,
      limit = 20,
      useKoreanFeatures = true
    } = options

    let results: SearchableItem[] = []

    // 한국어 특화 검색
    if (useKoreanFeatures && /[ㄱ-ㅎ가-힣]/.test(query)) {
      results = this.koreanSearch(query)
    } else {
      // 영어 또는 일반 검색
      results = this.generalSearch(query)
    }

    // 타입 필터링
    if (type !== 'all') {
      results = results.filter(item => item.type === type)
    }

    // 카테고리 필터링
    if (category) {
      results = results.filter(item => item.category === category)
    }

    // 결과 제한
    return results.slice(0, limit)
  }

  private koreanSearch(query: string): SearchableItem[] {
    const results: Array<{ item: SearchableItem; score: number }> = []

    // 1. Fuse.js 검색
    const fuseResults = this.fuseIndex.search(query)
    fuseResults.forEach(result => {
      if (result.item && result.score !== undefined) {
        results.push({ item: result.item, score: (1 - result.score) * 100 })
      }
    })

    // 2. 한국어 특화 검색 (초성, 분해 등)
    this.items.forEach(item => {
      const koreanScore = Math.max(
        KoreanTextProcessor.getSimilarity(query, item.name),
        KoreanTextProcessor.getSimilarity(query, item.content),
        KoreanTextProcessor.getSimilarity(query, item.description || '')
      )

      if (koreanScore > 30) {
        const existingIndex = results.findIndex(r => r.item.id === item.id)
        if (existingIndex >= 0) {
          // 기존 점수와 결합
          results[existingIndex].score = Math.max(results[existingIndex].score, koreanScore)
        } else {
          results.push({ item, score: koreanScore })
        }
      }
    })

    // 점수순으로 정렬하고 중복 제거
    return results
      .sort((a, b) => b.score - a.score)
      .map(r => r.item)
      .filter((item, index, array) => array.findIndex(i => i.id === item.id) === index)
  }

  private generalSearch(query: string): SearchableItem[] {
    const results: Array<{ item: SearchableItem; score: number }> = []

    // 1. FlexSearch (빠른 매칭)
    const flexResults = this.flexSearchIndex.search(query)
    flexResults.forEach(index => {
      if (typeof index === 'number' && this.items[index]) {
        results.push({ item: this.items[index], score: 90 })
      }
    })

    // 2. Fuse.js (정확한 매칭)
    const fuseResults = this.fuseIndex.search(query)
    fuseResults.forEach(result => {
      if (result.item && result.score !== undefined) {
        const existingIndex = results.findIndex(r => r.item.id === result.item.id)
        const score = (1 - result.score) * 100
        
        if (existingIndex >= 0) {
          results[existingIndex].score = Math.max(results[existingIndex].score, score)
        } else {
          results.push({ item: result.item, score })
        }
      }
    })

    // 점수순으로 정렬
    return results
      .sort((a, b) => b.score - a.score)
      .map(r => r.item)
  }

  // 자동완성 제안
  getSuggestions(query: string, limit = 5): string[] {
    if (!query.trim()) return []

    const suggestions = new Set<string>()

    this.items.forEach(item => {
      // 이름에서 제안
      if (item.name.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(item.name)
      }

      // 한국어의 경우 초성 매칭도 확인
      if (/[ㄱ-ㅎ가-힣]/.test(query)) {
        const similarity = KoreanTextProcessor.getSimilarity(query, item.name)
        if (similarity > 50) {
          suggestions.add(item.name)
        }
      }

      // 태그에서 제안
      item.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(tag)
        }
      })
    })

    return Array.from(suggestions).slice(0, limit)
  }

  // 인기 검색어 (향후 구현을 위한 준비)
  getPopularQueries(): string[] {
    // 실제로는 사용자 검색 로그를 분석해야 함
    return ['재테크', '패션', '레시피', '맛집', '육아', '투자']
  }

  // 검색 통계
  getStats() {
    return {
      totalItems: this.items.length,
      folders: this.items.filter(item => item.type === 'folder').length,
      storageItems: this.items.filter(item => item.type === 'storage').length,
      sharedFolders: this.items.filter(item => item.type === 'shared').length
    }
  }
}

// 전역 검색 엔진 인스턴스
export const searchEngine = new UniversalSearchEngine()