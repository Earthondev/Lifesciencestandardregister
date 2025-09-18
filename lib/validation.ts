import { VALIDATION_RULES, ERROR_MESSAGES } from './constants'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  min?: number
  max?: number
  custom?: (value: any) => string | null
}

export const validateField = (
  value: any,
  rules: ValidationRule,
  fieldName: string
): string | null => {
  // Required check
  if (rules.required && (!value || value.toString().trim() === '')) {
    return ERROR_MESSAGES.REQUIRED_FIELD
  }

  // Skip other validations if value is empty and not required
  if (!value || value.toString().trim() === '') {
    return null
  }

  const stringValue = value.toString().trim()

  // Min length check
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `${fieldName} ต้องมีอย่างน้อย ${rules.minLength} ตัวอักษร`
  }

  // Max length check
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `${fieldName} ต้องไม่เกิน ${rules.maxLength} ตัวอักษร`
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return `${fieldName} รูปแบบไม่ถูกต้อง`
  }

  // Min value check (for numbers)
  if (rules.min !== undefined && !isNaN(Number(value)) && Number(value) < rules.min) {
    return `${fieldName} ต้องมากกว่าหรือเท่ากับ ${rules.min}`
  }

  // Max value check (for numbers)
  if (rules.max !== undefined && !isNaN(Number(value)) && Number(value) > rules.max) {
    return `${fieldName} ต้องน้อยกว่าหรือเท่ากับ ${rules.max}`
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value)
  }

  return null
}

export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): ValidationResult => {
  const errors: Record<string, string> = {}

  Object.keys(rules).forEach(fieldName => {
    const fieldRules = rules[fieldName]
    const fieldValue = data[fieldName]
    const error = validateField(fieldValue, fieldRules, fieldName)
    
    if (error) {
      errors[fieldName] = error
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Specific validation functions
export const validateEmail = (email: string): string | null => {
  return validateField(email, {
    required: true,
    pattern: VALIDATION_RULES.EMAIL_PATTERN
  }, 'อีเมล')
}

export const validateCAS = (cas: string): string | null => {
  if (!cas) return null // CAS is optional
  
  const casError = validateField(cas, {
    pattern: VALIDATION_RULES.CAS_PATTERN
  }, 'เลข CAS')
  
  if (casError) return casError
  
  // Additional CAS checksum validation
  if (!isValidCASChecksum(cas)) {
    return 'เลข CAS ไม่ถูกต้อง (checksum ไม่ตรง)'
  }
  
  return null
}

export const validateStandardName = (name: string): string | null => {
  return validateField(name, {
    required: true,
    minLength: VALIDATION_RULES.NAME_MIN_LENGTH,
    maxLength: VALIDATION_RULES.NAME_MAX_LENGTH
  }, 'ชื่อสารมาตรฐาน')
}

export const validateConcentration = (concentration: number): string | null => {
  return validateField(concentration, {
    required: true,
    min: VALIDATION_RULES.CONCENTRATION_MIN,
    max: VALIDATION_RULES.CONCENTRATION_MAX
  }, 'ความเข้มข้น')
}

export const validatePackingSize = (size: number): string | null => {
  return validateField(size, {
    required: true,
    min: VALIDATION_RULES.PACKING_SIZE_MIN,
    max: VALIDATION_RULES.PACKING_SIZE_MAX
  }, 'ขนาดบรรจุ')
}

export const validateDate = (date: string): string | null => {
  if (!date) return null
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return 'รูปแบบวันที่ไม่ถูกต้อง'
  }
  
  return null
}

export const validateExpiryDate = (date: string): string | null => {
  const dateError = validateDate(date)
  if (dateError) return dateError
  
  if (!date) return null
  
  const expiryDate = new Date(date)
  const today = new Date()
  
  if (expiryDate < today) {
    return 'วันหมดอายุต้องเป็นวันที่ในอนาคต'
  }
  
  return null
}

// CAS checksum validation
export const isValidCASChecksum = (cas: string): boolean => {
  if (!cas || typeof cas !== 'string') return false
  
  const parts = cas.split('-')
  if (parts.length !== 3) return false
  
  const digits = parts[0] + parts[1]
  const checkDigit = parseInt(parts[2])
  
  if (digits.length < 2 || digits.length > 7) return false
  
  let sum = 0
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits[i]) * (digits.length - i)
  }
  
  return (sum % 10) === checkDigit
}

// Form validation schemas
export const REGISTER_STANDARD_SCHEMA = {
  name: {
    required: true,
    minLength: VALIDATION_RULES.NAME_MIN_LENGTH,
    maxLength: VALIDATION_RULES.NAME_MAX_LENGTH
  },
  storage: {
    required: true
  },
  material: {
    required: true
  },
  cas: {
    pattern: VALIDATION_RULES.CAS_PATTERN,
    custom: (value: string) => {
      if (!value) return null
      return isValidCASChecksum(value) ? null : 'เลข CAS ไม่ถูกต้อง'
    }
  },
  manufacturer: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  supplier: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  concentration: {
    required: true,
    min: VALIDATION_RULES.CONCENTRATION_MIN,
    max: VALIDATION_RULES.CONCENTRATION_MAX
  },
  concentration_unit: {
    required: true
  },
  packing_size: {
    required: true,
    min: VALIDATION_RULES.PACKING_SIZE_MIN,
    max: VALIDATION_RULES.PACKING_SIZE_MAX
  },
  packing_unit: {
    required: true
  },
  lot: {
    minLength: 1,
    maxLength: 50
  },
  date_received: {
    required: true,
    custom: validateDate
  },
  certificate_expiry: {
    custom: validateExpiryDate
  },
  lab_expiry_date: {
    custom: validateExpiryDate
  },
  test_group: {
    required: true,
    minLength: 2,
    maxLength: 50
  }
}

export const LOGIN_SCHEMA = {
  email: {
    required: true,
    pattern: VALIDATION_RULES.EMAIL_PATTERN
  },
  password: {
    required: true,
    minLength: 6
  }
}

export const CHANGE_STATUS_SCHEMA = {
  id_no: {
    required: true,
    minLength: 1
  },
  new_status: {
    required: true,
    custom: (value: string) => {
      const validStatuses = ['Unopened', 'In-Use', 'Disposed']
      return validStatuses.includes(value) ? null : 'สถานะไม่ถูกต้อง'
    }
  },
  note: {
    maxLength: 200
  }
}
