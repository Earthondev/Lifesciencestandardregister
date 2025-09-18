'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import ChemicalBackground from '@/components/ChemicalBackground'
import { useGoogleSheets } from '@/lib/googleSheets'
import { notificationManager } from '@/lib/notifications'
import { validateForm, REGISTER_STANDARD_SCHEMA } from '@/lib/validation'

export default function RegisterPage() {
  const router = useRouter()
  const { registerStandard, findSimilarNames, lookupCAS } = useGoogleSheets()
  const [formData, setFormData] = useState({
    name: '',
    storage: '',
    material: '',
    concentration: '',
    concentration_unit: '',
    packing_size: '',
    packing_unit: '',
    cas: '',
    lot: '',
    manufacturer: '',
    supplier: '',
    date_received: '',
    certificate_expiry: '',
    lab_expiry_date: '',
    test_group: '',
    status: 'Unopened'
  })
  const [similarNames, setSimilarNames] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [generatedId, setGeneratedId] = useState('')

  // Find similar names when name changes
  useEffect(() => {
    if (formData.name && formData.name.length > 2) {
      const timeoutId = setTimeout(async () => {
        try {
          const results = await findSimilarNames(formData.name)
          setSimilarNames(results)
        } catch (error) {
          console.error('Error finding similar names:', error)
        }
      }, 500)
      
      return () => clearTimeout(timeoutId)
    } else {
      setSimilarNames([])
    }
  }, [formData.name])

  // Auto-fill CAS when name changes
  useEffect(() => {
    if (formData.name && !formData.cas) {
      const timeoutId = setTimeout(async () => {
        try {
          const casResult = await lookupCAS(formData.name)
          if (casResult && casResult.cas) {
            setFormData(prev => ({ ...prev, cas: casResult.cas }))
            notificationManager.info(`พบเลข CAS: ${casResult.cas}`)
          }
        } catch (error) {
          console.error('Error looking up CAS:', error)
        }
      }, 1000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [formData.name, formData.cas, lookupCAS])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      // Validate form
      const validation = validateForm(formData, REGISTER_STANDARD_SCHEMA)
      if (!validation.isValid) {
        setErrors(validation.errors)
        setIsLoading(false)
        return
      }

      // Register standard
      const result = await registerStandard(formData)
      if (result) {
        setGeneratedId(result.id_no)
        setShowSuccessModal(true)
        notificationManager.success(`ลงทะเบียนสำเร็จ! รหัส: ${result.id_no}`)
      }
    } catch (error) {
      notificationManager.error('เกิดข้อผิดพลาดในการลงทะเบียน')
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSimilarNameClick = (name: string) => {
    setFormData(prev => ({ ...prev, name }))
    setSimilarNames([])
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    router.push('/list')
  }

  const handleCancel = () => {
    if (confirm('ต้องการยกเลิกการลงทะเบียน?')) {
      setFormData({
        name: '',
        storage: '',
        material: '',
        concentration: '',
        concentration_unit: '',
        packing_size: '',
        packing_unit: '',
        cas: '',
        lot: '',
        manufacturer: '',
        supplier: '',
        date_received: '',
        certificate_expiry: '',
        lab_expiry_date: '',
        test_group: '',
        status: 'Unopened'
      })
      setSimilarNames([])
      setErrors({})
    }
  }

  return (
    <ChemicalBackground>

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border border-white/20 mx-4 mt-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <rect x="0" y="0" width="24" height="12" rx="6" fill="currentColor"/>
                <line x1="12" y1="1" x2="12" y2="11" stroke="white" strokeWidth="0.5" opacity="0.6"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ลงทะเบียนสารใหม่</h1>
              <p className="text-sm text-gray-600">Register New Chemical Substance</p>
            </div>
          </div>
          <button 
            onClick={() => router.back()}
            className="text-orange-600 hover:text-orange-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับ
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        <div className="max-w-4xl mx-auto">
          {/* Similar Names Warning */}
          {similarNames.length > 0 && (
            <div className="bg-orange-50/80 border border-orange-200 rounded-lg p-4 mb-6 animate-slideDown">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 mb-2">พบชื่อสารที่คล้ายกันในระบบ</h3>
                  <div className="space-y-1 mb-2">
                    {similarNames.map((item, index) => (
                      <div key={index} className="text-sm text-orange-800">
                        • {item.name} (รหัส: {item.id_no}, ความคล้าย: {Math.round(item.similarity * 100)}%)
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-orange-700">กรุณาตรวจสอบว่าสารนี้ได้ลงทะเบียนแล้วหรือไม่</p>
                </div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  ข้อมูลพื้นฐาน
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="ชื่อสาร *"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="กรอกชื่อสารเคมี"
                      required
                      error={errors.name}
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ประเภทสาร <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">เลือกประเภท</option>
                      <option value="organic">สารอินทรีย์</option>
                      <option value="inorganic">สารอนินทรีย์</option>
                      <option value="vitamin">วิตามิน</option>
                      <option value="buffer">บัฟเฟอร์</option>
                      <option value="indicator">อินดิเคเตอร์</option>
                      <option value="standard">สารมาตรฐาน</option>
                    </select>
                  </div>
                  <div>
                    <Input
                      label="CAS No."
                      name="cas"
                      value={formData.cas}
                      onChange={handleInputChange}
                      placeholder="เช่น 64-17-5"
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Concentration & Packaging */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12h6m-6 4h6" />
                  </svg>
                  ความเข้มข้นและบรรจุภัณฑ์
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      label="ความเข้มข้น *"
                      name="concentration"
                      type="number"
                      step="0.01"
                      value={formData.concentration}
                      onChange={handleInputChange}
                      placeholder="99.5"
                      required
                      error={errors.concentration}
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12h6m-6 4h6" />
                        </svg>
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หน่วย <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="concentration_unit"
                      value={formData.concentration_unit}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">เลือกหน่วย</option>
                      <option value="%">% (เปอร์เซ็นต์)</option>
                      <option value="ppm">ppm</option>
                      <option value="mg/L">mg/L</option>
                      <option value="mol/L">mol/L</option>
                      <option value="N">N (นอร์มัล)</option>
                      <option value="M">M (โมลาร์)</option>
                    </select>
                  </div>
                  <div>
                    <Input
                      label="ขนาดบรรจุ *"
                      name="packing_size"
                      value={formData.packing_size}
                      onChange={handleInputChange}
                      placeholder="500 mL"
                      required
                      error={errors.packing_size}
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Storage & Handling */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  การจัดเก็บ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เงื่อนไขการจัดเก็บ <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="storage"
                      value={formData.storage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">เลือกเงื่อนไข</option>
                      <option value="room_temp">อุณหภูมิห้อง (15-30°C)</option>
                      <option value="cool">เย็น (2-8°C)</option>
                      <option value="frozen">แช่แข็ง (-20°C)</option>
                      <option value="dry">แห้ง</option>
                      <option value="dark">ป้องกันแสง</option>
                      <option value="inert">บรรยากาศเฉื่อย</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      กลุ่มทดสอบ
                    </label>
                    <select
                      name="test_group"
                      value={formData.test_group}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">เลือกกลุ่ม</option>
                      <option value="qc">Quality Control</option>
                      <option value="rd">Research & Development</option>
                      <option value="production">Production</option>
                      <option value="calibration">Calibration</option>
                      <option value="reference">Reference Standard</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  ข้อมูลผู้ผลิต/จำหน่าย
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="ผู้ผลิต *"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      placeholder="เช่น Sigma-Aldrich"
                      required
                      error={errors.manufacturer}
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      }
                    />
                  </div>
                  <div>
                    <Input
                      label="ผู้จำหน่าย"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      placeholder="เช่น บริษัท ABC จำกัด"
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      }
                    />
                  </div>
                  <div>
                    <Input
                      label="Lot Number *"
                      name="lot"
                      value={formData.lot}
                      onChange={handleInputChange}
                      placeholder="เช่น L2024001"
                      required
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  วันที่สำคัญ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Input
                      label="วันที่ได้รับ *"
                      name="date_received"
                      type="date"
                      value={formData.date_received}
                      onChange={handleInputChange}
                      required
                      error={errors.date_received}
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      }
                    />
                  </div>
                  <div>
                    <Input
                      label="วันหมดอายุ (Certificate)"
                      name="certificate_expiry"
                      type="date"
                      value={formData.certificate_expiry}
                      onChange={handleInputChange}
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    />
                  </div>
                  <div>
                    <Input
                      label="วันหมดอายุ (Lab Use)"
                      name="lab_expiry_date"
                      type="date"
                      value={formData.lab_expiry_date}
                      onChange={handleInputChange}
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  หมายเหตุเพิ่มเติม
                </h2>
                <textarea 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 h-24" 
                  placeholder="หมายเหตุหรือข้อมูลเพิ่มเติม..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 px-6 py-3 text-white font-medium rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังบันทึก...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      บันทึกข้อมูล
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">บันทึกสำเร็จ!</h3>
              <p className="text-gray-600 mb-4">รหัสสาร: <span className="font-mono font-bold text-orange-600">{generatedId}</span></p>
              <button 
                onClick={handleCloseSuccessModal}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6 py-2 text-white rounded-lg transition-all duration-200"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </ChemicalBackground>
  )
}
