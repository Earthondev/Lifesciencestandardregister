import { ERROR_MESSAGES } from './constants'

// Custom error classes
export class AppError extends Error {
  public code: string
  public statusCode: number
  public details?: any

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: any
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string = ERROR_MESSAGES.NETWORK_ERROR, details?: any) {
    super(message, 'NETWORK_ERROR', 0, details)
    this.name = 'NetworkError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED, details?: any) {
    super(message, 'UNAUTHORIZED', 401, details)
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = ERROR_MESSAGES.NOT_FOUND, details?: any) {
    super(message, 'NOT_FOUND', 404, details)
    this.name = 'NotFoundError'
  }
}

export class ServerError extends AppError {
  constructor(message: string = ERROR_MESSAGES.SERVER_ERROR, details?: any) {
    super(message, 'SERVER_ERROR', 500, details)
    this.name = 'ServerError'
  }
}

// Error handling utilities
export const handleError = (error: any): AppError => {
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return error
  }

  // Handle different types of errors
  if (error instanceof TypeError) {
    return new NetworkError('เกิดข้อผิดพลาดในการเชื่อมต่อ', error.message)
  }

  if (error instanceof SyntaxError) {
    return new ServerError('ข้อมูลที่ได้รับไม่ถูกต้อง', error.message)
  }

  if (error.name === 'AbortError') {
    return new NetworkError('การเชื่อมต่อถูกยกเลิก', error.message)
  }

  // Handle fetch errors
  if (error.status) {
    switch (error.status) {
      case 401:
        return new UnauthorizedError('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้')
      case 404:
        return new NotFoundError('ไม่พบข้อมูลที่ต้องการ')
      case 500:
        return new ServerError('เกิดข้อผิดพลาดในระบบ')
      default:
        return new ServerError(`เกิดข้อผิดพลาด (${error.status})`, error.message)
    }
  }

  // Handle API response errors
  if (error.response) {
    const status = error.response.status
    const message = error.response.data?.error || error.response.data?.message || 'เกิดข้อผิดพลาด'
    
    switch (status) {
      case 400:
        return new ValidationError(message, error.response.data)
      case 401:
        return new UnauthorizedError(message)
      case 404:
        return new NotFoundError(message)
      case 500:
        return new ServerError(message)
      default:
        return new ServerError(message, error.response.data)
    }
  }

  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return new NetworkError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้')
  }

  // Handle timeout errors
  if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
    return new NetworkError('การเชื่อมต่อหมดเวลา')
  }

  // Default error
  return new AppError(
    error.message || ERROR_MESSAGES.SERVER_ERROR,
    'UNKNOWN_ERROR',
    500,
    error
  )
}

// Error message formatting
export const formatErrorMessage = (error: any): string => {
  const appError = handleError(error)
  
  // Return user-friendly message
  switch (appError.code) {
    case 'VALIDATION_ERROR':
      return appError.message
    case 'NETWORK_ERROR':
      return 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง'
    case 'UNAUTHORIZED':
      return 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้ กรุณาเข้าสู่ระบบใหม่'
    case 'NOT_FOUND':
      return 'ไม่พบข้อมูลที่ต้องการ'
    case 'SERVER_ERROR':
      return 'เกิดข้อผิดพลาดในระบบ กรุณาติดต่อผู้ดูแลระบบ'
    default:
      return appError.message || ERROR_MESSAGES.SERVER_ERROR
  }
}

// Error logging
export const logError = (error: any, context?: string): void => {
  const appError = handleError(error)
  
  const errorLog = {
    timestamp: new Date().toISOString(),
    code: appError.code,
    message: appError.message,
    statusCode: appError.statusCode,
    details: appError.details,
    context,
    stack: error.stack,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'Server'
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Log:', errorLog)
  }
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or your own logging API
}

// Error boundary utilities
export const getErrorBoundaryFallback = (error: Error) => {
  return {
    title: 'เกิดข้อผิดพลาด',
    message: formatErrorMessage(error),
    action: 'รีเฟรชหน้าเว็บ',
    onAction: () => {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }
}

// Retry utilities
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on certain errors
      if (error instanceof ValidationError || error instanceof UnauthorizedError) {
        throw error
      }
      
      // Wait before retrying (except on last attempt)
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }
  
  throw lastError
}

// Error recovery utilities
export const recoverFromError = (error: any): boolean => {
  const appError = handleError(error)
  
  // Some errors are recoverable
  switch (appError.code) {
    case 'NETWORK_ERROR':
    case 'SERVER_ERROR':
      return true
    case 'VALIDATION_ERROR':
    case 'UNAUTHORIZED':
    case 'NOT_FOUND':
      return false
    default:
      return false
  }
}

// Error notification utilities
export const shouldNotifyUser = (error: any): boolean => {
  const appError = handleError(error)
  
  // Don't notify for certain errors
  switch (appError.code) {
    case 'VALIDATION_ERROR':
      return false // Validation errors are usually shown inline
    case 'NETWORK_ERROR':
      return true // Network errors should be notified
    case 'SERVER_ERROR':
      return true // Server errors should be notified
    default:
      return true
  }
}

// Error context utilities
export const createErrorContext = (context: Record<string, any>) => {
  return {
    ...context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'Server'
  }
}

// Error reporting utilities
export const reportError = async (error: any, context?: Record<string, any>) => {
  const appError = handleError(error)
  const errorContext = createErrorContext(context || {})
  
  // Log error locally
  logError(error, JSON.stringify(errorContext))
  
  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    try {
      // Example: Send to your error tracking API
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     error: appError,
      //     context: errorContext
      //   })
      // })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }
}
