import { ReactNode } from 'react'
import { QueryProvider } from '@/lib/query-client'
import { AuthProvider } from '@/components/auth/auth-provider'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </AuthProvider>
    </QueryProvider>
  )
}