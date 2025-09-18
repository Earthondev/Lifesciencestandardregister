import React, { useState } from 'react'
import { Input } from './Input'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface SearchFilterProps {
  onSearch: (filters: SearchFilters) => void
  onClear: () => void
  className?: string
}

export interface SearchFilters {
  searchTerm: string
  status: string
  manufacturer: string
  supplier: string
  testGroup: string
  expiryRange: {
    type: 'all' | 'expired' | 'expiring_soon' | 'expiring_30' | 'expiring_60' | 'expiring_90' | 'custom'
    days?: number
    startDate?: string
    endDate?: string
  }
  receivedRange: {
    type: 'all' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom'
    startDate?: string
    endDate?: string
  }
  concentration: {
    min?: number
    max?: number
    unit?: string
  }
  sortBy: string
  sortDirection: 'asc' | 'desc'
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onClear,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    status: '',
    manufacturer: '',
    supplier: '',
    testGroup: '',
    expiryRange: { type: 'all' },
    receivedRange: { type: 'all' },
    concentration: {},
    sortBy: 'date_received',
    sortDirection: 'desc'
  })

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleNestedFilterChange = (parentKey: keyof SearchFilters, childKey: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey] as any,
        [childKey]: value
      }
    }))
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      searchTerm: '',
      status: '',
      manufacturer: '',
      supplier: '',
      testGroup: '',
      expiryRange: { type: 'all' },
      receivedRange: { type: 'all' },
      concentration: {},
      sortBy: 'date_received',
      sortDirection: 'desc'
    }
    setFilters(clearedFilters)
    onClear()
  }

  return (
    <div className={cn('bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6', className)}>
      {/* Basic Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            label="ค้นหา"
            placeholder="ค้นหาตามชื่อสาร, ID, ผู้ผลิต, ผู้จำหน่าย..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSearch} size="md">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            ค้นหา
          </Button>
          
          <Button variant="secondary" onClick={handleClear} size="md">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            ล้าง
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setIsExpanded(!isExpanded)}
            size="md"
          >
            <svg className={cn("w-4 h-4 mr-2 transition-transform", isExpanded && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            กรองขั้นสูง
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="Unopened">ยังไม่เปิด</option>
                <option value="In-Use">กำลังใช้</option>
                <option value="Disposed">ทิ้งแล้ว</option>
              </select>
            </div>

            {/* Manufacturer Filter */}
            <div>
              <Input
                label="ผู้ผลิต"
                placeholder="กรองตามผู้ผลิต"
                value={filters.manufacturer}
                onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
              />
            </div>

            {/* Supplier Filter */}
            <div>
              <Input
                label="ผู้จำหน่าย"
                placeholder="กรองตามผู้จำหน่าย"
                value={filters.supplier}
                onChange={(e) => handleFilterChange('supplier', e.target.value)}
              />
            </div>

            {/* Test Group Filter */}
            <div>
              <Input
                label="กลุ่มทดสอบ"
                placeholder="กรองตามกลุ่มทดสอบ"
                value={filters.testGroup}
                onChange={(e) => handleFilterChange('testGroup', e.target.value)}
              />
            </div>

            {/* Expiry Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันหมดอายุ</label>
              <select
                value={filters.expiryRange.type}
                onChange={(e) => handleNestedFilterChange('expiryRange', 'type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">ทั้งหมด</option>
                <option value="expired">หมดอายุแล้ว</option>
                <option value="expiring_soon">ใกล้หมดอายุ (30 วัน)</option>
                <option value="expiring_60">หมดอายุใน 60 วัน</option>
                <option value="expiring_90">หมดอายุใน 90 วัน</option>
                <option value="custom">กำหนดเอง</option>
              </select>
              
              {filters.expiryRange.type === 'custom' && (
                <div className="mt-2 space-y-2">
                  <input
                    type="date"
                    value={filters.expiryRange.startDate || ''}
                    onChange={(e) => handleNestedFilterChange('expiryRange', 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="วันที่เริ่มต้น"
                  />
                  <input
                    type="date"
                    value={filters.expiryRange.endDate || ''}
                    onChange={(e) => handleNestedFilterChange('expiryRange', 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="วันที่สิ้นสุด"
                  />
                </div>
              )}
            </div>

            {/* Received Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่รับ</label>
              <select
                value={filters.receivedRange.type}
                onChange={(e) => handleNestedFilterChange('receivedRange', 'type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">ทั้งหมด</option>
                <option value="this_month">เดือนนี้</option>
                <option value="last_month">เดือนที่แล้ว</option>
                <option value="this_year">ปีนี้</option>
                <option value="last_year">ปีที่แล้ว</option>
                <option value="custom">กำหนดเอง</option>
              </select>
              
              {filters.receivedRange.type === 'custom' && (
                <div className="mt-2 space-y-2">
                  <input
                    type="date"
                    value={filters.receivedRange.startDate || ''}
                    onChange={(e) => handleNestedFilterChange('receivedRange', 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="วันที่เริ่มต้น"
                  />
                  <input
                    type="date"
                    value={filters.receivedRange.endDate || ''}
                    onChange={(e) => handleNestedFilterChange('receivedRange', 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="วันที่สิ้นสุด"
                  />
                </div>
              )}
            </div>

            {/* Concentration Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ความเข้มข้น</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="ต่ำสุด"
                  value={filters.concentration.min || ''}
                  onChange={(e) => handleNestedFilterChange('concentration', 'min', e.target.value ? Number(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="flex items-center text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="สูงสุด"
                  value={filters.concentration.max || ''}
                  onChange={(e) => handleNestedFilterChange('concentration', 'max', e.target.value ? Number(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เรียงตาม</label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="date_received">วันที่รับ</option>
                  <option value="lab_expiry_date">วันหมดอายุ</option>
                  <option value="name">ชื่อสาร</option>
                  <option value="manufacturer">ผู้ผลิต</option>
                  <option value="status">สถานะ</option>
                </select>
                <button
                  onClick={() => handleFilterChange('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <svg className={cn("w-4 h-4 transition-transform", filters.sortDirection === 'desc' && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={handleClear}>
              ล้างทั้งหมด
            </Button>
            <Button onClick={handleSearch}>
              ค้นหาด้วยกรองขั้นสูง
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
