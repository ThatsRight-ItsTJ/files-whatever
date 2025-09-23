'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLoginWithGithub, useLoginWithHuggingFace } from '@/hooks/api/use-auth-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Github, HuggingFace } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showEmailLogin, setShowEmailLogin] = useState(false)
  
  const router = useRouter()
  const loginWithGithub = useLoginWithGithub()
  const loginWithHuggingFace = useLoginWithHuggingFace()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      // This would be implemented with actual email/password login
      // For now, we'll just redirect to simulate successful login
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  const handleGithubLogin = () => {
    // In a real implementation, this would redirect to GitHub OAuth
    // For now, we'll simulate the login
    loginWithGithub.mutate('github-code')
  }

  const handleHuggingFaceLogin = () => {
    // In a real implementation, this would redirect to HuggingFace OAuth
    // For now, we'll simulate the login
    loginWithHuggingFace.mutate('hf-code')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Vibe Coding Tool</h1>
        <p className="mt-2 text-gray-600">Sign in to access your coding workspace</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!showEmailLogin ? (
        <div className="space-y-4">
          <Button
            onClick={handleGithubLogin}
            disabled={loginWithGithub.isPending}
            className="w-full"
            variant="outline"
          >
            {loginWithGithub.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            Continue with GitHub
          </Button>

          <Button
            onClick={handleHuggingFaceLogin}
            disabled={loginWithHuggingFace.isPending}
            className="w-full"
            variant="outline"
          >
            {loginWithHuggingFace.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <HuggingFace className="mr-2 h-4 w-4" />
            )}
            Continue with HuggingFace
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            onClick={() => setShowEmailLogin(true)}
            variant="outline"
            className="w-full"
          >
            Sign in with email
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sign in with email</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button
                onClick={() => setShowEmailLogin(false)}
                variant="link"
                className="text-sm"
              >
                Back to other sign-in options
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-sm text-gray-600">
        <p>
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}