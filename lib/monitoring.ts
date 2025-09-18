import React from 'react'
import { StandardsRegister, StatusLog } from '@/types'
import { formatDate } from './formatters'
import { notificationManager } from './notifications'

// Monitoring rule
export interface MonitoringRule {
  id: string
  name: string
  description: string
  condition: (data: StandardsRegister[]) => boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  notificationEnabled: boolean
  cooldownPeriod: number // in milliseconds
  lastTriggered?: Date
}

// Monitoring alert
export interface MonitoringAlert {
  id: string
  ruleId: string
  ruleName: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  data?: any
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
}

// Monitoring metrics
export interface MonitoringMetrics {
  totalAlerts: number
  activeAlerts: number
  acknowledgedAlerts: number
  criticalAlerts: number
  highAlerts: number
  mediumAlerts: number
  lowAlerts: number
  lastAlertTime?: Date
  averageResponseTime: number
}

// Monitoring manager class
class MonitoringManager {
  private rules: Map<string, MonitoringRule> = new Map()
  private alerts: MonitoringAlert[] = []
  private metrics: MonitoringMetrics = {
    totalAlerts: 0,
    activeAlerts: 0,
    acknowledgedAlerts: 0,
    criticalAlerts: 0,
    highAlerts: 0,
    mediumAlerts: 0,
    lowAlerts: 0,
    averageResponseTime: 0
  }

  constructor() {
    this.initializeDefaultRules()
  }

  // Initialize default monitoring rules
  private initializeDefaultRules(): void {
    // Expiry warning rule
    this.addRule({
      id: 'expiry_warning_30',
      name: 'Expiry Warning (30 days)',
      description: 'Alert when standards are expiring within 30 days',
      condition: (data) => {
        const now = new Date()
        const warningDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
        return data.some(standard => {
          if (!standard.lab_expiry_date) return false
          const expiryDate = new Date(standard.lab_expiry_date)
          return expiryDate <= warningDate && expiryDate > now
        })
      },
      severity: 'medium',
      enabled: true,
      notificationEnabled: true,
      cooldownPeriod: 24 * 60 * 60 * 1000 // 24 hours
    })

    // Expiry warning rule (60 days)
    this.addRule({
      id: 'expiry_warning_60',
      name: 'Expiry Warning (60 days)',
      description: 'Alert when standards are expiring within 60 days',
      condition: (data) => {
        const now = new Date()
        const warningDate = new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000))
        return data.some(standard => {
          if (!standard.lab_expiry_date) return false
          const expiryDate = new Date(standard.lab_expiry_date)
          return expiryDate <= warningDate && expiryDate > now
        })
      },
      severity: 'low',
      enabled: true,
      notificationEnabled: true,
      cooldownPeriod: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    // Expired standards rule
    this.addRule({
      id: 'expired_standards',
      name: 'Expired Standards',
      description: 'Alert when standards have expired',
      condition: (data) => {
        const now = new Date()
        return data.some(standard => {
          if (!standard.lab_expiry_date) return false
          const expiryDate = new Date(standard.lab_expiry_date)
          return expiryDate < now
        })
      },
      severity: 'high',
      enabled: true,
      notificationEnabled: true,
      cooldownPeriod: 24 * 60 * 60 * 1000 // 24 hours
    })

    // Low utilization rule
    this.addRule({
      id: 'low_utilization',
      name: 'Low Utilization',
      description: 'Alert when standards have been unopened for more than 6 months',
      condition: (data) => {
        const now = new Date()
        const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000))
        return data.some(standard => {
          if (standard.status !== 'Unopened') return false
          const receivedDate = new Date(standard.date_received)
          return receivedDate < sixMonthsAgo
        })
      },
      severity: 'medium',
      enabled: true,
      notificationEnabled: true,
      cooldownPeriod: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    // High value items rule
    this.addRule({
      id: 'high_value_items',
      name: 'High Value Items',
      description: 'Alert when high value standards are detected',
      condition: (data) => {
        return data.some(standard => {
          const concentration = parseFloat(standard.concentration?.toString() || '0')
          const packingSize = parseFloat(standard.packing_size?.toString() || '0')
          const value = concentration * packingSize
          return value > 1000
        })
      },
      severity: 'low',
      enabled: true,
      notificationEnabled: false,
      cooldownPeriod: 24 * 60 * 60 * 1000 // 24 hours
    })

    // Data quality rule
    this.addRule({
      id: 'data_quality',
      name: 'Data Quality Issues',
      description: 'Alert when data quality issues are detected',
      condition: (data) => {
        return data.some(standard => {
          const requiredFields = ['name', 'manufacturer', 'supplier', 'concentration', 'packing_size']
          const missingFields = requiredFields.filter(field => {
            const value = standard[field as keyof StandardsRegister]
            return !value || value.toString().trim() === ''
          })
          return missingFields.length > 2
        })
      },
      severity: 'medium',
      enabled: true,
      notificationEnabled: true,
      cooldownPeriod: 24 * 60 * 60 * 1000 // 24 hours
    })

    // Duplicate IDs rule
    this.addRule({
      id: 'duplicate_ids',
      name: 'Duplicate IDs',
      description: 'Alert when duplicate IDs are detected',
      condition: (data) => {
        const ids = data.map(standard => standard.id_no)
        const uniqueIds = new Set(ids)
        return ids.length !== uniqueIds.size
      },
      severity: 'critical',
      enabled: true,
      notificationEnabled: true,
      cooldownPeriod: 60 * 60 * 1000 // 1 hour
    })
  }

  // Add monitoring rule
  addRule(rule: MonitoringRule): void {
    this.rules.set(rule.id, rule)
  }

  // Remove monitoring rule
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId)
  }

  // Get all rules
  getRules(): MonitoringRule[] {
    return Array.from(this.rules.values())
  }

  // Get rule by ID
  getRule(ruleId: string): MonitoringRule | undefined {
    return this.rules.get(ruleId)
  }

  // Enable/disable rule
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId)
    if (rule) {
      rule.enabled = enabled
    }
  }

  // Run monitoring checks
  async runMonitoringChecks(data: StandardsRegister[]): Promise<MonitoringAlert[]> {
    const newAlerts: MonitoringAlert[] = []
    const now = new Date()

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue

      // Check cooldown period
      if (rule.lastTriggered) {
        const timeSinceLastTrigger = now.getTime() - rule.lastTriggered.getTime()
        if (timeSinceLastTrigger < rule.cooldownPeriod) {
          continue
        }
      }

      // Check rule condition
      if (rule.condition(data)) {
        const alert: MonitoringAlert = {
          id: this.generateAlertId(),
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          message: this.generateAlertMessage(rule, data),
          timestamp: now,
          data: this.getAlertData(rule, data),
          acknowledged: false
        }

        newAlerts.push(alert)
        this.alerts.push(alert)
        rule.lastTriggered = now

        // Send notification if enabled
        if (rule.notificationEnabled) {
          await this.sendNotification(alert)
        }
      }
    }

    this.updateMetrics()
    return newAlerts
  }

  // Generate alert ID
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Generate alert message
  private generateAlertMessage(rule: MonitoringRule, data: StandardsRegister[]): string {
    switch (rule.id) {
      case 'expiry_warning_30':
        const expiring30 = this.getExpiringStandards(data, 30)
        return `มีสารมาตรฐาน ${expiring30.length} รายการที่ใกล้หมดอายุในอีก 30 วัน`
      
      case 'expiry_warning_60':
        const expiring60 = this.getExpiringStandards(data, 60)
        return `มีสารมาตรฐาน ${expiring60.length} รายการที่ใกล้หมดอายุในอีก 60 วัน`
      
      case 'expired_standards':
        const expired = this.getExpiredStandards(data)
        return `มีสารมาตรฐาน ${expired.length} รายการที่หมดอายุแล้ว`
      
      case 'low_utilization':
        const lowUtil = this.getLowUtilizationStandards(data)
        return `มีสารมาตรฐาน ${lowUtil.length} รายการที่ยังไม่ได้เปิดใช้เป็นเวลานาน`
      
      case 'high_value_items':
        const highValue = this.getHighValueStandards(data)
        return `มีสารมาตรฐาน ${highValue.length} รายการที่มีค่าสูง`
      
      case 'data_quality':
        const qualityIssues = this.getDataQualityIssues(data)
        return `พบปัญหาคุณภาพข้อมูลใน ${qualityIssues.length} รายการ`
      
      case 'duplicate_ids':
        return 'พบรหัสซ้ำในระบบ'
      
      default:
        return rule.description
    }
  }

  // Get alert data
  private getAlertData(rule: MonitoringRule, data: StandardsRegister[]): any {
    switch (rule.id) {
      case 'expiry_warning_30':
        return this.getExpiringStandards(data, 30)
      
      case 'expiry_warning_60':
        return this.getExpiringStandards(data, 60)
      
      case 'expired_standards':
        return this.getExpiredStandards(data)
      
      case 'low_utilization':
        return this.getLowUtilizationStandards(data)
      
      case 'high_value_items':
        return this.getHighValueStandards(data)
      
      case 'data_quality':
        return this.getDataQualityIssues(data)
      
      case 'duplicate_ids':
        return this.getDuplicateIds(data)
      
      default:
        return null
    }
  }

  // Get expiring standards
  private getExpiringStandards(data: StandardsRegister[], days: number): StandardsRegister[] {
    const now = new Date()
    const warningDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))

    return data.filter(standard => {
      if (!standard.lab_expiry_date) return false
      const expiryDate = new Date(standard.lab_expiry_date)
      return expiryDate <= warningDate && expiryDate > now
    })
  }

  // Get expired standards
  private getExpiredStandards(data: StandardsRegister[]): StandardsRegister[] {
    const now = new Date()

    return data.filter(standard => {
      if (!standard.lab_expiry_date) return false
      const expiryDate = new Date(standard.lab_expiry_date)
      return expiryDate < now
    })
  }

  // Get low utilization standards
  private getLowUtilizationStandards(data: StandardsRegister[]): StandardsRegister[] {
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000))

    return data.filter(standard => {
      if (standard.status !== 'Unopened') return false
      const receivedDate = new Date(standard.date_received)
      return receivedDate < sixMonthsAgo
    })
  }

  // Get high value standards
  private getHighValueStandards(data: StandardsRegister[]): StandardsRegister[] {
    return data.filter(standard => {
      const concentration = parseFloat(standard.concentration?.toString() || '0')
      const packingSize = parseFloat(standard.packing_size?.toString() || '0')
      const value = concentration * packingSize
      return value > 1000
    })
  }

  // Get data quality issues
  private getDataQualityIssues(data: StandardsRegister[]): StandardsRegister[] {
    return data.filter(standard => {
      const requiredFields = ['name', 'manufacturer', 'supplier', 'concentration', 'packing_size']
      const missingFields = requiredFields.filter(field => {
        const value = standard[field as keyof StandardsRegister]
        return !value || value.toString().trim() === ''
      })
      return missingFields.length > 2
    })
  }

  // Get duplicate IDs
  private getDuplicateIds(data: StandardsRegister[]): string[] {
    const ids = data.map(standard => standard.id_no)
    const duplicates: string[] = []
    const seen = new Set<string>()

    ids.forEach(id => {
      if (seen.has(id)) {
        duplicates.push(id)
      } else {
        seen.add(id)
      }
    })

    return duplicates
  }

  // Send notification
  private async sendNotification(alert: MonitoringAlert): Promise<void> {
    const message = `[${alert.severity.toUpperCase()}] ${alert.ruleName}: ${alert.message}`
    
    try {
      await notificationManager.sendLineNotification(message, alert.severity)
    } catch (error) {
      console.error('Failed to send monitoring notification:', error)
    }
  }

  // Update metrics
  private updateMetrics(): void {
    this.metrics.totalAlerts = this.alerts.length
    this.metrics.activeAlerts = this.alerts.filter(alert => !alert.acknowledged).length
    this.metrics.acknowledgedAlerts = this.alerts.filter(alert => alert.acknowledged).length
    this.metrics.criticalAlerts = this.alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged).length
    this.metrics.highAlerts = this.alerts.filter(alert => alert.severity === 'high' && !alert.acknowledged).length
    this.metrics.mediumAlerts = this.alerts.filter(alert => alert.severity === 'medium' && !alert.acknowledged).length
    this.metrics.lowAlerts = this.alerts.filter(alert => alert.severity === 'low' && !alert.acknowledged).length
    
    const lastAlert = this.alerts[this.alerts.length - 1]
    if (lastAlert) {
      this.metrics.lastAlertTime = lastAlert.timestamp
    }
  }

  // Get all alerts
  getAlerts(): MonitoringAlert[] {
    return [...this.alerts]
  }

  // Get active alerts
  getActiveAlerts(): MonitoringAlert[] {
    return this.alerts.filter(alert => !alert.acknowledged)
  }

  // Get alerts by severity
  getAlertsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): MonitoringAlert[] {
    return this.alerts.filter(alert => alert.severity === severity)
  }

  // Acknowledge alert
  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      alert.acknowledgedBy = acknowledgedBy
      alert.acknowledgedAt = new Date()
      this.updateMetrics()
    }
  }

  // Acknowledge all alerts
  acknowledgeAllAlerts(acknowledgedBy: string): void {
    this.alerts.forEach(alert => {
      if (!alert.acknowledged) {
        alert.acknowledged = true
        alert.acknowledgedBy = acknowledgedBy
        alert.acknowledgedAt = new Date()
      }
    })
    this.updateMetrics()
  }

  // Get metrics
  getMetrics(): MonitoringMetrics {
    return { ...this.metrics }
  }

  // Clear old alerts
  clearOldAlerts(days: number = 30): void {
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000))
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffDate)
    this.updateMetrics()
  }

  // Export alerts
  exportAlerts(): string {
    const alertData = this.alerts.map(alert => ({
      id: alert.id,
      ruleName: alert.ruleName,
      severity: alert.severity,
      message: alert.message,
      timestamp: alert.timestamp.toISOString(),
      acknowledged: alert.acknowledged,
      acknowledgedBy: alert.acknowledgedBy,
      acknowledgedAt: alert.acknowledgedAt?.toISOString()
    }))

    return JSON.stringify(alertData, null, 2)
  }

  // Import alerts
  importAlerts(alertData: string): void {
    try {
      const alerts = JSON.parse(alertData)
      alerts.forEach((alert: any) => {
        this.alerts.push({
          ...alert,
          timestamp: new Date(alert.timestamp),
          acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined
        })
      })
      this.updateMetrics()
    } catch (error) {
      console.error('Failed to import alerts:', error)
    }
  }
}

// Create monitoring manager instance
export const monitoringManager = new MonitoringManager()

// Monitoring utilities
export const runMonitoringChecks = (data: StandardsRegister[]): Promise<MonitoringAlert[]> => {
  return monitoringManager.runMonitoringChecks(data)
}

export const getMonitoringRules = (): MonitoringRule[] => {
  return monitoringManager.getRules()
}

export const getActiveAlerts = (): MonitoringAlert[] => {
  return monitoringManager.getActiveAlerts()
}

export const getMonitoringMetrics = (): MonitoringMetrics => {
  return monitoringManager.getMetrics()
}

export const acknowledgeAlert = (alertId: string, acknowledgedBy: string): void => {
  monitoringManager.acknowledgeAlert(alertId, acknowledgedBy)
}

export const acknowledgeAllAlerts = (acknowledgedBy: string): void => {
  monitoringManager.acknowledgeAllAlerts(acknowledgedBy)
}

// Monitoring hooks
export const useMonitoring = () => {
  const [alerts, setAlerts] = React.useState<MonitoringAlert[]>([])
  const [metrics, setMetrics] = React.useState<MonitoringMetrics>(monitoringManager.getMetrics())
  const [isRunning, setIsRunning] = React.useState(false)

  const runChecks = async (data: StandardsRegister[]) => {
    setIsRunning(true)
    try {
      const newAlerts = await monitoringManager.runMonitoringChecks(data)
      setAlerts(monitoringManager.getAlerts())
      setMetrics(monitoringManager.getMetrics())
      return newAlerts
    } finally {
      setIsRunning(false)
    }
  }

  const acknowledgeAlert = (alertId: string, acknowledgedBy: string) => {
    monitoringManager.acknowledgeAlert(alertId, acknowledgedBy)
    setAlerts(monitoringManager.getAlerts())
    setMetrics(monitoringManager.getMetrics())
  }

  const acknowledgeAllAlerts = (acknowledgedBy: string) => {
    monitoringManager.acknowledgeAllAlerts(acknowledgedBy)
    setAlerts(monitoringManager.getAlerts())
    setMetrics(monitoringManager.getMetrics())
  }

  return {
    alerts,
    metrics,
    isRunning,
    runChecks,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    rules: monitoringManager.getRules()
  }
}

// Monitoring scheduling
export const scheduleMonitoring = (data: StandardsRegister[], interval: number): void => {
  setInterval(async () => {
    try {
      await monitoringManager.runMonitoringChecks(data)
    } catch (error) {
      console.error('Scheduled monitoring failed:', error)
    }
  }, interval)
}

// Monitoring validation
export const validateMonitoringRule = (rule: Partial<MonitoringRule>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!rule.id) {
    errors.push('Rule ID is required')
  }
  
  if (!rule.name) {
    errors.push('Rule name is required')
  }
  
  if (!rule.description) {
    errors.push('Rule description is required')
  }
  
  if (!rule.condition) {
    errors.push('Rule condition is required')
  }
  
  if (!rule.severity) {
    errors.push('Rule severity is required')
  }
  
  if (rule.cooldownPeriod && rule.cooldownPeriod < 0) {
    errors.push('Cooldown period must be positive')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
