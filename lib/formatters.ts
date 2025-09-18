import { format, parseISO, isValid, differenceInDays, addDays } from 'date-fns'
import { th } from 'date-fns/locale'
import { DATE_FORMATS } from './constants'

// Date formatting utilities
export const formatDate = (
  date: string | Date | null | undefined,
  formatStr: string = DATE_FORMATS.DISPLAY
): string => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''
    
    return format(dateObj, formatStr, { locale: th })
  } catch {
    return ''
  }
}

export const formatDateTime = (date: string | Date | null | undefined): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME)
}

export const formatThaiDate = (date: string | Date | null | undefined): string => {
  return formatDate(date, DATE_FORMATS.THAI)
}

export const formatApiDate = (date: string | Date | null | undefined): string => {
  return formatDate(date, DATE_FORMATS.API)
}

// Number formatting utilities
export const formatNumber = (
  num: number | string | null | undefined,
  decimals: number = 2
): string => {
  if (num === null || num === undefined || num === '') return '0'
  
  const number = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(number)) return '0'
  
  return number.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export const formatCurrency = (
  amount: number | string | null | undefined,
  currency: string = '฿'
): string => {
  if (amount === null || amount === undefined || amount === '') return `${currency}0`
  
  const number = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(number)) return `${currency}0`
  
  return `${currency}${number.toLocaleString('th-TH')}`
}

export const formatPercentage = (
  value: number | string | null | undefined,
  decimals: number = 1
): string => {
  if (value === null || value === undefined || value === '') return '0%'
  
  const number = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(number)) return '0%'
  
  return `${formatNumber(number, decimals)}%`
}

// Text formatting utilities
export const truncateText = (
  text: string | null | undefined,
  maxLength: number = 50
): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const capitalizeFirst = (str: string | null | undefined): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const normalizeString = (str: string | null | undefined): string => {
  if (!str) return ''
  return str.toString().trim().replace(/\s+/g, ' ').toLowerCase()
}

export const formatName = (name: string | null | undefined): string => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ')
}

// Status formatting utilities
export const formatStatus = (status: string | null | undefined): string => {
  const statusMap: Record<string, string> = {
    'Unopened': 'ยังไม่ได้เปิดใช้',
    'In-Use': 'กำลังใช้งาน',
    'Disposed': 'ทำลายทิ้งแล้ว'
  }
  
  return statusMap[status || ''] || status || ''
}

export const getStatusIcon = (status: string | null | undefined): string => {
  const iconMap: Record<string, string> = {
    'Unopened': '📦',
    'In-Use': '🧪',
    'Disposed': '🗑️'
  }
  
  return iconMap[status || ''] || '❓'
}

// Material type formatting
export const formatMaterialType = (type: string | null | undefined): string => {
  const typeMap: Record<string, string> = {
    'CRM': 'CRM (Certified Reference Material)',
    'SRM': 'SRM (Standard Reference Material)',
    'RM': 'RM (Reference Material)',
    'Working Standard': 'Working Standard',
    'Other': 'อื่นๆ'
  }
  
  return typeMap[type || ''] || type || ''
}

// Storage condition formatting
export const formatStorageCondition = (condition: string | null | undefined): string => {
  const conditionMap: Record<string, string> = {
    'Room Temperature': 'อุณหภูมิห้อง',
    'Refrigerated (2-8°C)': 'แช่เย็น (2-8°C)',
    'Frozen (-20°C)': 'แช่แข็ง (-20°C)',
    'Deep Freeze (-80°C)': 'แช่แข็งลึก (-80°C)',
    'Desiccator': 'ในเครื่องดูดความชื้น',
    'Other': 'อื่นๆ'
  }
  
  return conditionMap[condition || ''] || condition || ''
}

// Unit formatting
export const formatUnit = (unit: string | null | undefined): string => {
  const unitMap: Record<string, string> = {
    'mg/kg': 'มิลลิกรัม/กิโลกรัม',
    'μg/kg': 'ไมโครกรัม/กิโลกรัม',
    'mg/L': 'มิลลิกรัม/ลิตร',
    'μg/L': 'ไมโครกรัม/ลิตร',
    'ppm': 'ppm',
    'ppb': 'ppb',
    '%': '%',
    'g': 'กรัม',
    'mg': 'มิลลิกรัม',
    'L': 'ลิตร',
    'mL': 'มิลลิลิตร',
    'vial': 'ขวด',
    'bottle': 'ขวด',
    'ampoule': 'แอมปูล'
  }
  
  return unitMap[unit || ''] || unit || ''
}

// Expiry date utilities
export const isExpired = (expiryDate: string | Date | null | undefined): boolean => {
  if (!expiryDate) return false
  
  try {
    const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate
    const today = new Date()
    return expiry < today
  } catch {
    return false
  }
}

export const isExpiringSoon = (
  expiryDate: string | Date | null | undefined,
  days: number = 30
): boolean => {
  if (!expiryDate) return false
  
  try {
    const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate
    const today = new Date()
    const warningDate = addDays(today, days)
    return expiry <= warningDate && expiry > today
  } catch {
    return false
  }
}

export const getDaysUntilExpiry = (
  expiryDate: string | Date | null | undefined
): number => {
  if (!expiryDate) return 0
  
  try {
    const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate
    const today = new Date()
    return differenceInDays(expiry, today)
  } catch {
    return 0
  }
}

export const formatExpiryStatus = (
  expiryDate: string | Date | null | undefined
): { status: 'expired' | 'expiring' | 'valid'; text: string; color: string } => {
  if (!expiryDate) {
    return { status: 'valid', text: 'ไม่ระบุ', color: 'text-gray-500' }
  }
  
  if (isExpired(expiryDate)) {
    return { status: 'expired', text: 'หมดอายุแล้ว', color: 'text-red-600' }
  }
  
  if (isExpiringSoon(expiryDate)) {
    const days = getDaysUntilExpiry(expiryDate)
    return { 
      status: 'expiring', 
      text: `หมดอายุใน ${days} วัน`, 
      color: 'text-yellow-600' 
    }
  }
  
  return { status: 'valid', text: 'ยังไม่หมดอายุ', color: 'text-green-600' }
}

// ID formatting utilities
export const formatStandardId = (id: string | null | undefined): string => {
  if (!id) return ''
  
  // Format: LS-name-yy-nnn
  const parts = id.split('-')
  if (parts.length >= 4) {
    const [prefix, name, year, sequence] = parts
    return `${prefix}-${name}-${year}-${sequence.padStart(3, '0')}`
  }
  
  return id
}

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Phone number formatting
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return ''
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Format Thai phone numbers
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  return phone
}

// Email formatting
export const formatEmail = (email: string | null | undefined): string => {
  if (!email) return ''
  
  // Mask email for display (show first 2 chars and domain)
  const [localPart, domain] = email.split('@')
  if (localPart.length > 2) {
    const masked = localPart.slice(0, 2) + '*'.repeat(localPart.length - 2)
    return `${masked}@${domain}`
  }
  
  return email
}

// URL formatting
export const formatUrl = (url: string | null | undefined): string => {
  if (!url) return ''
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  
  return url
}

// Deep link formatting
export const formatDeepLink = (
  sheetId: string,
  sheetName: string,
  row: number,
  col?: number
): string => {
  const baseUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
  const range = col ? `${row}:${col}` : `${row}:${row}`
  return `${baseUrl}#gid=0&range=${range}`
}

// QR code URL formatting
export const formatQRCodeUrl = (text: string, size: number = 200): string => {
  const encodedText = encodeURIComponent(text)
  return `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodedText}`
}
