import React from 'react'
import { StandardsRegister, StatusLog } from '@/types'

// Migration version
export interface MigrationVersion {
  version: string
  description: string
  date: string
  author: string
}

// Migration result
export interface MigrationResult {
  success: boolean
  version: string
  recordsProcessed: number
  recordsSuccess: number
  recordsFailed: number
  errors: string[]
  warnings: string[]
  duration: number
}

// Migration step
export interface MigrationStep {
  name: string
  description: string
  execute: (data: any) => Promise<any>
  rollback?: (data: any) => Promise<any>
}

// Migration manager class
class MigrationManager {
  private migrations: Map<string, MigrationStep[]> = new Map()
  private currentVersion: string = '1.0.0'

  constructor() {
    this.initializeMigrations()
  }

  // Initialize migrations
  private initializeMigrations(): void {
    // Version 1.0.0 to 1.1.0
    this.addMigration('1.1.0', [
      {
        name: 'add_cas_validation',
        description: 'Add CAS validation to standards',
        execute: async (data: StandardsRegister[]) => {
          return data.map(standard => ({
            ...standard,
            cas_validated: this.validateCAS(standard.cas)
          }))
        },
        rollback: async (data: StandardsRegister[]) => {
          return data.map(standard => {
            const { cas_validated, ...rest } = standard as any
            return rest
          })
        }
      },
      {
        name: 'add_expiry_warnings',
        description: 'Add expiry warning flags',
        execute: async (data: StandardsRegister[]) => {
          return data.map(standard => ({
            ...standard,
            expiry_warning_30: this.isExpiringSoon(standard.lab_expiry_date, 30),
            expiry_warning_60: this.isExpiringSoon(standard.lab_expiry_date, 60)
          }))
        },
        rollback: async (data: StandardsRegister[]) => {
          return data.map(standard => {
            const { expiry_warning_30, expiry_warning_60, ...rest } = standard as any
            return rest
          })
        }
      }
    ])

    // Version 1.1.0 to 1.2.0
    this.addMigration('1.2.0', [
      {
        name: 'add_audit_fields',
        description: 'Add audit fields to all records',
        execute: async (data: StandardsRegister[]) => {
          return data.map(standard => ({
            ...standard,
            created_by: 'system',
            created_at: new Date().toISOString(),
            updated_by: 'system',
            updated_at: new Date().toISOString()
          }))
        },
        rollback: async (data: StandardsRegister[]) => {
          return data.map(standard => {
            const { created_by, created_at, updated_by, updated_at, ...rest } = standard as any
            return rest
          })
        }
      },
      {
        name: 'normalize_status_values',
        description: 'Normalize status values',
        execute: async (data: StandardsRegister[]) => {
          return data.map(standard => ({
            ...standard,
            status: this.normalizeStatus(standard.status)
          }))
        }
      }
    ])

    // Version 1.2.0 to 1.3.0
    this.addMigration('1.3.0', [
      {
        name: 'add_quality_metrics',
        description: 'Add quality metrics to standards',
        execute: async (data: StandardsRegister[]) => {
          return data.map(standard => ({
            ...standard,
            quality_score: this.calculateQualityScore(standard),
            data_completeness: this.calculateDataCompleteness(standard)
          }))
        },
        rollback: async (data: StandardsRegister[]) => {
          return data.map(standard => {
            const { quality_score, data_completeness, ...rest } = standard as any
            return rest
          })
        }
      }
    ])
  }

  // Add migration
  private addMigration(version: string, steps: MigrationStep[]): void {
    this.migrations.set(version, steps)
  }

  // Get available migrations
  getAvailableMigrations(): MigrationVersion[] {
    const versions: MigrationVersion[] = []
    
    for (const [version, steps] of this.migrations.entries()) {
      versions.push({
        version,
        description: `Migration to version ${version}`,
        date: new Date().toISOString(),
        author: 'System'
      })
    }
    
    return versions.sort((a, b) => a.version.localeCompare(b.version))
  }

  // Get current version
  getCurrentVersion(): string {
    return this.currentVersion
  }

  // Set current version
  setCurrentVersion(version: string): void {
    this.currentVersion = version
  }

  // Check if migration is needed
  isMigrationNeeded(targetVersion: string): boolean {
    return this.compareVersions(this.currentVersion, targetVersion) < 0
  }

  // Get migration path
  getMigrationPath(targetVersion: string): string[] {
    const path: string[] = []
    const availableVersions = Array.from(this.migrations.keys()).sort()
    
    for (const version of availableVersions) {
      if (this.compareVersions(this.currentVersion, version) < 0 && 
          this.compareVersions(version, targetVersion) <= 0) {
        path.push(version)
      }
    }
    
    return path
  }

  // Execute migration
  async executeMigration(
    targetVersion: string,
    data: StandardsRegister[]
  ): Promise<MigrationResult> {
    const startTime = Date.now()
    const result: MigrationResult = {
      success: true,
      version: targetVersion,
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsFailed: 0,
      errors: [],
      warnings: [],
      duration: 0
    }

    try {
      const migrationPath = this.getMigrationPath(targetVersion)
      
      if (migrationPath.length === 0) {
        result.warnings.push('No migration needed')
        return result
      }

      let currentData = [...data]

      for (const version of migrationPath) {
        const steps = this.migrations.get(version)
        if (!steps) {
          result.errors.push(`Migration steps not found for version ${version}`)
          continue
        }

        for (const step of steps) {
          try {
            currentData = await step.execute(currentData)
            result.recordsSuccess += currentData.length
          } catch (error) {
            result.errors.push(`Error in step ${step.name}: ${error}`)
            result.recordsFailed += currentData.length
          }
        }
      }

      result.recordsProcessed = data.length
      result.duration = Date.now() - startTime
      
      if (result.errors.length > 0) {
        result.success = false
      }

      return result
    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      result.duration = Date.now() - startTime
      return result
    }
  }

  // Rollback migration
  async rollbackMigration(
    targetVersion: string,
    data: StandardsRegister[]
  ): Promise<MigrationResult> {
    const startTime = Date.now()
    const result: MigrationResult = {
      success: true,
      version: targetVersion,
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsFailed: 0,
      errors: [],
      warnings: [],
      duration: 0
    }

    try {
      const migrationPath = this.getMigrationPath(targetVersion).reverse()
      
      if (migrationPath.length === 0) {
        result.warnings.push('No rollback needed')
        return result
      }

      let currentData = [...data]

      for (const version of migrationPath) {
        const steps = this.migrations.get(version)
        if (!steps) {
          result.errors.push(`Migration steps not found for version ${version}`)
          continue
        }

        // Execute rollback steps in reverse order
        for (const step of steps.reverse()) {
          if (step.rollback) {
            try {
              currentData = await step.rollback(currentData)
              result.recordsSuccess += currentData.length
            } catch (error) {
              result.errors.push(`Error in rollback step ${step.name}: ${error}`)
              result.recordsFailed += currentData.length
            }
          }
        }
      }

      result.recordsProcessed = data.length
      result.duration = Date.now() - startTime
      
      if (result.errors.length > 0) {
        result.success = false
      }

      return result
    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      result.duration = Date.now() - startTime
      return result
    }
  }

  // Compare versions
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0
      
      if (v1Part < v2Part) return -1
      if (v1Part > v2Part) return 1
    }
    
    return 0
  }

  // Validate CAS
  private validateCAS(cas: string): boolean {
    if (!cas) return false
    
    const casPattern = /^\d{2,7}-\d{2}-\d$/
    if (!casPattern.test(cas)) return false
    
    const parts = cas.split('-')
    const digits = parts[0] + parts[1]
    const checkDigit = parseInt(parts[2])
    
    let sum = 0
    for (let i = digits.length - 1; i >= 0; i--) {
      sum += parseInt(digits[i]) * (digits.length - i)
    }
    
    return (sum % 10) === checkDigit
  }

  // Check if expiring soon
  private isExpiringSoon(expiryDate: string | undefined, days: number): boolean {
    if (!expiryDate) return false
    
    const expiry = new Date(expiryDate)
    const now = new Date()
    const warningDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))
    
    return expiry <= warningDate && expiry > now
  }

  // Normalize status
  private normalizeStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'unopened': 'Unopened',
      'in-use': 'In-Use',
      'disposed': 'Disposed',
      'Unopened': 'Unopened',
      'In-Use': 'In-Use',
      'Disposed': 'Disposed'
    }
    
    return statusMap[status] || status
  }

  // Calculate quality score
  private calculateQualityScore(standard: StandardsRegister): number {
    let score = 0
    let totalFields = 0
    
    const fields = ['name', 'manufacturer', 'supplier', 'cas', 'lot', 'test_group']
    
    fields.forEach(field => {
      totalFields++
      if (standard[field as keyof StandardsRegister]) {
        score++
      }
    })
    
    return totalFields > 0 ? (score / totalFields) * 100 : 0
  }

  // Calculate data completeness
  private calculateDataCompleteness(standard: StandardsRegister): number {
    let score = 0
    let totalFields = 0
    
    const fields = [
      'name', 'manufacturer', 'supplier', 'cas', 'lot', 'test_group',
      'concentration', 'concentration_unit', 'packing_size', 'packing_unit',
      'date_received', 'lab_expiry_date'
    ]
    
    fields.forEach(field => {
      totalFields++
      const value = standard[field as keyof StandardsRegister]
      if (value !== null && value !== undefined && value !== '') {
        score++
      }
    })
    
    return totalFields > 0 ? (score / totalFields) * 100 : 0
  }

  // Get migration history
  getMigrationHistory(): Array<{
    version: string
    executedAt: string
    success: boolean
    duration: number
    recordsProcessed: number
  }> {
    // In a real implementation, this would be stored in a database
    return []
  }

  // Save migration history
  saveMigrationHistory(version: string, result: MigrationResult): void {
    // In a real implementation, this would be saved to a database
    console.log(`Migration ${version} completed:`, result)
  }

  // Validate data before migration
  validateDataBeforeMigration(data: StandardsRegister[]): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []
    
    if (!Array.isArray(data)) {
      errors.push('Data must be an array')
      return { isValid: false, errors, warnings }
    }
    
    data.forEach((standard, index) => {
      if (!standard.id_no) {
        errors.push(`Standard at index ${index} is missing ID`)
      }
      if (!standard.name) {
        errors.push(`Standard at index ${index} is missing name`)
      }
      if (!standard.status) {
        warnings.push(`Standard at index ${index} is missing status`)
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Create migration backup
  async createMigrationBackup(data: StandardsRegister[]): Promise<string> {
    const backupData = {
      version: this.currentVersion,
      timestamp: new Date().toISOString(),
      data: data
    }
    
    const jsonData = JSON.stringify(backupData, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `migration_backup_${this.currentVersion}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    
    return link.download
  }
}

// Create migration manager instance
export const migrationManager = new MigrationManager()

// Migration utilities
export const getAvailableMigrations = (): MigrationVersion[] => {
  return migrationManager.getAvailableMigrations()
}

export const getCurrentVersion = (): string => {
  return migrationManager.getCurrentVersion()
}

export const isMigrationNeeded = (targetVersion: string): boolean => {
  return migrationManager.isMigrationNeeded(targetVersion)
}

export const executeMigration = (targetVersion: string, data: StandardsRegister[]): Promise<MigrationResult> => {
  return migrationManager.executeMigration(targetVersion, data)
}

export const rollbackMigration = (targetVersion: string, data: StandardsRegister[]): Promise<MigrationResult> => {
  return migrationManager.rollbackMigration(targetVersion, data)
}

export const validateDataBeforeMigration = (data: StandardsRegister[]) => {
  return migrationManager.validateDataBeforeMigration(data)
}

export const createMigrationBackup = (data: StandardsRegister[]): Promise<string> => {
  return migrationManager.createMigrationBackup(data)
}

// Migration hooks
export const useMigration = () => {
  const [isMigrating, setIsMigrating] = React.useState(false)
  const [migrationResult, setMigrationResult] = React.useState<MigrationResult | null>(null)

  const executeMigration = async (targetVersion: string, data: StandardsRegister[]) => {
    setIsMigrating(true)
    try {
      const result = await migrationManager.executeMigration(targetVersion, data)
      setMigrationResult(result)
      return result
    } finally {
      setIsMigrating(false)
    }
  }

  const rollbackMigration = async (targetVersion: string, data: StandardsRegister[]) => {
    setIsMigrating(true)
    try {
      const result = await migrationManager.rollbackMigration(targetVersion, data)
      setMigrationResult(result)
      return result
    } finally {
      setIsMigrating(false)
    }
  }

  return {
    isMigrating,
    migrationResult,
    executeMigration,
    rollbackMigration,
    availableMigrations: getAvailableMigrations(),
    currentVersion: getCurrentVersion()
  }
}

// Migration validation
export const validateMigrationOptions = (options: {
  targetVersion: string
  createBackup: boolean
  validateData: boolean
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!options.targetVersion) {
    errors.push('Target version is required')
  }
  
  if (options.targetVersion && !migrationManager.isMigrationNeeded(options.targetVersion)) {
    errors.push('Target version is not newer than current version')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Migration scheduling
export const scheduleMigration = (targetVersion: string, data: StandardsRegister[]): void => {
  setTimeout(async () => {
    try {
      const result = await executeMigration(targetVersion, data)
      if (result.success) {
        console.log(`Migration to ${targetVersion} completed successfully`)
      } else {
        console.error(`Migration to ${targetVersion} failed:`, result.errors)
      }
    } catch (error) {
      console.error('Scheduled migration failed:', error)
    }
  }, 1000)
}
