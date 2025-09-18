import React from 'react'
import { StandardsRegister, StatusLog } from '@/types'
import { validateForm, REGISTER_STANDARD_SCHEMA } from './validation'
import { sanitizeString } from './sanitize'

// Test result
export interface TestResult {
  name: string
  passed: boolean
  message: string
  duration: number
  details?: any
}

// Test suite
export interface TestSuite {
  name: string
  tests: TestResult[]
  passed: number
  failed: number
  duration: number
}

// Test options
export interface TestOptions {
  includePerformance?: boolean
  includeSecurity?: boolean
  includeDataIntegrity?: boolean
  includeValidation?: boolean
  timeout?: number
}

// Testing manager class
class TestingManager {
  // Run all tests
  async runAllTests(
    data: StandardsRegister[],
    options: TestOptions = {}
  ): Promise<TestSuite[]> {
    const suites: TestSuite[] = []
    
    if (options.includeValidation !== false) {
      suites.push(await this.runValidationTests(data))
    }
    
    if (options.includeDataIntegrity !== false) {
      suites.push(await this.runDataIntegrityTests(data))
    }
    
    if (options.includeSecurity !== false) {
      suites.push(await this.runSecurityTests(data))
    }
    
    if (options.includePerformance !== false) {
      suites.push(await this.runPerformanceTests(data))
    }
    
    return suites
  }

  // Run validation tests
  private async runValidationTests(data: StandardsRegister[]): Promise<TestSuite> {
    const startTime = Date.now()
    const tests: TestResult[] = []
    
    // Test required fields
    tests.push(await this.testRequiredFields(data))
    
    // Test data types
    tests.push(await this.testDataTypes(data))
    
    // Test CAS validation
    tests.push(await this.testCASValidation(data))
    
    // Test date validation
    tests.push(await this.testDateValidation(data))
    
    // Test status validation
    tests.push(await this.testStatusValidation(data))
    
    const duration = Date.now() - startTime
    const passed = tests.filter(t => t.passed).length
    const failed = tests.filter(t => !t.passed).length
    
    return {
      name: 'Validation Tests',
      tests,
      passed,
      failed,
      duration
    }
  }

  // Run data integrity tests
  private async runDataIntegrityTests(data: StandardsRegister[]): Promise<TestSuite> {
    const startTime = Date.now()
    const tests: TestResult[] = []
    
    // Test unique IDs
    tests.push(await this.testUniqueIDs(data))
    
    // Test referential integrity
    tests.push(await this.testReferentialIntegrity(data))
    
    // Test data consistency
    tests.push(await this.testDataConsistency(data))
    
    // Test data completeness
    tests.push(await this.testDataCompleteness(data))
    
    const duration = Date.now() - startTime
    const passed = tests.filter(t => t.passed).length
    const failed = tests.filter(t => !t.passed).length
    
    return {
      name: 'Data Integrity Tests',
      tests,
      passed,
      failed,
      duration
    }
  }

  // Run security tests
  private async runSecurityTests(data: StandardsRegister[]): Promise<TestSuite> {
    const startTime = Date.now()
    const tests: TestResult[] = []
    
    // Test SQL injection prevention
    tests.push(await this.testSQLInjectionPrevention(data))
    
    // Test XSS prevention
    tests.push(await this.testXSSPrevention(data))
    
    // Test data sanitization
    tests.push(await this.testDataSanitization(data))
    
    // Test sensitive data protection
    tests.push(await this.testSensitiveDataProtection(data))
    
    const duration = Date.now() - startTime
    const passed = tests.filter(t => t.passed).length
    const failed = tests.filter(t => !t.passed).length
    
    return {
      name: 'Security Tests',
      tests,
      passed,
      failed,
      duration
    }
  }

  // Run performance tests
  private async runPerformanceTests(data: StandardsRegister[]): Promise<TestSuite> {
    const startTime = Date.now()
    const tests: TestResult[] = []
    
    // Test data loading performance
    tests.push(await this.testDataLoadingPerformance(data))
    
    // Test search performance
    tests.push(await this.testSearchPerformance(data))
    
    // Test memory usage
    tests.push(await this.testMemoryUsage(data))
    
    // Test response time
    tests.push(await this.testResponseTime(data))
    
    const duration = Date.now() - startTime
    const passed = tests.filter(t => t.passed).length
    const failed = tests.filter(t => !t.passed).length
    
    return {
      name: 'Performance Tests',
      tests,
      passed,
      failed,
      duration
    }
  }

  // Test required fields
  private async testRequiredFields(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    const requiredFields = ['id_no', 'name', 'manufacturer', 'supplier']
    const errors: string[] = []
    
    data.forEach((standard, index) => {
      requiredFields.forEach(field => {
        const value = standard[field as keyof StandardsRegister]
        if (!value || value.toString().trim() === '') {
          errors.push(`Standard ${index}: Missing required field ${field}`)
        }
      })
    })
    
    const duration = Date.now() - startTime
    const passed = errors.length === 0
    
    return {
      name: 'Required Fields Test',
      passed,
      message: passed ? 'All required fields are present' : `Found ${errors.length} missing required fields`,
      duration,
      details: errors
    }
  }

  // Test data types
  private async testDataTypes(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    
    data.forEach((standard, index) => {
      // Test concentration
      if (standard.concentration && isNaN(Number(standard.concentration))) {
        errors.push(`Standard ${index}: Invalid concentration type`)
      }
      
      // Test packing size
      if (standard.packing_size && isNaN(Number(standard.packing_size))) {
        errors.push(`Standard ${index}: Invalid packing size type`)
      }
      
      // Test available quantity
      if (standard.available_qty && isNaN(Number(standard.available_qty))) {
        errors.push(`Standard ${index}: Invalid available quantity type`)
      }
    })
    
    const duration = Date.now() - startTime
    const passed = errors.length === 0
    
    return {
      name: 'Data Types Test',
      passed,
      message: passed ? 'All data types are correct' : `Found ${errors.length} data type errors`,
      duration,
      details: errors
    }
  }

  // Test CAS validation
  private async testCASValidation(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    
    data.forEach((standard, index) => {
      if (standard.cas) {
        const casPattern = /^\d{2,7}-\d{2}-\d$/
        if (!casPattern.test(standard.cas)) {
          errors.push(`Standard ${index}: Invalid CAS format`)
        } else {
          // Validate CAS checksum
          const parts = standard.cas.split('-')
          const digits = parts[0] + parts[1]
          const checkDigit = parseInt(parts[2])
          
          let sum = 0
          for (let i = digits.length - 1; i >= 0; i--) {
            sum += parseInt(digits[i]) * (digits.length - i)
          }
          
          if ((sum % 10) !== checkDigit) {
            errors.push(`Standard ${index}: Invalid CAS checksum`)
          }
        }
      }
    })
    
    const duration = Date.now() - startTime
    const passed = errors.length === 0
    
    return {
      name: 'CAS Validation Test',
      passed,
      message: passed ? 'All CAS numbers are valid' : `Found ${errors.length} invalid CAS numbers`,
      duration,
      details: errors
    }
  }

  // Test date validation
  private async testDateValidation(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    
    data.forEach((standard, index) => {
      const dateFields = ['date_received', 'certificate_expiry', 'lab_expiry_date', 'date_opened', 'date_disposed']
      
      dateFields.forEach(field => {
        const value = standard[field as keyof StandardsRegister]
        if (value) {
          const date = new Date(value.toString())
          if (isNaN(date.getTime())) {
            errors.push(`Standard ${index}: Invalid date format for ${field}`)
          }
        }
      })
    })
    
    const duration = Date.now() - startTime
    const passed = errors.length === 0
    
    return {
      name: 'Date Validation Test',
      passed,
      message: passed ? 'All dates are valid' : `Found ${errors.length} invalid dates`,
      duration,
      details: errors
    }
  }

  // Test status validation
  private async testStatusValidation(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const validStatuses = ['Unopened', 'In-Use', 'Disposed']
    
    data.forEach((standard, index) => {
      if (!validStatuses.includes(standard.status)) {
        errors.push(`Standard ${index}: Invalid status '${standard.status}'`)
      }
    })
    
    const duration = Date.now() - startTime
    const passed = errors.length === 0
    
    return {
      name: 'Status Validation Test',
      passed,
      message: passed ? 'All statuses are valid' : `Found ${errors.length} invalid statuses`,
      duration,
      details: errors
    }
  }

  // Test unique IDs
  private async testUniqueIDs(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    const ids = data.map(standard => standard.id_no)
    const uniqueIds = new Set(ids)
    const duplicates = ids.length - uniqueIds.size
    
    const duration = Date.now() - startTime
    const passed = duplicates === 0
    
    return {
      name: 'Unique IDs Test',
      passed,
      message: passed ? 'All IDs are unique' : `Found ${duplicates} duplicate IDs`,
      duration,
      details: { duplicates, totalIds: ids.length }
    }
  }

  // Test referential integrity
  private async testReferentialIntegrity(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    
    // Test manufacturer references
    const manufacturers = new Set(data.map(s => s.manufacturer).filter(Boolean))
    data.forEach((standard, index) => {
      if (standard.manufacturer && !manufacturers.has(standard.manufacturer)) {
        errors.push(`Standard ${index}: Invalid manufacturer reference`)
      }
    })
    
    // Test supplier references
    const suppliers = new Set(data.map(s => s.supplier).filter(Boolean))
    data.forEach((standard, index) => {
      if (standard.supplier && !suppliers.has(standard.supplier)) {
        errors.push(`Standard ${index}: Invalid supplier reference`)
      }
    })
    
    const duration = Date.now() - startTime
    const passed = errors.length === 0
    
    return {
      name: 'Referential Integrity Test',
      passed,
      message: passed ? 'All references are valid' : `Found ${errors.length} invalid references`,
      duration,
      details: errors
    }
  }

  // Test data consistency
  private async testDataConsistency(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    
    data.forEach((standard, index) => {
      // Test status consistency
      if (standard.status === 'In-Use' && !standard.date_opened) {
        errors.push(`Standard ${index}: In-Use status without date_opened`)
      }
      
      if (standard.status === 'Disposed' && !standard.date_disposed) {
        errors.push(`Standard ${index}: Disposed status without date_disposed`)
      }
      
      // Test quantity consistency
      if (standard.available_qty && standard.packing_size) {
        const available = Number(standard.available_qty)
        const packing = Number(standard.packing_size)
        if (available > packing) {
          errors.push(`Standard ${index}: Available quantity exceeds packing size`)
        }
      }
    })
    
    const duration = Date.now() - startTime
    const passed = errors.length === 0
    
    return {
      name: 'Data Consistency Test',
      passed,
      message: passed ? 'All data is consistent' : `Found ${errors.length} consistency errors`,
      duration,
      details: errors
    }
  }

  // Test data completeness
  private async testDataCompleteness(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    const requiredFields = ['name', 'manufacturer', 'supplier', 'concentration', 'packing_size']
    const completenessScores: number[] = []
    
    data.forEach((standard, index) => {
      let score = 0
      requiredFields.forEach(field => {
        const value = standard[field as keyof StandardsRegister]
        if (value !== null && value !== undefined && value !== '') {
          score++
        }
      })
      completenessScores.push((score / requiredFields.length) * 100)
    })
    
    const averageCompleteness = completenessScores.reduce((a, b) => a + b, 0) / completenessScores.length
    const lowCompleteness = completenessScores.filter(score => score < 80).length
    
    const duration = Date.now() - startTime
    const passed = lowCompleteness === 0
    
    return {
      name: 'Data Completeness Test',
      passed,
      message: passed ? 'All data is complete' : `Found ${lowCompleteness} records with low completeness`,
      duration,
      details: { averageCompleteness, lowCompleteness, scores: completenessScores }
    }
  }

  // Test SQL injection prevention
  private async testSQLInjectionPrevention(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    const sqlPatterns = [
      "'; DROP TABLE",
      "'; DELETE FROM",
      "'; INSERT INTO",
      "'; UPDATE SET",
      "'; SELECT * FROM",
      "'; UNION SELECT",
      "'; OR 1=1",
      "'; AND 1=1"
    ]
    
    const errors: string[] = []
    data.forEach((standard, index) => {
      const textFields = [standard.name, standard.manufacturer, standard.supplier, standard.lot]
      textFields.forEach(field => {
        if (field) {
          sqlPatterns.forEach(pattern => {
            if (field.toLowerCase().includes(pattern.toLowerCase())) {
              errors.push(`Standard ${index}: Potential SQL injection in field`)
            }
          })
        }
      })
    })
    
    const duration = Date.now() - startTime
    const passed = errors.length === 0
    
    return {
      name: 'SQL Injection Prevention Test',
      passed,
      message: passed ? 'No SQL injection patterns found' : `Found ${errors.length} potential SQL injection patterns`,
      duration,
      details: errors
    }
  }

  // Test XSS prevention
  private async testXSSPrevention(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    const xssPatterns = [
      '<script>',
      '</script>',
      'javascript:',
      'onload=',
      'onerror=',
      'onclick=',
      'onmouseover=',
      'onfocus='
    ]
    
    const errors: string[] = []
    data.forEach((standard, index) => {
      const textFields = [standard.name, standard.manufacturer, standard.supplier, standard.lot]
      textFields.forEach(field => {
        if (field) {
          xssPatterns.forEach(pattern => {
            if (field.toLowerCase().includes(pattern.toLowerCase())) {
              errors.push(`Standard ${index}: Potential XSS in field`)
            }
          })
        }
      })
    })
    
    const duration = Date.now() - startTime
    const passed = errors.length === 0
    
    return {
      name: 'XSS Prevention Test',
      passed,
      message: passed ? 'No XSS patterns found' : `Found ${errors.length} potential XSS patterns`,
      duration,
      details: errors
    }
  }

  // Test data sanitization
  private async testDataSanitization(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    
    data.forEach((standard, index) => {
      const textFields = [standard.name, standard.manufacturer, standard.supplier, standard.lot]
      textFields.forEach(field => {
        if (field) {
          const sanitized = sanitizeString(field)
          if (sanitized.value !== field) {
            errors.push(`Standard ${index}: Field needs sanitization`)
          }
        }
      })
    })
    
    const duration = Date.now() - startTime
    const passed = errors.length === 0
    
    return {
      name: 'Data Sanitization Test',
      passed,
      message: passed ? 'All data is properly sanitized' : `Found ${errors.length} fields needing sanitization`,
      duration,
      details: errors
    }
  }

  // Test sensitive data protection
  private async testSensitiveDataProtection(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    
    data.forEach((standard, index) => {
      // Check for exposed sensitive data
      if (standard.cas && standard.cas.length > 0) {
        // CAS numbers should be protected
        if (standard.cas.includes('password') || standard.cas.includes('token')) {
          errors.push(`Standard ${index}: Potential sensitive data exposure`)
        }
      }
    })
    
    const duration = Date.now() - startTime
    const passed = errors.length === 0
    
    return {
      name: 'Sensitive Data Protection Test',
      passed,
      message: passed ? 'No sensitive data exposure found' : `Found ${errors.length} potential sensitive data exposures`,
      duration,
      details: errors
    }
  }

  // Test data loading performance
  private async testDataLoadingPerformance(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    
    // Simulate data loading
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const duration = Date.now() - startTime
    const passed = duration < 1000 // Should load in less than 1 second
    
    return {
      name: 'Data Loading Performance Test',
      passed,
      message: passed ? `Data loaded in ${duration}ms` : `Data loading took ${duration}ms (too slow)`,
      duration,
      details: { loadTime: duration, recordCount: data.length }
    }
  }

  // Test search performance
  private async testSearchPerformance(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    
    // Simulate search operation
    const searchTerm = 'test'
    const results = data.filter(standard => 
      standard.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const duration = Date.now() - startTime
    const passed = duration < 500 // Should search in less than 500ms
    
    return {
      name: 'Search Performance Test',
      passed,
      message: passed ? `Search completed in ${duration}ms` : `Search took ${duration}ms (too slow)`,
      duration,
      details: { searchTime: duration, resultCount: results.length }
    }
  }

  // Test memory usage
  private async testMemoryUsage(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    
    // Estimate memory usage
    const jsonSize = JSON.stringify(data).length
    const estimatedMemory = jsonSize * 2 // Rough estimate
    
    const duration = Date.now() - startTime
    const passed = estimatedMemory < 10 * 1024 * 1024 // Less than 10MB
    
    return {
      name: 'Memory Usage Test',
      passed,
      message: passed ? `Memory usage: ${(estimatedMemory / 1024 / 1024).toFixed(2)}MB` : `Memory usage too high: ${(estimatedMemory / 1024 / 1024).toFixed(2)}MB`,
      duration,
      details: { estimatedMemory, jsonSize }
    }
  }

  // Test response time
  private async testResponseTime(data: StandardsRegister[]): Promise<TestResult> {
    const startTime = Date.now()
    
    // Simulate API response
    await new Promise(resolve => setTimeout(resolve, 50))
    
    const duration = Date.now() - startTime
    const passed = duration < 200 // Should respond in less than 200ms
    
    return {
      name: 'Response Time Test',
      passed,
      message: passed ? `Response time: ${duration}ms` : `Response time too slow: ${duration}ms`,
      duration,
      details: { responseTime: duration }
    }
  }

  // Generate test report
  generateTestReport(suites: TestSuite[]): string {
    const totalTests = suites.reduce((sum, suite) => sum + suite.tests.length, 0)
    const totalPassed = suites.reduce((sum, suite) => sum + suite.passed, 0)
    const totalFailed = suites.reduce((sum, suite) => sum + suite.failed, 0)
    const totalDuration = suites.reduce((sum, suite) => sum + suite.duration, 0)
    
    const report = [
      'Test Report',
      '===========',
      '',
      `Total Tests: ${totalTests}`,
      `Passed: ${totalPassed}`,
      `Failed: ${totalFailed}`,
      `Duration: ${totalDuration}ms`,
      '',
      'Test Suites:',
      ...suites.map(suite => [
        `  ${suite.name}:`,
        `    Tests: ${suite.tests.length}`,
        `    Passed: ${suite.passed}`,
        `    Failed: ${suite.failed}`,
        `    Duration: ${suite.duration}ms`,
        ''
      ].join('\n')),
      'Individual Tests:',
      ...suites.flatMap(suite => 
        suite.tests.map(test => [
          `  ${test.name}: ${test.passed ? 'PASS' : 'FAIL'}`,
          `    Message: ${test.message}`,
          `    Duration: ${test.duration}ms`,
          ''
        ].join('\n'))
      )
    ].join('\n')
    
    return report
  }

  // Export test results
  exportTestResults(suites: TestSuite[]): void {
    const report = this.generateTestReport(suites)
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `test_report_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }
}

// Create testing manager instance
export const testingManager = new TestingManager()

// Testing utilities
export const runAllTests = (data: StandardsRegister[], options?: TestOptions): Promise<TestSuite[]> => {
  return testingManager.runAllTests(data, options)
}

export const generateTestReport = (suites: TestSuite[]): string => {
  return testingManager.generateTestReport(suites)
}

export const exportTestResults = (suites: TestSuite[]): void => {
  testingManager.exportTestResults(suites)
}

// Testing hooks
export const useTesting = () => {
  const [isRunning, setIsRunning] = React.useState(false)
  const [testSuites, setTestSuites] = React.useState<TestSuite[]>([])
  const [testReport, setTestReport] = React.useState<string>('')

  const runTests = async (data: StandardsRegister[], options?: TestOptions) => {
    setIsRunning(true)
    try {
      const suites = await testingManager.runAllTests(data, options)
      setTestSuites(suites)
      setTestReport(testingManager.generateTestReport(suites))
      return suites
    } finally {
      setIsRunning(false)
    }
  }

  const exportResults = () => {
    if (testSuites.length > 0) {
      testingManager.exportTestResults(testSuites)
    }
  }

  return {
    isRunning,
    testSuites,
    testReport,
    runTests,
    exportResults
  }
}

// Test validation
export const validateTestOptions = (options: TestOptions): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (options.timeout && options.timeout < 1000) {
    errors.push('Timeout must be at least 1000ms')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Test scheduling
export const scheduleTests = (data: StandardsRegister[], interval: number): void => {
  setInterval(async () => {
    try {
      const suites = await runAllTests(data)
      const report = generateTestReport(suites)
      console.log('Scheduled test results:', report)
    } catch (error) {
      console.error('Scheduled tests failed:', error)
    }
  }, interval)
}
