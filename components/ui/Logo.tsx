import React from 'react'
import Image from 'next/image'

interface LogoProps {
  width?: number
  height?: number
  className?: string
  showText?: boolean
}

export const Logo: React.FC<LogoProps> = ({ 
  width = 160, 
  height = 40, 
  className = '',
  showText = false 
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image
        src="/life-science-logo.svg"
        alt="Life Science Standards Logo"
        width={width}
        height={height}
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
