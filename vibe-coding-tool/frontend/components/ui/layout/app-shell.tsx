'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { Footer } from './footer'

export interface AppShellProps {
  children: React.ReactNode
  className?: string
  sidebarOpen?: boolean
  onSidebarToggle?: (open: boolean) => void
  header?: React.ReactNode
  footer?: React.ReactNode
  sidebar?: React.ReactNode
}

export function AppShell({
  children,
  className,
  sidebarOpen = false,
  onSidebarToggle,
  header,
  footer,
  sidebar
}: AppShellProps) {
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(sidebarOpen)

  const handleSidebarToggle = (open: boolean) => {
    setInternalSidebarOpen(open)
    onSidebarToggle?.(open)
  }

  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* Header */}
      <Header onMenuToggle={() => handleSidebarToggle(!internalSidebarOpen)}>
        {header}
      </Header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          open={internalSidebarOpen}
          onToggle={handleSidebarToggle}
        >
          {sidebar}
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <Footer>
          {footer}
        </Footer>
      )}
    </div>
  )
}

export default AppShell