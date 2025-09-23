import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from './button'
import { useDevice } from '@/lib/utils/responsive'

interface TouchButtonProps {
  children: React.ReactNode
  onClick?: () => void
  onTouchStart?: () => void
  onTouchEnd?: () => void
  className?: string
  disabled?: boolean
  loading?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  ripple?: boolean
}

export function TouchButton({
  children,
  onClick,
  onTouchStart,
  onTouchEnd,
  className = '',
  disabled = false,
  loading = false,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  ripple = true,
}: TouchButtonProps) {
  const { isTouchDevice } = useDevice()
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const rippleId = React.useRef(0)

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) return
    
    if (ripple && isTouchDevice) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const newRipple = { x, y, id: rippleId.current++ }
      setRipples(prev => [...prev, newRipple])
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }
    
    onClick?.()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || loading) return
    
    setIsPressed(true)
    onTouchStart?.()
    
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      
      const newRipple = { x, y, id: rippleId.current++ }
      setRipples(prev => [...prev, newRipple])
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    onTouchEnd?.()
  }

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-11 px-6 text-lg'
  }

  const baseClasses = `
    relative overflow-hidden
    transition-all duration-200 ease-in-out
    ${isPressed ? 'scale-95' : 'scale-100'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
  `

  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
    ghost: 'hover:bg-gray-100 active:bg-gray-200',
    link: 'text-blue-600 hover:text-blue-700 hover:underline active:text-blue-800'
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled || loading}
    >
      {/* Loading state */}
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      )}
      
      {/* Ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white bg-opacity-30 animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      
      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </Button>
  )
}

interface TouchIconButtonProps {
  icon: React.ReactNode
  onClick?: () => void
  onTouchStart?: () => void
  onTouchEnd?: () => void
  className?: string
  disabled?: boolean
  loading?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  ripple?: boolean
}

export function TouchIconButton({
  icon,
  onClick,
  onTouchStart,
  onTouchEnd,
  className = '',
  disabled = false,
  loading = false,
  variant = 'default',
  size = 'md',
  ripple = true,
}: TouchIconButtonProps) {
  const { isTouchDevice } = useDevice()
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const rippleId = React.useRef(0)

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) return
    
    if (ripple && isTouchDevice) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const newRipple = { x, y, id: rippleId.current++ }
      setRipples(prev => [...prev, newRipple])
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }
    
    onClick?.()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || loading) return
    
    setIsPressed(true)
    onTouchStart?.()
    
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      
      const newRipple = { x, y, id: rippleId.current++ }
      setRipples(prev => [...prev, newRipple])
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    onTouchEnd?.()
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const baseClasses = `
    relative overflow-hidden rounded-full
    transition-all duration-200 ease-in-out
    ${isPressed ? 'scale-95' : 'scale-100'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${sizeClasses[size]}
  `

  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
    ghost: 'hover:bg-gray-100 active:bg-gray-200',
    link: 'text-blue-600 hover:text-blue-700 hover:underline active:text-blue-800'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled || loading}
    >
      {/* Loading state */}
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        /* Ripples */
        <>
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-white bg-opacity-30 animate-ping"
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
              }}
            />
          ))}
          
          {/* Icon */}
          <span className="relative z-10">{icon}</span>
        </>
      )}
    </button>
  )
}

interface TouchCardProps {
  children: React.ReactNode
  onClick?: () => void
  onTouchStart?: () => void
  onTouchEnd?: () => void
  className?: string
  disabled?: boolean
  ripple?: boolean
  hover?: boolean
}

export function TouchCard({
  children,
  onClick,
  onTouchStart,
  onTouchEnd,
  className = '',
  disabled = false,
  ripple = true,
  hover = true,
}: TouchCardProps) {
  const { isTouchDevice } = useDevice()
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const rippleId = React.useRef(0)

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return
    
    if (ripple && isTouchDevice) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const newRipple = { x, y, id: rippleId.current++ }
      setRipples(prev => [...prev, newRipple])
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }
    
    onClick?.()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    
    setIsPressed(true)
    onTouchStart?.()
    
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      
      const newRipple = { x, y, id: rippleId.current++ }
      setRipples(prev => [...prev, newRipple])
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    onTouchEnd?.()
  }

  const baseClasses = `
    relative overflow-hidden
    transition-all duration-200 ease-in-out
    ${isPressed ? 'scale-95' : 'scale-100'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${hover ? 'hover:shadow-lg hover:-translate-y-1' : ''}
    ${className}
  `

  return (
    <div
      className={baseClasses}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white bg-opacity-30 animate-ping"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
          }}
        />
      ))}
      
      {/* Card content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Hook for touch interactions
export function useTouchInteraction() {
  const { isTouchDevice } = useDevice()
  
  const preventDefault = (e: Event) => {
    if (isTouchDevice) {
      e.preventDefault()
    }
  }

  const addTouchListeners = (element: HTMLElement) => {
    if (isTouchDevice) {
      element.addEventListener('touchmove', preventDefault, { passive: false })
    }
  }

  const removeTouchListeners = (element: HTMLElement) => {
    if (isTouchDevice) {
      element.removeEventListener('touchmove', preventDefault)
    }
  }

  return {
    isTouchDevice,
    preventDefault,
    addTouchListeners,
    removeTouchListeners,
  }
}