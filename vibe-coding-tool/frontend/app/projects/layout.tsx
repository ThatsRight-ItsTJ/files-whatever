import { ReactNode } from 'react'
import { QueryProvider } from '@/lib/query-client'
import { AuthProvider } from '@/components/auth/auth-provider'

interface ProjectsLayoutProps {
  children: ReactNode
}

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </AuthProvider>
    </QueryProvider>
  )
}