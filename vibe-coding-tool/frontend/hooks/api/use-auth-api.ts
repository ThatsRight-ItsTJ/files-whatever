import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/stores/auth-store'

// API response types
interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
    provider: 'github' | 'huggingface'
    permissions: string[]
  }
  accessToken: string
  refreshToken: string
}

interface OAuthCallbackResponse {
  user: LoginResponse['user']
  accessToken: string
  refreshToken: string
  isNewUser: boolean
}

// Mock API functions - replace with actual API calls
const authApi = {
  // Login with email/password (if implementing)
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      user: {
        id: `user-${Date.now()}`,
        email,
        name: 'John Doe',
        provider: 'github',
        permissions: ['read', 'write']
      },
      accessToken: `access-token-${Date.now()}`,
      refreshToken: `refresh-token-${Date.now()}`
    }
  },

  // GitHub OAuth
  loginWithGithub: async (code: string): Promise<OAuthCallbackResponse> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      user: {
        id: `github-user-${Date.now()}`,
        email: 'user@example.com',
        name: 'GitHub User',
        avatar: 'https://github.com/avatar.png',
        provider: 'github',
        permissions: ['read', 'write', 'admin']
      },
      accessToken: `github-access-token-${Date.now()}`,
      refreshToken: `github-refresh-token-${Date.now()}`,
      isNewUser: Math.random() > 0.5
    }
  },

  // HuggingFace OAuth
  loginWithHuggingFace: async (code: string): Promise<OAuthCallbackResponse> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      user: {
        id: `hf-user-${Date.now()}`,
        email: 'user@huggingface.co',
        name: 'HuggingFace User',
        avatar: 'https://huggingface.co/avatar.png',
        provider: 'huggingface',
        permissions: ['read', 'write']
      },
      accessToken: `hf-access-token-${Date.now()}`,
      refreshToken: `hf-refresh-token-${Date.now()}`,
      isNewUser: Math.random() > 0.5
    }
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      accessToken: `new-access-token-${Date.now()}`,
      refreshToken: `new-refresh-token-${Date.now()}`
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
  },

  // Get current user
  getCurrentUser: async (): Promise<LoginResponse['user']> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      id: 'current-user',
      email: 'user@example.com',
      name: 'Current User',
      provider: 'github',
      permissions: ['read', 'write']
    }
  },

  // Update user profile
  updateProfile: async (profile: Partial<LoginResponse['user']>): Promise<LoginResponse['user']> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: 'current-user',
      email: 'user@example.com',
      name: profile.name || 'Current User',
      provider: 'github',
      permissions: ['read', 'write'],
      ...profile
    }
  }
}

// Query hooks
export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAuthStatus = () => {
  return useQuery({
    queryKey: ['auth', 'status'],
    queryFn: async () => {
      // Check if user is authenticated by checking for stored token
      const token = localStorage.getItem('auth-token')
      return !!token
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

// Mutation hooks
export const useLogin = () => {
  const queryClient = useQueryClient()
  const { login } = useAuthStore()
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Update auth store
      login(data.user)
      
      // Store tokens
      localStorage.setItem('auth-token', data.accessToken)
      localStorage.setItem('refresh-token', data.refreshToken)
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error) => {
      console.error('Login failed:', error)
    },
  })
}

export const useLoginWithGithub = () => {
  const queryClient = useQueryClient()
  const { login } = useAuthStore()
  
  return useMutation({
    mutationFn: authApi.loginWithGithub,
    onSuccess: (data) => {
      // Update auth store
      login(data.user)
      
      // Store tokens
      localStorage.setItem('auth-token', data.accessToken)
      localStorage.setItem('refresh-token', data.refreshToken)
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error) => {
      console.error('GitHub login failed:', error)
    },
  })
}

export const useLoginWithHuggingFace = () => {
  const queryClient = useQueryClient()
  const { login } = useAuthStore()
  
  return useMutation({
    mutationFn: authApi.loginWithHuggingFace,
    onSuccess: (data) => {
      // Update auth store
      login(data.user)
      
      // Store tokens
      localStorage.setItem('auth-token', data.accessToken)
      localStorage.setItem('refresh-token', data.refreshToken)
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error) => {
      console.error('HuggingFace login failed:', error)
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear auth store
      logout()
      
      // Clear tokens
      localStorage.removeItem('auth-token')
      localStorage.removeItem('refresh-token')
      
      // Clear all queries
      queryClient.clear()
      
      // Redirect to login
      window.location.href = '/auth/login'
    },
    onError: (error) => {
      console.error('Logout failed:', error)
      // Still clear local state even if API call fails
      logout()
      localStorage.removeItem('auth-token')
      localStorage.removeItem('refresh-token')
      queryClient.clear()
      window.location.href = '/auth/login'
    },
  })
}

export const useRefreshToken = () => {
  const { updateUser } = useAuthStore()
  
  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (data) => {
      // Update stored tokens
      localStorage.setItem('auth-token', data.accessToken)
      localStorage.setItem('refresh-token', data.refreshToken)
      
      // Update user with new tokens (if needed)
      updateUser({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    },
    onError: (error) => {
      console.error('Token refresh failed:', error)
      // If refresh fails, force logout
      useLogout.mutate()
    },
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const { updateUser } = useAuthStore()
  
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      // Update auth store
      updateUser(data)
      
      // Invalidate user query
      queryClient.invalidateQueries({ queryKey: ['auth', 'currentUser'] })
    },
    onError: (error) => {
      console.error('Profile update failed:', error)
    },
  })
}

// Utility hook for automatic token refresh
export const useTokenRefresh = () => {
  const { data: user } = useCurrentUser()
  const refreshTokenMutation = useRefreshToken()
  
  // Check if token needs refresh (simplified logic)
  const shouldRefresh = () => {
    if (!user) return false
    
    const token = localStorage.getItem('auth-token')
    if (!token) return false
    
    // Check if token is expired (simplified - check age)
    const tokenAge = Date.now() - (parseInt(token.split('-')[1]) || 0)
    return tokenAge > 30 * 60 * 1000 // 30 minutes
  }
  
  // Auto-refresh token when needed
  if (shouldRefresh()) {
    refreshTokenMutation.mutate(localStorage.getItem('refresh-token') || '')
  }
  
  return refreshTokenMutation
}