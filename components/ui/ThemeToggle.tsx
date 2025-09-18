import React, { useState } from 'react'
import { useTheme, Theme } from '@/lib/theme'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
  variant?: 'button' | 'dropdown' | 'compact'
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  showLabel = true,
  variant = 'button'
}) => {
  const { theme, setTheme, themeConfig } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes: { key: Theme; name: string; icon: React.ReactNode }[] = [
    {
      key: 'light',
      name: 'ธีมสว่าง',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      key: 'dark',
      name: 'ธีมมืด',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    },
    {
      key: 'orange',
      name: 'ธีมส้ม',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      key: 'blue',
      name: 'ธีมน้ำเงิน',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      key: 'green',
      name: 'ธีมเขียว',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ]

  const currentTheme = themes.find(t => t.key === theme)

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className={cn(
          'p-2 rounded-lg transition-all duration-200 hover:scale-105',
          'bg-white/10 backdrop-blur-sm border border-white/20',
          'hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500',
          className
        )}
        title={`เปลี่ยนธีม (ปัจจุบัน: ${currentTheme?.name})`}
      >
        {currentTheme?.icon}
      </button>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200',
            'bg-white/10 backdrop-blur-sm border border-white/20',
            'hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500',
            className
          )}
        >
          {currentTheme?.icon}
          {showLabel && (
            <span className="text-sm font-medium">{currentTheme?.name}</span>
          )}
          <svg 
            className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg z-20 overflow-hidden">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.key}
                  onClick={() => {
                    setTheme(themeOption.key)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200',
                    'hover:bg-orange-50 focus:outline-none focus:bg-orange-50',
                    theme === themeOption.key && 'bg-orange-100 text-orange-700'
                  )}
                >
                  <div className={cn(
                    'p-1 rounded',
                    theme === themeOption.key ? 'text-orange-600' : 'text-gray-600'
                  )}>
                    {themeOption.icon}
                  </div>
                  <span className="text-sm font-medium">{themeOption.name}</span>
                  {theme === themeOption.key && (
                    <svg className="w-4 h-4 ml-auto text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  // Default button variant
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
          'bg-white/10 backdrop-blur-sm border border-white/20',
          'hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500',
          className
        )}
      >
        {currentTheme?.icon}
        {showLabel && (
          <span className="text-sm font-medium">{currentTheme?.name}</span>
        )}
        <svg 
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Theme Selection Panel */}
          <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg z-20 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">เลือกธีม</h3>
            <div className="grid grid-cols-1 gap-2">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.key}
                  onClick={() => {
                    setTheme(themeOption.key)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200',
                    'hover:bg-orange-50 focus:outline-none focus:bg-orange-50',
                    theme === themeOption.key && 'bg-orange-100 text-orange-700'
                  )}
                >
                  <div className={cn(
                    'p-1 rounded',
                    theme === themeOption.key ? 'text-orange-600' : 'text-gray-600'
                  )}>
                    {themeOption.icon}
                  </div>
                  <span className="text-sm font-medium">{themeOption.name}</span>
                  {theme === themeOption.key && (
                    <svg className="w-4 h-4 ml-auto text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
