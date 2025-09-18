'use client'

import React, { useState, useEffect } from 'react'
import { useGoogleSheets } from '@/lib/googleSheets'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function TestConnectionPage() {
  const { testConnection, getStandards, getStatistics } = useGoogleSheets()
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed' | 'mock'>('testing')
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    testGoogleSheetsConnection()
  }, [])

  const testGoogleSheetsConnection = async () => {
    setIsLoading(true)
    setConnectionStatus('testing')
    
    try {
      // Test basic connection
      const connected = await testConnection()
      
      if (connected) {
        setConnectionStatus('connected')
        
        // Test data retrieval
        try {
          const [standards, stats] = await Promise.all([
            getStandards(),
            getStatistics()
          ])
          
          setTestResults({
            connection: true,
            standardsCount: standards?.length || 0,
            statistics: stats,
            sampleData: standards?.slice(0, 2) || []
          })
        } catch (dataError) {
          console.error('Data retrieval test failed:', dataError)
          setTestResults({
            connection: true,
            dataError: dataError.message
          })
        }
      } else {
        setConnectionStatus('failed')
        setTestResults({
          connection: false,
          error: 'Connection test failed'
        })
      }
    } catch (error) {
      console.error('Connection test error:', error)
      setConnectionStatus('mock')
      setTestResults({
        connection: false,
        usingMockData: true,
        error: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'mock': return 'text-yellow-600'
      default: return 'text-blue-600'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'เชื่อมต่อสำเร็จ'
      case 'failed': return 'เชื่อมต่อล้มเหลว'
      case 'mock': return 'ใช้ข้อมูลจำลอง'
      default: return 'กำลังทดสอบ...'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '✅'
      case 'failed': return '❌'
      case 'mock': return '⚠️'
      default: return '🔄'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ทดสอบการเชื่อมต่อ Google Sheets
          </h1>
          <p className="text-gray-600">
            ตรวจสอบสถานะการเชื่อมต่อกับ Google Sheets API
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Connection Status */}
          <Card>
            <div className="text-center">
              <div className="text-4xl mb-4">{getStatusIcon()}</div>
              <h3 className="text-xl font-semibold mb-2">สถานะการเชื่อมต่อ</h3>
              <p className={`text-lg font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </p>
              
              <div className="mt-6">
                <Button 
                  onClick={testGoogleSheetsConnection}
                  loading={isLoading}
                  variant="primary"
                >
                  ทดสอบใหม่
                </Button>
              </div>
            </div>
          </Card>

          {/* Test Results */}
          <Card>
            <h3 className="text-xl font-semibold mb-4">ผลการทดสอบ</h3>
            {testResults ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">การเชื่อมต่อ:</span>
                  <span className={testResults.connection ? 'text-green-600' : 'text-red-600'}>
                    {testResults.connection ? 'สำเร็จ' : 'ล้มเหลว'}
                  </span>
                </div>
                
                {testResults.usingMockData && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ใช้ข้อมูลจำลอง:</span>
                    <span className="text-yellow-600">ใช่</span>
                  </div>
                )}
                
                {testResults.standardsCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">จำนวนข้อมูล:</span>
                    <span className="text-blue-600">{testResults.standardsCount} รายการ</span>
                  </div>
                )}
                
                {testResults.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">
                      <strong>ข้อผิดพลาด:</strong> {testResults.error}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">ยังไม่ได้ทดสอบ</p>
            )}
          </Card>
        </div>

        {/* Sample Data */}
        {testResults?.sampleData && testResults.sampleData.length > 0 && (
          <Card className="mt-6">
            <h3 className="text-xl font-semibold mb-4">ข้อมูลตัวอย่าง</h3>
            <div className="space-y-3">
              {testResults.sampleData.map((item: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">รหัส: {item.id_no}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Unopened' 
                        ? 'bg-green-100 text-green-800' 
                        : item.status === 'In-Use'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status === 'Unopened' ? 'ยังไม่เปิด' : 
                       item.status === 'In-Use' ? 'กำลังใช้' : 'ทิ้งแล้ว'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Configuration Info */}
        <Card className="mt-6">
          <h3 className="text-xl font-semibold mb-4">ข้อมูลการตั้งค่า</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Google Sheets ID:</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                1KJAfxnbH8iFDopf6rN6Kt47TWZUCV_oSCxZXNu9GvGM
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Sheet Name:</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                StandardsRegister
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">API URL:</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                {process.env.NEXT_PUBLIC_APPS_SCRIPT_WEB_APP_URL || 'ไม่ได้ตั้งค่า'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">สถานะ:</p>
              <p className="text-sm">
                {connectionStatus === 'mock' 
                  ? 'ใช้ข้อมูลจำลอง (CORS Blocked)' 
                  : connectionStatus === 'connected'
                  ? 'เชื่อมต่อ Google Sheets สำเร็จ'
                  : 'กำลังทดสอบ...'}
              </p>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
          >
            กลับไปหน้า Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
