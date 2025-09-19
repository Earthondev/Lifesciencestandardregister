'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'orange' | 'blue' | 'green'

export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    accent: string
    success: string
    warning: string
    error: string
  }
  gradients: {
    primary: string
    background: string
    surface: string
  }
}

export const themeConfigs: Record<Theme, ThemeConfig> = {
  light: {
    name: 'ธีมสว่าง',
    colors: {
      primary: 'orange-500',
      secondary: 'orange-600',
      background: 'orange-50',
      surface: 'white',
      text: 'gray-800',
      textSecondary: 'gray-600',
      border: 'gray-200',
      accent: 'orange-400',
      success: 'green-500',
      warning: 'yellow-500',
      error: 'red-500'
    },
    gradients: {
      primary: 'from-orange-500 to-red-500',
      background: 'from-orange-50 via-white to-orange-50',
      surface: 'from-white/95 to-white/90'
    }
  },
  dark: {
    name: 'ธีมมืด',
    colors: {
      primary: 'orange-400',
      secondary: 'orange-500',
      background: 'gray-900',
      surface: 'gray-800',
      text: 'gray-100',
      textSecondary: 'gray-300',
      border: 'gray-700',
      accent: 'orange-300',
      success: 'green-400',
      warning: 'yellow-400',
      error: 'red-400'
    },
    gradients: {
      primary: 'from-orange-400 to-red-400',
      background: 'from-gray-900 via-gray-800 to-gray-900',
      surface: 'from-gray-800/95 to-gray-800/90'
    }
  },
  orange: {
    name: 'ธีมส้ม',
    colors: {
      primary: 'orange-600',
      secondary: 'orange-700',
      background: 'orange-100',
      surface: 'white',
      text: 'gray-800',
      textSecondary: 'gray-600',
      border: 'orange-200',
      accent: 'orange-500',
      success: 'green-500',
      warning: 'yellow-500',
      error: 'red-500'
    },
    gradients: {
      primary: 'from-orange-600 to-red-600',
      background: 'from-orange-100 via-white to-orange-100',
      surface: 'from-white/95 to-white/90'
    }
  },
  blue: {
    name: 'ธีมน้ำเงิน',
    colors: {
      primary: 'blue-500',
      secondary: 'blue-600',
      background: 'blue-50',
      surface: 'white',
      text: 'gray-800',
      textSecondary: 'gray-600',
      border: 'blue-200',
      accent: 'blue-400',
      success: 'green-500',
      warning: 'yellow-500',
      error: 'red-500'
    },
    gradients: {
      primary: 'from-blue-500 to-indigo-500',
      background: 'from-blue-50 via-white to-blue-50',
      surface: 'from-white/95 to-white/90'
    }
  },
  green: {
    name: 'ธีมเขียว',
    colors: {
      primary: 'green-500',
      secondary: 'green-600',
      background: 'green-50',
      surface: 'white',
      text: 'gray-800',
      textSecondary: 'gray-600',
      border: 'green-200',
      accent: 'green-400',
      success: 'green-600',
      warning: 'yellow-500',
      error: 'red-500'
    },
    gradients: {
      primary: 'from-green-500 to-emerald-500',
      background: 'from-green-50 via-white to-green-50',
      surface: 'from-white/95 to-white/90'
    }
  }
}

interface ThemeContextType {
  theme: Theme
  themeConfig: ThemeConfig
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'green'
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && themeConfigs[savedTheme]) {
      setThemeState(savedTheme)
    }
  }, [])

  // Save theme to localStorage and apply to document
  useEffect(() => {
    localStorage.setItem('theme', theme)
    applyThemeToDocument(theme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    const themes: Theme[] = ['green', 'light', 'dark', 'orange', 'blue']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setThemeState(themes[nextIndex])
  }

  const themeConfig = themeConfigs[theme]

  const contextValue: ThemeContextType = {
    theme,
    themeConfig,
    setTheme,
    toggleTheme
  }

  return React.createElement(
    ThemeContext.Provider,
    { value: contextValue },
    children
  )
}

// Apply theme classes to document
const applyThemeToDocument = (theme: Theme) => {
  const config = themeConfigs[theme]
  const root = document.documentElement

  // Remove existing theme classes
  root.classList.remove('theme-light', 'theme-dark', 'theme-orange', 'theme-blue', 'theme-green')
  
  // Add new theme class
  root.classList.add(`theme-${theme}`)

  // Set CSS custom properties
  root.style.setProperty('--color-primary', `var(--${config.colors.primary})`)
  root.style.setProperty('--color-secondary', `var(--${config.colors.secondary})`)
  root.style.setProperty('--color-background', `var(--${config.colors.background})`)
  root.style.setProperty('--color-surface', `var(--${config.colors.surface})`)
  root.style.setProperty('--color-text', `var(--${config.colors.text})`)
  root.style.setProperty('--color-text-secondary', `var(--${config.colors.textSecondary})`)
  root.style.setProperty('--color-border', `var(--${config.colors.border})`)
  root.style.setProperty('--color-accent', `var(--${config.colors.accent})`)
  root.style.setProperty('--color-success', `var(--${config.colors.success})`)
  root.style.setProperty('--color-warning', `var(--${config.colors.warning})`)
  root.style.setProperty('--color-error', `var(--${config.colors.error})`)
}

// Theme utility functions
export const getThemeClasses = (theme: Theme, element: 'background' | 'surface' | 'text' | 'border' | 'primary') => {
  const config = themeConfigs[theme]
  
  switch (element) {
    case 'background':
      return `bg-gradient-to-br ${config.gradients.background}`
    case 'surface':
      return `bg-gradient-to-br ${config.gradients.surface}`
    case 'text':
      return `text-${config.colors.text}`
    case 'border':
      return `border-${config.colors.border}`
    case 'primary':
      return `bg-gradient-to-r ${config.gradients.primary}`
    default:
      return ''
  }
}

export const getThemeColor = (theme: Theme, color: keyof ThemeConfig['colors']) => {
  return themeConfigs[theme].colors[color]
}