import React from 'react'
import Image from 'next/image'
import { useTheme } from '@/lib/theme'

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 32, 
  className = '',
  showText = false 
}) => {
  const { theme } = useTheme()
  
  // เลือกโลโก้ตามธีม
  const getLogoSrc = () => {
    switch (theme) {
      case 'dark':
        return '/pill-dark.svg'
      case 'green':
        return '/pill-white-green-circle.svg'
      case 'orange':
        return '/pill-white-orange-circle.svg'
      case 'blue':
        return '/pill-white-green-circle.svg' // ใช้เขียวเป็น default สำหรับ blue
      case 'light':
        return '/pill-white-green-circle.svg' // ใช้เขียวเป็น default สำหรับ light
      default:
        return '/pill-white-green-circle.svg'
    }
  }
  
  const logoSrc = getLogoSrc()
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image
        src={logoSrc}
        alt="Life Science Standards Logo"
        width={size}
        height={size}
        className="flex-shrink-0"
        priority
      />
      {showText && (
        <span className="font-bold text-gray-800 text-lg">
          Life Science Standards
        </span>
      )}
    </div>
  )
}

export default Logo
