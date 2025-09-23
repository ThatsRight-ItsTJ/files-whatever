'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useUpdateProfile } from '@/hooks/api/use-auth-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Trash2, Link } from 'lucide-react'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const updateProfile = useUpdateProfile()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    bio: '',
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC'
    }
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePreferenceChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')

    try {
      // Update profile via API
      const updatedUser = await updateProfile.mutateAsync(formData)
      
      // Update local state
      setUser(updatedUser)
      setSuccess('Profile updated successfully')
      setIsEditing(false)
    } catch (err) {
      setError('Failed to update profile')
    }
  }

  const handleDisconnectProvider = async (provider: string) => {
    if (!confirm(`Are you sure you want to disconnect your ${provider} account?`)) {
      return
    }

    try {
      // Disconnect provider via API
      // For now, just update local state
      setUser(prev => prev ? { ...prev, provider: null } : null)
      setSuccess(`${provider} account disconnected`)
    } catch (err) {
      setError(`Failed to disconnect ${provider} account`)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-center">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatar} alt={formData.name} />
                <AvatarFallback className="text-2xl">
                  {formData.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {isEditing && (
                <div className="w-full space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={formData.avatar}
                    onChange={(e) => handleInputChange('avatar', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-gray-900">{user.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              ) : (
                <p className="text-gray-900">{user.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-gray-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and connected services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connected Providers */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Connected Providers</h3>
              <div className="space-y-2">
                {user.provider && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Link className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.provider}</p>
                        <p className="text-sm text-gray-600">
                          Connected on {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnectProvider(user.provider!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  {isEditing ? (
                    <select
                      value={formData.preferences.theme}
                      onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  ) : (
                    <Badge variant="outline">{formData.preferences.theme}</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  {isEditing ? (
                    <select
                      value={formData.preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  ) : (
                    <Badge variant="outline">{formData.preferences.language}</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  {isEditing ? (
                    <select
                      value={formData.preferences.timezone}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="CET">Central European Time</option>
                    </select>
                  ) : (
                    <Badge variant="outline">{formData.preferences.timezone}</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {user.permissions?.map((permission) => (
                  <Badge key={permission} variant="secondary">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>

            {/* API Tokens */}
            <div>
              <h3 className="text-lg font-semibold mb-4">API Tokens</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Personal Access Token</p>
                    <p className="text-sm text-gray-600">
                      Created {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Token
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}