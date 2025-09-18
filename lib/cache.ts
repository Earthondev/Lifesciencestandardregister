import { STORAGE_KEYS } from './constants'

// Cache interface
interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

// Cache manager class
class CacheManager {
  private memoryCache: Map<string, CacheItem<any>> = new Map()
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutes

  // Set cache item
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiry = now + (ttl || this.defaultTTL)
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiry
    }
    
    this.memoryCache.set(key, cacheItem)
    
    // Also store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem))
      } catch (error) {
        console.warn('Failed to store cache in localStorage:', error)
      }
    }
  }

  // Get cache item
  get<T>(key: string): T | null {
    // Try memory cache first
    const memoryItem = this.memoryCache.get(key)
    if (memoryItem && memoryItem.expiry > Date.now()) {
      return memoryItem.data
    }
    
    // Try localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`cache_${key}`)
        if (stored) {
          const cacheItem: CacheItem<T> = JSON.parse(stored)
          if (cacheItem.expiry > Date.now()) {
            // Restore to memory cache
            this.memoryCache.set(key, cacheItem)
            return cacheItem.data
          } else {
            // Remove expired item
            localStorage.removeItem(`cache_${key}`)
          }
        }
      } catch (error) {
        console.warn('Failed to retrieve cache from localStorage:', error)
      }
    }
    
    // Remove expired item from memory
    if (memoryItem) {
      this.memoryCache.delete(key)
    }
    
    return null
  }

  // Check if cache exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Remove cache item
  remove(key: string): void {
    this.memoryCache.delete(key)
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`cache_${key}`)
      } catch (error) {
        console.warn('Failed to remove cache from localStorage:', error)
      }
    }
  }

  // Clear all cache
  clear(): void {
    this.memoryCache.clear()
    
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.warn('Failed to clear cache from localStorage:', error)
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys())
    }
  }

  // Clean expired items
  cleanExpired(): void {
    const now = Date.now()
    
    // Clean memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiry <= now) {
        this.memoryCache.delete(key)
      }
    }
    
    // Clean localStorage
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            const stored = localStorage.getItem(key)
            if (stored) {
              try {
                const cacheItem: CacheItem<any> = JSON.parse(stored)
                if (cacheItem.expiry <= now) {
                  localStorage.removeItem(key)
                }
              } catch (error) {
                // Remove corrupted cache
                localStorage.removeItem(key)
              }
            }
          }
        })
      } catch (error) {
        console.warn('Failed to clean expired cache:', error)
      }
    }
  }
}

// Create cache manager instance
export const cacheManager = new CacheManager()

// Cache keys
export const CACHE_KEYS = {
  STATISTICS: 'statistics',
  STANDARDS: 'standards',
  STANDARD_DETAIL: 'standard_detail',
  STATUS_LOG: 'status_log',
  ID_MASTER: 'id_master',
  RECENT_ACTIVITY: 'recent_activity',
  CONFIG: 'config',
  HOLIDAYS: 'holidays',
  SIMILAR_NAMES: 'similar_names',
  CAS_LOOKUP: 'cas_lookup'
} as const

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  STATISTICS: 2 * 60 * 1000, // 2 minutes
  STANDARDS: 5 * 60 * 1000, // 5 minutes
  STANDARD_DETAIL: 10 * 60 * 1000, // 10 minutes
  STATUS_LOG: 1 * 60 * 1000, // 1 minute
  ID_MASTER: 30 * 60 * 1000, // 30 minutes
  RECENT_ACTIVITY: 1 * 60 * 1000, // 1 minute
  CONFIG: 60 * 60 * 1000, // 1 hour
  HOLIDAYS: 24 * 60 * 60 * 1000, // 24 hours
  SIMILAR_NAMES: 60 * 60 * 1000, // 1 hour
  CAS_LOOKUP: 24 * 60 * 60 * 1000 // 24 hours
} as const

// Cache utilities
export const getCachedData = <T>(key: string): T | null => {
  return cacheManager.get<T>(key)
}

export const setCachedData = <T>(key: string, data: T, ttl?: number): void => {
  cacheManager.set(key, data, ttl)
}

export const invalidateCache = (key: string): void => {
  cacheManager.remove(key)
}

export const invalidateAllCache = (): void => {
  cacheManager.clear()
}

// Cache-aware data fetching
export const fetchWithCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  // Try to get from cache first
  const cached = getCachedData<T>(key)
  if (cached !== null) {
    return cached
  }
  
  // Fetch fresh data
  const data = await fetchFn()
  
  // Cache the result
  setCachedData(key, data, ttl)
  
  return data
}

// Cache invalidation strategies
export const invalidateRelatedCache = (baseKey: string): void => {
  const relatedKeys = [
    `${baseKey}_list`,
    `${baseKey}_detail`,
    `${baseKey}_stats`
  ]
  
  relatedKeys.forEach(key => {
    invalidateCache(key)
  })
}

// Cache warming utilities
export const warmCache = async (): Promise<void> => {
  try {
    // Pre-load frequently accessed data
    const promises = [
      // Add your cache warming logic here
      // Example: fetchWithCache(CACHE_KEYS.STATISTICS, () => apiClient.getStatistics(), CACHE_TTL.STATISTICS)
    ]
    
    await Promise.allSettled(promises)
  } catch (error) {
    console.warn('Cache warming failed:', error)
  }
}

// Cache monitoring
export const getCacheInfo = () => {
  const stats = cacheManager.getStats()
  const memoryUsage = typeof window !== 'undefined' ? 
    (performance as any).memory?.usedJSHeapSize || 0 : 0
  
  return {
    ...stats,
    memoryUsage,
    timestamp: new Date().toISOString()
  }
}

// Auto-cleanup expired cache
if (typeof window !== 'undefined') {
  // Clean expired cache every 5 minutes
  setInterval(() => {
    cacheManager.cleanExpired()
  }, 5 * 60 * 1000)
  
  // Clean expired cache on page load
  cacheManager.cleanExpired()
}

// Cache persistence utilities
export const exportCache = (): string => {
  const cacheData: Record<string, any> = {}
  
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        const data = localStorage.getItem(key)
        if (data) {
          cacheData[key] = JSON.parse(data)
        }
      }
    })
  }
  
  return JSON.stringify(cacheData, null, 2)
}

export const importCache = (cacheData: string): void => {
  try {
    const data = JSON.parse(cacheData)
    
    if (typeof window !== 'undefined') {
      Object.keys(data).forEach(key => {
        localStorage.setItem(key, JSON.stringify(data[key]))
      })
    }
  } catch (error) {
    console.error('Failed to import cache:', error)
  }
}
