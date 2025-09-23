'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Pause,
  ArrowRight,
  User,
  Calendar,
  Code
} from 'lucide-react'

export interface TimelineItem {
  id: string
  title: string
  description?: string
  timestamp: Date
  status: 'completed' | 'failed' | 'running' | 'pending' | 'cancelled'
  type?: 'task' | 'project' | 'agent' | 'system'
  user?: string
  metadata?: Record<string, any>
}

export interface TimelineProps {
  items: TimelineItem[]
  className?: string
  onItemClick?: (item: TimelineItem) => void
  maxItems?: number
  showUser?: boolean
  showTime?: boolean
}

export function Timeline({ 
  items, 
  className, 
  onItemClick,
  maxItems = 50,
  showUser = true,
  showTime = true
}: TimelineProps) {
  const displayItems = items.slice(0, maxItems)
  
  const getStatusIcon = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'cancelled':
        return <Pause className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type?: TimelineItem['type']) => {
    switch (type) {
      case 'task':
        return <Code className="h-3 w-3" />
      case 'project':
        return <Calendar className="h-3 w-3" />
      case 'agent':
        return <User className="h-3 w-3" />
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ago`
    } else if (hours > 0) {
      return `${hours}h ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return 'Just now'
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {displayItems.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            'flex items-start space-x-4 p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer',
            onItemClick && 'hover:border-primary'
          )}
          onClick={() => onItemClick?.(item)}
        >
          {/* Timeline Line */}
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              getStatusColor(item.status)
            )}>
              {getStatusIcon(item.status)}
            </div>
            {index < displayItems.length - 1 && (
              <div className="w-0.5 h-16 bg-border mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium truncate">{item.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                </div>
                
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  {showTime && (
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(item.timestamp)}</span>
                    </span>
                  )}
                  
                  {showUser && item.user && (
                    <span className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{item.user}</span>
                    </span>
                  )}
                </div>

                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(item.metadata).slice(0, 3).map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                      >
                        {getTypeIcon(item.type)}
                        <span className="ml-1">{key}: {String(value)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </div>
        </div>
      ))}

      {items.length > maxItems && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Showing {maxItems} of {items.length} items
          </p>
        </div>
      )}
    </div>
  )
}

export default Timeline