'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useTokenRefresh } from '@/hooks/api/use-auth-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function CallbackPage() {
  const router = useRouter()
  const { setUser, setIsAuthenticated } = useAuthStore()
  const tokenRefresh = useTokenRefresh()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')
        const provider = urlParams.get('provider') || 'github'

        if (error) {
          throw new Error(`Authentication failed: ${error}`)
        }

        if (!code) {
          throw new Error('No authentication code provided')
        }

        // Exchange code for tokens (this would be done via API call)
        // For now, we'll simulate successful authentication
        const mockUser = {
          id: `user-${Date.now()}`,
          name: 'John Doe',
          email: 'john@example.com',
          avatar: `https://api.github.com/users/${provider === 'github' ? 'octocat' : 'user'}/avatar`,
          provider,
          providerAccountId: provider === 'github' ? 'octocat' : 'user123',
          accessToken: `mock-access-token-${Date.now()}`,
          refreshToken: `mock-refresh-token-${Date.now()}`,
          expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
          permissions: ['read', 'write'],
          scopes: ['repo', 'user'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // Store user data
        setUser(mockUser)
        setIsAuthenticated(true)

        // Refresh token to get fresh tokens
        await tokenRefresh.mutateAsync()

        // Redirect to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Authentication callback error:', error)
        // Redirect to login with error
        router.push('/auth/login?error=authentication_failed')
      }
    }

    handleCallback()
  }, [router, setUser, setIsAuthenticated, tokenRefresh])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Authenticating...
          </CardTitle>
          <CardDescription>
            Please wait while we complete your authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">
              This may take a few moments
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Error page for failed authentication
export function ErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Authentication Failed
          </CardTitle>
          <CardDescription>
            We couldn't authenticate your account. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-sm text-gray-600">
              There was an error during the authentication process.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}