'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Logo } from '@/components/ui/Logo'
import ChemicalBackground from '@/components/ChemicalBackground'
import { useGoogleSheets } from '@/lib/googleSheets'
import { notificationManager } from '@/lib/notifications'
import { formatDate } from '@/lib/formatters'
import { Statistics, StandardsRegister } from '@/types'

export default function DashboardNewPage() {
  const router = useRouter()
  const { getStatistics, getStandards } = useGoogleSheets()
  const [stats, setStats] = useState<Statistics | null>(null)
  const [standards, setStandards] = useState<StandardsRegister[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('current-year')
  const [lastUpdate, setLastUpdate] = useState('')
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [showCustomRange, setShowCustomRange] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadData()
    updateLastUpdate()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [statsData, standardsData] = await Promise.all([
        getStatistics(),
        getStandards()
      ])
      
      setStats(statsData)
      setStandards(standardsData)
    } catch (error) {
      notificationManager.error('ไม่สามารถโหลดข้อมูลได้')
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateLastUpdate = () => {
    const now = new Date()
    const timeString = now.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    })
    setLastUpdate(timeString)
  }

  const getExpiringSoon = () => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
    
    return standards.filter(standard => {
      const expiryDate = new Date(standard.lab_expiry_date)
      return expiryDate > now && expiryDate <= thirtyDaysFromNow
    })
  }

  const getExpired = () => {
    const now = new Date()
    
    return standards.filter(standard => {
      const expiryDate = new Date(standard.lab_expiry_date)
      return expiryDate < now
    })
  }

  const getRecentActivity = () => {
    return standards
      .sort((a, b) => new Date(b.date_received).getTime() - new Date(a.date_received).getTime())
      .slice(0, 5)
  }

  const getMonthlyStats = () => {
    const monthlyData: Record<string, number> = {}
    const now = new Date()
    
    // Initialize months
    for (let i = 0; i < 12; i++) {
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() - i + 1).padStart(2, '0')}`
      monthlyData[monthKey] = 0
    }
    
    // Count standards by month
    standards.forEach(standard => {
      const receivedDate = new Date(standard.date_received)
      const monthKey = `${receivedDate.getFullYear()}-${String(receivedDate.getMonth() + 1).padStart(2, '0')}`
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey]++
      }
    })

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count
    })).reverse()
  }

  const handleRefresh = async () => {
    await loadData()
    updateLastUpdate()
    notificationManager.success('อัปเดตข้อมูลเรียบร้อย')
  }

  const handleExport = () => {
    notificationManager.info('ส่งออกรายงาน PDF (Demo Mode)')
  }

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value)
    setShowCustomRange(value === 'custom')
  }

  const toggleChartType = () => {
    setChartType(prev => prev === 'line' ? 'bar' : 'line')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  const expiringSoon = getExpiringSoon()
  const expired = getExpired()
  const recentActivity = getRecentActivity()
  const monthlyStats = getMonthlyStats()

  return (
    <ChemicalBackground>

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border border-white/20 mx-4 mt-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Logo width={120} height={30} />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-600">ภาพรวมการจัดการสารมาตรฐานในห้องแล็บ</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">อัปเดตล่าสุด</p>
              <p className="text-sm font-medium text-gray-800">{lastUpdate}</p>
            </div>
            <button 
              onClick={handleRefresh}
              className="text-orange-600 hover:text-orange-800 transition-colors p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Time Filter */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">ช่วงเวลา:</label>
              <select 
                value={timeFilter}
                onChange={(e) => handleTimeFilterChange(e.target.value)}
                className="bg-white/90 backdrop-blur-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="current-month">เดือนปัจจุบัน</option>
                <option value="last-month">เดือนที่แล้ว</option>
                <option value="current-year">ปีปัจจุบัน</option>
                <option value="last-year">ปีที่แล้ว</option>
                <option value="custom">กำหนดเอง</option>
              </select>
            </div>
            {showCustomRange && (
              <div className="flex items-center space-x-2">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white/90 backdrop-blur-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-gray-500">ถึง</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white/90 backdrop-blur-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}
            <button 
              onClick={handleExport}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-4 py-2 text-white rounded-lg text-sm transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ส่งออกรายงาน
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Total Substances */}
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats?.total_standards || 0}</h3>
            <p className="text-sm text-gray-600 mb-2">สารทั้งหมด</p>
            <div className="flex items-center justify-center text-xs">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              <span className="text-green-500">+12 เดือนนี้</span>
            </div>
          </div>

          {/* Unopened */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold">{stats?.unopened || 0}</h3>
            <p className="text-sm mb-2 opacity-90">ยังไม่เปิด</p>
            <div className="flex items-center justify-center text-xs opacity-80">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              <span>+8 เดือนนี้</span>
            </div>
          </div>

          {/* In Use */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold">{stats?.in_use || 0}</h3>
            <p className="text-sm mb-2 opacity-90">กำลังใช้</p>
            <div className="flex items-center justify-center text-xs opacity-80">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
              <span>-3 เดือนนี้</span>
            </div>
          </div>

          {/* Disposed */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold">{stats?.disposed || 0}</h3>
            <p className="text-sm mb-2 opacity-90">ทิ้งแล้ว</p>
            <div className="flex items-center justify-center text-xs opacity-80">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              <span>+7 เดือนนี้</span>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-pulse">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold">{stats?.expiring_soon || 0}</h3>
            <p className="text-sm mb-2 opacity-90">ใกล้หมดอายุ</p>
            <div className="flex items-center justify-center text-xs opacity-80">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>ใน 30 วัน</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Registration Trends */}
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                แนวโน้มการลงทะเบียน
              </h3>
              <button 
                onClick={toggleChartType}
                className="text-sm text-orange-600 hover:text-orange-800 transition-colors"
              >
                {chartType === 'line' ? (
                  <>
                    <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    แท่ง
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    เส้น
                  </>
                )}
              </button>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500">กราฟแนวโน้มการลงทะเบียน</p>
                <p className="text-sm text-gray-400">({chartType === 'line' ? 'กราฟเส้น' : 'กราฟแท่ง'})</p>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              การกระจายสถานะ
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p className="text-gray-500">กราฟวงกลมแสดงสถานะ</p>
                <p className="text-sm text-gray-400">ยังไม่เปิด: {stats?.unopened || 0}, กำลังใช้: {stats?.in_use || 0}, ทิ้งแล้ว: {stats?.disposed || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Items Requiring Attention */}
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                ต้องดำเนินการ
              </h3>
              <button 
                onClick={() => router.push('/list')}
                className="text-sm text-orange-600 hover:text-orange-800 transition-colors"
              >
                ดูทั้งหมด 
                <svg className="w-3 h-3 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {expiringSoon.slice(0, 3).map((standard, index) => (
                <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{standard.name}</h4>
                      <p className="text-sm text-red-600 mt-1">หมดอายุใน {Math.ceil((new Date(standard.lab_expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} วัน</p>
                      <p className="text-xs text-gray-500 mt-1">Certificate: {formatDate(standard.certificate_expiry)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => router.push(`/details/${standard.id_no}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => router.push(`/details/${standard.id_no}`)}
                        className="text-orange-600 hover:text-orange-800 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {expiringSoon.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">ไม่มีสารที่ต้องดำเนินการ</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">รายการที่ต้องดำเนินการ</span>
                <span className="font-medium text-red-600">{expiringSoon.length} รายการ</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                กิจกรรมล่าสุด
              </h3>
              <button 
                onClick={() => router.push('/list')}
                className="text-sm text-orange-600 hover:text-orange-800 transition-colors"
              >
                ดูทั้งหมด 
                <svg className="w-3 h-3 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((standard, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">ลงทะเบียนสารใหม่</p>
                    <p className="text-xs text-gray-500">{standard.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(standard.date_received)}</p>
                  </div>
                </div>
              ))}
              
              {recentActivity.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">ไม่มีกิจกรรมล่าสุด</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChemicalBackground>
  )
}
