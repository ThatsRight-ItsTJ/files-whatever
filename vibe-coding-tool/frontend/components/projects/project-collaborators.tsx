'use client'

import { useState } from 'react'
import { useProjectCollaborators, useAddCollaborator, useRemoveCollaborator } from '@/hooks/api/use-projects-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Plus, 
  Mail, 
  Shield, 
  Trash2, 
  Crown,
  User,
  Settings,
  Calendar
} from 'lucide-react'

interface ProjectCollaboratorsProps {
  projectId: string
}

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  avatar?: string
  joinedAt: string
  lastActive: string
}

interface AddCollaboratorForm {
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

export function ProjectCollaborators({ projectId }: ProjectCollaboratorsProps) {
  const { data: collaborators, isLoading, refetch } = useProjectCollaborators(projectId)
  const addCollaborator = useAddCollaborator()
  const removeCollaborator = useRemoveCollaborator()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState<AddCollaboratorForm>({
    email: '',
    role: 'editor'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleAddCollaborator = async () => {
    setError('')
    setSuccess('')

    try {
      await addCollaborator.mutateAsync({
        projectId,
        email: addForm.email,
        role: addForm.role
      })
      setSuccess('Collaborator added successfully')
      setAddForm({ email: '', role: 'editor' })
      setShowAddDialog(false)
      refetch()
    } catch (err) {
      setError('Failed to add collaborator')
    }
  }

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return

    try {
      await removeCollaborator.mutateAsync({
        projectId,
        userId: collaboratorId
      })
      refetch()
    } catch (err) {
      console.error('Failed to remove collaborator:', err)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-red-100 text-red-800'
      case 'editor': return 'bg-blue-100 text-blue-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4" />
      case 'admin': return <Shield className="h-4 w-4" />
      case 'editor': return <Settings className="h-4 w-4" />
      case 'viewer': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
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
          <Users className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Collaborators</h2>
            <p className="text-gray-600">
              Manage who can access and modify this project
            </p>
          </div>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Collaborator
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Collaborator</DialogTitle>
              <DialogDescription>
                Add a new collaborator to this project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter collaborator's email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Permission Level</Label>
                <Select value={addForm.role} onValueChange={(value: 'admin' | 'editor' | 'viewer') => setAddForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full access</SelectItem>
                    <SelectItem value="editor">Editor - Can edit and view</SelectItem>
                    <SelectItem value="viewer">Viewer - Can only view</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCollaborator} disabled={addCollaborator.isPending || !addForm.email}>
                  {addCollaborator.isPending ? 'Adding...' : 'Add Collaborator'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Collaborators List */}
      <div className="space-y-4">
        {collaborators && collaborators.length > 0 ? (
          <div className="grid gap-4">
            {collaborators.map((collaborator: Collaborator) => (
              <Card key={collaborator.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                        <AvatarFallback>
                          {collaborator.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{collaborator.name}</h3>
                          <Badge className={getRoleColor(collaborator.role)}>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(collaborator.role)}
                              <span>{collaborator.role}</span>
                            </div>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                          <Mail className="h-4 w-4" />
                          <span>{collaborator.email}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Joined {new Date(collaborator.joinedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Last active {new Date(collaborator.lastActive).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {collaborator.role !== 'owner' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveCollaborator(collaborator.id)}
                          disabled={removeCollaborator.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No collaborators yet</h3>
                <p className="mt-2 text-gray-600">
                  Add collaborators to this project to start working together.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Permission Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Badge className="bg-purple-100 text-purple-800">
                <Crown className="h-3 w-3 mr-1" />
                Owner
              </Badge>
              <span className="text-sm text-gray-600">Full access to all project features</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-red-100 text-red-800">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
              <span className="text-sm text-gray-600">Can manage settings and collaborators</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-blue-100 text-blue-800">
                <Settings className="h-3 w-3 mr-1" />
                Editor
              </Badge>
              <span className="text-sm text-gray-600">Can edit files and view project</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-gray-100 text-gray-800">
                <User className="h-3 w-3 mr-1" />
                Viewer
              </Badge>
              <span className="text-sm text-gray-600">Can only view project files</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}