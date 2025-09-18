import React from 'react'

// Logging levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

// Log entry
export interface LogEntry {
  id: string
  level: LogLevel
  message: string
  timestamp: Date
  source: string
  data?: any
  stack?: string
  userId?: string
  sessionId?: string
  requestId?: string
}

// Log configuration
export interface LogConfig {
  level: LogLevel
  enableConsole: boolean
  enableStorage: boolean
  enableRemote: boolean
  maxEntries: number
  retentionDays: number
  remoteEndpoint?: string
  remoteApiKey?: string
}

// Log filter
export interface LogFilter {
  level?: LogLevel[]
  source?: string[]
  startDate?: Date
  endDate?: Date
  userId?: string
  sessionId?: string
  searchTerm?: string
}

// Logging manager class
class LoggingManager {
  private config: LogConfig = {
    level: 'info',
    enableConsole: true,
    enableStorage: true,
    enableRemote: false,
    maxEntries: 1000,
    retentionDays: 30
  }
  
  private logs: LogEntry[] = []
  private listeners: ((entry: LogEntry) => void)[] = []

  constructor() {
    this.loadConfig()
    this.loadLogs()
    this.startCleanup()
  }

  // Set configuration
  setConfig(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config }
    this.saveConfig()
  }

  // Get configuration
  getConfig(): LogConfig {
    return { ...this.config }
  }

  // Load configuration from localStorage
  private loadConfig(): void {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('log_config')
      if (saved) {
        const config = JSON.parse(saved)
        this.config = { ...this.config, ...config }
      }
    } catch (error) {
      console.warn('Failed to load log configuration:', error)
    }
  }

  // Save configuration to localStorage
  private saveConfig(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('log_config', JSON.stringify(this.config))
    } catch (error) {
      console.warn('Failed to save log configuration:', error)
    }
  }

  // Load logs from localStorage
  private loadLogs(): void {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('app_logs')
      if (saved) {
        const logs = JSON.parse(saved)
        this.logs = logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }))
      }
    } catch (error) {
      console.warn('Failed to load logs:', error)
    }
  }

  // Save logs to localStorage
  private saveLogs(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs))
    } catch (error) {
      console.warn('Failed to save logs:', error)
    }
  }

  // Start cleanup process
  private startCleanup(): void {
    setInterval(() => {
      this.cleanup()
    }, 24 * 60 * 60 * 1000) // Run daily
  }

  // Cleanup old logs
  private cleanup(): void {
    const cutoffDate = new Date(Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000))
    this.logs = this.logs.filter(log => log.timestamp > cutoffDate)
    
    // Limit number of entries
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries)
    }
    
    this.saveLogs()
  }

  // Log message
  log(level: LogLevel, message: string, data?: any, source: string = 'app'): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      id: this.generateLogId(),
      level,
      message,
      timestamp: new Date(),
      source,
      data: this.sanitizeData(data),
      stack: this.getStack(),
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      requestId: this.getCurrentRequestId()
    }

    this.logs.push(entry)
    this.notifyListeners(entry)

    if (this.config.enableConsole) {
      this.logToConsole(entry)
    }

    if (this.config.enableStorage) {
      this.saveLogs()
    }

    if (this.config.enableRemote) {
      this.sendToRemote(entry)
    }
  }

  // Check if should log
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  // Generate log ID
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Sanitize data
  private sanitizeData(data: any): any {
    if (data === null || data === undefined) return data
    
    if (typeof data === 'string') {
      // Remove sensitive information
      return data.replace(/password[^,}]*/gi, 'password:***')
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item))
    }
    
    if (typeof data === 'object') {
      const sanitized: any = {}
      Object.keys(data).forEach(key => {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') || 
            key.toLowerCase().includes('key')) {
          sanitized[key] = '***'
        } else {
          sanitized[key] = this.sanitizeData(data[key])
        }
      })
      return sanitized
    }
    
    return data
  }

  // Get stack trace
  private getStack(): string | undefined {
    try {
      throw new Error()
    } catch (error) {
      return (error as Error).stack
    }
  }

  // Get current user ID
  private getCurrentUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined
    
    try {
      return localStorage.getItem('userEmail') || undefined
    } catch {
      return undefined
    }
  }

  // Get current session ID
  private getCurrentSessionId(): string | undefined {
    if (typeof window === 'undefined') return undefined
    
    try {
      return localStorage.getItem('sessionId') || undefined
    } catch {
      return undefined
    }
  }

  // Get current request ID
  private getCurrentRequestId(): string | undefined {
    // In a real implementation, this would be generated per request
    return undefined
  }

  // Log to console
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString()
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.source}]`
    
    switch (entry.level) {
      case 'debug':
        console.debug(prefix, entry.message, entry.data)
        break
      case 'info':
        console.info(prefix, entry.message, entry.data)
        break
      case 'warn':
        console.warn(prefix, entry.message, entry.data)
        break
      case 'error':
      case 'fatal':
        console.error(prefix, entry.message, entry.data, entry.stack)
        break
    }
  }

  // Send to remote endpoint
  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.remoteApiKey}`
        },
        body: JSON.stringify(entry)
      })
    } catch (error) {
      console.error('Failed to send log to remote endpoint:', error)
    }
  }

  // Notify listeners
  private notifyListeners(entry: LogEntry): void {
    this.listeners.forEach(listener => {
      try {
        listener(entry)
      } catch (error) {
        console.error('Error in log listener:', error)
      }
    })
  }

  // Subscribe to log entries
  subscribe(listener: (entry: LogEntry) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Get logs
  getLogs(filter?: LogFilter): LogEntry[] {
    let filteredLogs = [...this.logs]

    if (filter) {
      if (filter.level && filter.level.length > 0) {
        filteredLogs = filteredLogs.filter(log => filter.level!.includes(log.level))
      }

      if (filter.source && filter.source.length > 0) {
        filteredLogs = filteredLogs.filter(log => filter.source!.includes(log.source))
      }

      if (filter.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startDate!)
      }

      if (filter.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endDate!)
      }

      if (filter.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filter.userId)
      }

      if (filter.sessionId) {
        filteredLogs = filteredLogs.filter(log => log.sessionId === filter.sessionId)
      }

      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase()
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(searchTerm) ||
          log.source.toLowerCase().includes(searchTerm)
        )
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level)
  }

  // Get recent logs
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count).reverse()
  }

  // Clear logs
  clearLogs(): void {
    this.logs = []
    this.saveLogs()
  }

  // Export logs
  exportLogs(filter?: LogFilter): string {
    const logs = this.getLogs(filter)
    return JSON.stringify(logs, null, 2)
  }

  // Import logs
  importLogs(logData: string): void {
    try {
      const logs = JSON.parse(logData)
      logs.forEach((log: any) => {
        this.logs.push({
          ...log,
          timestamp: new Date(log.timestamp)
        })
      })
      this.saveLogs()
    } catch (error) {
      console.error('Failed to import logs:', error)
    }
  }

  // Get log statistics
  getLogStatistics(): {
    totalLogs: number
    logsByLevel: Record<LogLevel, number>
    logsBySource: Record<string, number>
    averageLogsPerDay: number
    oldestLog: Date | null
    newestLog: Date | null
  } {
    const logsByLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0
    }

    const logsBySource: Record<string, number> = {}

    this.logs.forEach(log => {
      logsByLevel[log.level]++
      logsBySource[log.source] = (logsBySource[log.source] || 0) + 1
    })

    const now = new Date()
    const oldestLog = this.logs.length > 0 ? this.logs[0].timestamp : null
    const newestLog = this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : null
    
    const daysDiff = oldestLog ? Math.ceil((now.getTime() - oldestLog.getTime()) / (24 * 60 * 60 * 1000)) : 0
    const averageLogsPerDay = daysDiff > 0 ? this.logs.length / daysDiff : 0

    return {
      totalLogs: this.logs.length,
      logsByLevel,
      logsBySource,
      averageLogsPerDay,
      oldestLog,
      newestLog
    }
  }
}

// Create logging manager instance
export const loggingManager = new LoggingManager()

// Logging utilities
export const debug = (message: string, data?: any, source?: string): void => {
  loggingManager.log('debug', message, data, source)
}

export const info = (message: string, data?: any, source?: string): void => {
  loggingManager.log('info', message, data, source)
}

export const warn = (message: string, data?: any, source?: string): void => {
  loggingManager.log('warn', message, data, source)
}

export const error = (message: string, data?: any, source?: string): void => {
  loggingManager.log('error', message, data, source)
}

export const fatal = (message: string, data?: any, source?: string): void => {
  loggingManager.log('fatal', message, data, source)
}

// Logging hooks
export const useLogging = () => {
  const [logs, setLogs] = React.useState<LogEntry[]>([])
  const [config, setConfig] = React.useState<LogConfig>(loggingManager.getConfig())

  React.useEffect(() => {
    const unsubscribe = loggingManager.subscribe((entry) => {
      setLogs(prev => [...prev, entry])
    })

    return unsubscribe
  }, [])

  const updateConfig = (newConfig: Partial<LogConfig>) => {
    loggingManager.setConfig(newConfig)
    setConfig(loggingManager.getConfig())
  }

  const getLogs = (filter?: LogFilter) => {
    return loggingManager.getLogs(filter)
  }

  const clearLogs = () => {
    loggingManager.clearLogs()
    setLogs([])
  }

  const exportLogs = (filter?: LogFilter) => {
    return loggingManager.exportLogs(filter)
  }

  return {
    logs,
    config,
    updateConfig,
    getLogs,
    clearLogs,
    exportLogs,
    statistics: loggingManager.getLogStatistics()
  }
}

// Logging decorators
export const logMethod = (level: LogLevel = 'info', source?: string) => {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = function (...args: any[]) {
      const startTime = Date.now()
      const methodName = `${target.constructor.name}.${propertyName}`
      
      try {
        const result = method.apply(this, args)
        const duration = Date.now() - startTime
        
        loggingManager.log(level, `Method ${methodName} executed successfully`, {
          method: methodName,
          args: args,
          duration: duration
        }, source || 'method')
        
        return result
      } catch (error) {
        const duration = Date.now() - startTime
        
        loggingManager.log('error', `Method ${methodName} failed`, {
          method: methodName,
          args: args,
          error: error,
          duration: duration
        }, source || 'method')
        
        throw error
      }
    }
  }
}

export const logAsync = (level: LogLevel = 'info', source?: string) => {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      const methodName = `${target.constructor.name}.${propertyName}`
      
      try {
        const result = await method.apply(this, args)
        const duration = Date.now() - startTime
        
        loggingManager.log(level, `Async method ${methodName} executed successfully`, {
          method: methodName,
          args: args,
          duration: duration
        }, source || 'async-method')
        
        return result
      } catch (error) {
        const duration = Date.now() - startTime
        
        loggingManager.log('error', `Async method ${methodName} failed`, {
          method: methodName,
          args: args,
          error: error,
          duration: duration
        }, source || 'async-method')
        
        throw error
      }
    }
  }
}

// Logging validation
export const validateLogConfig = (config: Partial<LogConfig>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (config.level && !['debug', 'info', 'warn', 'error', 'fatal'].includes(config.level)) {
    errors.push('Invalid log level')
  }
  
  if (config.maxEntries && config.maxEntries < 1) {
    errors.push('Max entries must be at least 1')
  }
  
  if (config.retentionDays && config.retentionDays < 1) {
    errors.push('Retention days must be at least 1')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Logging scheduling
export const scheduleLogCleanup = (interval: number = 24 * 60 * 60 * 1000): void => {
  setInterval(() => {
    loggingManager.clearLogs()
  }, interval)
}
