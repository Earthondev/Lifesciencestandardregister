import { StandardsRegister } from '@/types'

// Performance metrics
export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  cpuUsage: number
  networkLatency: number
  cacheHitRate: number
  errorRate: number
  throughput: number
}

// Performance measurement
export interface PerformanceMeasurement {
  name: string
  startTime: number
  endTime: number
  duration: number
  memoryDelta: number
  data?: any
}

// Performance threshold
export interface PerformanceThreshold {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'percent' | 'count'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// Performance manager class
class PerformanceManager {
  private measurements: PerformanceMeasurement[] = []
  private thresholds: PerformanceThreshold[] = []
  private observers: ((metrics: PerformanceMetrics) => void)[] = []

  constructor() {
    this.initializeThresholds()
    this.startMonitoring()
  }

  // Initialize performance thresholds
  private initializeThresholds(): void {
    this.thresholds = [
      { name: 'Page Load Time', value: 2000, unit: 'ms', severity: 'medium' },
      { name: 'API Response Time', value: 1000, unit: 'ms', severity: 'medium' },
      { name: 'Memory Usage', value: 50 * 1024 * 1024, unit: 'bytes', severity: 'high' },
      { name: 'Cache Hit Rate', value: 80, unit: 'percent', severity: 'low' },
      { name: 'Error Rate', value: 5, unit: 'percent', severity: 'high' },
      { name: 'Throughput', value: 100, unit: 'count', severity: 'medium' }
    ]
  }

  // Start performance monitoring
  private startMonitoring(): void {
    if (typeof window === 'undefined') return

    // Monitor memory usage
    setInterval(() => {
      this.measureMemoryUsage()
    }, 5000)

    // Monitor page performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        this.measurePageLoadTime()
      })
    }
  }

  // Start performance measurement
  startMeasurement(name: string): PerformanceMeasurement {
    const measurement: PerformanceMeasurement = {
      name,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      memoryDelta: 0
    }

    this.measurements.push(measurement)
    return measurement
  }

  // End performance measurement
  endMeasurement(measurement: PerformanceMeasurement, data?: any): void {
    measurement.endTime = performance.now()
    measurement.duration = measurement.endTime - measurement.startTime
    measurement.data = data

    // Check against thresholds
    this.checkThresholds(measurement)

    // Notify observers
    this.notifyObservers()
  }

  // Measure function execution time
  measureFunction<T>(name: string, fn: () => T): T {
    const measurement = this.startMeasurement(name)
    
    try {
      const result = fn()
      this.endMeasurement(measurement)
      return result
    } catch (error) {
      this.endMeasurement(measurement, { error })
      throw error
    }
  }

  // Measure async function execution time
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const measurement = this.startMeasurement(name)
    
    try {
      const result = await fn()
      this.endMeasurement(measurement)
      return result
    } catch (error) {
      this.endMeasurement(measurement, { error })
      throw error
    }
  }

  // Measure data processing performance
  measureDataProcessing<T>(
    name: string,
    data: T[],
    processor: (data: T[]) => any
  ): any {
    const measurement = this.startMeasurement(name)
    
    try {
      const result = processor(data)
      this.endMeasurement(measurement, {
        inputSize: data.length,
        outputSize: Array.isArray(result) ? result.length : 1
      })
      return result
    } catch (error) {
      this.endMeasurement(measurement, { error })
      throw error
    }
  }

  // Measure API call performance
  async measureApiCall<T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const measurement = this.startMeasurement(name)
    
    try {
      const result = await apiCall()
      this.endMeasurement(measurement, {
        success: true,
        responseSize: JSON.stringify(result).length
      })
      return result
    } catch (error) {
      this.endMeasurement(measurement, { error, success: false })
      throw error
    }
  }

  // Measure memory usage
  private measureMemoryUsage(): void {
    if (typeof window === 'undefined' || !('memory' in performance)) return

    const memory = (performance as any).memory
    const measurement = this.startMeasurement('Memory Usage')
    
    this.endMeasurement(measurement, {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    })
  }

  // Measure page load time
  private measurePageLoadTime(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const measurement = this.startMeasurement('Page Load Time')
    
    this.endMeasurement(measurement, {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalTime: navigation.loadEventEnd - navigation.navigationStart
    })
  }

  // Check performance thresholds
  private checkThresholds(measurement: PerformanceMeasurement): void {
    const threshold = this.thresholds.find(t => t.name === measurement.name)
    if (!threshold) return

    let value = measurement.duration
    if (measurement.data?.usedJSHeapSize) {
      value = measurement.data.usedJSHeapSize
    }

    if (value > threshold.value) {
      console.warn(`Performance threshold exceeded: ${threshold.name}`, {
        value,
        threshold: threshold.value,
        severity: threshold.severity
      })
    }
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    const recentMeasurements = this.measurements.slice(-100)
    
    return {
      loadTime: this.getAverageMeasurement('Page Load Time'),
      renderTime: this.getAverageMeasurement('Render Time'),
      memoryUsage: this.getLatestMemoryUsage(),
      cpuUsage: 0, // Would need additional monitoring
      networkLatency: this.getAverageMeasurement('API Response Time'),
      cacheHitRate: this.getCacheHitRate(),
      errorRate: this.getErrorRate(),
      throughput: this.getThroughput()
    }
  }

  // Get average measurement
  private getAverageMeasurement(name: string): number {
    const measurements = this.measurements.filter(m => m.name === name)
    if (measurements.length === 0) return 0
    
    const total = measurements.reduce((sum, m) => sum + m.duration, 0)
    return total / measurements.length
  }

  // Get latest memory usage
  private getLatestMemoryUsage(): number {
    const memoryMeasurements = this.measurements.filter(m => m.name === 'Memory Usage')
    if (memoryMeasurements.length === 0) return 0
    
    const latest = memoryMeasurements[memoryMeasurements.length - 1]
    return latest.data?.usedJSHeapSize || 0
  }

  // Get cache hit rate
  private getCacheHitRate(): number {
    // This would be calculated based on actual cache usage
    return 85 // Placeholder
  }

  // Get error rate
  private getErrorRate(): number {
    const errorMeasurements = this.measurements.filter(m => m.data?.error)
    const totalMeasurements = this.measurements.length
    
    if (totalMeasurements === 0) return 0
    
    return (errorMeasurements.length / totalMeasurements) * 100
  }

  // Get throughput
  private getThroughput(): number {
    const recentMeasurements = this.measurements.slice(-60) // Last minute
    return recentMeasurements.length
  }

  // Get measurements
  getMeasurements(): PerformanceMeasurement[] {
    return [...this.measurements]
  }

  // Get measurements by name
  getMeasurementsByName(name: string): PerformanceMeasurement[] {
    return this.measurements.filter(m => m.name === name)
  }

  // Clear measurements
  clearMeasurements(): void {
    this.measurements = []
  }

  // Subscribe to performance updates
  subscribe(observer: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(observer)
    return () => {
      const index = this.observers.indexOf(observer)
      if (index > -1) {
        this.observers.splice(index, 1)
      }
    }
  }

  // Notify observers
  private notifyObservers(): void {
    const metrics = this.getPerformanceMetrics()
    this.observers.forEach(observer => {
      try {
        observer(metrics)
      } catch (error) {
        console.error('Error in performance observer:', error)
      }
    })
  }

  // Optimize data processing
  optimizeDataProcessing<T>(data: T[], processor: (data: T[]) => any): any {
    // Use Web Workers for large datasets
    if (data.length > 10000) {
      return this.processWithWebWorker(data, processor)
    }
    
    // Use requestIdleCallback for medium datasets
    if (data.length > 1000) {
      return this.processWithIdleCallback(data, processor)
    }
    
    // Process immediately for small datasets
    return processor(data)
  }

  // Process with Web Worker
  private processWithWebWorker<T>(data: T[], processor: (data: T[]) => any): any {
    // This would require implementing Web Worker logic
    return processor(data)
  }

  // Process with requestIdleCallback
  private processWithIdleCallback<T>(data: T[], processor: (data: T[]) => any): any {
    return new Promise((resolve) => {
      const processChunk = (deadline: IdleDeadline) => {
        while (deadline.timeRemaining() > 0 && data.length > 0) {
          const chunk = data.splice(0, 100)
          processor(chunk)
        }
        
        if (data.length > 0) {
          requestIdleCallback(processChunk)
        } else {
          resolve(true)
        }
      }
      
      requestIdleCallback(processChunk)
    })
  }

  // Debounce function
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Throttle function
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // Memoize function
  memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map()
    
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args)
      
      if (cache.has(key)) {
        return cache.get(key)
      }
      
      const result = func(...args)
      cache.set(key, result)
      return result
    }) as T
  }

  // Lazy load function
  lazyLoad<T>(loader: () => Promise<T>): () => Promise<T> {
    let promise: Promise<T> | null = null
    
    return () => {
      if (!promise) {
        promise = loader()
      }
      return promise
    }
  }

  // Batch operations
  batchOperations<T>(operations: (() => T)[], batchSize: number = 10): T[] {
    const results: T[] = []
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize)
      const batchResults = batch.map(op => op())
      results.push(...batchResults)
    }
    
    return results
  }

  // Virtual scrolling
  virtualScroll<T>(
    items: T[],
    containerHeight: number,
    itemHeight: number,
    scrollTop: number
  ): { visibleItems: T[]; startIndex: number; endIndex: number } {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + visibleCount, items.length)
    
    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      endIndex
    }
  }

  // Export performance data
  exportPerformanceData(): string {
    const data = {
      measurements: this.measurements,
      thresholds: this.thresholds,
      metrics: this.getPerformanceMetrics(),
      timestamp: new Date().toISOString()
    }
    
    return JSON.stringify(data, null, 2)
  }
}

// Create performance manager instance
export const performanceManager = new PerformanceManager()

// Performance utilities
export const measurePerformance = <T>(name: string, fn: () => T): T => {
  return performanceManager.measureFunction(name, fn)
}

export const measureAsyncPerformance = <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  return performanceManager.measureAsyncFunction(name, fn)
}

export const measureDataProcessing = <T>(name: string, data: T[], processor: (data: T[]) => any): any => {
  return performanceManager.measureDataProcessing(name, data, processor)
}

export const measureApiCall = <T>(name: string, apiCall: () => Promise<T>): Promise<T> => {
  return performanceManager.measureApiCall(name, apiCall)
}

export const getPerformanceMetrics = (): PerformanceMetrics => {
  return performanceManager.getPerformanceMetrics()
}

export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void => {
  return performanceManager.debounce(func, wait)
}

export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void => {
  return performanceManager.throttle(func, limit)
}

export const memoize = <T extends (...args: any[]) => any>(func: T): T => {
  return performanceManager.memoize(func)
}

export const lazyLoad = <T>(loader: () => Promise<T>): () => Promise<T> => {
  return performanceManager.lazyLoad(loader)
}

// Performance hooks
export const usePerformance = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>(performanceManager.getPerformanceMetrics())
  const [measurements, setMeasurements] = React.useState<PerformanceMeasurement[]>([])

  React.useEffect(() => {
    const unsubscribe = performanceManager.subscribe((newMetrics) => {
      setMetrics(newMetrics)
      setMeasurements(performanceManager.getMeasurements())
    })

    return unsubscribe
  }, [])

  const measureFunction = <T>(name: string, fn: () => T): T => {
    return performanceManager.measureFunction(name, fn)
  }

  const measureAsyncFunction = <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    return performanceManager.measureAsyncFunction(name, fn)
  }

  const clearMeasurements = () => {
    performanceManager.clearMeasurements()
    setMeasurements([])
  }

  const exportData = () => {
    return performanceManager.exportPerformanceData()
  }

  return {
    metrics,
    measurements,
    measureFunction,
    measureAsyncFunction,
    clearMeasurements,
    exportData
  }
}

// Performance validation
export const validatePerformanceThreshold = (threshold: Partial<PerformanceThreshold>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (threshold.value && threshold.value < 0) {
    errors.push('Threshold value must be positive')
  }
  
  if (threshold.unit && !['ms', 'bytes', 'percent', 'count'].includes(threshold.unit)) {
    errors.push('Invalid threshold unit')
  }
  
  if (threshold.severity && !['low', 'medium', 'high', 'critical'].includes(threshold.severity)) {
    errors.push('Invalid severity level')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Performance scheduling
export const schedulePerformanceMonitoring = (interval: number = 60000): void => {
  setInterval(() => {
    const metrics = performanceManager.getPerformanceMetrics()
    console.log('Performance metrics:', metrics)
  }, interval)
}
