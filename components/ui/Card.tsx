import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'glass' | 'stat'
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  variant = 'default'
}) => {
  const baseClasses = 'rounded-xl shadow-lg'
  
  const variants = {
    default: 'bg-white border border-gray-200',
    glass: 'bg-white/95 backdrop-blur-sm border border-white/20',
    stat: 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'
  }
  
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  return (
    <div className={cn(baseClasses, variants[variant], paddings[padding], className)}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
)

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => (
  <h3 className={cn('text-xl font-bold text-gray-800', className)}>
    {children}
  </h3>
)

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={cn('text-gray-600', className)}>
    {children}
  </div>
)
