import React from 'react'
import { STORAGE_KEYS } from './constants'

// Configuration interface
interface AppConfig {
  // API Configuration
  apiUrl: string
  timeout: number
  
  // App Configuration
  appName: string
  appVersion: string
  timezone: string
  
  // Feature Flags
  features: {
    lineNotifications: boolean
    exportEnabled: boolean
    fuzzySearch: boolean
    autoRefresh: boolean
  }
  
  // UI Configuration
  ui: {
    theme: string
    language: string
    animations: boolean
    autoRefreshInterval: number
  }
  
  // Security Configuration
  security: {
    sessionTimeout: number
    allowedDomains: string[]
    requireVerification: boolean
  }
  
  // Cache Configuration
  cache: {
    enabled: boolean
    defaultTTL: number
    maxSize: number
  }
}

// Default configuration
const defaultConfig: AppConfig = {
  apiUrl: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_URL || '',
  timeout: 30000,
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Life Science Standards Register',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  timezone: process.env.NEXT_PUBLIC_TIMEZONE || 'Asia/Bangkok',
  features: {
    lineNotifications: process.env.NEXT_PUBLIC_LINE_NOTIFY_ENABLED === 'true',
    exportEnabled: true,
    fuzzySearch: true,
    autoRefresh: true
  },
  ui: {
    theme: 'orange',
    language: 'th',
    animations: true,
    autoRefreshInterval: 300000 // 5 minutes
  },
  security: {
    sessionTimeout: 3600000, // 1 hour
    allowedDomains: [],
    requireVerification: false
  },
  cache: {
    enabled: true,
    defaultTTL: 300000, // 5 minutes
    maxSize: 100
  }
}

// Configuration manager class
class ConfigManager {
  private config: AppConfig = { ...defaultConfig }
  private listeners: ((config: AppConfig) => void)[] = []

  constructor() {
    this.loadConfig()
  }

  // Get current configuration
  getConfig(): AppConfig {
    return { ...this.config }
  }

  // Get specific configuration value
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key]
  }

  // Set configuration value
  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value
    this.saveConfig()
    this.notifyListeners()
  }

  // Update multiple configuration values
  update(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates }
    this.saveConfig()
    this.notifyListeners()
  }

  // Reset to default configuration
  reset(): void {
    this.config = { ...defaultConfig }
    this.saveConfig()
    this.notifyListeners()
  }

  // Load configuration from localStorage
  private loadConfig(): void {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG)
      if (saved) {
        const savedConfig = JSON.parse(saved)
        this.config = { ...defaultConfig, ...savedConfig }
      }
    } catch (error) {
      console.warn('Failed to load configuration:', error)
    }
  }

  // Save configuration to localStorage
  private saveConfig(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config))
    } catch (error) {
      console.warn('Failed to save configuration:', error)
    }
  }

  // Subscribe to configuration changes
  subscribe(listener: (config: AppConfig) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Notify listeners of configuration changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getConfig()))
  }

  // Validate configuration
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.config.apiUrl) {
      errors.push('API URL is required')
    }

    if (this.config.timeout <= 0) {
      errors.push('Timeout must be greater than 0')
    }

    if (this.config.ui.autoRefreshInterval < 1000) {
      errors.push('Auto refresh interval must be at least 1 second')
    }

    if (this.config.security.sessionTimeout < 60000) {
      errors.push('Session timeout must be at least 1 minute')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Export configuration
  export(): string {
    return JSON.stringify(this.config, null, 2)
  }

  // Import configuration
  import(configData: string): { success: boolean; errors: string[] } {
    try {
      const importedConfig = JSON.parse(configData)
      const validation = this.validate()
      
      if (validation.isValid) {
        this.config = { ...defaultConfig, ...importedConfig }
        this.saveConfig()
        this.notifyListeners()
        return { success: true, errors: [] }
      } else {
        return { success: false, errors: validation.errors }
      }
    } catch (error) {
      return { success: false, errors: ['Invalid configuration format'] }
    }
  }
}

// Create configuration manager instance
export const configManager = new ConfigManager()

// React hook for configuration
export const useConfig = () => {
  const [config, setConfig] = React.useState<AppConfig>(configManager.getConfig())

  React.useEffect(() => {
    const unsubscribe = configManager.subscribe(setConfig)
    return unsubscribe
  }, [])

  return {
    config,
    setConfig: configManager.set.bind(configManager),
    updateConfig: configManager.update.bind(configManager),
    resetConfig: configManager.reset.bind(configManager)
  }
}

// Configuration utilities
export const getApiUrl = (): string => {
  return configManager.get('apiUrl')
}

export const getAppName = (): string => {
  return configManager.get('appName')
}

export const getAppVersion = (): string => {
  return configManager.get('appVersion')
}

export const getTimezone = (): string => {
  return configManager.get('timezone')
}

export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return configManager.get('features')[feature]
}

export const getTheme = (): string => {
  return configManager.get('ui').theme
}

export const getLanguage = (): string => {
  return configManager.get('ui').language
}

export const getAutoRefreshInterval = (): number => {
  return configManager.get('ui').autoRefreshInterval
}

export const getSessionTimeout = (): number => {
  return configManager.get('security').sessionTimeout
}

export const getAllowedDomains = (): string[] => {
  return configManager.get('security').allowedDomains
}

export const isCacheEnabled = (): boolean => {
  return configManager.get('cache').enabled
}

export const getCacheTTL = (): number => {
  return configManager.get('cache').defaultTTL
}

// Environment-specific configuration
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    isDevelopment,
    isProduction,
    apiUrl: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_URL,
    sheetsUrl: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL,
    lineNotifyToken: process.env.NEXT_PUBLIC_LINE_NOTIFY_TOKEN,
    debugMode: isDevelopment
  }
}

// Configuration validation
export const validateEnvironmentVariables = (): { isValid: boolean; missing: string[] } => {
  const required = [
    'NEXT_PUBLIC_GOOGLE_SHEETS_API_URL',
    'NEXT_PUBLIC_GOOGLE_SHEETS_URL'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  return {
    isValid: missing.length === 0,
    missing
  }
}

// Configuration presets
export const CONFIG_PRESETS = {
  development: {
    features: {
      lineNotifications: false,
      exportEnabled: true,
      fuzzySearch: true,
      autoRefresh: true
    },
    ui: {
      theme: 'orange',
      language: 'th',
      animations: true,
      autoRefreshInterval: 60000 // 1 minute for development
    },
    cache: {
      enabled: true,
      defaultTTL: 60000, // 1 minute
      maxSize: 50
    }
  },
  production: {
    features: {
      lineNotifications: true,
      exportEnabled: true,
      fuzzySearch: true,
      autoRefresh: true
    },
    ui: {
      theme: 'orange',
      language: 'th',
      animations: true,
      autoRefreshInterval: 300000 // 5 minutes
    },
    cache: {
      enabled: true,
      defaultTTL: 300000, // 5 minutes
      maxSize: 100
    }
  }
} as const

// Apply configuration preset
export const applyPreset = (preset: keyof typeof CONFIG_PRESETS): void => {
  const presetConfig = CONFIG_PRESETS[preset]
  configManager.update(presetConfig)
}
