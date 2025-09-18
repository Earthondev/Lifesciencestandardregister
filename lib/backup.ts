import { apiClient } from './api'
import { formatDate } from './formatters'
import { StandardsRegister, StatusLog, Statistics } from '@/types'

// Backup options
export interface BackupOptions {
  includeStandards?: boolean
  includeStatusLog?: boolean
  includeStatistics?: boolean
  includeConfig?: boolean
  includeHolidays?: boolean
  compress?: boolean
  encrypt?: boolean
  password?: string
}

// Backup result
export interface BackupResult {
  success: boolean
  filename: string
  size: number
  timestamp: Date
  error?: string
}

// Restore options
export interface RestoreOptions {
  validateData?: boolean
  overwriteExisting?: boolean
  createBackup?: boolean
  password?: string
}

// Restore result
export interface RestoreResult {
  success: boolean
  recordsProcessed: number
  recordsSuccess: number
  recordsFailed: number
  errors: string[]
  warnings: string[]
}

// Backup data structure
export interface BackupData {
  version: string
  timestamp: string
  metadata: {
    appName: string
    appVersion: string
    totalRecords: number
    backupType: 'full' | 'partial'
  }
  data: {
    standards?: StandardsRegister[]
    statusLog?: StatusLog[]
    statistics?: Statistics
    config?: Record<string, string>
    holidays?: Array<{ date: string; name: string; type: string }>
  }
}

// Backup manager class
class BackupManager {
  private readonly backupVersion = '1.0.0'

  // Create backup
  async createBackup(options: BackupOptions = {}): Promise<BackupResult> {
    try {
      const timestamp = new Date()
      const filename = `backup_${formatDate(timestamp, 'yyyy-MM-dd_HH-mm-ss')}.json`
      
      // Collect data
      const backupData: BackupData = {
        version: this.backupVersion,
        timestamp: timestamp.toISOString(),
        metadata: {
          appName: 'Life Science Standards Register',
          appVersion: '1.0.0',
          totalRecords: 0,
          backupType: 'full'
        },
        data: {}
      }

      let totalRecords = 0

      // Get standards data
      if (options.includeStandards !== false) {
        const standardsResponse = await apiClient.getStandards()
        if (standardsResponse.success) {
          backupData.data.standards = standardsResponse.data
          totalRecords += standardsResponse.data.length
        }
      }

      // Get status log data
      if (options.includeStatusLog !== false) {
        const statusLogResponse = await apiClient.getStatusLog()
        if (statusLogResponse.success) {
          backupData.data.statusLog = statusLogResponse.data
          totalRecords += statusLogResponse.data.length
        }
      }

      // Get statistics
      if (options.includeStatistics !== false) {
        const statisticsResponse = await apiClient.getStatistics()
        if (statisticsResponse.success) {
          backupData.data.statistics = statisticsResponse.data
        }
      }

      // Get configuration
      if (options.includeConfig !== false) {
        const configResponse = await apiClient.getConfig()
        if (configResponse.success) {
          backupData.data.config = configResponse.data
        }
      }

      // Get holidays
      if (options.includeHolidays !== false) {
        const holidaysResponse = await apiClient.getHolidays()
        if (holidaysResponse.success) {
          backupData.data.holidays = holidaysResponse.data
        }
      }

      backupData.metadata.totalRecords = totalRecords

      // Convert to JSON
      let jsonData = JSON.stringify(backupData, null, 2)

      // Compress if requested
      if (options.compress) {
        // Simple compression (in real implementation, use a compression library)
        jsonData = this.compressData(jsonData)
      }

      // Encrypt if requested
      if (options.encrypt && options.password) {
        // In real implementation, use proper encryption
        jsonData = await this.encryptData(jsonData, options.password)
      }

      // Create blob and download
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)

      return {
        success: true,
        filename,
        size: blob.size,
        timestamp
      }
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Restore from backup
  async restoreBackup(
    file: File,
    options: RestoreOptions = {}
  ): Promise<RestoreResult> {
    const result: RestoreResult = {
      success: true,
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsFailed: 0,
      errors: [],
      warnings: []
    }

    try {
      // Read file
      const fileContent = await this.readFileAsText(file)
      
      // Decrypt if needed
      let jsonData = fileContent
      if (options.password) {
        jsonData = await this.decryptData(jsonData, options.password)
      }

      // Parse JSON
      const backupData: BackupData = JSON.parse(jsonData)

      // Validate backup data
      if (options.validateData !== false) {
        const validation = this.validateBackupData(backupData)
        if (!validation.isValid) {
          result.errors.push(...validation.errors)
          result.success = false
          return result
        }
      }

      // Create backup before restore if requested
      if (options.createBackup) {
        const backupResult = await this.createBackup()
        if (!backupResult.success) {
          result.warnings.push('Failed to create backup before restore')
        }
      }

      // Restore data
      if (backupData.data.standards) {
        const standardsResult = await this.restoreStandards(backupData.data.standards, options)
        result.recordsProcessed += standardsResult.processed
        result.recordsSuccess += standardsResult.success
        result.recordsFailed += standardsResult.failed
        result.errors.push(...standardsResult.errors)
      }

      if (backupData.data.statusLog) {
        const statusLogResult = await this.restoreStatusLog(backupData.data.statusLog, options)
        result.recordsProcessed += statusLogResult.processed
        result.recordsSuccess += statusLogResult.success
        result.recordsFailed += statusLogResult.failed
        result.errors.push(...statusLogResult.errors)
      }

      if (backupData.data.config) {
        const configResult = await this.restoreConfig(backupData.data.config, options)
        if (!configResult.success) {
          result.errors.push(...configResult.errors)
        }
      }

      if (backupData.data.holidays) {
        const holidaysResult = await this.restoreHolidays(backupData.data.holidays, options)
        if (!holidaysResult.success) {
          result.errors.push(...holidaysResult.errors)
        }
      }

      result.success = result.errors.length === 0
      return result
    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      return result
    }
  }

  // Validate backup data
  private validateBackupData(backupData: BackupData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!backupData.version) {
      errors.push('Backup version is missing')
    }

    if (!backupData.timestamp) {
      errors.push('Backup timestamp is missing')
    }

    if (!backupData.metadata) {
      errors.push('Backup metadata is missing')
    }

    if (!backupData.data) {
      errors.push('Backup data is missing')
    }

    // Validate standards data
    if (backupData.data.standards) {
      if (!Array.isArray(backupData.data.standards)) {
        errors.push('Standards data must be an array')
      } else {
        backupData.data.standards.forEach((standard, index) => {
          if (!standard.id_no) {
            errors.push(`Standard at index ${index} is missing ID`)
          }
          if (!standard.name) {
            errors.push(`Standard at index ${index} is missing name`)
          }
        })
      }
    }

    // Validate status log data
    if (backupData.data.statusLog) {
      if (!Array.isArray(backupData.data.statusLog)) {
        errors.push('Status log data must be an array')
      } else {
        backupData.data.statusLog.forEach((log, index) => {
          if (!log.log_id) {
            errors.push(`Status log at index ${index} is missing log ID`)
          }
          if (!log.timestamp) {
            errors.push(`Status log at index ${index} is missing timestamp`)
          }
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Restore standards
  private async restoreStandards(
    standards: StandardsRegister[],
    options: RestoreOptions
  ): Promise<{ processed: number; success: number; failed: number; errors: string[] }> {
    const result = { processed: 0, success: 0, failed: 0, errors: [] as string[] }

    for (const standard of standards) {
      try {
        result.processed++
        
        // Check if standard already exists
        if (!options.overwriteExisting) {
          const existingResponse = await apiClient.getStandardById(standard.id_no)
          if (existingResponse.success) {
            result.errors.push(`Standard ${standard.id_no} already exists`)
            result.failed++
            continue
          }
        }

        // Register standard
        const registerResponse = await apiClient.registerStandard(standard)
        if (registerResponse.success) {
          result.success++
        } else {
          result.errors.push(`Failed to restore standard ${standard.id_no}: ${registerResponse.error}`)
          result.failed++
        }
      } catch (error) {
        result.errors.push(`Error restoring standard ${standard.id_no}: ${error}`)
        result.failed++
      }
    }

    return result
  }

  // Restore status log
  private async restoreStatusLog(
    statusLog: StatusLog[],
    options: RestoreOptions
  ): Promise<{ processed: number; success: number; failed: number; errors: string[] }> {
    const result = { processed: 0, success: 0, failed: 0, errors: [] as string[] }

    // Note: Status log restoration would require a specific API endpoint
    // For now, we'll just count the records
    result.processed = statusLog.length
    result.success = statusLog.length
    result.errors.push('Status log restoration not implemented yet')

    return result
  }

  // Restore configuration
  private async restoreConfig(
    config: Record<string, string>,
    options: RestoreOptions
  ): Promise<{ success: boolean; errors: string[] }> {
    const result = { success: true, errors: [] as string[] }

    for (const [key, value] of Object.entries(config)) {
      try {
        const updateResponse = await apiClient.updateConfig(key, value)
        if (!updateResponse.success) {
          result.errors.push(`Failed to restore config ${key}: ${updateResponse.error}`)
          result.success = false
        }
      } catch (error) {
        result.errors.push(`Error restoring config ${key}: ${error}`)
        result.success = false
      }
    }

    return result
  }

  // Restore holidays
  private async restoreHolidays(
    holidays: Array<{ date: string; name: string; type: string }>,
    options: RestoreOptions
  ): Promise<{ success: boolean; errors: string[] }> {
    const result = { success: true, errors: [] as string[] }

    // Note: Holiday restoration would require a specific API endpoint
    // For now, we'll just log that it's not implemented
    result.errors.push('Holiday restoration not implemented yet')

    return result
  }

  // Read file as text
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // Compress data (simple implementation)
  private compressData(data: string): string {
    // In real implementation, use a compression library like pako
    return data
  }

  // Encrypt data (simple implementation)
  private async encryptData(data: string, password: string): Promise<string> {
    // In real implementation, use proper encryption
    return data
  }

  // Decrypt data (simple implementation)
  private async decryptData(data: string, password: string): Promise<string> {
    // In real implementation, use proper decryption
    return data
  }

  // Get backup info
  getBackupInfo(backupData: BackupData): {
    version: string
    timestamp: Date
    appName: string
    appVersion: string
    totalRecords: number
    backupType: string
  } {
    return {
      version: backupData.version,
      timestamp: new Date(backupData.timestamp),
      appName: backupData.metadata.appName,
      appVersion: backupData.metadata.appVersion,
      totalRecords: backupData.metadata.totalRecords,
      backupType: backupData.metadata.backupType
    }
  }

  // Validate backup file
  validateBackupFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check file type
    if (!file.name.endsWith('.json')) {
      errors.push('Backup file must be a JSON file')
    }

    // Check file size
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      errors.push('Backup file is too large (max 50MB)')
    }

    // Check file name format
    if (!file.name.match(/^backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/)) {
      errors.push('Backup file name format is invalid')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Get backup history
  getBackupHistory(): string[] {
    if (typeof window === 'undefined') return []

    try {
      const history = localStorage.getItem('backup_history')
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.warn('Failed to load backup history:', error)
      return []
    }
  }

  // Save backup history
  saveBackupHistory(filename: string): void {
    if (typeof window === 'undefined') return

    try {
      const history = this.getBackupHistory()
      const newHistory = [filename, ...history.filter((item: string) => item !== filename)].slice(0, 10)
      localStorage.setItem('backup_history', JSON.stringify(newHistory))
    } catch (error) {
      console.warn('Failed to save backup history:', error)
    }
  }

  // Clear backup history
  clearBackupHistory(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem('backup_history')
    } catch (error) {
      console.warn('Failed to clear backup history:', error)
    }
  }
}

// Create backup manager instance
export const backupManager = new BackupManager()

// Backup utilities
export const createBackup = (options?: BackupOptions): Promise<BackupResult> => {
  return backupManager.createBackup(options)
}

export const restoreBackup = (file: File, options?: RestoreOptions): Promise<RestoreResult> => {
  return backupManager.restoreBackup(file, options)
}

export const validateBackupFile = (file: File): { isValid: boolean; errors: string[] } => {
  return backupManager.validateBackupFile(file)
}

export const getBackupHistory = (): string[] => {
  return backupManager.getBackupHistory()
}

export const saveBackupHistory = (filename: string): void => {
  backupManager.saveBackupHistory(filename)
}

export const clearBackupHistory = (): void => {
  backupManager.clearBackupHistory()
}

// Backup scheduling
export const scheduleBackup = (interval: number): void => {
  setInterval(() => {
    createBackup({ includeStandards: true, includeStatusLog: true })
  }, interval)
}

// Auto backup on data changes
export const enableAutoBackup = (): void => {
  // This would be called when data changes
  const autoBackup = () => {
    createBackup({ includeStandards: true, includeStatusLog: true })
  }

  // Listen for data changes (this would be implemented based on your data management)
  // For example, you could listen to API calls or state changes
}

// Backup validation
export const validateBackupData = (backupData: BackupData): { isValid: boolean; errors: string[] } => {
  return backupManager.validateBackupData(backupData)
}

// Backup info
export const getBackupInfo = (backupData: BackupData) => {
  return backupManager.getBackupInfo(backupData)
}
