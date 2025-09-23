import React, { useState } from 'react'
import { X, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { useBreakpoint, useDevice } from '@/lib/utils/responsive'

interface ResponsiveSidebarProps {
  children: React.ReactNode
  title?: string
  className?: string
  mobileBreakpoint?: 'sm' | 'md' | 'lg'
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ResponsiveSidebar({
  children,
  title = 'Navigation',
  className = '',
  mobileBreakpoint = 'md',
  defaultOpen = true,
  open,
  onOpenChange,
}: ResponsiveSidebarProps) {
  const { currentBreakpoint } = useBreakpoint()
  const { isMobile } = useDevice()
  
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  
  const isOpen = open !== undefined ? open : internalOpen
  const isMobileView = isMobile && currentBreakpoint === mobileBreakpoint
  
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  const toggleSidebar = () => {
    handleOpenChange(!isOpen)
  }

  const closeSidebar = () => {
    handleOpenChange(false)
  }

  // Overlay for mobile
  if (isMobileView && isOpen) {
    return (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:w-64 md:z-auto
        `}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{title}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
                className="md:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </div>
        </div>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div className={`
      hidden md:flex md:flex-col ${className}
      ${isOpen ? 'w-64' : 'w-16'}
      transition-all duration-300 ease-in-out
    `}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {isOpen && (
            <h2 className="text-lg font-semibold">{title}</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {children}
        </div>
      </div>
    </div>
  )
}

interface ResponsiveSidebarTriggerProps {
  onClick?: () => void
  className?: string
}

export function ResponsiveSidebarTrigger({
  onClick,
  className = '',
}: ResponsiveSidebarTriggerProps) {
  const { isMobile } = useDevice()
  
  if (!isMobile) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`
        fixed top-4 left-4 z-50 md:hidden
        ${className}
      `}
    >
      <Menu className="w-4 h-4" />
    </Button>
  )
}

interface ResponsiveSidebarContentProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveSidebarContent({
  children,
  className = '',
}: ResponsiveSidebarContentProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  )
}

interface ResponsiveSidebarItemProps {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  className?: string
}

export function ResponsiveSidebarItem({
  children,
  onClick,
  active = false,
  disabled = false,
  className = '',
}: ResponsiveSidebarItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left
        transition-colors duration-200
        ${active 
          ? 'bg-blue-100 text-blue-700 border-blue-200' 
          : 'text-gray-700 hover:bg-gray-100'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

// Hook for sidebar management
export function useResponsiveSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(!isOpen)
  
  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  }
}

// Higher-order component for responsive sidebar
export function withResponsiveSidebar<P extends object>(
  Component: React.ComponentType<P>,
  sidebarProps: Omit<ResponsiveSidebarProps, 'children' | 'open' | 'onOpenChange'>
) {
  return function ResponsiveSidebarWrapper(props: P) {
    const { isOpen, setIsOpen } = useResponsiveSidebar()
    
    return (
      <ResponsiveSidebar {...sidebarProps} open={isOpen} onOpenChange={setIsOpen}>
        <Component {...props} />
      </ResponsiveSidebar>
    )
  }
}