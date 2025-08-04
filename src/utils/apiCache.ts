interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  force?: boolean // Force refresh ignoring cache
}

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private maxEntries = 100 // Prevent memory leaks

  /**
   * Get cached data or fetch new data
   * @param key - Unique cache key
   * @param fetcher - Function to fetch fresh data
   * @param options - Cache options
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl = 15 * 60 * 1000, force = false } = options // Default 15 minutes TTL

    // Check if we should use cached data
    if (!force && this.cache.has(key)) {
      const entry = this.cache.get(key)!
      if (Date.now() < entry.expiresAt) {
        console.log(`📦 Cache HIT for key: ${key}`)
        return entry.data as T
      } else {
        console.log(`⏰ Cache EXPIRED for key: ${key}`)
        this.cache.delete(key)
      }
    }

    console.log(`🌐 Cache MISS for key: ${key}, fetching fresh data...`)

    try {
      // Fetch fresh data
      const data = await fetcher()
      
      // Store in cache
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      }
      
      // Clean up old entries if we're approaching the limit
      if (this.cache.size >= this.maxEntries) {
        this.cleanup()
      }
      
      this.cache.set(key, entry)
      console.log(`💾 Cached data for key: ${key} (TTL: ${ttl}ms)`)
      
      return data
    } catch (error) {
      console.error(`❌ Failed to fetch data for key: ${key}`, error)
      
      // Try to return stale data if available
      if (this.cache.has(key)) {
        const staleEntry = this.cache.get(key)!
        console.log(`🥴 Returning STALE data for key: ${key}`)
        return staleEntry.data as T
      }
      
      throw error
    }
  }

  /**
   * Manually set cache entry
   */
  set<T>(key: string, data: T, ttl: number = 15 * 60 * 1000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    }
    
    this.cache.set(key, entry)
    console.log(`💾 Manually cached data for key: ${key}`)
  }

  /**
   * Remove specific cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      console.log(`🗑️ Deleted cache entry for key: ${key}`)
    }
    return deleted
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    console.log('🧹 Cleared all cache entries')
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      size: JSON.stringify(entry.data).length,
      age: Date.now() - entry.timestamp,
      ttl: entry.expiresAt - Date.now(),
      expired: Date.now() > entry.expiresAt
    }))

    return {
      totalEntries: this.cache.size,
      maxEntries: this.maxEntries,
      entries
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        cleaned++
      }
    }
    
    // If still too many entries, remove oldest ones
    if (this.cache.size >= this.maxEntries) {
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      
      const toRemove = entries.slice(0, Math.floor(this.maxEntries * 0.2)) // Remove oldest 20%
      toRemove.forEach(([key]) => this.cache.delete(key))
      cleaned += toRemove.length
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} cache entries`)
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    if (!this.cache.has(key)) return false
    
    const entry = this.cache.get(key)!
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  /**
   * Get cache entry info without returning data
   */
  getInfo(key: string) {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    return {
      key,
      timestamp: entry.timestamp,
      expiresAt: entry.expiresAt,
      age: Date.now() - entry.timestamp,
      ttl: entry.expiresAt - Date.now(),
      expired: Date.now() > entry.expiresAt,
      size: JSON.stringify(entry.data).length
    }
  }
}

// Global cache instance
export const apiCache = new APICache()

// Utility functions for specific data types
export const cacheKeys = {
  news: (region: string) => `news_${region}`,
  weather: (location: string) => `weather_${location}`,
  market: (symbol: string) => `market_${symbol}`,
  marketOverview: () => 'market_overview',
  music: (genre?: string) => `music_${genre || 'general'}`,
} as const

// Pre-configured cache functions
export const cachedFetch = {
  /**
   * Cache news data for 10 minutes
   */
  news: <T>(key: string, fetcher: () => Promise<T>, force = false) =>
    apiCache.get(key, fetcher, { ttl: 10 * 60 * 1000, force }),

  /**
   * Cache weather data for 15 minutes
   */
  weather: <T>(key: string, fetcher: () => Promise<T>, force = false) =>
    apiCache.get(key, fetcher, { ttl: 15 * 60 * 1000, force }),

  /**
   * Cache market data for 1 minute (for real-time feel)
   */
  market: <T>(key: string, fetcher: () => Promise<T>, force = false) =>
    apiCache.get(key, fetcher, { ttl: 1 * 60 * 1000, force }),

  /**
   * Cache music recommendations for 1 hour
   */
  music: <T>(key: string, fetcher: () => Promise<T>, force = false) =>
    apiCache.get(key, fetcher, { ttl: 60 * 60 * 1000, force }),

  /**
   * Generic cached fetch with custom TTL
   */
  generic: <T>(key: string, fetcher: () => Promise<T>, ttl: number, force = false) =>
    apiCache.get(key, fetcher, { ttl, force })
}

// Development helper to inspect cache
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  interface WindowWithDebug {
    apiCache: APICache
    cacheStats: () => void
  }
  ;(window as unknown as WindowWithDebug).apiCache = apiCache
  ;(window as unknown as WindowWithDebug).cacheStats = () => console.table(apiCache.getStats().entries)
}