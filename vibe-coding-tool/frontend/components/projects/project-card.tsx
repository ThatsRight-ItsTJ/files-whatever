'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectActions } from '@/hooks/api/use-projects-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Star, Archive, GitBranch, Calendar, Users, Code, ExternalLink } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description?: string
    status: 'active' | 'archived' | 'draft'
    type: string
    language: string
    repositoryUrl?: string
    isPrivate: boolean
    createdAt: string
    updatedAt: string
    collaborators?: number
    stars?: number
    lastActivity?: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()
  const { archiveProject, deleteProject, updateProject } = useProjectActions()
  const [isArchiving, setIsArchiving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleArchive = async () => {
    setIsArchiving(true)
    try {
      await archiveProject.mutateAsync(project.id)
      // Refresh the page or update the project list
      router.refresh()
    } catch (error) {
      console.error('Failed to archive project:', error)
    } finally {
      setIsArchiving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteProject.mutateAsync(project.id)
      // Refresh the page or update the project list
      router.refresh()
    } catch (error) {
      console.error('Failed to delete project:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenProject = () => {
    router.push(`/projects/${project.id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'archived':
        return 'Archived'
      case 'draft':
        return 'Draft'
      default:
        return status
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
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {project.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1 line-clamp-2">
              {project.description || 'No description provided'}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenProject}>
                <Code className="mr-2 h-4 w-4" />
                Open Project
              </DropdownMenuItem>
              {project.repositoryUrl && (
                <DropdownMenuItem asChild>
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Repository
                  </a>
                </DropdownMenuItem>
              )}
              {project.status === 'active' && (
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Project
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <GitBranch className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status and Language */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(project.status)}>
            {getStatusText(project.status)}
          </Badge>
          <Badge className={getLanguageColor(project.language)}>
            {project.language}
          </Badge>
          {project.isPrivate && (
            <Badge variant="outline">
              Private
            </Badge>
          )}
        </div>

        {/* Project Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {project.stars && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{project.stars}</span>
              </div>
            )}
            {project.collaborators && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{project.collaborators}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            onClick={handleOpenProject}
            className="flex-1"
            size="sm"
          >
            <Code className="mr-2 h-4 w-4" />
            Open
          </Button>
          {project.repositoryUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}