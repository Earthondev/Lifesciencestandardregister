import { validateForm, REGISTER_STANDARD_SCHEMA } from './validation'
import { RegisterStandardForm } from '@/types'

// Import formats
export type ImportFormat = 'csv' | 'excel' | 'json'

// Import options
export interface ImportOptions {
  format: ImportFormat
  skipValidation?: boolean
  skipDuplicates?: boolean
  updateExisting?: boolean
  batchSize?: number
}

// Import result
export interface ImportResult {
  success: boolean
  totalRows: number
  processedRows: number
  successRows: number
  errorRows: number
  errors: ImportError[]
  warnings: ImportWarning[]
}

// Import error
export interface ImportError {
  row: number
  field?: string
  message: string
  data?: any
}

// Import warning
export interface ImportWarning {
  row: number
  field?: string
  message: string
  data?: any
}

// CSV parsing utilities
export const parseCSV = (csvContent: string): any[] => {
  const lines = csvContent.split('\n')
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row')
  }

  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''))
  const data: any[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = parseCSVLine(line)
    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`)
    }

    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index]
    })
    data.push(row)
  }

  return data
}

// Parse a single CSV line (handles quoted values)
const parseCSVLine = (line: string): string[] => {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i += 2
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
        i++
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim())
      current = ''
      i++
    } else {
      current += char
      i++
    }
  }

  // Add the last field
  values.push(current.trim())
  return values
}

// JSON parsing utilities
export const parseJSON = (jsonContent: string): any[] => {
  try {
    const data = JSON.parse(jsonContent)
    if (Array.isArray(data)) {
      return data
    } else if (typeof data === 'object') {
      return [data]
    } else {
      throw new Error('JSON data must be an array or object')
    }
  } catch (error) {
    throw new Error('Invalid JSON format')
  }
}

// Excel parsing utilities (placeholder)
export const parseExcel = (excelContent: ArrayBuffer): any[] => {
  // This would require a library like xlsx
  // For now, we'll throw an error
  throw new Error('Excel import not implemented yet')
}

// Generic import function
export const importData = async (
  content: string | ArrayBuffer,
  options: ImportOptions
): Promise<ImportResult> => {
  let data: any[] = []

  try {
    // Parse data based on format
    switch (options.format) {
      case 'csv':
        data = parseCSV(content as string)
        break
      case 'json':
        data = parseJSON(content as string)
        break
      case 'excel':
        data = parseExcel(content as ArrayBuffer)
        break
      default:
        throw new Error(`Unsupported import format: ${options.format}`)
    }

    // Process data
    return await processImportData(data, options)
  } catch (error) {
    return {
      success: false,
      totalRows: 0,
      processedRows: 0,
      successRows: 0,
      errorRows: 0,
      errors: [{
        row: 0,
        message: error instanceof Error ? error.message : 'Unknown error'
      }],
      warnings: []
    }
  }
}

// Process imported data
const processImportData = async (
  data: any[],
  options: ImportOptions
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: true,
    totalRows: data.length,
    processedRows: 0,
    successRows: 0,
    errorRows: 0,
    errors: [],
    warnings: []
  }

  const batchSize = options.batchSize || 100
  const batches = Math.ceil(data.length / batchSize)

  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const start = batchIndex * batchSize
    const end = Math.min(start + batchSize, data.length)
    const batch = data.slice(start, end)

    for (let i = 0; i < batch.length; i++) {
      const rowIndex = start + i + 1 // 1-based row number
      const row = batch[i]

      try {
        // Validate row data
        if (!options.skipValidation) {
          const validation = validateImportRow(row)
          if (!validation.isValid) {
            result.errors.push(...validation.errors.map(error => ({
              row: rowIndex,
              field: error.field,
              message: error.message,
              data: row
            })))
            result.errorRows++
            continue
          }
        }

        // Process row (this would call your API)
        await processImportRow(row, options)
        result.successRows++
      } catch (error) {
        result.errors.push({
          row: rowIndex,
          message: error instanceof Error ? error.message : 'Unknown error',
          data: row
        })
        result.errorRows++
      }

      result.processedRows++
    }
  }

  result.success = result.errorRows === 0
  return result
}

// Validate import row
const validateImportRow = (row: any): { isValid: boolean; errors: ImportError[] } => {
  const errors: ImportError[] = []

  // Map CSV headers to form fields
  const mappedRow = mapImportRow(row)
  
  // Validate using existing schema
  const validation = validateForm(mappedRow, REGISTER_STANDARD_SCHEMA)
  
  if (!validation.isValid) {
    Object.keys(validation.errors).forEach(field => {
      errors.push({
        field,
        message: validation.errors[field]
      })
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Map import row to form fields
const mapImportRow = (row: any): RegisterStandardForm => {
  return {
    name: row['ชื่อสารมาตรฐาน'] || row['name'] || '',
    storage: row['เงื่อนไขการเก็บรักษา'] || row['storage'] || '',
    material: row['ประเภทวัสดุ'] || row['material'] || '',
    cas: row['เลข CAS'] || row['cas'] || '',
    manufacturer: row['ผู้ผลิต'] || row['manufacturer'] || '',
    supplier: row['ผู้จัดหา'] || row['supplier'] || '',
    concentration: parseFloat(row['ความเข้มข้น'] || row['concentration'] || '0'),
    concentration_unit: row['หน่วยความเข้มข้น'] || row['concentration_unit'] || '',
    packing_size: parseFloat(row['ขนาดบรรจุ'] || row['packing_size'] || '0'),
    packing_unit: row['หน่วยบรรจุ'] || row['packing_unit'] || '',
    lot: row['เลข Lot'] || row['lot'] || '',
    date_received: row['วันที่รับ'] || row['date_received'] || '',
    certificate_expiry: row['วันหมดอายุใบรับรอง'] || row['certificate_expiry'] || '',
    lab_expiry_date: row['วันหมดอายุในห้องแล็บ'] || row['lab_expiry_date'] || '',
    test_group: row['กลุ่มทดสอบ'] || row['test_group'] || '',
    status: (row['สถานะ'] || row['status'] || 'Unopened') as 'Unopened' | 'In-Use' | 'Disposed'
  }
}

// Process import row (call API)
const processImportRow = async (row: any, options: ImportOptions): Promise<void> => {
  const mappedRow = mapImportRow(row)
  
  // This would call your API to register the standard
  // For now, we'll simulate the API call
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // In real implementation:
  // await apiClient.registerStandard(mappedRow)
}

// File reading utilities
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// Import from file
export const importFromFile = async (
  file: File,
  options: ImportOptions
): Promise<ImportResult> => {
  try {
    let content: string | ArrayBuffer
    let format: ImportFormat

    // Determine format from file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'csv':
        content = await readFileAsText(file)
        format = 'csv'
        break
      case 'json':
        content = await readFileAsText(file)
        format = 'json'
        break
      case 'xlsx':
      case 'xls':
        content = await readFileAsArrayBuffer(file)
        format = 'excel'
        break
      default:
        throw new Error(`Unsupported file format: ${extension}`)
    }

    return await importData(content, { ...options, format })
  } catch (error) {
    return {
      success: false,
      totalRows: 0,
      processedRows: 0,
      successRows: 0,
      errorRows: 0,
      errors: [{
        row: 0,
        message: error instanceof Error ? error.message : 'Unknown error'
      }],
      warnings: []
    }
  }
}

// Import validation
export const validateImportFile = (file: File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB')
  }

  const extension = file.name.split('.').pop()?.toLowerCase()
  const supportedFormats = ['csv', 'json', 'xlsx', 'xls']
  
  if (!extension || !supportedFormats.includes(extension)) {
    errors.push(`Unsupported file format. Supported formats: ${supportedFormats.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Import progress tracking
export const trackImportProgress = (
  total: number,
  current: number,
  callback: (progress: number) => void
): void => {
  const progress = Math.round((current / total) * 100)
  callback(progress)
}

// Import template generation
export const generateImportTemplate = (): string => {
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

  return JSON.stringify(template, null, 2)
}

// Import error reporting
export const generateImportReport = (result: ImportResult): string => {
  const report = [
    `Import Report - ${new Date().toLocaleDateString('th-TH')}`,
    `Total Rows: ${result.totalRows}`,
    `Processed Rows: ${result.processedRows}`,
    `Success Rows: ${result.successRows}`,
    `Error Rows: ${result.errorRows}`,
    `Success Rate: ${Math.round((result.successRows / result.totalRows) * 100)}%`,
    '',
    'Errors:',
    ...result.errors.map(error => 
      `Row ${error.row}: ${error.field ? `${error.field} - ` : ''}${error.message}`
    ),
    '',
    'Warnings:',
    ...result.warnings.map(warning => 
      `Row ${warning.row}: ${warning.field ? `${warning.field} - ` : ''}${warning.message}`
    )
  ].join('\n')

  return report
}
