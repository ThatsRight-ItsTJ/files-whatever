import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext'

// Mock the auth context
vi.mock('@/lib/auth/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => {
    return <div>{children}</div>
  },
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

describe('Authentication Flow', () => {
  it('renders login button when user is not authenticated', () => {
    const TestComponent = () => {
      const { user, login } = useAuth()
      
      return (
        <div>
          {user ? <span>Welcome, {user.name}</span> : <button onClick={login}>Login</button>}
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('calls login function when login button is clicked', async () => {
    const { useAuth } = await import('@/lib/auth/AuthContext')
    const mockLogin = vi.fn()
    
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
      logout: vi.fn(),
    })

    const TestComponent = () => {
      const { login } = useAuth()
      
      return (
        <div>
          <button onClick={login}>Login</button>
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    fireEvent.click(screen.getByText('Login'))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1)
    })
  })

  it('shows loading state during authentication', () => {
    const { useAuth } = require('@/lib/auth/AuthContext')
    const mockLogin = vi.fn()
    
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      login: mockLogin,
      logout: vi.fn(),
    })

    const TestComponent = () => {
      const { loading } = useAuth()
      
      return (
        <div>
          {loading ? <span>Loading...</span> : <button onClick={mockLogin}>Login</button>}
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})