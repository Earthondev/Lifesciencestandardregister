'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
// import { Modal } from '@/components/ui/Modal' // ไม่ได้ใช้
// import ChemicalBackground from '@/components/ChemicalBackground' // ไม่ได้ใช้
import { useGoogleSheets } from '@/lib/googleSheets'
import { notificationManager } from '@/lib/notifications'
import { formatDate } from '@/lib/utils'
import { StandardsRegister, StatusLog } from '@/types'

interface DetailsPageProps {
  params: {
    id: string
  }
}

// Required for static export
export async function generateStaticParams() {
  // Return empty array for now since we don't have predefined IDs
  // In a real app, you would fetch all possible IDs from your data source
  return []
}

export default function DetailsPage({ params }: DetailsPageProps) {
  const router = useRouter()
  const { getStandards, changeStatus } = useGoogleSheets()
  const [standard, setStandard] = useState<StandardsRegister | null>(null)
  const [statusLog, setStatusLog] = useState<StatusLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const standardsData = await getStandards()
      const standardData = standardsData.find(s => s.id_no === params.id)
      
      if (standardData) {
        setStandard(standardData)
        // For now, we'll create a mock status log since the API doesn't have getStatusLog
        setStatusLog([
          {
            log_id: 1,
            id_no: standardData.id_no,
            from_status: '',
            to_status: standardData.status,
            timestamp: standardData.date_received,
            by: 'System',
            note: 'ลงทะเบียนสารใหม่'
          }
        ])
      }
    } catch (error) {
      notificationManager.error('ไม่สามารถโหลดข้อมูลได้')
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async () => {
    try {
      await changeStatus({
        id_no: params.id,
        new_status: newStatus,
        note: statusNote
      })
      
      notificationManager.success('เปลี่ยนสถานะสำเร็จ')
      setShowStatusModal(false)
      setNewStatus('')
      setStatusNote('')
      loadData() // Reload data
    } catch (error) {
      notificationManager.error('ไม่สามารถเปลี่ยนสถานะได้')
      console.error('Error changing status:', error)
    }
  }

  const generateQRCode = (text: string) => {
    const encodedText = encodeURIComponent(text)
    return `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodedText}`
  }

  const generateDeepLink = (type: 'in' | 'out') => {
    const baseUrl = 'https://docs.google.com/spreadsheets/d/1KJAfxnbH8iFDopf6rN6Kt47TWZUCV_oSCxZXNu9GvGM/edit'
    const gid = '478474749'
    const range = type === 'in' ? 'A2' : 'U2' // Assuming status column is U
    return `${baseUrl}#gid=${gid}&range=${range}`
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

  if (!standard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-2">ไม่พบข้อมูล</h3>
          <p className="text-gray-600 mb-4">ไม่พบสารมาตรฐานที่ต้องการ</p>
          <Button onClick={() => router.push('/list')}>
            กลับไปรายการ
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-white to-surface">

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border border-white/20 mx-4 mt-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">รายละเอียดสาร</h1>
              <p className="text-sm text-gray-600">Substance Details & History</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/list')}
            className="text-orange-600 hover:text-orange-800 transition-colors px-4 py-2"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับ
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Substance Header */}
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{standard.name}</h2>
                  <p className="text-lg text-gray-600 font-mono">{standard.id_no}</p>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    standard.status === 'Unopened' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                      : standard.status === 'In-Use'
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                  }`}>
                    {standard.status === 'Unopened' ? 'ยังไม่เปิด' : 
                     standard.status === 'In-Use' ? 'กำลังใช้' : 'ทิ้งแล้ว'}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">อัปเดตล่าสุด: <span>{formatDate(standard.date_received)}</span></p>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                {standard.status === 'Unopened' && (
                  <button 
                    onClick={() => {
                      setNewStatus('In-Use')
                      setShowStatusModal(true)
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    เปิดใช้
                  </button>
                )}
                {standard.status !== 'Disposed' && (
                  <button 
                    onClick={() => {
                      setNewStatus('Disposed')
                      setShowStatusModal(true)
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    ทิ้ง
                  </button>
                )}
                <button 
                  onClick={() => window.print()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  พิมพ์
                </button>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                ข้อมูลรายละเอียด
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">ประเภทสาร</label>
                  <p className="text-gray-800 font-medium">{standard.material || '-'}</p>
                </div>
                <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">CAS No.</label>
                  <p className="text-gray-800 font-mono">{standard.cas || '-'}</p>
                </div>
                <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">ความเข้มข้น</label>
                  <p className="text-gray-800 font-medium">{standard.concentration} {standard.concentration_unit}</p>
                </div>
                <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">ขนาดบรรจุ</label>
                  <p className="text-gray-800 font-medium">{standard.packing_size} {standard.packing_unit}</p>
                </div>
                <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">เงื่อนไขการจัดเก็บ</label>
                  <p className="text-gray-800 font-medium">{standard.storage || '-'}</p>
                </div>
                <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">กลุ่มทดสอบ</label>
                  <p className="text-gray-800 font-medium">{standard.test_group || '-'}</p>
                </div>
                <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">ผู้ผลิต</label>
                  <p className="text-gray-800 font-medium">{standard.manufacturer}</p>
                </div>
                <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Lot Number</label>
                  <p className="text-gray-800 font-mono">{standard.lot || '-'}</p>
                </div>
                <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">วันที่รับเข้า</label>
                  <p className="text-gray-800 font-medium">{formatDate(standard.date_received)}</p>
                </div>
                <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">วันหมดอายุ (Certificate)</label>
                  <p className="text-gray-800 font-medium">{formatDate(standard.certificate_expiry || '')}</p>
                </div>
                <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">วันหมดอายุ (Lab Use)</label>
                  <p className="text-gray-800 font-medium">{formatDate(standard.lab_expiry_date || '')}</p>
                </div>
                <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">หมายเหตุ</label>
                  <p className="text-gray-800">{standard.supplier || '-'}</p>
                </div>
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ประวัติการเปลี่ยนสถานะ
              </h3>
              
              {statusLog.length > 0 ? (
                <div className="space-y-4">
                  {statusLog.map((log, index) => (
                    <div key={index} className="relative pl-8 mb-6">
                      <div className="absolute left-2 top-2 w-3 h-3 bg-orange-500 rounded-full"></div>
                      <div className="absolute left-3.5 top-5 w-0.5 h-full bg-orange-200"></div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-800">
                            {log.from_status ? `เปลี่ยนจาก ${log.from_status} เป็น ${log.to_status}` : `เริ่มต้นเป็น ${log.to_status}`}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          สถานะ: <span className={`font-medium ${
                            log.to_status === 'Unopened' ? 'text-green-600' : 
                            log.to_status === 'In-Use' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {log.to_status === 'Unopened' ? 'ยังไม่เปิด' : 
                             log.to_status === 'In-Use' ? 'กำลังใช้' : 'ทิ้งแล้ว'}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">ผู้ดำเนินการ: {log.by}</p>
                        <p className="text-xs text-gray-400 mt-1">{log.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600">ยังไม่มีประวัติการเปลี่ยนสถานะ</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - QR Codes & Actions */}
          <div className="space-y-6">
            {/* QR Codes */}
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                QR Code
              </h3>
              
              {/* IN QR Code */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  เข้าใช้งาน (IN)
                </h4>
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <img
                    src={generateQRCode(generateDeepLink('in'))}
                    alt="QR Code IN"
                    className="mx-auto mb-3 border border-gray-200 rounded-lg"
                  />
                  <div className="space-y-2">
                    <button 
                      onClick={() => window.open(generateDeepLink('in'), '_blank')}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      ดาวน์โหลด QR IN
                    </button>
                    <p className="text-xs text-gray-500">สแกนเมื่อเริ่มใช้งาน</p>
                  </div>
                </div>
              </div>
              
              {/* OUT QR Code */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  เสร็จสิ้นการใช้ (OUT)
                </h4>
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <img
                    src={generateQRCode(generateDeepLink('out'))}
                    alt="QR Code OUT"
                    className="mx-auto mb-3 border border-gray-200 rounded-lg"
                  />
                  <div className="space-y-2">
                    <button 
                      onClick={() => window.open(generateDeepLink('out'), '_blank')}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      ดาวน์โหลด QR OUT
                    </button>
                    <p className="text-xs text-gray-500">สแกนเมื่อใช้งานเสร็จ</p>
                  </div>
                </div>
              </div>
              
              {/* Deep Links */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-3">Deep Links</h4>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">IN Link:</p>
                    <p className="text-xs font-mono text-blue-600 break-all">{generateDeepLink('in')}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">OUT Link:</p>
                    <p className="text-xs font-mono text-blue-600 break-all">{generateDeepLink('out')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                สถิติการใช้งาน
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">วันที่เหลือ (Certificate)</span>
                  <span className="font-bold text-green-600">
                    {standard.certificate_expiry ? 
                      Math.ceil((new Date(standard.certificate_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} วัน
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">วันที่เหลือ (Lab Use)</span>
                  <span className="font-bold text-yellow-600">
                    {standard.lab_expiry_date ? 
                      Math.ceil((new Date(standard.lab_expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} วัน
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">จำนวนครั้งที่ใช้</span>
                  <span className="font-bold text-blue-600">{statusLog.length} ครั้ง</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ระยะเวลาเก็บ</span>
                  <span className="font-bold text-gray-600">
                    {Math.ceil((new Date().getTime() - new Date(standard.date_received).getTime()) / (1000 * 60 * 60 * 24))} วัน
                  </span>
                </div>
              </div>
            </div>

            {/* Related Substances */}
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                สารที่เกี่ยวข้อง
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Toluene</p>
                    <p className="text-xs text-gray-500">LS-TOLU-24-007</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">ยังไม่เปิด</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Xylene</p>
                    <p className="text-xs text-gray-500">LS-XYLE-24-008</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">กำลังใช้</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Change Modal */}
        {showStatusModal && (
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
                  ต้องการเปลี่ยนสถานะของ "{standard.name}" เป็น "{newStatus === 'In-Use' ? 'กำลังใช้' : newStatus === 'Disposed' ? 'ทิ้งแล้ว' : 'ยังไม่เปิด'}" หรือไม่?
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมายเหตุ
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="กรอกหมายเหตุ (ไม่บังคับ)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    onClick={handleStatusChange}
                    disabled={!newStatus}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 px-4 py-2 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    ยืนยัน
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
