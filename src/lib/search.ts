// Advanced Search Engine for Koouk
import { Content, Folder, SearchResult } from '@/types/core'

export class SearchEngine {
  private static instance: SearchEngine
  private folderIndex: Map<string, Folder> = new Map()
  private contentIndex: Map<string, Content> = new Map()
  private wordIndex: Map<string, Set<string>> = new Map()

  static getInstance(): SearchEngine {
    if (!SearchEngine.instance) {
      SearchEngine.instance = new SearchEngine()
    }
    return SearchEngine.instance
  }

  // Index folders for search
  indexFolders(folders: Folder[]) {
    this.folderIndex.clear()
    
    folders.forEach(folder => {
      this.folderIndex.set(folder.id, folder)
      this.addToWordIndex(folder.id, folder.name, 'folder')
      if (folder.description) {
        this.addToWordIndex(folder.id, folder.description, 'folder')
      }
    })
  }

  // Index content for search
  indexContent(contents: Content[]) {
    this.contentIndex.clear()
    
    contents.forEach(content => {
      this.contentIndex.set(content.id, content)
      this.addToWordIndex(content.id, content.title, 'content')
      this.addToWordIndex(content.id, content.body, 'content')
      
      // Index metadata tags
      if (content.metadata?.tags) {
        content.metadata.tags.forEach(tag => {
          this.addToWordIndex(content.id, tag, 'content')
        })
      }
    })
  }

  // Add words to index
  private addToWordIndex(id: string, text: string, type: string) {
    const words = this.tokenize(text)
    
    words.forEach(word => {
      const key = `${type}:${word}`
      if (!this.wordIndex.has(key)) {
        this.wordIndex.set(key, new Set())
      }
      this.wordIndex.get(key)!.add(id)
    })
  }

  // Tokenize text for indexing
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1)
  }

  // Main search function
  search(query: string, options: {
    folderId?: string
    type?: 'content' | 'folder' | 'all'
    limit?: number
  } = {}): SearchResult[] {
    if (!query.trim()) return []

    const { folderId, type = 'all', limit = 20 } = options
    const results: SearchResult[] = []
    const queryWords = this.tokenize(query)

    // Search content
    if (type === 'all' || type === 'content') {
      const contentResults = this.searchContent(queryWords, folderId)
      results.push(...contentResults)
    }

    // Search folders
    if (type === 'all' || type === 'folder') {
      const folderResults = this.searchFolders(queryWords)
      results.push(...folderResults)
    }

    // Sort by relevance and limit results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit)
  }

  // Search content items
  private searchContent(queryWords: string[], folderId?: string): SearchResult[] {
    const results: SearchResult[] = []
    const matchedIds = new Set<string>()

    // Find matching content IDs
    queryWords.forEach(word => {
      const key = `content:${word}`
      const ids = this.wordIndex.get(key)
      if (ids) {
        ids.forEach(id => matchedIds.add(id))
      }
    })

    // Create search results
    matchedIds.forEach(id => {
      const content = this.contentIndex.get(id)
      if (!content) return
      
      // Filter by folder if specified
      if (folderId && content.folderId !== folderId) return

      const relevance = this.calculateRelevance(content, queryWords)
      const snippet = this.generateSnippet(content.body, queryWords)

      results.push({
        id: content.id,
        title: content.title,
        snippet,
        type: 'content',
        folderId: content.folderId,
        relevance
      })
    })

    return results
  }

  // Search folders
  private searchFolders(queryWords: string[]): SearchResult[] {
    const results: SearchResult[] = []
    const matchedIds = new Set<string>()

    // Find matching folder IDs
    queryWords.forEach(word => {
      const key = `folder:${word}`
      const ids = this.wordIndex.get(key)
      if (ids) {
        ids.forEach(id => matchedIds.add(id))
      }
    })

    // Create search results
    matchedIds.forEach(id => {
      const folder = this.folderIndex.get(id)
      if (!folder) return

      const relevance = this.calculateFolderRelevance(folder, queryWords)
      const snippet = folder.description || `Folder: ${folder.name}`

      results.push({
        id: folder.id,
        title: folder.name,
        snippet,
        type: 'folder',
        relevance
      })
    })

    return results
  }

  // Calculate content relevance score
  private calculateRelevance(content: Content, queryWords: string[]): number {
    let score = 0
    const titleWords = this.tokenize(content.title)
    const bodyWords = this.tokenize(content.body)

    queryWords.forEach(word => {
      // Title matches get higher score
      if (titleWords.includes(word)) {
        score += 10
      }
      
      // Body matches
      const bodyMatches = bodyWords.filter(w => w.includes(word)).length
      score += bodyMatches * 2

      // Exact matches get bonus
      if (content.title.toLowerCase().includes(word)) {
        score += 5
      }
    })

    return score
  }

  // Calculate folder relevance score
  private calculateFolderRelevance(folder: Folder, queryWords: string[]): number {
    let score = 0
    const nameWords = this.tokenize(folder.name)
    const descWords = folder.description ? this.tokenize(folder.description) : []

    queryWords.forEach(word => {
      if (nameWords.includes(word)) {
        score += 15
      }
      if (descWords.includes(word)) {
        score += 5
      }
    })

    return score
  }

  // Generate search snippet
  private generateSnippet(text: string, queryWords: string[], maxLength = 150): string {
    const words = text.split(/\s+/)
    const querySet = new Set(queryWords.map(w => w.toLowerCase()))
    
    // Find the first occurrence of any query word
    let startIndex = 0
    for (let i = 0; i < words.length; i++) {
      if (querySet.has(words[i].toLowerCase())) {
        startIndex = Math.max(0, i - 10)
        break
      }
    }

    // Extract snippet
    const snippetWords = words.slice(startIndex, startIndex + 25)
    let snippet = snippetWords.join(' ')
    
    // Truncate if too long
    if (snippet.length > maxLength) {
      snippet = snippet.substring(0, maxLength) + '...'
    }

    return snippet
  }

  // Get search suggestions
  getSuggestions(query: string, limit = 5): string[] {
    const suggestions: string[] = []
    const words = this.tokenize(query)
    const lastWord = words[words.length - 1] || ''

    // Find words that start with the last query word
    this.wordIndex.forEach((_, key) => {
      const word = key.split(':')[1]
      if (word && word.startsWith(lastWord) && word !== lastWord) {
        const suggestion = [...words.slice(0, -1), word].join(' ')
        if (!suggestions.includes(suggestion)) {
          suggestions.push(suggestion)
        }
      }
    })

    return suggestions.slice(0, limit)
  }
}

// Export singleton instance
export const searchEngine = SearchEngine.getInstance()