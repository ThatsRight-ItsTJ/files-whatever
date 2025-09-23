import React from 'react'

interface SkeletonProps {
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function Skeleton({ className = '', as: Component = 'div' }: SkeletonProps) {
  return (
    <Component 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
    />
  )
}

interface SkeletonTextProps {
  lines?: number
  className?: string
  width?: string | number
}

export function SkeletonText({ 
  lines = 1, 
  className = '', 
  width = '100%' 
}: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton 
            className={`h-4 rounded ${typeof width === 'string' ? width : `w-[${width}px]`}`}
          />
        </div>
      ))}
    </div>
  )
}

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}

interface SkeletonTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}: SkeletonTableProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className={`h-8 ${colIndex === 0 ? 'w-8' : ''}`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface SkeletonListProps {
  items?: number
  className?: string
}

export function SkeletonList({ items = 3, className = '' }: SkeletonListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
          <Skeleton className="w-10 h-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      ))}
    </div>
  )
}

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SkeletonAvatar({ 
  size = 'md', 
  className = '' 
}: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }

  return (
    <Skeleton 
      className={`rounded-full ${sizeClasses[size]} ${className}`} 
    />
  )
}

interface SkeletonButtonProps {
  className?: string
}

export function SkeletonButton({ className = '' }: SkeletonButtonProps) {
  return (
    <Skeleton 
      className={`h-10 rounded-md ${className}`} 
    />
  )
}

interface SkeletonFormProps {
  className?: string
}

export function SkeletonForm({ className = '' }: SkeletonFormProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}