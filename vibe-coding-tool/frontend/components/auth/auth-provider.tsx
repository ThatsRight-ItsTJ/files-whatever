'use client'

import { ReactNode, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useAuthStatus, useTokenRefresh } from '@/hooks/api/use-auth-api'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, user } = useAuthStore()
  const { data: isAuthInitialized } = useAuthStatus()
  const tokenRefresh = useTokenRefresh()

  // Auto-refresh token when needed
  useEffect(() => {
    if (isAuthenticated && user) {
      // Set up token refresh interval
      const interval = setInterval(() => {
        tokenRefresh.mutate()
      }, 5 * 60 * 1000) // Refresh every 5 minutes

      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user, tokenRefresh])

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthInitialized === false) {
      // User is not authenticated, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
  }, [isAuthInitialized])

  // Show loading state while auth is being initialized
  if (isAuthInitialized === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}