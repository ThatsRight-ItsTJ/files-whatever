import { ReactNode } from 'react'
import { QueryProvider } from '@/lib/query-client'
import { AuthProvider } from '@/components/auth/auth-provider'

interface EditorLayoutProps {
  children: ReactNode
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900">
          {children}
        </div>
      </AuthProvider>
    </QueryProvider>
  )
}