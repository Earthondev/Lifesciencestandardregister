import React from 'react'
import { PAGINATION } from './constants'

// Pagination options
export interface PaginationOptions {
  page: number
  limit: number
  total: number
}

// Pagination info
export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: number | null
  previousPage: number | null
}

// Paginated data
export interface PaginatedData<T> {
  data: T[]
  pagination: PaginationInfo
}

// Pagination manager class
class PaginationManager {
  private options: PaginationOptions

  constructor(options: PaginationOptions) {
    this.options = options
  }

  // Get pagination info
  getPaginationInfo(): PaginationInfo {
    const { page, limit, total } = this.options
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = Math.min(startIndex + limit - 1, total - 1)
    
    return {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      startIndex,
      endIndex,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null
    }
  }

  // Get page data
  getPageData<T>(data: T[]): T[] {
    const { startIndex, endIndex } = this.getPaginationInfo()
    return data.slice(startIndex, endIndex + 1)
  }

  // Get paginated data
  getPaginatedData<T>(data: T[]): PaginatedData<T> {
    return {
      data: this.getPageData(data),
      pagination: this.getPaginationInfo()
    }
  }

  // Update pagination options
  updateOptions(options: Partial<PaginationOptions>): void {
    this.options = { ...this.options, ...options }
  }

  // Go to specific page
  goToPage(page: number): void {
    const maxPage = Math.ceil(this.options.total / this.options.limit)
    const validPage = Math.max(1, Math.min(page, maxPage))
    this.options.page = validPage
  }

  // Go to next page
  goToNextPage(): void {
    const { hasNextPage, nextPage } = this.getPaginationInfo()
    if (hasNextPage && nextPage) {
      this.goToPage(nextPage)
    }
  }

  // Go to previous page
  goToPreviousPage(): void {
    const { hasPreviousPage, previousPage } = this.getPaginationInfo()
    if (hasPreviousPage && previousPage) {
      this.goToPage(previousPage)
    }
  }

  // Go to first page
  goToFirstPage(): void {
    this.goToPage(1)
  }

  // Go to last page
  goToLastPage(): void {
    const { totalPages } = this.getPaginationInfo()
    this.goToPage(totalPages)
  }

  // Change page size
  changePageSize(newLimit: number): void {
    const { currentPage, totalItems } = this.getPaginationInfo()
    const maxPage = Math.ceil(totalItems / newLimit)
    const validPage = Math.min(currentPage, maxPage)
    
    this.options.limit = newLimit
    this.options.page = validPage
  }

  // Get page numbers for pagination UI
  getPageNumbers(maxVisible: number = 5): number[] {
    const { currentPage, totalPages } = this.getPaginationInfo()
    const pages: number[] = []
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show pages around current page
      const halfVisible = Math.floor(maxVisible / 2)
      let startPage = Math.max(1, currentPage - halfVisible)
      let endPage = Math.min(totalPages, startPage + maxVisible - 1)
      
      // Adjust if we're near the end
      if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1)
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  // Get page size options
  getPageSizeOptions(): number[] {
    return PAGINATION.PAGE_SIZE_OPTIONS
  }

  // Validate page number
  isValidPage(page: number): boolean {
    const { totalPages } = this.getPaginationInfo()
    return page >= 1 && page <= totalPages
  }

  // Get offset for API calls
  getOffset(): number {
    return (this.options.page - 1) * this.options.limit
  }

  // Get limit for API calls
  getLimit(): number {
    return this.options.limit
  }
}

// Create pagination manager
export const createPagination = (options: PaginationOptions): PaginationManager => {
  return new PaginationManager(options)
}

// Pagination utilities
export const paginateData = <T>(
  data: T[],
  page: number = 1,
  limit: number = PAGINATION.DEFAULT_PAGE_SIZE
): PaginatedData<T> => {
  const pagination = createPagination({
    page,
    limit,
    total: data.length
  })
  
  return pagination.getPaginatedData(data)
}

export const getPaginationInfo = (
  page: number,
  limit: number,
  total: number
): PaginationInfo => {
  const pagination = createPagination({ page, limit, total })
  return pagination.getPaginationInfo()
}

export const validatePaginationOptions = (
  page: number,
  limit: number,
  total: number
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (page < 1) {
    errors.push('Page number must be greater than 0')
  }
  
  if (limit < 1) {
    errors.push('Page size must be greater than 0')
  }
  
  if (limit > PAGINATION.MAX_PAGE_SIZE) {
    errors.push(`Page size must not exceed ${PAGINATION.MAX_PAGE_SIZE}`)
  }
  
  if (total < 0) {
    errors.push('Total items must not be negative')
  }
  
  const maxPage = Math.ceil(total / limit)
  if (page > maxPage && total > 0) {
    errors.push(`Page number must not exceed ${maxPage}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Pagination hooks for React
export const usePagination = (
  totalItems: number,
  initialPage: number = 1,
  initialLimit: number = PAGINATION.DEFAULT_PAGE_SIZE
) => {
  const [page, setPage] = React.useState(initialPage)
  const [limit, setLimit] = React.useState(initialLimit)
  
  const pagination = React.useMemo(() => {
    return createPagination({ page, limit, total: totalItems })
  }, [page, limit, totalItems])
  
  const paginationInfo = pagination.getPaginationInfo()
  
  const goToPage = React.useCallback((newPage: number) => {
    pagination.goToPage(newPage)
    setPage(pagination.options.page)
  }, [pagination])
  
  const goToNextPage = React.useCallback(() => {
    pagination.goToNextPage()
    setPage(pagination.options.page)
  }, [pagination])
  
  const goToPreviousPage = React.useCallback(() => {
    pagination.goToPreviousPage()
    setPage(pagination.options.page)
  }, [pagination])
  
  const goToFirstPage = React.useCallback(() => {
    pagination.goToFirstPage()
    setPage(pagination.options.page)
  }, [pagination])
  
  const goToLastPage = React.useCallback(() => {
    pagination.goToLastPage()
    setPage(pagination.options.page)
  }, [pagination])
  
  const changePageSize = React.useCallback((newLimit: number) => {
    pagination.changePageSize(newLimit)
    setPage(pagination.options.page)
    setLimit(pagination.options.limit)
  }, [pagination])
  
  const resetPagination = React.useCallback(() => {
    setPage(1)
    setLimit(initialLimit)
  }, [initialLimit])
  
  return {
    page,
    limit,
    paginationInfo,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    resetPagination,
    getPageNumbers: pagination.getPageNumbers.bind(pagination),
    getPageSizeOptions: pagination.getPageSizeOptions.bind(pagination)
  }
}

// Pagination component props
export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSize?: number
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
  showFirstLastButtons?: boolean
  showPreviousNextButtons?: boolean
  maxVisiblePages?: number
  className?: string
}

// Pagination utilities for UI
export const getPaginationText = (paginationInfo: PaginationInfo): string => {
  const { startIndex, endIndex, totalItems } = paginationInfo
  return `แสดง ${startIndex + 1}-${endIndex + 1} จาก ${totalItems} รายการ`
}

export const getPageSizeText = (pageSize: number): string => {
  return `แสดง ${pageSize} รายการต่อหน้า`
}

export const getPageText = (page: number, totalPages: number): string => {
  return `หน้า ${page} จาก ${totalPages}`
}

// Pagination validation
export const sanitizePaginationOptions = (
  page: number,
  limit: number,
  total: number
): { page: number; limit: number } => {
  const sanitizedLimit = Math.max(1, Math.min(limit, PAGINATION.MAX_PAGE_SIZE))
  const maxPage = Math.ceil(total / sanitizedLimit)
  const sanitizedPage = Math.max(1, Math.min(page, maxPage))
  
  return {
    page: sanitizedPage,
    limit: sanitizedLimit
  }
}

// Pagination for API calls
export const getApiPaginationParams = (
  page: number,
  limit: number
): { offset: number; limit: number } => {
  return {
    offset: (page - 1) * limit,
    limit
  }
}

// Pagination for database queries
export const getDbPaginationParams = (
  page: number,
  limit: number
): { skip: number; take: number } => {
  return {
    skip: (page - 1) * limit,
    take: limit
  }
}

// Pagination for search results
export const paginateSearchResults = <T>(
  results: T[],
  page: number,
  limit: number
): PaginatedData<T> => {
  return paginateData(results, page, limit)
}

// Pagination for filtered data
export const paginateFilteredData = <T>(
  data: T[],
  filters: any,
  page: number,
  limit: number
): PaginatedData<T> => {
  // Apply filters first, then paginate
  const filteredData = data // This would be filtered based on filters
  return paginateData(filteredData, page, limit)
}
