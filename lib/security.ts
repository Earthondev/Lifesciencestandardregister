// Security utilities for data protection and encryption

// Encryption options
export interface EncryptionOptions {
  algorithm?: string
  keyLength?: number
  iterations?: number
}

// Security manager class
class SecurityManager {
  private readonly defaultOptions: EncryptionOptions = {
    algorithm: 'AES-GCM',
    keyLength: 256,
    iterations: 100000
  }

  // Generate random string
  generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Generate random number
  generateRandomNumber(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Generate UUID
  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Hash password (simple implementation)
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password)
    return passwordHash === hash
  }

  // Encrypt data (simple implementation)
  async encryptData(data: string, password: string): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      const passwordBuffer = encoder.encode(password)
      
      // Generate key from password
      const key = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      )
      
      // Derive encryption key
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('salt'),
          iterations: this.defaultOptions.iterations!,
          hash: 'SHA-256'
        },
        key,
        { name: 'AES-GCM', length: this.defaultOptions.keyLength! },
        false,
        ['encrypt', 'decrypt']
      )
      
      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12))
      
      // Encrypt data
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        derivedKey,
        dataBuffer
      )
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encrypted), iv.length)
      
      // Convert to base64
      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      throw new Error('Encryption failed')
    }
  }

  // Decrypt data
  async decryptData(encryptedData: string, password: string): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()
      
      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(c => c.charCodeAt(0))
      )
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, 12)
      const encrypted = combined.slice(12)
      
      // Generate key from password
      const passwordBuffer = encoder.encode(password)
      const key = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      )
      
      // Derive decryption key
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('salt'),
          iterations: this.defaultOptions.iterations!,
          hash: 'SHA-256'
        },
        key,
        { name: 'AES-GCM', length: this.defaultOptions.keyLength! },
        false,
        ['encrypt', 'decrypt']
      )
      
      // Decrypt data
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        derivedKey,
        encrypted
      )
      
      return decoder.decode(decrypted)
    } catch (error) {
      throw new Error('Decryption failed')
    }
  }

  // Generate secure token
  generateSecureToken(length: number = 64): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let result = ''
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
    
    return result
  }

  // Generate API key
  generateApiKey(): string {
    return `lsr_${this.generateSecureToken(32)}`
  }

  // Generate session ID
  generateSessionId(): string {
    return `session_${this.generateUUID()}`
  }

  // Validate token format
  validateTokenFormat(token: string): boolean {
    // Basic token validation
    return token.length >= 32 && /^[a-zA-Z0-9_-]+$/.test(token)
  }

  // Validate API key format
  validateApiKeyFormat(apiKey: string): boolean {
    return apiKey.startsWith('lsr_') && this.validateTokenFormat(apiKey.slice(4))
  }

  // Validate session ID format
  validateSessionIdFormat(sessionId: string): boolean {
    return sessionId.startsWith('session_') && this.validateTokenFormat(sessionId.slice(8))
  }

  // Check password strength
  checkPasswordStrength(password: string): {
    score: number
    feedback: string[]
    isStrong: boolean
  } {
    const feedback: string[] = []
    let score = 0

    // Length check
    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่')
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก')
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('รหัสผ่านต้องมีตัวเลข')
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1
    } else {
      feedback.push('รหัสผ่านต้องมีอักขระพิเศษ')
    }

    // Length bonus
    if (password.length >= 12) {
      score += 1
    }

    return {
      score,
      feedback,
      isStrong: score >= 4
    }
  }

  // Sanitize sensitive data
  sanitizeSensitiveData(data: any): any {
    if (typeof data === 'string') {
      // Mask sensitive strings
      if (data.length > 4) {
        return data.slice(0, 2) + '*'.repeat(data.length - 4) + data.slice(-2)
      }
      return '*'.repeat(data.length)
    } else if (Array.isArray(data)) {
      return data.map(item => this.sanitizeSensitiveData(item))
    } else if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data }
      Object.keys(sanitized).forEach(key => {
        if (this.isSensitiveField(key)) {
          sanitized[key] = this.sanitizeSensitiveData(sanitized[key])
        }
      })
      return sanitized
    }
    return data
  }

  // Check if field is sensitive
  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      'password',
      'token',
      'key',
      'secret',
      'apiKey',
      'sessionId',
      'cas',
      'lot'
    ]
    
    return sensitiveFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    )
  }

  // Generate CSRF token
  generateCSRFToken(): string {
    return this.generateSecureToken(32)
  }

  // Validate CSRF token
  validateCSRFToken(token: string, expectedToken: string): boolean {
    return token === expectedToken && this.validateTokenFormat(token)
  }

  // Generate nonce
  generateNonce(): string {
    return this.generateSecureToken(16)
  }

  // Validate nonce
  validateNonce(nonce: string): boolean {
    return this.validateTokenFormat(nonce) && nonce.length === 16
  }
}

// Create security manager instance
export const securityManager = new SecurityManager()

// Security utilities
export const generateRandomString = (length?: number): string => {
  return securityManager.generateRandomString(length)
}

export const generateRandomNumber = (min?: number, max?: number): number => {
  return securityManager.generateRandomNumber(min, max)
}

export const generateUUID = (): string => {
  return securityManager.generateUUID()
}

export const hashPassword = async (password: string): Promise<string> => {
  return securityManager.hashPassword(password)
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return securityManager.verifyPassword(password, hash)
}

export const encryptData = async (data: string, password: string): Promise<string> => {
  return securityManager.encryptData(data, password)
}

export const decryptData = async (encryptedData: string, password: string): Promise<string> => {
  return securityManager.decryptData(encryptedData, password)
}

export const generateSecureToken = (length?: number): string => {
  return securityManager.generateSecureToken(length)
}

export const generateApiKey = (): string => {
  return securityManager.generateApiKey()
}

export const generateSessionId = (): string => {
  return securityManager.generateSessionId()
}

export const checkPasswordStrength = (password: string) => {
  return securityManager.checkPasswordStrength(password)
}

export const sanitizeSensitiveData = (data: any): any => {
  return securityManager.sanitizeSensitiveData(data)
}

export const generateCSRFToken = (): string => {
  return securityManager.generateCSRFToken()
}

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  return securityManager.validateCSRFToken(token, expectedToken)
}

export const generateNonce = (): string => {
  return securityManager.generateNonce()
}

export const validateNonce = (nonce: string): boolean => {
  return securityManager.validateNonce(nonce)
}

// Security constants
export const SECURITY_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  TOKEN_LENGTH: 64,
  API_KEY_LENGTH: 36,
  SESSION_ID_LENGTH: 45,
  NONCE_LENGTH: 16,
  CSRF_TOKEN_LENGTH: 32,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000 // 7 days
} as const

// Security validation
export const validateSecurityInput = (input: string, type: 'password' | 'token' | 'apiKey'): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  switch (type) {
    case 'password':
      if (input.length < SECURITY_CONSTANTS.MIN_PASSWORD_LENGTH) {
        errors.push(`รหัสผ่านต้องมีอย่างน้อย ${SECURITY_CONSTANTS.MIN_PASSWORD_LENGTH} ตัวอักษร`)
      }
      if (input.length > SECURITY_CONSTANTS.MAX_PASSWORD_LENGTH) {
        errors.push(`รหัสผ่านต้องไม่เกิน ${SECURITY_CONSTANTS.MAX_PASSWORD_LENGTH} ตัวอักษร`)
      }
      break
    case 'token':
      if (!securityManager.validateTokenFormat(input)) {
        errors.push('รูปแบบ Token ไม่ถูกต้อง')
      }
      break
    case 'apiKey':
      if (!securityManager.validateApiKeyFormat(input)) {
        errors.push('รูปแบบ API Key ไม่ถูกต้อง')
      }
      break
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Security logging
export const logSecurityEvent = (event: string, details: any): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details: securityManager.sanitizeSensitiveData(details),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    ip: 'unknown' // Would be set by server
  }

  console.log('Security Event:', logEntry)
  
  // In production, this would be sent to a security monitoring service
}

// Rate limiting
export class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map()
  private readonly maxAttempts: number
  private readonly windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(key: string): boolean {
    const now = Date.now()
    const attempt = this.attempts.get(key)

    if (!attempt) {
      this.attempts.set(key, { count: 1, lastAttempt: now })
      return true
    }

    if (now - attempt.lastAttempt > this.windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now })
      return true
    }

    if (attempt.count >= this.maxAttempts) {
      return false
    }

    attempt.count++
    attempt.lastAttempt = now
    return true
  }

  getRemainingAttempts(key: string): number {
    const attempt = this.attempts.get(key)
    if (!attempt) return this.maxAttempts
    return Math.max(0, this.maxAttempts - attempt.count)
  }

  getTimeUntilReset(key: string): number {
    const attempt = this.attempts.get(key)
    if (!attempt) return 0
    return Math.max(0, this.windowMs - (Date.now() - attempt.lastAttempt))
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }
}

// Create rate limiter instance
export const rateLimiter = new RateLimiter()
