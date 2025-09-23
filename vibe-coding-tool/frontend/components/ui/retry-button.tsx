import React, { useState } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { LoadingSpinner } from './loading-spinner'

interface RetryButtonProps {
  onRetry: () => Promise<void> | void
  retryCount?: number
  maxRetries?: number
  delay?: number
  className?: string
  disabled?: boolean
  children?: React.ReactNode
  retryButtonText?: string
  retryingText?: string
  errorText?: string
}

export function RetryButton({
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  delay = 1000,
  className = '',
  disabled = false,
  children,
  retryButtonText = 'Retry',
  retryingText = 'Retrying...',
  errorText = 'Failed to load'
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentRetryCount, setCurrentRetryCount] = useState(retryCount)

  const handleRetry = async () => {
    if (isRetrying || disabled) return

    setIsRetrying(true)
    setError(null)

    try {
      await onRetry()
      setCurrentRetryCount(0) // Reset on success
    } catch (err) {
      const retryCount = currentRetryCount + 1
      setCurrentRetryCount(retryCount)
      
      if (retryCount >= maxRetries) {
        setError(errorText)
      } else {
        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, retryCount - 1)
        setTimeout(() => {
          handleRetry()
        }, backoffDelay)
      }
    } finally {
      setIsRetrying(false)
    }
  }

  const canRetry = currentRetryCount < maxRetries && !disabled

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {isRetrying ? (
        <LoadingSpinner text={retryingText} />
      ) : error ? (
        <div className="text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600 mb-4">{error}</p>
          {canRetry && (
            <Button onClick={handleRetry} variant="outline" disabled={disabled}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryButtonText} ({currentRetryCount}/{maxRetries})
            </Button>
          )}
        </div>
      ) : children ? (
        children
      ) : (
        <Button onClick={handleRetry} disabled={disabled}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryButtonText}
        </Button>
      )}
    </div>
  )
}

interface RetryableComponentProps {
  children: (retry: () => void, isRetrying: boolean, retryCount: number) => React.ReactNode
  onRetry: () => Promise<void> | void
  retryCount?: number
  maxRetries?: number
  delay?: number
  className?: string
  disabled?: boolean
  fallback?: React.ReactNode
}

export function RetryableComponent({
  children,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  delay = 1000,
  className = '',
  disabled = false,
  fallback
}: RetryableComponentProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentRetryCount, setCurrentRetryCount] = useState(retryCount)

  const handleRetry = async () => {
    if (isRetrying || disabled) return

    setIsRetrying(true)
    setError(null)

    try {
      await onRetry()
      setCurrentRetryCount(0) // Reset on success
    } catch (err) {
      const retryCount = currentRetryCount + 1
      setCurrentRetryCount(retryCount)
      
      if (retryCount >= maxRetries) {
        setError('Failed to load after multiple attempts')
      } else {
        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, retryCount - 1)
        setTimeout(() => {
          handleRetry()
        }, backoffDelay)
      }
    } finally {
      setIsRetrying(false)
    }
  }

  const canRetry = currentRetryCount < maxRetries && !disabled

  if (error && !canRetry && fallback) {
    return <>{fallback}</>
  }

  return (
    <div className={className}>
      {children(handleRetry, isRetrying, currentRetryCount)}
    </div>
  )
}

// Hook for retry logic
export function useRetry(maxRetries = 3, delay = 1000) {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const retry = async (operation: () => Promise<void> | void) => {
    if (isRetrying) return

    setIsRetrying(true)
    setError(null)

    try {
      await operation()
      setRetryCount(0) // Reset on success
    } catch (err) {
      const newRetryCount = retryCount + 1
      setRetryCount(newRetryCount)
      
      if (newRetryCount >= maxRetries) {
        setError('Failed after multiple attempts')
      } else {
        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, newRetryCount - 1)
        setTimeout(() => {
          retry(operation)
        }, backoffDelay)
      }
    } finally {
      setIsRetrying(false)
    }
  }

  const reset = () => {
    setRetryCount(0)
    setError(null)
    setIsRetrying(false)
  }

  return {
    retry,
    reset,
    retryCount,
    isRetrying,
    error,
    canRetry: retryCount < maxRetries && !isRetrying
  }
}

// Higher-order component for retry functionality
export function withRetry<P extends object>(
  Component: React.ComponentType<P & { retry: () => void; isRetrying: boolean; retryCount: number }>,
  onRetry: () => Promise<void> | void,
  maxRetries = 3,
  delay = 1000
) {
  return function RetryWrapper(props: P) {
    const [isRetrying, setIsRetrying] = useState(false)
    const [retryCount, setRetryCount] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const handleRetry = async () => {
      if (isRetrying) return

      setIsRetrying(true)
      setError(null)

      try {
        await onRetry()
        setRetryCount(0) // Reset on success
      } catch (err) {
        const newRetryCount = retryCount + 1
        setRetryCount(newRetryCount)
        
        if (newRetryCount >= maxRetries) {
          setError('Failed after multiple attempts')
        } else {
          // Exponential backoff
          const backoffDelay = delay * Math.pow(2, newRetryCount - 1)
          setTimeout(() => {
            handleRetry()
          }, backoffDelay)
        }
      } finally {
        setIsRetrying(false)
      }
    }

    return (
      <Component
        {...props}
        retry={handleRetry}
        isRetrying={isRetrying}
        retryCount={retryCount}
      />
    )
  }
}