import { VALIDATION_RULES } from './constants'

// Sanitization options
export interface SanitizeOptions {
  trim?: boolean
  removeExtraSpaces?: boolean
  toLowerCase?: boolean
  toUpperCase?: boolean
  removeSpecialChars?: boolean
  allowSpecialChars?: string[]
  maxLength?: number
  minLength?: number
}

// Sanitization result
export interface SanitizeResult {
  value: string
  originalValue: string
  changes: string[]
}

// Sanitization manager class
class SanitizationManager {
  // Sanitize string
  sanitizeString(
    value: string,
    options: SanitizeOptions = {}
  ): SanitizeResult {
    const changes: string[] = []
    let sanitized = value

    // Trim whitespace
    if (options.trim !== false) {
      const trimmed = sanitized.trim()
      if (trimmed !== sanitized) {
        changes.push('trimmed whitespace')
        sanitized = trimmed
      }
    }

    // Remove extra spaces
    if (options.removeExtraSpaces !== false) {
      const normalized = sanitized.replace(/\s+/g, ' ')
      if (normalized !== sanitized) {
        changes.push('removed extra spaces')
        sanitized = normalized
      }
    }

    // Convert to lowercase
    if (options.toLowerCase) {
      const lowercased = sanitized.toLowerCase()
      if (lowercased !== sanitized) {
        changes.push('converted to lowercase')
        sanitized = lowercased
      }
    }

    // Convert to uppercase
    if (options.toUpperCase) {
      const uppercased = sanitized.toUpperCase()
      if (uppercased !== sanitized) {
        changes.push('converted to uppercase')
        sanitized = uppercased
      }
    }

    // Remove special characters
    if (options.removeSpecialChars) {
      const allowedChars = options.allowSpecialChars || []
      const pattern = new RegExp(`[^a-zA-Z0-9\\s${allowedChars.join('')}]`, 'g')
      const cleaned = sanitized.replace(pattern, '')
      if (cleaned !== sanitized) {
        changes.push('removed special characters')
        sanitized = cleaned
      }
    }

    // Truncate if too long
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength)
      changes.push(`truncated to ${options.maxLength} characters`)
    }

    // Pad if too short
    if (options.minLength && sanitized.length < options.minLength) {
      sanitized = sanitized.padEnd(options.minLength, ' ')
      changes.push(`padded to ${options.minLength} characters`)
    }

    return {
      value: sanitized,
      originalValue: value,
      changes
    }
  }

  // Sanitize number
  sanitizeNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null
    }

    const num = typeof value === 'string' ? parseFloat(value) : Number(value)
    
    if (isNaN(num)) {
      return null
    }

    return num
  }

  // Sanitize date
  sanitizeDate(value: any): Date | null {
    if (value === null || value === undefined || value === '') {
      return null
    }

    const date = new Date(value)
    
    if (isNaN(date.getTime())) {
      return null
    }

    return date
  }

  // Sanitize email
  sanitizeEmail(value: string): string {
    const result = this.sanitizeString(value, {
      trim: true,
      removeExtraSpaces: true,
      toLowerCase: true
    })

    // Remove any characters that aren't valid in email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailPattern.test(result.value)) {
      return ''
    }

    return result.value
  }

  // Sanitize CAS number
  sanitizeCAS(value: string): string {
    const result = this.sanitizeString(value, {
      trim: true,
      removeExtraSpaces: true,
      removeSpecialChars: true,
      allowSpecialChars: ['-']
    })

    // Validate CAS format
    const casPattern = /^\d{2,7}-\d{2}-\d$/
    if (!casPattern.test(result.value)) {
      return ''
    }

    return result.value
  }

  // Sanitize phone number
  sanitizePhone(value: string): string {
    const result = this.sanitizeString(value, {
      trim: true,
      removeExtraSpaces: true,
      removeSpecialChars: true,
      allowSpecialChars: ['-', '+', '(', ')', ' ']
    })

    // Remove all non-digit characters except + at the beginning
    let cleaned = result.value.replace(/[^\d+]/g, '')
    
    // Ensure + is only at the beginning
    if (cleaned.includes('+') && !cleaned.startsWith('+')) {
      cleaned = cleaned.replace(/\+/g, '')
    }

    return cleaned
  }

  // Sanitize URL
  sanitizeURL(value: string): string {
    const result = this.sanitizeString(value, {
      trim: true,
      removeExtraSpaces: true
    })

    // Add protocol if missing
    if (!result.value.startsWith('http://') && !result.value.startsWith('https://')) {
      result.value = `https://${result.value}`
    }

    return result.value
  }

  // Sanitize HTML
  sanitizeHTML(value: string): string {
    const result = this.sanitizeString(value, {
      trim: true,
      removeExtraSpaces: true
    })

    // Remove HTML tags
    const cleaned = result.value.replace(/<[^>]*>/g, '')
    
    // Decode HTML entities
    const decoded = cleaned
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')

    return decoded
  }

  // Sanitize object
  sanitizeObject<T extends Record<string, any>>(
    obj: T,
    schema: Record<keyof T, SanitizeOptions>
  ): T {
    const sanitized = { ...obj }

    Object.keys(schema).forEach(key => {
      const fieldKey = key as keyof T
      const value = obj[fieldKey]
      const options = schema[fieldKey]

      if (typeof value === 'string') {
        const result = this.sanitizeString(value, options)
        sanitized[fieldKey] = result.value as T[keyof T]
      } else if (typeof value === 'number') {
        const result = this.sanitizeNumber(value)
        sanitized[fieldKey] = result as T[keyof T]
      } else if (value instanceof Date) {
        const result = this.sanitizeDate(value)
        sanitized[fieldKey] = result as T[keyof T]
      }
    })

    return sanitized
  }

  // Sanitize array
  sanitizeArray<T>(
    array: T[],
    sanitizer: (item: T) => T
  ): T[] {
    return array.map(sanitizer).filter(item => item !== null && item !== undefined)
  }
}

// Create sanitization manager instance
export const sanitizationManager = new SanitizationManager()

// Sanitization utilities
export const sanitizeString = (
  value: string,
  options: SanitizeOptions = {}
): SanitizeResult => {
  return sanitizationManager.sanitizeString(value, options)
}

export const sanitizeNumber = (value: any): number | null => {
  return sanitizationManager.sanitizeNumber(value)
}

export const sanitizeDate = (value: any): Date | null => {
  return sanitizationManager.sanitizeDate(value)
}

export const sanitizeEmail = (value: string): string => {
  return sanitizationManager.sanitizeEmail(value)
}

export const sanitizeCAS = (value: string): string => {
  return sanitizationManager.sanitizeCAS(value)
}

export const sanitizePhone = (value: string): string => {
  return sanitizationManager.sanitizePhone(value)
}

export const sanitizeURL = (value: string): string => {
  return sanitizationManager.sanitizeURL(value)
}

export const sanitizeHTML = (value: string): string => {
  return sanitizationManager.sanitizeHTML(value)
}

// Sanitization schemas
export const STANDARD_SANITIZATION_SCHEMA = {
  name: {
    trim: true,
    removeExtraSpaces: true,
    maxLength: VALIDATION_RULES.NAME_MAX_LENGTH
  },
  manufacturer: {
    trim: true,
    removeExtraSpaces: true,
    maxLength: 100
  },
  supplier: {
    trim: true,
    removeExtraSpaces: true,
    maxLength: 100
  },
  cas: {
    trim: true,
    removeExtraSpaces: true
  },
  lot: {
    trim: true,
    removeExtraSpaces: true,
    maxLength: 50
  },
  test_group: {
    trim: true,
    removeExtraSpaces: true,
    maxLength: 50
  },
  storage_condition: {
    trim: true,
    removeExtraSpaces: true
  },
  material_type: {
    trim: true,
    removeExtraSpaces: true
  },
  concentration_unit: {
    trim: true,
    removeExtraSpaces: true
  },
  packing_unit: {
    trim: true,
    removeExtraSpaces: true
  }
}

export const USER_SANITIZATION_SCHEMA = {
  email: {
    trim: true,
    removeExtraSpaces: true,
    toLowerCase: true
  },
  name: {
    trim: true,
    removeExtraSpaces: true,
    maxLength: 100
  },
  phone: {
    trim: true,
    removeExtraSpaces: true
  }
}

// Sanitization for form data
export const sanitizeFormData = <T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, SanitizeOptions>
): T => {
  return sanitizationManager.sanitizeObject(data, schema)
}

// Sanitization for API responses
export const sanitizeApiResponse = <T>(response: T): T => {
  if (typeof response === 'string') {
    return sanitizeHTML(response) as T
  } else if (Array.isArray(response)) {
    return sanitizationManager.sanitizeArray(response, sanitizeApiResponse) as T
  } else if (typeof response === 'object' && response !== null) {
    const sanitized = { ...response }
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key]
      if (typeof value === 'string') {
        sanitized[key] = sanitizeHTML(value)
      } else if (Array.isArray(value)) {
        sanitized[key] = sanitizationManager.sanitizeArray(value, sanitizeApiResponse)
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeApiResponse(value)
      }
    })
    return sanitized
  }
  return response
}

// Sanitization for user input
export const sanitizeUserInput = (input: string): string => {
  return sanitizeHTML(input)
}

// Sanitization for search queries
export const sanitizeSearchQuery = (query: string): string => {
  return sanitizationManager.sanitizeString(query, {
    trim: true,
    removeExtraSpaces: true,
    removeSpecialChars: true,
    allowSpecialChars: ['-', '_', '.']
  }).value
}

// Sanitization for file names
export const sanitizeFileName = (fileName: string): string => {
  return sanitizationManager.sanitizeString(fileName, {
    trim: true,
    removeExtraSpaces: true,
    removeSpecialChars: true,
    allowSpecialChars: ['-', '_', '.']
  }).value
}

// Sanitization for passwords
export const sanitizePassword = (password: string): string => {
  return sanitizationManager.sanitizeString(password, {
    trim: true,
    removeExtraSpaces: true
  }).value
}

// Sanitization for comments/notes
export const sanitizeComment = (comment: string): string => {
  return sanitizationManager.sanitizeString(comment, {
    trim: true,
    removeExtraSpaces: true,
    maxLength: 500
  }).value
}

// Sanitization validation
export const validateSanitization = (
  original: string,
  sanitized: string
): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = []

  if (original.length !== sanitized.length) {
    warnings.push('Length changed during sanitization')
  }

  if (original.trim() !== sanitized.trim()) {
    warnings.push('Whitespace changed during sanitization')
  }

  if (original.toLowerCase() !== sanitized.toLowerCase()) {
    warnings.push('Case changed during sanitization')
  }

  return {
    isValid: warnings.length === 0,
    warnings
  }
}
