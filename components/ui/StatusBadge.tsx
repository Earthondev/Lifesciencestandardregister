import React from 'react'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'Unopened' | 'In-Use' | 'Disposed'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium'
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  const variants = {
    'Unopened': 'bg-blue-100 text-blue-800',
    'In-Use': 'bg-yellow-100 text-yellow-800',
    'Disposed': 'bg-red-100 text-red-800'
  }
  
  const icons = {
    'Unopened': '📦',
    'In-Use': '🧪',
    'Disposed': '🗑️'
  }
  
  const labels = {
    'Unopened': 'ยังไม่ได้เปิดใช้',
    'In-Use': 'กำลังใช้งาน',
    'Disposed': 'ทำลายทิ้งแล้ว'
  }
  
  return (
    <span className={cn(baseClasses, sizes[size], variants[status])}>
      {showIcon && (
        <span className="mr-1">{icons[status]}</span>
      )}
      {labels[status]}
    </span>
  )
}
