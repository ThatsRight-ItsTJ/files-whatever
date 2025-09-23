import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useProjectStore } from '@/lib/stores/project-store'

// API response types
interface ProjectResponse {
  projects: Array<{
    id: string
    name: string
    description?: string
    repository?: {
      url: string
      provider: 'github' | 'gitlab' | 'bitbucket'
      branch: string
    }
    template?: string
    status: 'active' | 'archived' | 'draft'
    settings: {
      language: string
      framework: string
      dependencies: string[]
      buildCommand: string
      startCommand: string
    }
    collaborators: Array<{
      id: string
      name: string
      email: string
      role: 'owner' | 'admin' | 'developer' | 'viewer'
      permissions: string[]
      joinedAt: string
    }>
    createdAt: string
    updatedAt: string
    lastAccessedAt: string
  }>
}

interface ProjectCreateRequest {
  name: string
  description?: string
  repository?: {
    url: string
    provider: 'github' | 'gitlab' | 'bitbucket'
    branch: string
  }
  template?: string
  settings?: {
    language: string
    framework: string
    dependencies: string[]
    buildCommand: string
    startCommand: string
  }
}

interface ProjectUpdateRequest {
  name?: string
  description?: string
  repository?: {
    url: string
    provider: 'github' | 'gitlab' | 'bitbucket'
    branch: string
  }
  template?: string
  status?: 'active' | 'archived' | 'draft'
  settings?: {
    language: string
    framework: string
    dependencies: string[]
    buildCommand: string
    startCommand: string
  }
}

interface CollaboratorRequest {
  email: string
  role: 'owner' | 'admin' | 'developer' | 'viewer'
  permissions: string[]
}

// Mock API functions - replace with actual API calls
const projectsApi = {
  // Get all projects
  getProjects: async (): Promise<ProjectResponse> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      projects: [
        {
          id: 'project-1',
          name: 'My Web App',
          description: 'A modern web application',
          repository: {
            url: 'https://github.com/user/my-web-app',
            provider: 'github',
            branch: 'main'
          },
          template: 'nextjs',
          status: 'active',
          settings: {
            language: 'TypeScript',
            framework: 'Next.js',
            dependencies: ['react', 'next', 'typescript'],
            buildCommand: 'npm run build',
            startCommand: 'npm run start'
          },
          collaborators: [
            {
              id: 'collab-1',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'owner',
              permissions: ['read', 'write', 'admin'],
              joinedAt: new Date().toISOString()
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString()
        }
      ]
    }
  },

  // Get project by ID
  getProject: async (projectId: string): Promise<ProjectResponse['projects'][0]> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      id: projectId,
      name: 'Project Details',
      description: 'Project description',
      repository: {
        url: 'https://github.com/user/project',
        provider: 'github',
        branch: 'main'
      },
      template: 'react',
      status: 'active',
      settings: {
        language: 'JavaScript',
        framework: 'React',
        dependencies: ['react', 'react-dom'],
        buildCommand: 'npm run build',
        startCommand: 'npm start'
      },
      collaborators: [
        {
          id: 'collab-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'owner',
          permissions: ['read', 'write', 'admin'],
          joinedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    }
  },

  // Create project
  createProject: async (project: ProjectCreateRequest): Promise<ProjectResponse['projects'][0]> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return {
      id: `project-${Date.now()}`,
      name: project.name,
      description: project.description,
      repository: project.repository,
      template: project.template,
      status: 'active',
      settings: project.settings || {
        language: 'TypeScript',
        framework: 'Next.js',
        dependencies: [],
        buildCommand: 'npm run build',
        startCommand: 'npm run start'
      },
      collaborators: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    }
  },

  // Update project
  updateProject: async (projectId: string, updates: ProjectUpdateRequest): Promise<ProjectResponse['projects'][0]> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: projectId,
      name: updates.name || 'Updated Project',
      description: updates.description,
      repository: updates.repository,
      template: updates.template,
      status: updates.status || 'active',
      settings: updates.settings || {
        language: 'TypeScript',
        framework: 'Next.js',
        dependencies: [],
        buildCommand: 'npm run build',
        startCommand: 'npm run start'
      },
      collaborators: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    }
  },

  // Delete project
  deleteProject: async (projectId: string): Promise<void> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
  },

  // Add collaborator
  addCollaborator: async (projectId: string, collaborator: CollaboratorRequest): Promise<ProjectResponse['projects'][0]> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: projectId,
      name: 'Project with Collaborator',
      description: 'Project description',
      repository: {
        url: 'https://github.com/user/project',
        provider: 'github',
        branch: 'main'
      },
      template: 'react',
      status: 'active',
      settings: {
        language: 'JavaScript',
        framework: 'React',
        dependencies: ['react', 'react-dom'],
        buildCommand: 'npm run build',
        startCommand: 'npm start'
      },
      collaborators: [
        {
          id: `collab-${Date.now()}`,
          name: collaborator.email.split('@')[0],
          email: collaborator.email,
          role: collaborator.role,
          permissions: collaborator.permissions,
          joinedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    }
  },

  // Remove collaborator
  removeCollaborator: async (projectId: string, collaboratorId: string): Promise<ProjectResponse['projects'][0]> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      id: projectId,
      name: 'Project without Collaborator',
      description: 'Project description',
      repository: {
        url: 'https://github.com/user/project',
        provider: 'github',
        branch: 'main'
      },
      template: 'react',
      status: 'active',
      settings: {
        language: 'JavaScript',
        framework: 'React',
        dependencies: ['react', 'react-dom'],
        buildCommand: 'npm run build',
        startCommand: 'npm start'
      },
      collaborators: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    }
  },

  // Update collaborator
  updateCollaborator: async (projectId: string, collaboratorId: string, updates: Partial<CollaboratorRequest>): Promise<ProjectResponse['projects'][0]> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: projectId,
      name: 'Project with Updated Collaborator',
      description: 'Project description',
      repository: {
        url: 'https://github.com/user/project',
        provider: 'github',
        branch: 'main'
      },
      template: 'react',
      status: 'active',
      settings: {
        language: 'JavaScript',
        framework: 'React',
        dependencies: ['react', 'react-dom'],
        buildCommand: 'npm run build',
        startCommand: 'npm start'
      },
      collaborators: [
        {
          id: collaboratorId,
          name: 'Updated User',
          email: 'updated@example.com',
          role: updates.role || 'developer',
          permissions: updates.permissions || ['read', 'write'],
          joinedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    }
  }
}

// Query hooks
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectsApi.getProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useActiveProjects = () => {
  return useQuery({
    queryKey: ['projects', 'active'],
    queryFn: projectsApi.getProjects,
    select: (data) => data.projects.filter(project => project.status === 'active'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useArchivedProjects = () => {
  return useQuery({
    queryKey: ['projects', 'archived'],
    queryFn: projectsApi.getProjects,
    select: (data) => data.projects.filter(project => project.status === 'archived'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutation hooks
export const useCreateProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: (newProject) => {
      // Add to cache
      queryClient.setQueryData(['projects'], (oldData: any) => ({
        projects: [...(oldData?.projects || []), newProject]
      }))
      
      // Invalidate active projects query
      queryClient.invalidateQueries({ queryKey: ['projects', 'active'] })
    },
    onError: (error) => {
      console.error('Project creation failed:', error)
    },
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: ProjectUpdateRequest }) =>
      projectsApi.updateProject(projectId, updates),
    onSuccess: (updatedProject) => {
      // Update cache
      queryClient.setQueryData(['projects', updatedProject.id], updatedProject)
      queryClient.setQueryData(['projects'], (oldData: any) => ({
        projects: oldData?.projects.map((project: any) =>
          project.id === updatedProject.id ? updatedProject : project
        )
      }))
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['projects', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['projects', 'archived'] })
    },
    onError: (error) => {
      console.error('Project update failed:', error)
    },
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: (_, projectId) => {
      // Remove from cache
      queryClient.setQueryData(['projects'], (oldData: any) => ({
        projects: oldData?.projects.filter((project: any) => project.id !== projectId)
      }))
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['projects', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['projects', 'archived'] })
      queryClient.removeQueries({ queryKey: ['projects', projectId] })
    },
    onError: (error) => {
      console.error('Project deletion failed:', error)
    },
  })
}

export const useAddCollaborator = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ projectId, collaborator }: { projectId: string; collaborator: CollaboratorRequest }) =>
      projectsApi.addCollaborator(projectId, collaborator),
    onSuccess: (updatedProject) => {
      // Update cache
      queryClient.setQueryData(['projects', updatedProject.id], updatedProject)
      queryClient.setQueryData(['projects'], (oldData: any) => ({
        projects: oldData?.projects.map((project: any) =>
          project.id === updatedProject.id ? updatedProject : project
        )
      }))
    },
    onError: (error) => {
      console.error('Adding collaborator failed:', error)
    },
  })
}

export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ projectId, collaboratorId }: { projectId: string; collaboratorId: string }) =>
      projectsApi.removeCollaborator(projectId, collaboratorId),
    onSuccess: (updatedProject) => {
      // Update cache
      queryClient.setQueryData(['projects', updatedProject.id], updatedProject)
      queryClient.setQueryData(['projects'], (oldData: any) => ({
        projects: oldData?.projects.map((project: any) =>
          project.id === updatedProject.id ? updatedProject : project
        )
      }))
    },
    onError: (error) => {
      console.error('Removing collaborator failed:', error)
    },
  })
}

export const useUpdateCollaborator = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ projectId, collaboratorId, updates }: { projectId: string; collaboratorId: string; updates: Partial<CollaboratorRequest> }) =>
      projectsApi.updateCollaborator(projectId, collaboratorId, updates),
    onSuccess: (updatedProject) => {
      // Update cache
      queryClient.setQueryData(['projects', updatedProject.id], updatedProject)
      queryClient.setQueryData(['projects'], (oldData: any) => ({
        projects: oldData?.projects.map((project: any) =>
          project.id === updatedProject.id ? updatedProject : project
        )
      }))
    },
    onError: (error) => {
      console.error('Updating collaborator failed:', error)
    },
  })
}