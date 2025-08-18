// Optimized search library for English-only content
import { FolderItem } from '@/types/folder'
import { SharedFolder } from '@/types/share'

// Search index type definition
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

// English text processing utility
class EnglishTextProcessor {
  // Simple text normalization
  static normalize(text: string): string {
    return text.toLowerCase().trim()
  }

  // Calculate similarity score for search results
  static getSimilarity(query: string, target: string): number {
    const normalizedQuery = this.normalize(query)
    const normalizedTarget = this.normalize(target)
    
    let score = 0
    
    // Exact match
    if (normalizedTarget.includes(normalizedQuery)) {
      score += 100
    }
    
    // Word boundary match
    const queryWords = normalizedQuery.split(' ')
    const targetWords = normalizedTarget.split(' ')
    
    queryWords.forEach(queryWord => {
      targetWords.forEach(targetWord => {
        if (targetWord.startsWith(queryWord)) {
          score += 50
        } else if (targetWord.includes(queryWord)) {
          score += 25
        }
      })
    })
    
    // Tag matching
    return score
  }

  // Check if query matches target text
  static matches(query: string, target: string): boolean {
    const normalizedQuery = this.normalize(query)
    const normalizedTarget = this.normalize(target)
    
    // Split query into words
    const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0)
    
    // Check if all query words are found in target
    return queryWords.every(word => 
      normalizedTarget.includes(word)
    )
  }
}

// Universal search engine for English content
class UniversalSearchEngine {
  private searchIndex: SearchableItem[] = []

  // Update search index with folders and items
  updateIndex(folders: FolderItem[], sharedFolders: SharedFolder[] = []) {
    this.searchIndex = []
    
    // Index folders recursively
    this.indexFolders(folders)
    
    // Index shared folders
    sharedFolders.forEach(folder => {
      this.searchIndex.push({
        id: folder.id,
        name: folder.title,
        content: '',
        type: 'shared',
        category: folder.category,
        tags: folder.tags || [],
        description: folder.description
      })
    })
  }

  private indexFolders(folders: FolderItem[]) {
    folders.forEach(folder => {
      // Index folder itself
      this.searchIndex.push({
        id: folder.id,
        name: folder.name,
        content: '',
        type: 'folder',
        tags: [],
        folderId: folder.parentId
      })

      // Index folder contents
      folder.children.forEach(item => {
        if (item.type !== 'folder') {
          this.searchIndex.push({
            id: item.id,
            name: item.name,
            content: item.content || '',
            type: 'storage',
            tags: item.tags || [],
            folderId: folder.id
          })
        }
      })

      // Recursively index subfolders
      const subfolders = folder.children.filter(child => child.type === 'folder') as FolderItem[]
      if (subfolders.length > 0) {
        this.indexFolders(subfolders)
      }
    })
  }

  // Search with query
  search(query: string, options: {
    type?: 'folder' | 'storage' | 'shared'
    category?: string
    limit?: number
  } = {}): SearchableItem[] {
    if (!query.trim()) return []

    const { type, category, limit = 50 } = options
    
    let results = this.searchIndex.filter(item => {
      // Type filter
      if (type && item.type !== type) return false
      
      // Category filter
      if (category && item.category !== category) return false
      
      // Text matching
      const searchText = `${item.name} ${item.content} ${item.tags.join(' ')}`
      return EnglishTextProcessor.matches(query, searchText)
    })

    // Sort by relevance score
    const scoredResults = results.map(item => ({
      ...item,
      score: EnglishTextProcessor.getSimilarity(query, `${item.name} ${item.content}`)
    }))
    
    scoredResults.sort((a, b) => b.score - a.score)
    results = scoredResults

    return results.slice(0, limit)
  }

  // Get search suggestions
  getSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim()) return []

    const suggestions = new Set<string>()
    
    this.searchIndex.forEach(item => {
      const words = `${item.name} ${item.content}`.toLowerCase().split(/\s+/)
      words.forEach(word => {
        if (word.startsWith(query.toLowerCase()) && word !== query.toLowerCase()) {
          suggestions.add(word)
        }
      })
    })

    return Array.from(suggestions).slice(0, limit)
  }

  // Get popular queries (placeholder implementation)
  getPopularQueries(): string[] {
    // Return some common search terms as placeholders
    return ['documents', 'notes', 'images', 'bookmarks', 'folders']
  }
}

// Export singleton instance
export const searchEngine = new UniversalSearchEngine()
export { EnglishTextProcessor }
export type { SearchableItem }