'use client'

import { useState } from 'react'
import { useProjectSettings, useUpdateProjectSettings } from '@/hooks/api/use-projects-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Shield, 
  Bell, 
  Palette, 
  Database,
  GitBranch,
  Globe,
  Key
} from 'lucide-react'

interface ProjectSettingsProps {
  project: {
    id: string
    name: string
    description?: string
    isPrivate: boolean
    language: string
    repositoryUrl?: string
  }
}

interface ProjectSettingsData {
  name: string
  description: string
  isPrivate: boolean
  language: string
  repositoryUrl: string
  notifications: {
    email: boolean
    webhook: boolean
    slack: boolean
  }
  features: {
    autoSave: boolean
    realTimeCollaboration: boolean
    codeAnalysis: boolean
    deployment: boolean
  }
  integrations: {
    github: boolean
    slack: boolean
    discord: boolean
    jira: boolean
  }
}

export function ProjectSettings({ project }: ProjectSettingsProps) {
  const { data: settings, isLoading } = useProjectSettings(project.id)
  const updateSettings = useUpdateProjectSettings()
  const [formData, setFormData] = useState<ProjectSettingsData>({
    name: project.name,
    description: project.description || '',
    isPrivate: project.isPrivate,
    language: project.language,
    repositoryUrl: project.repositoryUrl || '',
    notifications: {
      email: true,
      webhook: false,
      slack: false
    },
    features: {
      autoSave: true,
      realTimeCollaboration: false,
      codeAnalysis: true,
      deployment: false
    },
    integrations: {
      github: !!project.repositoryUrl,
      slack: false,
      discord: false,
      jira: false
    }
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof ProjectSettingsData],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')

    try {
      await updateSettings.mutateAsync({
        projectId: project.id,
        settings: formData
      })
      setSuccess('Settings saved successfully')
    } catch (err) {
      setError('Failed to save settings')
    }
  }

  const handleReset = () => {
    setFormData({
      name: project.name,
      description: project.description || '',
      isPrivate: project.isPrivate,
      language: project.language,
      repositoryUrl: project.repositoryUrl || '',
      notifications: {
        email: true,
        webhook: false,
        slack: false
      },
      features: {
        autoSave: true,
        realTimeCollaboration: false,
        codeAnalysis: true,
        deployment: false
      },
      integrations: {
        github: !!project.repositoryUrl,
        slack: false,
        discord: false,
        jira: false
      }
    })
    setError('')
    setSuccess('')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Project Settings</h2>
            <p className="text-gray-600">Configure your project preferences and integrations</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Alerts */}
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

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Update your project's basic details and visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    placeholder="e.g., TypeScript, Python"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your project"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repositoryUrl">Repository URL</Label>
                <Input
                  id="repositoryUrl"
                  value={formData.repositoryUrl}
                  onChange={(e) => handleInputChange('repositoryUrl', e.target.value)}
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => handleInputChange('isPrivate', checked)}
                />
                <Label htmlFor="isPrivate">Make this project private</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Project Features</span>
              </CardTitle>
              <CardDescription>
                Enable or disable project features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Save className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Auto Save</h4>
                      <p className="text-sm text-gray-600">Automatically save changes</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.features.autoSave}
                    onCheckedChange={(checked) => handleNestedChange('features', 'autoSave', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <GitBranch className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Real-time Collaboration</h4>
                      <p className="text-sm text-gray-600">Work together in real-time</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.features.realTimeCollaboration}
                    onCheckedChange={(checked) => handleNestedChange('features', 'realTimeCollaboration', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Key className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Code Analysis</h4>
                      <p className="text-sm text-gray-600">Analyze code quality and security</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.features.codeAnalysis}
                    onCheckedChange={(checked) => handleNestedChange('features', 'codeAnalysis', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Auto Deployment</h4>
                      <p className="text-sm text-gray-600">Automatically deploy changes</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.features.deployment}
                    onCheckedChange={(checked) => handleNestedChange('features', 'deployment', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitBranch className="h-5 w-5" />
                <span>Service Integrations</span>
              </CardTitle>
              <CardDescription>
                Connect with external services and tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <GitBranch className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">GitHub</h4>
                      <p className="text-sm text-gray-600">Connect to GitHub repository</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.integrations.github}
                    onCheckedChange={(checked) => handleNestedChange('integrations', 'github', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bell className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Slack</h4>
                      <p className="text-sm text-gray-600">Send notifications to Slack</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.integrations.slack}
                    onCheckedChange={(checked) => handleNestedChange('integrations', 'slack', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Bell className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Discord</h4>
                      <p className="text-sm text-gray-600">Send notifications to Discord</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.integrations.discord}
                    onCheckedChange={(checked) => handleNestedChange('integrations', 'discord', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Jira</h4>
                      <p className="text-sm text-gray-600">Connect to Jira for issue tracking</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.integrations.jira}
                    onCheckedChange={(checked) => handleNestedChange('integrations', 'jira', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security & Privacy</span>
              </CardTitle>
              <CardDescription>
                Configure security settings and privacy options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Private Project</h4>
                      <p className="text-sm text-gray-600">
                        {formData.isPrivate 
                          ? 'This project is private and only visible to you' 
                          : 'This project is public and visible to everyone'
                        }
                      </p>
                    </div>
                  </div>
                  <Badge variant={formData.isPrivate ? 'destructive' : 'default'}>
                    {formData.isPrivate ? 'Private' : 'Public'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Notification Preferences</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <Switch
                        id="email-notifications"
                        checked={formData.notifications.email}
                        onCheckedChange={(checked) => handleNestedChange('notifications', 'email', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="webhook-notifications">Webhook Notifications</Label>
                      <Switch
                        id="webhook-notifications"
                        checked={formData.notifications.webhook}
                        onCheckedChange={(checked) => handleNestedChange('notifications', 'webhook', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slack-notifications">Slack Notifications</Label>
                      <Switch
                        id="slack-notifications"
                        checked={formData.notifications.slack}
                        onCheckedChange={(checked) => handleNestedChange('notifications', 'slack', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}