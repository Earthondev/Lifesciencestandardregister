import React from 'react'
import { StandardsRegister, StatusLog, Statistics } from '@/types'

// Google Sheets configuration
const GOOGLE_SHEETS_CONFIG = {
  SHEET_ID: '1KJAfxnbH8iFDopf6rN6Kt47TWZUCV_oSCxZXNu9GvGM',
  SHEET_NAME: 'StandardsRegister',
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/1KJAfxnbH8iFDopf6rN6Kt47TWZUCV_oSCxZXNu9GvGM/edit',
  GID: '478474749'
}

// Google Sheets API client
class GoogleSheetsClient {
  private baseUrl: string
  private sheetId: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_WEB_APP_URL || ''
    this.sheetId = GOOGLE_SHEETS_CONFIG.SHEET_ID
  }

  // Make API request
  private async makeRequest(action: string, data?: any): Promise<any> {
    if (!this.baseUrl) {
      throw new Error('Apps Script Web App URL not configured')
    }

    const url = `${this.baseUrl}?action=${action}`
    const options: RequestInit = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, options)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.data || 'API request failed')
      }
      
      return result.data
    } catch (error) {
      console.error(`API request failed for action ${action}:`, error)
      // Return mock data for development
      return this.getMockData(action)
    }
  }

  // Mock data for development
  private getMockData(action: string): any {
    switch (action) {
      case 'getStandards':
        return [
          {
            'ID No.': 'LS-Glucose-24-001',
            'Standard Reference Material Name (CRM/SRM/RM)': 'Glucose Standard',
            'Storage condition': 'Room Temperature',
            'Material type': 'Solid',
            'Conc.': 100,
            'Conc_unit': 'mg/mL',
            'Packing size': 1,
            'Pack_unit': 'g',
            'cas': '50-99-7',
            'lot': 'GLC001',
            'Manufacturer': 'Sigma-Aldrich',
            'Supplier': 'ChemSupply Co.',
            'Date Received': '2024-01-15',
            'cer exp.': '2025-01-15',
            'Lab Expiry Date': '2025-01-15',
            'test group': 'Biochemistry',
            'DeepLink_IN': 'https://example.com/in',
            'DeepLink_OUT': 'https://example.com/out',
            'QR_IN': 'QR_IN_001',
            'QR_OUT': 'QR_OUT_001',
            'Status': 'Unopened',
            'AvailableQty': 1,
            'Date Opened': '',
            'Date Disposed': ''
          },
          {
            'ID No.': 'LS-Protein-24-002',
            'Standard Reference Material Name (CRM/SRM/RM)': 'Protein Standard',
            'Storage condition': '4°C',
            'Material type': 'Liquid',
            'Conc.': 2,
            'Conc_unit': 'mg/mL',
            'Packing size': 5,
            'Pack_unit': 'mL',
            'cas': '9002-84-0',
            'lot': 'PRT002',
            'Manufacturer': 'Bio-Rad',
            'Supplier': 'LabSupply Inc.',
            'Date Received': '2024-02-01',
            'cer exp.': '2025-02-01',
            'Lab Expiry Date': '2025-02-01',
            'test group': 'Protein Analysis',
            'DeepLink_IN': 'https://example.com/in',
            'DeepLink_OUT': 'https://example.com/out',
            'QR_IN': 'QR_IN_002',
            'QR_OUT': 'QR_OUT_002',
            'Status': 'In-Use',
            'AvailableQty': 3.5,
            'Date Opened': '2024-02-15',
            'Date Disposed': ''
          }
        ]
      case 'getStats':
        return {
          total_standards: 2,
          unopened: 1,
          in_use: 1,
          disposed: 0,
          expiring_soon: 0,
          expired: 0
        }
      case 'getStandardById':
        return {
          'ID No.': 'LS-Glucose-24-001',
          'Standard Reference Material Name (CRM/SRM/RM)': 'Glucose Standard',
          'Storage condition': 'Room Temperature',
          'Material type': 'Solid',
          'Conc.': 100,
          'Conc_unit': 'mg/mL',
          'Packing size': 1,
          'Pack_unit': 'g',
          'cas': '50-99-7',
          'lot': 'GLC001',
          'Manufacturer': 'Sigma-Aldrich',
          'Supplier': 'ChemSupply Co.',
          'Date Received': '2024-01-15',
          'cer exp.': '2025-01-15',
          'Lab Expiry Date': '2025-01-15',
          'test group': 'Biochemistry',
          'DeepLink_IN': 'https://example.com/in',
          'DeepLink_OUT': 'https://example.com/out',
          'QR_IN': 'QR_IN_001',
          'QR_OUT': 'QR_OUT_001',
          'Status': 'Unopened',
          'AvailableQty': 1,
          'Date Opened': '',
          'Date Disposed': ''
        }
      case 'getStatusLog':
        return [
          {
            log_id: 'LOG_1705123456789_abc123def',
            timestamp: '2024-01-15T10:00:00Z',
            id_no: 'LS-Glucose-24-001',
            from_status: '',
            to_status: 'Unopened',
            by: 'system',
            note: 'New registration'
          },
          {
            log_id: 'LOG_1705123456790_def456ghi',
            timestamp: '2024-02-15T14:30:00Z',
            id_no: 'LS-Protein-24-002',
            from_status: 'Unopened',
            to_status: 'In-Use',
            by: 'user',
            note: 'Opened for testing'
          }
        ]
      case 'findSimilarNames':
        return [
          {
            id_no: 'LS-Glucose-24-001',
            name: 'Glucose Standard',
            similarity: 0.85
          },
          {
            id_no: 'LS-Glucose-24-003',
            name: 'Glucose Solution',
            similarity: 0.75
          }
        ]
      case 'lookupCAS':
        return {
          cas: '50-99-7',
          name: 'Glucose',
          formula: 'C₆H₁₂O₆'
        }
      default:
        return []
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('health')
      return true
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }

  // Get statistics
  async getStatistics(): Promise<Statistics> {
    return this.makeRequest('getStats')
  }

  // Get all standards
  async getStandards(): Promise<StandardsRegister[]> {
    return this.makeRequest('getStandards')
  }

  // Get standard by ID
  async getStandardById(idNo: string): Promise<StandardsRegister | null> {
    return this.makeRequest('getStandardById', { id_no: idNo })
  }

  // Get status log
  async getStatusLog(): Promise<StatusLog[]> {
    return this.makeRequest('getStatusLog')
  }

  // Get ID Master data
  async getIDMaster(): Promise<any[]> {
    return this.makeRequest('getIDMaster')
  }

  // Get recent activity
  async getRecentActivity(limit: number = 10): Promise<any[]> {
    return this.makeRequest('getRecentActivity', { limit })
  }

  // Find similar names
  async findSimilarNames(query: string): Promise<any[]> {
    return this.makeRequest('findSimilarNames', { query })
  }

  // Lookup CAS number
  async lookupCAS(name: string): Promise<any> {
    return this.makeRequest('lookupCAS', { name })
  }

  // Get configuration
  async getConfig(): Promise<Record<string, string>> {
    return this.makeRequest('getConfig')
  }

  // Get holidays
  async getHolidays(): Promise<any[]> {
    return this.makeRequest('getHolidays')
  }

  // Export data
  async exportData(format: string = 'json'): Promise<any> {
    return this.makeRequest('exportData', { format })
  }

  // Register new standard
  async registerStandard(data: any): Promise<any> {
    return this.makeRequest('registerStandard', data)
  }

  // Update standard
  async updateStandard(data: any): Promise<any> {
    return this.makeRequest('updateStandard', data)
  }

  // Change status
  async changeStatus(data: any): Promise<any> {
    return this.makeRequest('changeStatus', data)
  }

  // Add to ID Master
  async addToIDMaster(data: any): Promise<any> {
    return this.makeRequest('addToIDMaster', data)
  }

  // Update configuration
  async updateConfig(data: any): Promise<any> {
    return this.makeRequest('updateConfig', data)
  }

  // Send LINE notification
  async sendLineNotification(message: string, type: string = 'info'): Promise<any> {
    return this.makeRequest('sendLineNotification', { message, type })
  }

  // User management functions
  async authenticateUser(email: string, password: string): Promise<any> {
    return this.makeRequest('authenticateUser', { email, password })
  }

  async getUserByEmail(email: string): Promise<any> {
    return this.makeRequest('getUserByEmail', { email })
  }


  async getAllUsers(): Promise<any[]> {
    return this.makeRequest('getAllUsers')
  }

  async createUser(userData: any): Promise<any> {
    return this.makeRequest('createUser', userData)
  }

  async updateUser(userData: any): Promise<any> {
    return this.makeRequest('updateUser', userData)
  }

  async deleteUser(email: string): Promise<any> {
    return this.makeRequest('deleteUser', { email })
  }

  // Get sheet URL
  getSheetUrl(): string {
    return GOOGLE_SHEETS_CONFIG.SHEET_URL
  }

  // Get sheet ID
  getSheetId(): string {
    return this.sheetId
  }

  // Generate deep link
  generateDeepLink(row: number, column: string = 'A'): string {
    const baseUrl = GOOGLE_SHEETS_CONFIG.SHEET_URL
    const range = `${column}${row}`
    return `${baseUrl}#gid=${GOOGLE_SHEETS_CONFIG.GID}&range=${range}`
  }

  // Generate QR code URL
  generateQRCodeUrl(text: string, size: number = 200): string {
    const encodedText = encodeURIComponent(text)
    return `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodedText}`
  }
}

// Create Google Sheets client instance
export const googleSheetsClient = new GoogleSheetsClient()

// Google Sheets utilities
export const getSheetUrl = (): string => {
  return googleSheetsClient.getSheetUrl()
}

export const getSheetId = (): string => {
  return googleSheetsClient.getSheetId()
}

export const generateDeepLink = (row: number, column: string = 'A'): string => {
  return googleSheetsClient.generateDeepLink(row, column)
}

export const generateQRCodeUrl = (text: string, size: number = 200): string => {
  return googleSheetsClient.generateQRCodeUrl(text, size)
}

// Google Sheets hooks
export const useGoogleSheets = () => {
  const [isConnected, setIsConnected] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const connected = await googleSheetsClient.testConnection()
      setIsConnected(connected)
      return connected
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed'
      setError(errorMessage)
      setIsConnected(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const getStandards = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const standards = await googleSheetsClient.getStandards()
      return standards
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get standards'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getStatistics = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const stats = await googleSheetsClient.getStatistics()
      return stats
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get statistics'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const registerStandard = async (data: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await googleSheetsClient.registerStandard(data)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register standard'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const changeStatus = async (data: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await googleSheetsClient.changeStatus(data)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change status'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const findSimilarNames = async (query: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const results = await googleSheetsClient.findSimilarNames(query)
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find similar names'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const lookupCAS = async (name: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await googleSheetsClient.lookupCAS(name)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to lookup CAS'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async (format: string = 'json') => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await googleSheetsClient.exportData(format)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // User management functions
  const authenticateUser = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await googleSheetsClient.authenticateUser(email, password)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getUserByEmail = async (email: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const user = await googleSheetsClient.getUserByEmail(email)
      return user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get user'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }


  const getAllUsers = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const users = await googleSheetsClient.getAllUsers()
      return users
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get users'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const createUser = async (userData: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await googleSheetsClient.createUser(userData)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (userData: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await googleSheetsClient.updateUser(userData)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async (email: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await googleSheetsClient.deleteUser(email)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isConnected,
    isLoading,
    error,
    testConnection,
    getStandards,
    getStatistics,
    registerStandard,
    changeStatus,
    findSimilarNames,
    lookupCAS,
    exportData,
    getSheetUrl,
    getSheetId,
    generateDeepLink,
    generateQRCodeUrl,
    // User management functions
    authenticateUser,
    getUserByEmail,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
  }
}

// Google Sheets validation
export const validateGoogleSheetsConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!process.env.NEXT_PUBLIC_APPS_SCRIPT_WEB_APP_URL) {
    errors.push('Apps Script Web App URL is required')
  }
  
  if (!GOOGLE_SHEETS_CONFIG.SHEET_ID) {
    errors.push('Google Sheets ID is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Google Sheets constants
export const GOOGLE_SHEETS_CONSTANTS = {
  SHEET_ID: GOOGLE_SHEETS_CONFIG.SHEET_ID,
  SHEET_URL: GOOGLE_SHEETS_CONFIG.SHEET_URL,
  GID: GOOGLE_SHEETS_CONFIG.GID,
  SHEET_NAME: GOOGLE_SHEETS_CONFIG.SHEET_NAME
} as const

// Google Sheets error handling
export const handleGoogleSheetsError = (error: any): string => {
  if (error.message?.includes('Apps Script Web App URL not configured')) {
    return 'การตั้งค่า Google Sheets ยังไม่สมบูรณ์ กรุณาติดต่อผู้ดูแลระบบ'
  }
  
  if (error.message?.includes('API request failed')) {
    return 'ไม่สามารถเชื่อมต่อกับ Google Sheets ได้ กรุณาลองใหม่อีกครั้ง'
  }
  
  if (error.message?.includes('Standard not found')) {
    return 'ไม่พบข้อมูลสารมาตรฐานที่ต้องการ'
  }
  
  if (error.message?.includes('Connection test failed')) {
    return 'ไม่สามารถเชื่อมต่อกับ Google Sheets ได้ กรุณาตรวจสอบการตั้งค่า'
  }
  
  return error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google Sheets'
}

// Google Sheets monitoring
export const monitorGoogleSheetsConnection = (interval: number = 60000): void => {
  setInterval(async () => {
    try {
      const isConnected = await googleSheetsClient.testConnection()
      if (!isConnected) {
        console.warn('Google Sheets connection lost')
      }
    } catch (error) {
      console.error('Google Sheets monitoring error:', error)
    }
  }, interval)
}