'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Folder, 
  Code, 
  Brain, 
  Network, 
  Settings, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search
} from 'lucide-react'

export interface SidebarProps {
  children?: React.ReactNode
  open?: boolean
  onToggle?: (open: boolean) => void
}

export function Sidebar({ children, open = true, onToggle }: SidebarProps) {
  const [internalOpen, setInternalOpen] = useState(open)

  const handleToggle = (newOpen: boolean) => {
    setInternalOpen(newOpen)
    onToggle?.(newOpen)
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/' },
    { id: 'projects', label: 'Projects', icon: Folder, href: '/projects' },
    { id: 'editor', label: 'Code Editor', icon: Code, href: '/editor' },
    { id: 'agents', label: 'AI Agents', icon: Brain, href: '/agents' },
    { id: 'knowledge', label: 'Knowledge Graph', icon: Network, href: '/knowledge-graph' },
  ]

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
    { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
    { id: 'logout', label: 'Logout', icon: LogOut, href: '/auth/logout' },
  ]

  return (
    <div className={cn(
      'fixed inset-y-0 left-0 z-50 flex flex-col bg-background border-r transition-all duration-300 ease-in-out',
      internalOpen ? 'w-64' : 'w-16'
    )}>
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-4 border-b">
        {internalOpen && (
          <h2 className="text-lg font-semibold">Vibe Coding Tool</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleToggle(!internalOpen)}
          className="ml-auto"
        >
          {internalOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Bar (only when expanded) */}
      {internalOpen && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-4">
          {/* Main Menu Items */}
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                internalOpen ? "px-3" : "px-2"
              )}
              asChild
            >
              <a href={item.href}>
                <item.icon className={cn(
                  "h-4 w-4",
                  internalOpen ? "mr-3" : "mx-auto"
                )} />
                {internalOpen && <span>{item.label}</span>}
              </a>
            </Button>
          ))}

          {/* Create New Button */}
          {internalOpen && (
            <Button
              variant="default"
              className="w-full justify-start mt-4"
              asChild
            >
              <a href="/projects/new">
                <Plus className="h-4 w-4 mr-3" />
                Create New Project
              </a>
            </Button>
          )}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t p-4">
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                internalOpen ? "px-3" : "px-2"
              )}
              asChild
            >
              <a href={item.href}>
                <item.icon className={cn(
                  "h-4 w-4",
                  internalOpen ? "mr-3" : "mx-auto"
                )} />
                {internalOpen && <span>{item.label}</span>}
              </a>
            </Button>
          ))}
        </div>

        {/* Status Indicator */}
        {internalOpen && (
          <div className="mt-4 p-3 rounded-lg bg-muted">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Connected</span>
              </div>
              <Badge variant="secondary">v1.0.0</Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar