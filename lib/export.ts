import { formatDate, formatNumber } from './formatters'
import { StandardsRegister, StatusLog, Statistics } from '@/types'

// Export formats
export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf'

// Export options
export interface ExportOptions {
  format: ExportFormat
  filename?: string
  includeHeaders?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  filters?: {
    status?: string[]
    manufacturer?: string[]
    testGroup?: string[]
  }
}

// CSV export utilities
export const exportToCSV = (
  data: any[],
  filename: string = 'export.csv',
  options: Partial<ExportOptions> = {}
): void => {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    // Headers
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        
        // Escape commas and quotes
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    )
  ].join('\n')

  downloadFile(csvContent, filename, 'text/csv')
}

// Excel export utilities (using CSV format for simplicity)
export const exportToExcel = (
  data: any[],
  filename: string = 'export.xlsx',
  options: Partial<ExportOptions> = {}
): void => {
  // For now, we'll export as CSV with .xlsx extension
  // In a real implementation, you might want to use a library like xlsx
  exportToCSV(data, filename.replace('.xlsx', '.csv'), options)
}

// JSON export utilities
export const exportToJSON = (
  data: any[],
  filename: string = 'export.json',
  options: Partial<ExportOptions> = {}
): void => {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, filename, 'application/json')
}

// PDF export utilities (placeholder)
export const exportToPDF = (
  data: any[],
  filename: string = 'export.pdf',
  options: Partial<ExportOptions> = {}
): void => {
  // This would require a PDF generation library
  // For now, we'll throw an error
  throw new Error('PDF export not implemented yet')
}

// Generic export function
export const exportData = (
  data: any[],
  options: ExportOptions
): void => {
  const filename = options.filename || `export_${new Date().toISOString().split('T')[0]}.${options.format}`
  
  switch (options.format) {
    case 'csv':
      exportToCSV(data, filename, options)
      break
    case 'excel':
      exportToExcel(data, filename, options)
      break
    case 'json':
      exportToJSON(data, filename, options)
      break
    case 'pdf':
      exportToPDF(data, filename, options)
      break
    default:
      throw new Error(`Unsupported export format: ${options.format}`)
  }
}

// Download file utility
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  window.URL.revokeObjectURL(url)
}

// Standards-specific export functions
export const exportStandards = (
  standards: StandardsRegister[],
  options: Partial<ExportOptions> = {}
): void => {
  const formattedData = standards.map(standard => ({
    'รหัส': standard.id_no,
    'ชื่อสารมาตรฐาน': standard.name,
    'สถานะ': standard.status,
    'ผู้ผลิต': standard.manufacturer,
    'ผู้จัดหา': standard.supplier,
    'เลข CAS': standard.cas,
    'เลข Lot': standard.lot,
    'ความเข้มข้น': standard.concentration,
    'หน่วยความเข้มข้น': standard.concentration_unit,
    'ขนาดบรรจุ': standard.packing_size,
    'หน่วยบรรจุ': standard.packing_unit,
    'วันที่รับ': formatDate(standard.date_received),
    'วันหมดอายุใบรับรอง': formatDate(standard.certificate_expiry),
    'วันหมดอายุในห้องแล็บ': formatDate(standard.lab_expiry_date),
    'กลุ่มทดสอบ': standard.test_group,
    'ปริมาณคงเหลือ': standard.available_qty,
    'วันที่เปิดใช้': formatDate(standard.date_opened),
    'วันที่ทำลายทิ้ง': formatDate(standard.date_disposed)
  }))

  const defaultOptions: ExportOptions = {
    format: 'csv',
    filename: `standards_${new Date().toISOString().split('T')[0]}.csv`,
    includeHeaders: true,
    ...options
  }

  exportData(formattedData, defaultOptions)
}

export const exportStatusLog = (
  statusLog: StatusLog[],
  options: Partial<ExportOptions> = {}
): void => {
  const formattedData = statusLog.map(log => ({
    'รหัส Log': log.log_id,
    'เวลา': formatDate(log.timestamp, 'dd/MM/yyyy HH:mm'),
    'รหัสสารมาตรฐาน': log.id_no,
    'สถานะเดิม': log.from_status,
    'สถานะใหม่': log.to_status,
    'ผู้เปลี่ยน': log.by,
    'หมายเหตุ': log.note
  }))

  const defaultOptions: ExportOptions = {
    format: 'csv',
    filename: `status_log_${new Date().toISOString().split('T')[0]}.csv`,
    includeHeaders: true,
    ...options
  }

  exportData(formattedData, defaultOptions)
}

export const exportStatistics = (
  statistics: Statistics,
  options: Partial<ExportOptions> = {}
): void => {
  const formattedData = [
    {
      'รายการ': 'สารมาตรฐานทั้งหมด',
      'จำนวน': statistics.total_standards
    },
    {
      'รายการ': 'ยังไม่ได้เปิดใช้',
      'จำนวน': statistics.unopened
    },
    {
      'รายการ': 'กำลังใช้งาน',
      'จำนวน': statistics.in_use
    },
    {
      'รายการ': 'ทำลายทิ้งแล้ว',
      'จำนวน': statistics.disposed
    },
    {
      'รายการ': 'หมดอายุแล้ว',
      'จำนวน': statistics.expired
    },
    {
      'รายการ': 'ใกล้หมดอายุ',
      'จำนวน': statistics.expiring_soon
    }
  ]

  const defaultOptions: ExportOptions = {
    format: 'csv',
    filename: `statistics_${new Date().toISOString().split('T')[0]}.csv`,
    includeHeaders: true,
    ...options
  }

  exportData(formattedData, defaultOptions)
}

// Bulk export function
export const exportAllData = async (
  data: {
    standards?: StandardsRegister[]
    statusLog?: StatusLog[]
    statistics?: Statistics
  },
  options: Partial<ExportOptions> = {}
): Promise<void> => {
  const timestamp = new Date().toISOString().split('T')[0]
  
  if (data.standards) {
    exportStandards(data.standards, {
      ...options,
      filename: `standards_${timestamp}.csv`
    })
  }
  
  if (data.statusLog) {
    exportStatusLog(data.statusLog, {
      ...options,
      filename: `status_log_${timestamp}.csv`
    })
  }
  
  if (data.statistics) {
    exportStatistics(data.statistics, {
      ...options,
      filename: `statistics_${timestamp}.csv`
    })
  }
}

// Export template functions
export const exportImportTemplate = (): void => {
  const template = [
    {
      'ชื่อสารมาตรฐาน': 'ตัวอย่าง: Tocopheryl acetate',
      'เงื่อนไขการเก็บรักษา': 'ตัวอย่าง: Room Temperature',
      'ประเภทวัสดุ': 'ตัวอย่าง: CRM',
      'เลข CAS': 'ตัวอย่าง: 7695-91-2',
      'ผู้ผลิต': 'ตัวอย่าง: Sigma-Aldrich',
      'ผู้จัดหา': 'ตัวอย่าง: Lab Supply Co',
      'ความเข้มข้น': 'ตัวอย่าง: 1000',
      'หน่วยความเข้มข้น': 'ตัวอย่าง: mg/kg',
      'ขนาดบรรจุ': 'ตัวอย่าง: 1',
      'หน่วยบรรจุ': 'ตัวอย่าง: g',
      'เลข Lot': 'ตัวอย่าง: LOT001',
      'วันที่รับ': 'ตัวอย่าง: 2025-01-15',
      'วันหมดอายุใบรับรอง': 'ตัวอย่าง: 2026-01-15',
      'วันหมดอายุในห้องแล็บ': 'ตัวอย่าง: 2025-07-15',
      'กลุ่มทดสอบ': 'ตัวอย่าง: Vitamins',
      'สถานะ': 'ตัวอย่าง: Unopened'
    }
  ]

  exportToCSV(template, 'import_template.csv')
}

// Export validation
export const validateExportData = (data: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!data || data.length === 0) {
    errors.push('No data to export')
  }

  if (data && data.length > 10000) {
    errors.push('Too much data to export at once (max 10,000 records)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Export progress tracking
export const trackExportProgress = (
  total: number,
  current: number,
  callback: (progress: number) => void
): void => {
  const progress = Math.round((current / total) * 100)
  callback(progress)
}

// Export scheduling
export const scheduleExport = (
  data: any[],
  options: ExportOptions,
  delay: number = 0
): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        exportData(data, options)
        resolve()
      } catch (error) {
        reject(error)
      }
    }, delay)
  })
}
