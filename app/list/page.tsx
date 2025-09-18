'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { SearchFilter, SearchFilters } from '@/components/ui/SearchFilter'
import ChemicalBackground from '@/components/ChemicalBackground'
import { useGoogleSheets } from '@/lib/googleSheets'
import { notificationManager } from '@/lib/notifications'
import { formatDate } from '@/lib/formatters'
import { StandardsRegister } from '@/types'

export default function ListPage() {
  const router = useRouter()
  const { getStandards, changeStatus } = useGoogleSheets()
  const [standards, setStandards] = useState<StandardsRegister[]>([])
  const [filteredStandards, setFilteredStandards] = useState<StandardsRegister[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedStandard, setSelectedStandard] = useState<StandardsRegister | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Load standards on component mount
  useEffect(() => {
    loadStandards()
  }, [])

  // Apply filters when standards or filters change
  useEffect(() => {
    if (currentFilters) {
      applyAdvancedFilters(currentFilters)
    } else {
      setFilteredStandards(standards)
    }
  }, [standards, currentFilters])

  // Calculate statistics
  const statistics = {
    total: standards.length,
    unopened: standards.filter(s => s.status === 'Unopened').length,
    inUse: standards.filter(s => s.status === 'In-Use').length,
    disposed: standards.filter(s => s.status === 'Disposed').length
  }

  const loadStandards = async () => {
    setIsLoading(true)
    try {
      const data = await getStandards()
      setStandards(data)
    } catch (error) {
      notificationManager.error('ไม่สามารถโหลดข้อมูลได้')
      console.error('Error loading standards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyAdvancedFilters = (filters: SearchFilters) => {
    let filtered = [...standards]

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(standard =>
        standard.id_no?.toLowerCase().includes(searchLower) ||
        standard.name?.toLowerCase().includes(searchLower) ||
        standard.manufacturer?.toLowerCase().includes(searchLower) ||
        standard.supplier?.toLowerCase().includes(searchLower) ||
        standard.cas?.toLowerCase().includes(searchLower) ||
        standard.lot?.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(standard => standard.status === filters.status)
    }

    // Manufacturer filter
    if (filters.manufacturer) {
      filtered = filtered.filter(standard =>
        standard.manufacturer?.toLowerCase().includes(filters.manufacturer.toLowerCase())
      )
    }

    // Supplier filter
    if (filters.supplier) {
      filtered = filtered.filter(standard =>
        standard.supplier?.toLowerCase().includes(filters.supplier.toLowerCase())
      )
    }

    // Test group filter
    if (filters.testGroup) {
      filtered = filtered.filter(standard =>
        standard.test_group?.toLowerCase().includes(filters.testGroup.toLowerCase())
      )
    }

    // Expiry range filter
    if (filters.expiryRange.type !== 'all') {
      const now = new Date()
      filtered = filtered.filter(standard => {
        const expiryDate = new Date(standard.lab_expiry_date)
        
        switch (filters.expiryRange.type) {
          case 'expired':
            return expiryDate < now
          case 'expiring_soon':
          case 'expiring_30':
            const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
            return expiryDate >= now && expiryDate <= thirtyDaysFromNow
          case 'expiring_60':
            const sixtyDaysFromNow = new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000))
            return expiryDate >= now && expiryDate <= sixtyDaysFromNow
          case 'expiring_90':
            const ninetyDaysFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000))
            return expiryDate >= now && expiryDate <= ninetyDaysFromNow
          case 'custom':
            if (filters.expiryRange.startDate && filters.expiryRange.endDate) {
              const startDate = new Date(filters.expiryRange.startDate)
              const endDate = new Date(filters.expiryRange.endDate)
              return expiryDate >= startDate && expiryDate <= endDate
            }
            return true
          default:
            return true
        }
      })
    }

    // Received date range filter
    if (filters.receivedRange.type !== 'all') {
      const now = new Date()
      filtered = filtered.filter(standard => {
        const receivedDate = new Date(standard.date_received)
        
        switch (filters.receivedRange.type) {
          case 'this_month':
            return receivedDate.getMonth() === now.getMonth() && receivedDate.getFullYear() === now.getFullYear()
          case 'last_month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            return receivedDate >= lastMonth && receivedDate < thisMonth
          case 'this_year':
            return receivedDate.getFullYear() === now.getFullYear()
          case 'last_year':
            return receivedDate.getFullYear() === now.getFullYear() - 1
          case 'custom':
            if (filters.receivedRange.startDate && filters.receivedRange.endDate) {
              const startDate = new Date(filters.receivedRange.startDate)
              const endDate = new Date(filters.receivedRange.endDate)
              return receivedDate >= startDate && receivedDate <= endDate
            }
            return true
          default:
            return true
        }
      })
    }

    // Concentration range filter
    if (filters.concentration.min !== undefined || filters.concentration.max !== undefined) {
      filtered = filtered.filter(standard => {
        const concentration = standard.concentration
        if (filters.concentration.min !== undefined && concentration < filters.concentration.min) {
          return false
        }
        if (filters.concentration.max !== undefined && concentration > filters.concentration.max) {
          return false
        }
        return true
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof StandardsRegister]
      let bValue: any = b[filters.sortBy as keyof StandardsRegister]
      
      // Handle date sorting
      if (filters.sortBy === 'date_received' || filters.sortBy === 'lab_expiry_date') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }
      
      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (aValue < bValue) return filters.sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return filters.sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredStandards(filtered)
    setCurrentPage(1)
  }

  const handleSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters)
  }

  const handleClearFilters = () => {
    setCurrentFilters(null)
    setFilteredStandards(standards)
  }


  const handleStatusChange = async (idNo: string, newStatus: string) => {
    const standard = standards.find(s => s.id_no === idNo)
    if (standard) {
      setSelectedStandard(standard)
      setNewStatus(newStatus)
      setShowStatusModal(true)
    }
  }

  const confirmStatusChange = async () => {
    if (!selectedStandard) return

    try {
      await changeStatus({
        id_no: selectedStandard.id_no,
        new_status: newStatus,
        note: `เปลี่ยนสถานะเป็น ${newStatus}`
      })
      
      notificationManager.success('เปลี่ยนสถานะสำเร็จ')
      loadStandards() // Reload data
      setShowStatusModal(false)
      setSelectedStandard(null)
      setNewStatus('')
    } catch (error) {
      notificationManager.error('ไม่สามารถเปลี่ยนสถานะได้')
      console.error('Error changing status:', error)
    }
  }

  const handleViewDetails = (idNo: string) => {
    router.push(`/details/${idNo}`)
  }

  const handleQuickAction = (idNo: string, action: string) => {
    switch (action) {
      case 'open':
        handleStatusChange(idNo, 'In-Use')
        break
      case 'dispose':
        handleStatusChange(idNo, 'Disposed')
        break
      case 'reopen':
        handleStatusChange(idNo, 'Unopened')
        break
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredStandards.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStandards = filteredStandards.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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

  return (
    <ChemicalBackground>

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border border-white/20 mx-4 mt-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">รายการสารทั้งหมด</h1>
              <p className="text-sm text-gray-600">Chemical Substances Inventory</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => router.push('/register')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-4 py-2 text-white rounded-lg text-sm transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              เพิ่มสารใหม่
            </button>
            <button 
              onClick={() => router.back()}
              className="text-orange-600 hover:text-orange-800 transition-colors px-4 py-2"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.total}</p>
              </div>
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ยังไม่เปิด</p>
                <p className="text-2xl font-bold text-green-600">{statistics.unopened}</p>
              </div>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">กำลังใช้</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.inUse}</p>
              </div>
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ทิ้งแล้ว</p>
                <p className="text-2xl font-bold text-red-600">{statistics.disposed}</p>
              </div>
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
        </div>

        {/* Advanced Search and Filter */}
        <SearchFilter 
          onSearch={handleSearch}
          onClear={handleClearFilters}
          className="mb-6"
        />

        {/* Results Summary */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              แสดง <span className="font-semibold text-orange-600">{filteredStandards.length}</span> รายการจากทั้งหมด <span className="font-semibold">{standards.length}</span> รายการ
            </div>
            {currentFilters && (
              <div className="text-xs text-gray-500">
                กรองแล้ว: {Object.values(currentFilters).filter(v => v && v !== '' && JSON.stringify(v) !== '{}').length} เงื่อนไข
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    ID No.
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    ชื่อสาร
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    สถานะ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    วันที่รับเข้า
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    วันหมดอายุ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    ผู้จัดหา
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedStandards.map((standard, index) => (
                  <tr key={index} className="hover:bg-orange-50/50 transition-all duration-200 hover:transform hover:-translate-y-0.5">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {standard.id_no}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {standard.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        standard.status === 'Unopened' 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                          : standard.status === 'In-Use'
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                          : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      }`}>
                        {standard.status === 'Unopened' ? 'ยังไม่เปิด' : 
                         standard.status === 'In-Use' ? 'กำลังใช้' : 'ทิ้งแล้ว'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(standard.date_received)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(standard.lab_expiry_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {standard.supplier}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        {standard.status === 'Unopened' && (
                          <button
                            onClick={() => handleStatusChange(standard.id_no, 'In-Use')}
                            className="text-yellow-600 hover:text-yellow-800 transition-all duration-200 hover:scale-110"
                            title="เปิดใช้"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        {standard.status !== 'Disposed' && (
                          <button
                            onClick={() => handleStatusChange(standard.id_no, 'Disposed')}
                            className="text-red-600 hover:text-red-800 transition-all duration-200 hover:scale-110"
                            title="ทิ้ง"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(standard.id_no)}
                          className="text-blue-600 hover:text-blue-800 transition-all duration-200 hover:scale-110"
                          title="ดูรายละเอียด"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedStandards.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">ไม่พบข้อมูล</h3>
                <p className="text-gray-600 mb-4">ไม่พบสารมาตรฐานที่ตรงกับเงื่อนไขการค้นหา</p>
                <button 
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6 py-2 text-white rounded-lg transition-all duration-200"
                >
                  เพิ่มสารใหม่
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            แสดง <span className="font-semibold">{filteredStandards.length > 0 ? startIndex + 1 : 0}</span>-<span className="font-semibold">{Math.min(endIndex, filteredStandards.length)}</span> จาก <span className="font-semibold">{filteredStandards.length}</span> รายการ
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              หน้า {currentPage} จาก {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && selectedStandard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">เปลี่ยนสถานะ</h3>
              <p className="text-gray-600 mb-4">
                ต้องการเปลี่ยนสถานะของ "{selectedStandard.name}" เป็น "{newStatus === 'In-Use' ? 'กำลังใช้' : newStatus === 'Disposed' ? 'ทิ้งแล้ว' : 'ยังไม่เปิด'}" หรือไม่?
              </p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={confirmStatusChange}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-4 py-2 text-white rounded-lg transition-all duration-200"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ChemicalBackground>
  )
}
