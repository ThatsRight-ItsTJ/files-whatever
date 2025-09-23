import React, { useEffect, useState } from 'react'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
}

const iconColors = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600'
}

export function ToastComponent({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  const Icon = icons[toast.type]
  const colorClasses = colors[toast.type]
  const iconColorClasses = iconColors[toast.type]

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        max-w-sm w-full shadow-lg rounded-lg border p-4 mb-2
        ${colorClasses}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${iconColorClasses}`} />
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium">{toast.title}</h4>
          {toast.description && (
            <p className="mt-1 text-sm opacity-90">{toast.description}</p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-sm font-medium hover:underline"
            >
              {toast.action.label}
            </button>
          )}
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onDismiss(toast.id), 300)
            }}
            className="ml-4 flex-shrink-0"
          >
            <X className="w-4 h-4 opacity-60 hover:opacity-100" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

// Hook for using toast notifications
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])
    return id
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const success = (title: string, description?: string, action?: Toast['action']) =>
    addToast({ type: 'success', title, description, action })

  const error = (title: string, description?: string, action?: Toast['action']) =>
    addToast({ type: 'error', title, description, action })

  const warning = (title: string, description?: string, action?: Toast['action']) =>
    addToast({ type: 'warning', title, description, action })

  const info = (title: string, description?: string, action?: Toast['action']) =>
    addToast({ type: 'info', title, description, action })

  return {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => (
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    )
  }
}

// Higher-order component for toast notifications
export function withToast<P extends object>(
  Component: React.ComponentType<P>,
  toastHook: () => ReturnType<typeof useToast>
) {
  return function ToastWrapper(props: P) {
    const toast = toastHook()
    return (
      <>
        <Component {...props} />
        <toast.ToastContainer />
      </>
    )
  }
}