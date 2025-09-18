import React from 'react'
import { apiClient } from './api'
import { cacheManager, CACHE_KEYS, CACHE_TTL } from './cache'
import { configManager } from './config'
import { notificationManager } from './notifications'

// Sync status
export interface SyncStatus {
  isSyncing: boolean
  lastSync: Date | null
  nextSync: Date | null
  error: string | null
  progress: number
}

// Sync options
export interface SyncOptions {
  force?: boolean
  silent?: boolean
  includeCache?: boolean
  notifyOnError?: boolean
}

// Sync result
export interface SyncResult {
  success: boolean
  dataUpdated: boolean
  cacheUpdated: boolean
  error?: string
  timestamp: Date
}

// Sync manager class
class SyncManager {
  private status: SyncStatus = {
    isSyncing: false,
    lastSync: null,
    nextSync: null,
    error: null,
    progress: 0
  }
  private listeners: ((status: SyncStatus) => void)[] = []
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    this.loadSyncStatus()
    this.startAutoSync()
  }

  // Get current sync status
  getStatus(): SyncStatus {
    return { ...this.status }
  }

  // Subscribe to sync status changes
  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Start sync process
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.status.isSyncing && !options.force) {
      return {
        success: false,
        dataUpdated: false,
        cacheUpdated: false,
        error: 'Sync already in progress',
        timestamp: new Date()
      }
    }

    this.updateStatus({ isSyncing: true, error: null, progress: 0 })

    try {
      const result = await this.performSync(options)
      
      this.updateStatus({
        isSyncing: false,
        lastSync: new Date(),
        nextSync: this.calculateNextSync(),
        error: null,
        progress: 100
      })

      this.saveSyncStatus()

      if (!options.silent && result.success) {
        notificationManager.success('ข้อมูลถูกซิงค์เรียบร้อยแล้ว')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      this.updateStatus({
        isSyncing: false,
        error: errorMessage,
        progress: 0
      })

      this.saveSyncStatus()

      if (!options.silent && options.notifyOnError !== false) {
        notificationManager.error(`การซิงค์ข้อมูลล้มเหลว: ${errorMessage}`)
      }

      return {
        success: false,
        dataUpdated: false,
        cacheUpdated: false,
        error: errorMessage,
        timestamp: new Date()
      }
    }
  }

  // Perform actual sync
  private async performSync(options: SyncOptions): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      dataUpdated: false,
      cacheUpdated: false,
      timestamp: new Date()
    }

    try {
      // Test connection
      this.updateStatus({ progress: 10 })
      const isConnected = await apiClient.testConnection()
      if (!isConnected) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้')
      }

      // Sync statistics
      this.updateStatus({ progress: 20 })
      const statsResponse = await apiClient.getStatistics()
      if (statsResponse.success) {
        cacheManager.set(CACHE_KEYS.STATISTICS, statsResponse.data, CACHE_TTL.STATISTICS)
        result.cacheUpdated = true
      }

      // Sync standards
      this.updateStatus({ progress: 40 })
      const standardsResponse = await apiClient.getStandards()
      if (standardsResponse.success) {
        cacheManager.set(CACHE_KEYS.STANDARDS, standardsResponse.data, CACHE_TTL.STANDARDS)
        result.dataUpdated = true
      }

      // Sync recent activity
      this.updateStatus({ progress: 60 })
      const activityResponse = await apiClient.getRecentActivity(10)
      if (activityResponse.success) {
        cacheManager.set(CACHE_KEYS.RECENT_ACTIVITY, activityResponse.data, CACHE_TTL.RECENT_ACTIVITY)
      }

      // Sync configuration
      this.updateStatus({ progress: 80 })
      const configResponse = await apiClient.getConfig()
      if (configResponse.success) {
        cacheManager.set(CACHE_KEYS.CONFIG, configResponse.data, CACHE_TTL.CONFIG)
      }

      // Sync holidays
      this.updateStatus({ progress: 90 })
      const holidaysResponse = await apiClient.getHolidays()
      if (holidaysResponse.success) {
        cacheManager.set(CACHE_KEYS.HOLIDAYS, holidaysResponse.data, CACHE_TTL.HOLIDAYS)
      }

      this.updateStatus({ progress: 100 })
      return result
    } catch (error) {
      result.success = false
      result.error = error instanceof Error ? error.message : 'Unknown error'
      throw error
    }
  }

  // Start auto sync
  private startAutoSync(): void {
    const interval = configManager.get('ui').autoRefreshInterval
    if (interval > 0) {
      this.syncInterval = setInterval(() => {
        this.sync({ silent: true, notifyOnError: false })
      }, interval)
    }
  }

  // Stop auto sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Calculate next sync time
  private calculateNextSync(): Date {
    const interval = configManager.get('ui').autoRefreshInterval
    return new Date(Date.now() + interval)
  }

  // Update sync status
  private updateStatus(updates: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...updates }
    this.notifyListeners()
  }

  // Notify listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getStatus()))
  }

  // Load sync status from localStorage
  private loadSyncStatus(): void {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('sync_status')
      if (saved) {
        const status = JSON.parse(saved)
        this.status = {
          ...this.status,
          lastSync: status.lastSync ? new Date(status.lastSync) : null,
          nextSync: status.nextSync ? new Date(status.nextSync) : null,
          error: status.error
        }
      }
    } catch (error) {
      console.warn('Failed to load sync status:', error)
    }
  }

  // Save sync status to localStorage
  private saveSyncStatus(): void {
    if (typeof window === 'undefined') return

    try {
      const status = {
        lastSync: this.status.lastSync?.toISOString(),
        nextSync: this.status.nextSync?.toISOString(),
        error: this.status.error
      }
      localStorage.setItem('sync_status', JSON.stringify(status))
    } catch (error) {
      console.warn('Failed to save sync status:', error)
    }
  }

  // Force sync
  async forceSync(): Promise<SyncResult> {
    return this.sync({ force: true, silent: false })
  }

  // Silent sync
  async silentSync(): Promise<SyncResult> {
    return this.sync({ silent: true, notifyOnError: false })
  }

  // Sync specific data
  async syncSpecificData(type: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      dataUpdated: false,
      cacheUpdated: false,
      timestamp: new Date()
    }

    try {
      switch (type) {
        case 'statistics':
          const statsResponse = await apiClient.getStatistics()
          if (statsResponse.success) {
            cacheManager.set(CACHE_KEYS.STATISTICS, statsResponse.data, CACHE_TTL.STATISTICS)
            result.cacheUpdated = true
          }
          break
        case 'standards':
          const standardsResponse = await apiClient.getStandards()
          if (standardsResponse.success) {
            cacheManager.set(CACHE_KEYS.STANDARDS, standardsResponse.data, CACHE_TTL.STANDARDS)
            result.dataUpdated = true
          }
          break
        case 'activity':
          const activityResponse = await apiClient.getRecentActivity(10)
          if (activityResponse.success) {
            cacheManager.set(CACHE_KEYS.RECENT_ACTIVITY, activityResponse.data, CACHE_TTL.RECENT_ACTIVITY)
            result.cacheUpdated = true
          }
          break
        default:
          throw new Error(`Unknown sync type: ${type}`)
      }

      return result
    } catch (error) {
      result.success = false
      result.error = error instanceof Error ? error.message : 'Unknown error'
      return result
    }
  }
}

// Create sync manager instance
export const syncManager = new SyncManager()

// React hook for sync
export const useSync = () => {
  const [status, setStatus] = React.useState<SyncStatus>(syncManager.getStatus())

  React.useEffect(() => {
    const unsubscribe = syncManager.subscribe(setStatus)
    return unsubscribe
  }, [])

  return {
    status,
    sync: syncManager.sync.bind(syncManager),
    forceSync: syncManager.forceSync.bind(syncManager),
    silentSync: syncManager.silentSync.bind(syncManager),
    syncSpecificData: syncManager.syncSpecificData.bind(syncManager)
  }
}

// Sync utilities
export const isDataStale = (lastSync: Date | null, maxAge: number = 300000): boolean => {
  if (!lastSync) return true
  return Date.now() - lastSync.getTime() > maxAge
}

export const getTimeUntilNextSync = (nextSync: Date | null): number => {
  if (!nextSync) return 0
  return Math.max(0, nextSync.getTime() - Date.now())
}

export const formatTimeUntilNextSync = (nextSync: Date | null): string => {
  const time = getTimeUntilNextSync(nextSync)
  if (time === 0) return 'พร้อมซิงค์'
  
  const minutes = Math.floor(time / 60000)
  const seconds = Math.floor((time % 60000) / 1000)
  
  if (minutes > 0) {
    return `${minutes} นาที ${seconds} วินาที`
  } else {
    return `${seconds} วินาที`
  }
}

// Sync scheduling
export const scheduleSync = (delay: number): Promise<SyncResult> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      syncManager.sync({ silent: true })
        .then(resolve)
        .catch(reject)
    }, delay)
  })
}

// Sync on visibility change
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // Page became visible, check if data is stale
      const status = syncManager.getStatus()
      if (isDataStale(status.lastSync)) {
        syncManager.silentSync()
      }
    }
  })
}

// Sync on network reconnection
if (typeof window !== 'undefined' && 'navigator' in window) {
  window.addEventListener('online', () => {
    syncManager.silentSync()
  })
}
