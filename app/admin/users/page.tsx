'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Logo } from '@/components/ui/Logo'
import ChemicalBackground from '@/components/ChemicalBackground'
import { useGoogleSheets } from '@/lib/googleSheets'
import { useAuth } from '@/hooks/useAuth'
import { notificationManager } from '@/lib/notifications'

interface User {
  email: string
  name: string
  role: string
  permissions: string
  phone: string
  created_at: string
  is_active: boolean
}

export default function UsersManagementPage() {
  const router = useRouter()
  const { getAllUsers, createUser, updateUser, deleteUser } = useGoogleSheets()
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user',
    permissions: 'read,write',
    phone: '',
    is_active: true
  })

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/dashboard')
      return
    }
    loadUsers()
  }, [isAdmin, router])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const usersData = await getAllUsers()
      setUsers(usersData)
    } catch (error) {
      notificationManager.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await createUser(formData)
      if (result.success) {
        notificationManager.success('สร้างผู้ใช้เรียบร้อย')
        setShowCreateModal(false)
        resetForm()
        loadUsers()
      } else {
        notificationManager.error(result.message || 'ไม่สามารถสร้างผู้ใช้ได้')
      }
    } catch (error) {
      notificationManager.error('เกิดข้อผิดพลาดในการสร้างผู้ใช้')
      console.error('Error creating user:', error)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      const result = await updateUser({
        ...formData,
        email: selectedUser.email
      })
      if (result.message) {
        notificationManager.success('อัปเดตผู้ใช้เรียบร้อย')
        setShowEditModal(false)
        setSelectedUser(null)
        resetForm()
        loadUsers()
      } else {
        notificationManager.error('ไม่สามารถอัปเดตผู้ใช้ได้')
      }
    } catch (error) {
      notificationManager.error('เกิดข้อผิดพลาดในการอัปเดตผู้ใช้')
      console.error('Error updating user:', error)
    }
  }

  const handleDeleteUser = async (email: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) return

    try {
      const result = await deleteUser(email)
      if (result.message) {
        notificationManager.success('ลบผู้ใช้เรียบร้อย')
        loadUsers()
      } else {
        notificationManager.error('ไม่สามารถลบผู้ใช้ได้')
      }
    } catch (error) {
      notificationManager.error('เกิดข้อผิดพลาดในการลบผู้ใช้')
      console.error('Error deleting user:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'user',
      permissions: 'read,write',
      phone: '',
      is_active: true
    })
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
      permissions: user.permissions,
      phone: user.phone || '',
      is_active: user.is_active
    })
    setShowEditModal(true)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'user': return 'bg-blue-100 text-blue-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <ChemicalBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูลผู้ใช้...</p>
          </div>
        </div>
      </ChemicalBackground>
    )
  }

  return (
    <ChemicalBackground>
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border border-white/20 mx-4 mt-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Logo size={48} />
            <div>
              <h1 className="text-xl font-bold text-gray-800">จัดการผู้ใช้</h1>
              <p className="text-sm text-gray-600">User Management System</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setShowCreateModal(true)}
              size="md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              เพิ่มผู้ใช้
            </Button>
            <Button 
              variant="secondary"
              onClick={() => router.back()}
              size="md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับ
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Users Table */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">อีเมล</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">ชื่อ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">บทบาท</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">สถานะ</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={index} className="hover:bg-blue-50/50 transition-all duration-200">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.email)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetForm()
        }}
        title="เพิ่มผู้ใช้ใหม่"
        size="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="อีเมล"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              label="ชื่อ"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="รหัสผ่าน"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">บทบาท</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">ผู้ใช้</option>
                <option value="admin">ผู้ดูแลระบบ</option>
                <option value="viewer">ผู้ดู</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สิทธิ์</label>
              <select
                value={formData.permissions}
                onChange={(e) => setFormData(prev => ({ ...prev, permissions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="read">อ่านอย่างเดียว</option>
                <option value="read,write">อ่านและเขียน</option>
                <option value="read,write,delete">อ่าน เขียน และลบ</option>
                <option value="read,write,delete,admin">สิทธิ์เต็ม</option>
              </select>
            </div>
            <Input
              label="เบอร์โทรศัพท์"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              เปิดใช้งาน
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false)
                resetForm()
              }}
            >
              ยกเลิก
            </Button>
            <Button type="submit">
              สร้างผู้ใช้
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedUser(null)
          resetForm()
        }}
        title="แก้ไขผู้ใช้"
        size="lg"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="อีเมล"
              type="email"
              value={formData.email}
              disabled
            />
            <Input
              label="ชื่อ"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="รหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">บทบาท</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">ผู้ใช้</option>
                <option value="admin">ผู้ดูแลระบบ</option>
                <option value="viewer">ผู้ดู</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สิทธิ์</label>
              <select
                value={formData.permissions}
                onChange={(e) => setFormData(prev => ({ ...prev, permissions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="read">อ่านอย่างเดียว</option>
                <option value="read,write">อ่านและเขียน</option>
                <option value="read,write,delete">อ่าน เขียน และลบ</option>
                <option value="read,write,delete,admin">สิทธิ์เต็ม</option>
              </select>
            </div>
            <Input
              label="เบอร์โทรศัพท์"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active_edit"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active_edit" className="ml-2 block text-sm text-gray-900">
              เปิดใช้งาน
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowEditModal(false)
                setSelectedUser(null)
                resetForm()
              }}
            >
              ยกเลิก
            </Button>
            <Button type="submit">
              อัปเดตผู้ใช้
            </Button>
          </div>
        </form>
      </Modal>
    </ChemicalBackground>
  )
}
