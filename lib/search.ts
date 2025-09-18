import { StandardsRegister } from '@/types'
import { normalizeString } from './utils'

// Search options
export interface SearchOptions {
  query: string
  fields?: string[]
  caseSensitive?: boolean
  exactMatch?: boolean
  fuzzyThreshold?: number
}

// Filter options
export interface FilterOptions {
  status?: string[]
  manufacturer?: string[]
  supplier?: string[]
  testGroup?: string[]
  materialType?: string[]
  storageCondition?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  expiryRange?: {
    start: Date
    end: Date
  }
  concentrationRange?: {
    min: number
    max: number
  }
  packingSizeRange?: {
    min: number
    max: number
  }
}

// Sort options
export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

// Search result
export interface SearchResult<T> {
  data: T[]
  total: number
  filtered: number
  query: string
  filters: FilterOptions
  sort: SortOptions
}

// Search manager class
class SearchManager {
  private data: StandardsRegister[] = []
  private searchIndex: Map<string, Set<number>> = new Map()
  private isIndexed: boolean = false

  // Set data to search
  setData(data: StandardsRegister[]): void {
    this.data = data
    this.isIndexed = false
    this.buildSearchIndex()
  }

  // Build search index
  private buildSearchIndex(): void {
    this.searchIndex.clear()
    
    this.data.forEach((item, index) => {
      // Index all searchable fields
      const searchableFields = [
        item.name,
        item.manufacturer,
        item.supplier,
        item.cas,
        item.lot,
        item.test_group,
        item.material_type,
        item.storage_condition
      ]

      searchableFields.forEach(field => {
        if (field) {
          const normalizedField = normalizeString(field)
          const words = normalizedField.split(/\s+/)
          
          words.forEach(word => {
            if (word.length > 1) { // Skip single characters
              if (!this.searchIndex.has(word)) {
                this.searchIndex.set(word, new Set())
              }
              this.searchIndex.get(word)!.add(index)
            }
          })
        }
      })
    })

    this.isIndexed = true
  }

  // Search data
  search(
    options: SearchOptions,
    filters: FilterOptions = {},
    sort: SortOptions = { field: 'name', direction: 'asc' }
  ): SearchResult<StandardsRegister> {
    let results = [...this.data]

    // Apply search query
    if (options.query) {
      results = this.applySearch(results, options)
    }

    // Apply filters
    results = this.applyFilters(results, filters)

    // Apply sorting
    results = this.applySorting(results, sort)

    return {
      data: results,
      total: this.data.length,
      filtered: results.length,
      query: options.query,
      filters,
      sort
    }
  }

  // Apply search query
  private applySearch(data: StandardsRegister[], options: SearchOptions): StandardsRegister[] {
    const query = options.caseSensitive ? options.query : normalizeString(options.query)
    const queryWords = query.split(/\s+/).filter(word => word.length > 1)

    if (queryWords.length === 0) return data

    return data.filter(item => {
      if (options.exactMatch) {
        return this.exactMatch(item, query, options.fields)
      } else {
        return this.fuzzyMatch(item, queryWords, options.fields, options.fuzzyThreshold)
      }
    })
  }

  // Exact match
  private exactMatch(item: StandardsRegister, query: string, fields?: string[]): boolean {
    const searchFields = fields || this.getSearchableFields()
    
    return searchFields.some(field => {
      const value = this.getFieldValue(item, field)
      if (!value) return false
      
      const normalizedValue = options.caseSensitive ? value : normalizeString(value)
      return normalizedValue === query
    })
  }

  // Fuzzy match
  private fuzzyMatch(
    item: StandardsRegister, 
    queryWords: string[], 
    fields?: string[],
    threshold: number = 0.8
  ): boolean {
    const searchFields = fields || this.getSearchableFields()
    
    return queryWords.every(queryWord => {
      return searchFields.some(field => {
        const value = this.getFieldValue(item, field)
        if (!value) return false
        
        const normalizedValue = normalizeString(value)
        const similarity = this.calculateSimilarity(queryWord, normalizedValue)
        return similarity >= threshold
      })
    })
  }

  // Calculate similarity between two strings
  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0
    
    const maxLen = Math.max(str1.length, str2.length)
    if (maxLen === 0) return 1.0
    
    const distance = this.levenshteinDistance(str1, str2)
    return 1 - (distance / maxLen)
  }

  // Levenshtein distance
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []
    const len1 = str1.length
    const len2 = str2.length

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[len2][len1]
  }

  // Apply filters
  private applyFilters(data: StandardsRegister[], filters: FilterOptions): StandardsRegister[] {
    return data.filter(item => {
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(item.status)) return false
      }

      // Manufacturer filter
      if (filters.manufacturer && filters.manufacturer.length > 0) {
        if (!filters.manufacturer.includes(item.manufacturer)) return false
      }

      // Supplier filter
      if (filters.supplier && filters.supplier.length > 0) {
        if (!filters.supplier.includes(item.supplier)) return false
      }

      // Test group filter
      if (filters.testGroup && filters.testGroup.length > 0) {
        if (!filters.testGroup.includes(item.test_group)) return false
      }

      // Material type filter
      if (filters.materialType && filters.materialType.length > 0) {
        if (!filters.materialType.includes(item.material_type)) return false
      }

      // Storage condition filter
      if (filters.storageCondition && filters.storageCondition.length > 0) {
        if (!filters.storageCondition.includes(item.storage_condition)) return false
      }

      // Date range filter
      if (filters.dateRange) {
        const itemDate = new Date(item.date_received)
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
          return false
        }
      }

      // Expiry range filter
      if (filters.expiryRange && item.lab_expiry_date) {
        const expiryDate = new Date(item.lab_expiry_date)
        if (expiryDate < filters.expiryRange.start || expiryDate > filters.expiryRange.end) {
          return false
        }
      }

      // Concentration range filter
      if (filters.concentrationRange && item.concentration) {
        const concentration = parseFloat(item.concentration.toString())
        if (concentration < filters.concentrationRange.min || concentration > filters.concentrationRange.max) {
          return false
        }
      }

      // Packing size range filter
      if (filters.packingSizeRange && item.packing_size) {
        const packingSize = parseFloat(item.packing_size.toString())
        if (packingSize < filters.packingSizeRange.min || packingSize > filters.packingSizeRange.max) {
          return false
        }
      }

      return true
    })
  }

  // Apply sorting
  private applySorting(data: StandardsRegister[], sort: SortOptions): StandardsRegister[] {
    return data.sort((a, b) => {
      const aValue = this.getFieldValue(a, sort.field)
      const bValue = this.getFieldValue(b, sort.field)
      
      if (aValue === bValue) return 0
      
      let comparison = 0
      if (aValue < bValue) comparison = -1
      else if (aValue > bValue) comparison = 1
      
      return sort.direction === 'desc' ? -comparison : comparison
    })
  }

  // Get field value
  private getFieldValue(item: StandardsRegister, field: string): any {
    const fieldMap: Record<string, keyof StandardsRegister> = {
      'name': 'name',
      'manufacturer': 'manufacturer',
      'supplier': 'supplier',
      'cas': 'cas',
      'lot': 'lot',
      'test_group': 'test_group',
      'material_type': 'material_type',
      'storage_condition': 'storage_condition',
      'status': 'status',
      'concentration': 'concentration',
      'packing_size': 'packing_size',
      'date_received': 'date_received',
      'lab_expiry_date': 'lab_expiry_date'
    }
    
    const mappedField = fieldMap[field] || field
    return item[mappedField]
  }

  // Get searchable fields
  private getSearchableFields(): string[] {
    return [
      'name',
      'manufacturer',
      'supplier',
      'cas',
      'lot',
      'test_group',
      'material_type',
      'storage_condition'
    ]
  }

  // Get filter options
  getFilterOptions(): FilterOptions {
    const statuses = [...new Set(this.data.map(item => item.status))]
    const manufacturers = [...new Set(this.data.map(item => item.manufacturer).filter(Boolean))]
    const suppliers = [...new Set(this.data.map(item => item.supplier).filter(Boolean))]
    const testGroups = [...new Set(this.data.map(item => item.test_group).filter(Boolean))]
    const materialTypes = [...new Set(this.data.map(item => item.material_type).filter(Boolean))]
    const storageConditions = [...new Set(this.data.map(item => item.storage_condition).filter(Boolean))]

    return {
      status: statuses,
      manufacturer: manufacturers,
      supplier: suppliers,
      testGroup: testGroups,
      materialType: materialTypes,
      storageCondition: storageConditions
    }
  }

  // Get search suggestions
  getSearchSuggestions(query: string, limit: number = 5): string[] {
    if (!this.isIndexed) return []
    
    const normalizedQuery = normalizeString(query)
    const suggestions: string[] = []
    
    // Find matching words in search index
    for (const [word, indices] of this.searchIndex.entries()) {
      if (word.startsWith(normalizedQuery) && word !== normalizedQuery) {
        // Get sample values for this word
        const sampleIndices = Array.from(indices).slice(0, 3)
        sampleIndices.forEach(index => {
          const item = this.data[index]
          if (item.name && !suggestions.includes(item.name)) {
            suggestions.push(item.name)
          }
        })
        
        if (suggestions.length >= limit) break
      }
    }
    
    return suggestions.slice(0, limit)
  }

  // Clear search index
  clearIndex(): void {
    this.searchIndex.clear()
    this.isIndexed = false
  }
}

// Create search manager instance
export const searchManager = new SearchManager()

// Search utilities
export const searchStandards = (
  data: StandardsRegister[],
  query: string,
  filters: FilterOptions = {},
  sort: SortOptions = { field: 'name', direction: 'asc' }
): SearchResult<StandardsRegister> => {
  searchManager.setData(data)
  return searchManager.search({ query }, filters, sort)
}

export const filterStandards = (
  data: StandardsRegister[],
  filters: FilterOptions,
  sort: SortOptions = { field: 'name', direction: 'asc' }
): SearchResult<StandardsRegister> => {
  searchManager.setData(data)
  return searchManager.search({ query: '' }, filters, sort)
}

export const sortStandards = (
  data: StandardsRegister[],
  sort: SortOptions
): StandardsRegister[] => {
  searchManager.setData(data)
  return searchManager.applySorting(data, sort)
}

// Advanced search functions
export const searchByCAS = (data: StandardsRegister[], cas: string): StandardsRegister[] => {
  return data.filter(item => item.cas === cas)
}

export const searchByManufacturer = (data: StandardsRegister[], manufacturer: string): StandardsRegister[] => {
  return data.filter(item => 
    normalizeString(item.manufacturer).includes(normalizeString(manufacturer))
  )
}

export const searchByStatus = (data: StandardsRegister[], status: string): StandardsRegister[] => {
  return data.filter(item => item.status === status)
}

export const searchExpiringSoon = (data: StandardsRegister[], days: number = 30): StandardsRegister[] => {
  const now = new Date()
  const warningDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))
  
  return data.filter(item => {
    if (!item.lab_expiry_date) return false
    const expiryDate = new Date(item.lab_expiry_date)
    return expiryDate <= warningDate && expiryDate > now
  })
}

export const searchExpired = (data: StandardsRegister[]): StandardsRegister[] => {
  const now = new Date()
  
  return data.filter(item => {
    if (!item.lab_expiry_date) return false
    const expiryDate = new Date(item.lab_expiry_date)
    return expiryDate < now
  })
}

// Search result utilities
export const getSearchStats = (result: SearchResult<StandardsRegister>) => {
  const statusCounts = result.data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const manufacturerCounts = result.data.reduce((acc, item) => {
    if (item.manufacturer) {
      acc[item.manufacturer] = (acc[item.manufacturer] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return {
    total: result.total,
    filtered: result.filtered,
    statusCounts,
    manufacturerCounts
  }
}

// Search history
export const saveSearchHistory = (query: string): void => {
  if (typeof window === 'undefined') return
  
  try {
    const history = JSON.parse(localStorage.getItem('search_history') || '[]')
    const newHistory = [query, ...history.filter((item: string) => item !== query)].slice(0, 10)
    localStorage.setItem('search_history', JSON.stringify(newHistory))
  } catch (error) {
    console.warn('Failed to save search history:', error)
  }
}

export const getSearchHistory = (): string[] => {
  if (typeof window === 'undefined') return []
  
  try {
    return JSON.parse(localStorage.getItem('search_history') || '[]')
  } catch (error) {
    console.warn('Failed to load search history:', error)
    return []
  }
}

export const clearSearchHistory = (): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('search_history')
  } catch (error) {
    console.warn('Failed to clear search history:', error)
  }
}
