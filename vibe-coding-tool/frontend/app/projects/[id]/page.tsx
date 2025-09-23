'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProject, useProjectActions } from '@/hooks/api/use-projects-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  GitBranch, 
  Star, 
  Calendar, 
  Code,
  ExternalLink,
  Edit,
  Trash2,
  Archive
} from 'lucide-react'
import { ProjectSettings } from '@/components/projects/project-settings'
import { ProjectCollaborators } from '@/components/projects/project-collaborators'
import { ProjectFiles } from '@/components/projects/project-files'
import { ProjectActivity } from '@/components/projects/project-activity'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { data: project, isLoading, error } = useProject(projectId)
  const { archiveProject, deleteProject, updateProject } = useProjectActions()
  const [activeTab, setActiveTab] = useState('overview')

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this project?')) return
    try {
      await archiveProject.mutateAsync(projectId)
      router.push('/projects')
    } catch (error) {
      console.error('Failed to archive project:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return
    try {
      await deleteProject.mutateAsync(projectId)
      router.push('/projects')
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <Button onClick={() => router.push('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-100 text-yellow-800',
      typescript: 'bg-blue-100 text-blue-800',
      python: 'bg-green-100 text-green-800',
      java: 'bg-red-100 text-red-800',
      go: 'bg-cyan-100 text-cyan-800',
      rust: 'bg-orange-100 text-orange-800',
    }
    return colors[language] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/projects')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-600">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <Badge className={getLanguageColor(project.language)}>
                {project.language}
              </Badge>
              {project.isPrivate && (
                <Badge variant="outline">Private</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Repository</p>
                      <p className="font-medium">{project.repositoryUrl ? 'Connected' : 'Not connected'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Collaborators</p>
                      <p className="font-medium">{project.collaborators || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Stars</p>
                      <p className="font-medium">{project.stars || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-medium">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Repository Link */}
            {project.repositoryUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ExternalLink className="h-5 w-5" />
                    <span>Repository</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {project.repositoryUrl}
                    </a>
                    <Button variant="outline" size="sm">
                      <Code className="h-4 w-4 mr-2" />
                      Open in Editor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Project Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </Button>
                  {project.status === 'active' && (
                    <Button variant="outline" onClick={handleArchive}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Project
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <ProjectFiles projectId={projectId} />
          </TabsContent>

          <TabsContent value="collaborators">
            <ProjectCollaborators projectId={projectId} />
          </TabsContent>

          <TabsContent value="activity">
            <ProjectActivity projectId={projectId} />
          </TabsContent>

          <TabsContent value="settings">
            <ProjectSettings project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}