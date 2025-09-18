import { StandardsRegister, StatusLog, Statistics } from '@/types'
import { formatDate, formatNumber } from './formatters'

// Analytics options
export interface AnalyticsOptions {
  dateRange?: {
    start: Date
    end: Date
  }
  groupBy?: 'day' | 'week' | 'month' | 'year'
  filters?: {
    status?: string[]
    manufacturer?: string[]
    testGroup?: string[]
  }
}

// Analytics result
export interface AnalyticsResult {
  summary: AnalyticsSummary
  trends: AnalyticsTrend[]
  charts: AnalyticsChart[]
  insights: AnalyticsInsight[]
}

// Analytics summary
export interface AnalyticsSummary {
  totalStandards: number
  totalValue: number
  averageAge: number
  utilizationRate: number
  expiryRate: number
  growthRate: number
}

// Analytics trend
export interface AnalyticsTrend {
  period: string
  value: number
  change: number
  changePercent: number
}

// Analytics chart
export interface AnalyticsChart {
  type: 'bar' | 'line' | 'pie' | 'doughnut'
  title: string
  data: any[]
  labels: string[]
  colors?: string[]
}

// Analytics insight
export interface AnalyticsInsight {
  type: 'warning' | 'info' | 'success' | 'error'
  title: string
  message: string
  value?: number
  recommendation?: string
}

// Analytics manager class
class AnalyticsManager {
  // Generate analytics report
  generateAnalyticsReport(
    standards: StandardsRegister[],
    statusLog: StatusLog[],
    options: AnalyticsOptions = {}
  ): AnalyticsResult {
    const summary = this.generateSummary(standards, statusLog, options)
    const trends = this.generateTrends(standards, statusLog, options)
    const charts = this.generateCharts(standards, statusLog, options)
    const insights = this.generateInsights(standards, statusLog, options)

    return {
      summary,
      trends,
      charts,
      insights
    }
  }

  // Generate summary
  private generateSummary(
    standards: StandardsRegister[],
    statusLog: StatusLog[],
    options: AnalyticsOptions
  ): AnalyticsSummary {
    const filteredStandards = this.filterStandards(standards, options.filters)
    
    const totalStandards = filteredStandards.length
    const totalValue = this.calculateTotalValue(filteredStandards)
    const averageAge = this.calculateAverageAge(filteredStandards)
    const utilizationRate = this.calculateUtilizationRate(filteredStandards)
    const expiryRate = this.calculateExpiryRate(filteredStandards)
    const growthRate = this.calculateGrowthRate(standards, options.dateRange)

    return {
      totalStandards,
      totalValue,
      averageAge,
      utilizationRate,
      expiryRate,
      growthRate
    }
  }

  // Generate trends
  private generateTrends(
    standards: StandardsRegister[],
    statusLog: StatusLog[],
    options: AnalyticsOptions
  ): AnalyticsTrend[] {
    const trends: AnalyticsTrend[] = []
    const groupBy = options.groupBy || 'month'
    
    // Registration trends
    const registrationTrend = this.calculateRegistrationTrend(standards, groupBy, options.dateRange)
    trends.push({
      period: 'Registrations',
      value: registrationTrend.current,
      change: registrationTrend.change,
      changePercent: registrationTrend.changePercent
    })

    // Status change trends
    const statusChangeTrend = this.calculateStatusChangeTrend(statusLog, groupBy, options.dateRange)
    trends.push({
      period: 'Status Changes',
      value: statusChangeTrend.current,
      change: statusChangeTrend.change,
      changePercent: statusChangeTrend.changePercent
    })

    // Expiry trends
    const expiryTrend = this.calculateExpiryTrend(standards, groupBy, options.dateRange)
    trends.push({
      period: 'Expiries',
      value: expiryTrend.current,
      change: expiryTrend.change,
      changePercent: expiryTrend.changePercent
    })

    return trends
  }

  // Generate charts
  private generateCharts(
    standards: StandardsRegister[],
    statusLog: StatusLog[],
    options: AnalyticsOptions
  ): AnalyticsChart[] {
    const charts: AnalyticsChart[] = []

    // Status distribution chart
    charts.push(this.createStatusDistributionChart(standards))

    // Manufacturer distribution chart
    charts.push(this.createManufacturerDistributionChart(standards))

    // Monthly registration chart
    charts.push(this.createMonthlyRegistrationChart(standards, options.dateRange))

    // Expiry timeline chart
    charts.push(this.createExpiryTimelineChart(standards, options.dateRange))

    // Test group distribution chart
    charts.push(this.createTestGroupDistributionChart(standards))

    return charts
  }

  // Generate insights
  private generateInsights(
    standards: StandardsRegister[],
    statusLog: StatusLog[],
    options: AnalyticsOptions
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = []

    // Expiry warnings
    const expiringSoon = this.getExpiringSoon(standards, 30)
    if (expiringSoon.length > 0) {
      insights.push({
        type: 'warning',
        title: 'สารมาตรฐานใกล้หมดอายุ',
        message: `มีสารมาตรฐาน ${expiringSoon.length} รายการที่ใกล้หมดอายุในอีก 30 วัน`,
        value: expiringSoon.length,
        recommendation: 'ควรตรวจสอบและจัดการสารมาตรฐานที่ใกล้หมดอายุ'
      })
    }

    // Low utilization
    const lowUtilization = this.getLowUtilization(standards)
    if (lowUtilization.length > 0) {
      insights.push({
        type: 'info',
        title: 'การใช้งานต่ำ',
        message: `มีสารมาตรฐาน ${lowUtilization.length} รายการที่ยังไม่ได้เปิดใช้เป็นเวลานาน`,
        value: lowUtilization.length,
        recommendation: 'ควรตรวจสอบความจำเป็นในการใช้งาน'
      })
    }

    // High value items
    const highValueItems = this.getHighValueItems(standards)
    if (highValueItems.length > 0) {
      insights.push({
        type: 'success',
        title: 'สินค้าค่าสูง',
        message: `มีสารมาตรฐาน ${highValueItems.length} รายการที่มีค่าสูง`,
        value: highValueItems.length,
        recommendation: 'ควรดูแลรักษาอย่างพิเศษ'
      })
    }

    // Growth rate
    const growthRate = this.calculateGrowthRate(standards, options.dateRange)
    if (growthRate > 20) {
      insights.push({
        type: 'success',
        title: 'การเติบโตสูง',
        message: `อัตราการเติบโต ${growthRate.toFixed(1)}% ในช่วงเวลาที่กำหนด`,
        value: growthRate,
        recommendation: 'ควรเตรียมความพร้อมสำหรับการจัดการที่เพิ่มขึ้น'
      })
    } else if (growthRate < -10) {
      insights.push({
        type: 'warning',
        title: 'การเติบโตลดลง',
        message: `อัตราการเติบโต ${growthRate.toFixed(1)}% ในช่วงเวลาที่กำหนด`,
        value: growthRate,
        recommendation: 'ควรตรวจสอบสาเหตุของการลดลง'
      })
    }

    return insights
  }

  // Filter standards
  private filterStandards(standards: StandardsRegister[], filters?: any): StandardsRegister[] {
    if (!filters) return standards

    return standards.filter(standard => {
      if (filters.status && !filters.status.includes(standard.status)) {
        return false
      }
      if (filters.manufacturer && !filters.manufacturer.includes(standard.manufacturer)) {
        return false
      }
      if (filters.testGroup && !filters.testGroup.includes(standard.test_group)) {
        return false
      }
      return true
    })
  }

  // Calculate total value
  private calculateTotalValue(standards: StandardsRegister[]): number {
    return standards.reduce((total, standard) => {
      const concentration = parseFloat(standard.concentration?.toString() || '0')
      const packingSize = parseFloat(standard.packing_size?.toString() || '0')
      return total + (concentration * packingSize)
    }, 0)
  }

  // Calculate average age
  private calculateAverageAge(standards: StandardsRegister[]): number {
    const now = new Date()
    const totalAge = standards.reduce((total, standard) => {
      const receivedDate = new Date(standard.date_received)
      const ageInDays = Math.floor((now.getTime() - receivedDate.getTime()) / (1000 * 60 * 60 * 24))
      return total + ageInDays
    }, 0)
    
    return standards.length > 0 ? totalAge / standards.length : 0
  }

  // Calculate utilization rate
  private calculateUtilizationRate(standards: StandardsRegister[]): number {
    const inUseCount = standards.filter(s => s.status === 'In-Use').length
    return standards.length > 0 ? (inUseCount / standards.length) * 100 : 0
  }

  // Calculate expiry rate
  private calculateExpiryRate(standards: StandardsRegister[]): number {
    const now = new Date()
    const expiredCount = standards.filter(standard => {
      if (!standard.lab_expiry_date) return false
      const expiryDate = new Date(standard.lab_expiry_date)
      return expiryDate < now
    }).length
    
    return standards.length > 0 ? (expiredCount / standards.length) * 100 : 0
  }

  // Calculate growth rate
  private calculateGrowthRate(standards: StandardsRegister[], dateRange?: any): number {
    if (!dateRange) return 0

    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    const midDate = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2)

    const firstHalf = standards.filter(s => {
      const receivedDate = new Date(s.date_received)
      return receivedDate >= startDate && receivedDate < midDate
    }).length

    const secondHalf = standards.filter(s => {
      const receivedDate = new Date(s.date_received)
      return receivedDate >= midDate && receivedDate <= endDate
    }).length

    if (firstHalf === 0) return secondHalf > 0 ? 100 : 0
    return ((secondHalf - firstHalf) / firstHalf) * 100
  }

  // Calculate registration trend
  private calculateRegistrationTrend(standards: StandardsRegister[], groupBy: string, dateRange?: any): any {
    // Implementation would group standards by time period and calculate trends
    return { current: 0, change: 0, changePercent: 0 }
  }

  // Calculate status change trend
  private calculateStatusChangeTrend(statusLog: StatusLog[], groupBy: string, dateRange?: any): any {
    // Implementation would group status changes by time period and calculate trends
    return { current: 0, change: 0, changePercent: 0 }
  }

  // Calculate expiry trend
  private calculateExpiryTrend(standards: StandardsRegister[], groupBy: string, dateRange?: any): any {
    // Implementation would group expiries by time period and calculate trends
    return { current: 0, change: 0, changePercent: 0 }
  }

  // Create status distribution chart
  private createStatusDistributionChart(standards: StandardsRegister[]): AnalyticsChart {
    const statusCounts = standards.reduce((acc, standard) => {
      acc[standard.status] = (acc[standard.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      type: 'doughnut',
      title: 'การกระจายสถานะ',
      data: Object.values(statusCounts),
      labels: Object.keys(statusCounts),
      colors: ['#3B82F6', '#F59E0B', '#EF4444']
    }
  }

  // Create manufacturer distribution chart
  private createManufacturerDistributionChart(standards: StandardsRegister[]): AnalyticsChart {
    const manufacturerCounts = standards.reduce((acc, standard) => {
      if (standard.manufacturer) {
        acc[standard.manufacturer] = (acc[standard.manufacturer] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const sortedManufacturers = Object.entries(manufacturerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // Top 10 manufacturers

    return {
      type: 'bar',
      title: 'ผู้ผลิต 10 อันดับแรก',
      data: sortedManufacturers.map(([,count]) => count),
      labels: sortedManufacturers.map(([name]) => name)
    }
  }

  // Create monthly registration chart
  private createMonthlyRegistrationChart(standards: StandardsRegister[], dateRange?: any): AnalyticsChart {
    // Implementation would group standards by month and create chart data
    return {
      type: 'line',
      title: 'การลงทะเบียนรายเดือน',
      data: [],
      labels: []
    }
  }

  // Create expiry timeline chart
  private createExpiryTimelineChart(standards: StandardsRegister[], dateRange?: any): AnalyticsChart {
    // Implementation would group expiries by time period and create chart data
    return {
      type: 'bar',
      title: 'ไทม์ไลน์การหมดอายุ',
      data: [],
      labels: []
    }
  }

  // Create test group distribution chart
  private createTestGroupDistributionChart(standards: StandardsRegister[]): AnalyticsChart {
    const testGroupCounts = standards.reduce((acc, standard) => {
      if (standard.test_group) {
        acc[standard.test_group] = (acc[standard.test_group] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return {
      type: 'pie',
      title: 'การกระจายกลุ่มทดสอบ',
      data: Object.values(testGroupCounts),
      labels: Object.keys(testGroupCounts)
    }
  }

  // Get expiring soon
  private getExpiringSoon(standards: StandardsRegister[], days: number): StandardsRegister[] {
    const now = new Date()
    const warningDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))

    return standards.filter(standard => {
      if (!standard.lab_expiry_date) return false
      const expiryDate = new Date(standard.lab_expiry_date)
      return expiryDate <= warningDate && expiryDate > now
    })
  }

  // Get low utilization
  private getLowUtilization(standards: StandardsRegister[]): StandardsRegister[] {
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000))

    return standards.filter(standard => {
      if (standard.status !== 'Unopened') return false
      const receivedDate = new Date(standard.date_received)
      return receivedDate < sixMonthsAgo
    })
  }

  // Get high value items
  private getHighValueItems(standards: StandardsRegister[]): StandardsRegister[] {
    return standards.filter(standard => {
      const concentration = parseFloat(standard.concentration?.toString() || '0')
      const packingSize = parseFloat(standard.packing_size?.toString() || '0')
      const value = concentration * packingSize
      return value > 1000 // Threshold for high value
    })
  }

  // Generate performance metrics
  generatePerformanceMetrics(standards: StandardsRegister[]): {
    averageProcessingTime: number
    errorRate: number
    successRate: number
    throughput: number
  } {
    // Implementation would calculate performance metrics
    return {
      averageProcessingTime: 0,
      errorRate: 0,
      successRate: 100,
      throughput: 0
    }
  }

  // Generate cost analysis
  generateCostAnalysis(standards: StandardsRegister[]): {
    totalCost: number
    averageCost: number
    costByCategory: Record<string, number>
    costTrend: number
  } {
    // Implementation would calculate cost analysis
    return {
      totalCost: 0,
      averageCost: 0,
      costByCategory: {},
      costTrend: 0
    }
  }

  // Generate quality metrics
  generateQualityMetrics(standards: StandardsRegister[]): {
    accuracy: number
    completeness: number
    consistency: number
    timeliness: number
  } {
    // Implementation would calculate quality metrics
    return {
      accuracy: 100,
      completeness: 100,
      consistency: 100,
      timeliness: 100
    }
  }
}

// Create analytics manager instance
export const analyticsManager = new AnalyticsManager()

// Analytics utilities
export const generateAnalyticsReport = (
  standards: StandardsRegister[],
  statusLog: StatusLog[],
  options?: AnalyticsOptions
): AnalyticsResult => {
  return analyticsManager.generateAnalyticsReport(standards, statusLog, options)
}

export const generatePerformanceMetrics = (standards: StandardsRegister[]) => {
  return analyticsManager.generatePerformanceMetrics(standards)
}

export const generateCostAnalysis = (standards: StandardsRegister[]) => {
  return analyticsManager.generateCostAnalysis(standards)
}

export const generateQualityMetrics = (standards: StandardsRegister[]) => {
  return analyticsManager.generateQualityMetrics(standards)
}

// Analytics export
export const exportAnalyticsReport = (report: AnalyticsResult): void => {
  const reportData = {
    generatedAt: new Date().toISOString(),
    summary: report.summary,
    trends: report.trends,
    insights: report.insights
  }

  const jsonData = JSON.stringify(reportData, null, 2)
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `analytics_report_${formatDate(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Analytics scheduling
export const scheduleAnalyticsReport = (interval: number): void => {
  setInterval(() => {
    // Generate and save analytics report
    console.log('Generating scheduled analytics report...')
  }, interval)
}

// Analytics dashboard data
export const getDashboardAnalytics = (standards: StandardsRegister[]): {
  totalStandards: number
  unopenedCount: number
  inUseCount: number
  disposedCount: number
  expiredCount: number
  expiringSoonCount: number
  topManufacturers: Array<{ name: string; count: number }>
  recentActivity: number
} => {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))

  const unopenedCount = standards.filter(s => s.status === 'Unopened').length
  const inUseCount = standards.filter(s => s.status === 'In-Use').length
  const disposedCount = standards.filter(s => s.status === 'Disposed').length
  const expiredCount = standards.filter(s => {
    if (!s.lab_expiry_date) return false
    return new Date(s.lab_expiry_date) < now
  }).length
  const expiringSoonCount = standards.filter(s => {
    if (!s.lab_expiry_date) return false
    const expiryDate = new Date(s.lab_expiry_date)
    return expiryDate <= thirtyDaysFromNow && expiryDate > now
  }).length

  const manufacturerCounts = standards.reduce((acc, standard) => {
    if (standard.manufacturer) {
      acc[standard.manufacturer] = (acc[standard.manufacturer] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const topManufacturers = Object.entries(manufacturerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return {
    totalStandards: standards.length,
    unopenedCount,
    inUseCount,
    disposedCount,
    expiredCount,
    expiringSoonCount,
    topManufacturers,
    recentActivity: 0 // Would be calculated from status log
  }
}
