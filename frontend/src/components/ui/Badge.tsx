import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'gray'
}

const variants = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-700',
}

export default function Badge({ children, className = '', variant = 'gray' }: BadgeProps) {
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
