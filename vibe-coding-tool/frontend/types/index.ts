// Core Types
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'developer' | 'viewer'
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
    notifications: {
      email: boolean
      push: boolean
      projectUpdates: boolean
      taskUpdates: boolean
    }
    editor: {
      fontSize: number
      fontFamily: string
      tabSize: number
      showLineNumbers: boolean
      wordWrap: boolean
      minimap: boolean
    }
    ai: {
      defaultModel: string
      temperature: number
      maxTokens: number
      autoSuggestions: boolean
    }
  }
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  isActive: boolean
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'archived'
  settings: {
    build: {
      command: string
      outputDir: string
      installCommand: string
    }
    deployment: {
      provider: 'vercel' | 'netlify' | 'github-pages' | 'custom'
      config: Record<string, any>
    }
    features: {
      analytics: boolean
      comments: boolean
      wiki: boolean
      issues: boolean
      discussions: boolean
    }
    security: {
      allowPublicAccess: boolean
      requireApproval: boolean
      allowedDomains?: string[]
    }
    integrations: {
      github: {
        enabled: boolean
        webhookSecret?: string
      }
      slack: {
        enabled: boolean
        webhookUrl?: string
      }
      discord: {
        enabled: boolean
        webhookUrl?: string
      }
    }
  }
  collaborators: Array<{
    id: string
    name: string
    email: string
    role: 'owner' | 'admin' | 'developer' | 'viewer'
    permissions: {
      read: boolean
      write: boolean
      delete: boolean
      manage: boolean
    }
    joinedAt: string
  }>
  repository?: {
    url: string
    provider: 'github' | 'gitlab' | 'bitbucket'
    branch?: string
  }
  templateId?: string
  createdAt: string
  updatedAt: string
  lastActivity: string
}

export interface Task {
  id: string
  title: string
  description?: string
  type: {
    id: string
    name: string
    description: string
    category: 'development' | 'testing' | 'deployment' | 'analysis' | 'documentation'
    capabilities: string[]
    estimatedTime?: number
    isHeavy: boolean
  }
  status: {
    id: string
    name: string
    description: string
    color: string
    order: number
  }
  priority: {
    id: string
    name: string
    description: string
    color: string
    order: number
  }
  input: any
  output?: any
  requiredCapabilities: string[]
  isHeavy: boolean
  projectId?: string
  assigneeId?: string
  dueDate?: string
  tags: string[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface Agent {
  id: string
  name: string
  description?: string
  type: {
    id: string
    name: string
    description: string
    category: 'code' | 'documentation' | 'testing' | 'deployment' | 'analysis'
    capabilities: string[]
    supportedModels: string[]
  }
  model: string
  config: {
    temperature: number
    maxTokens: number
    topP: number
    topK: number
    frequencyPenalty: number
    presencePenalty: number
    systemPrompt?: string
    contextWindow?: number
    stopSequences?: string[]
    tools?: Array<{
      name: string
      description: string
      parameters: Array<{
        name: string
        type: 'string' | 'number' | 'boolean' | 'array' | 'object'
        description: string
        required: boolean
        default?: any
        enum?: any[]
        schema?: any
      }>
      enabled: boolean
    }>
  }
  capabilities: string[]
  pricing?: {
    inputTokenPrice: number
    outputTokenPrice: number
    currency: string
    unit: 'per_1k_tokens'
  }
  visibility: 'public' | 'private' | 'unlisted'
  tags: string[]
  status: 'active' | 'inactive' | 'draft'
  reviews: Array<{
    id: string
    rating: number
    comment: string
    user: {
      id: string
      name: string
      email: string
      avatar?: string
    }
    createdAt: string
    helpful: number
  }>
  createdAt: string
  updatedAt: string
}

export interface KnowledgeGraph {
  id: string
  name: string
  description?: string
  type: 'code' | 'documentation' | 'requirements' | 'architecture' | 'custom'
  source: {
    type: 'repository' | 'files' | 'api' | 'manual'
    config: Record<string, any>
  }
  settings: {
    extraction: {
      enabled: boolean
      depth: number
      includeFiles: string[]
      excludeFiles: string[]
      languages: string[]
    }
    visualization: {
      layout: 'force' | 'hierarchical' | 'circular' | 'grid'
      nodeSize: 'fixed' | 'weighted'
      edgeWidth: 'fixed' | 'weighted'
      colors: {
        primary: string
        secondary: string
        accent: string
      }
    }
    search: {
      enabled: boolean
      fuzzy: boolean
      caseSensitive: boolean
      maxResults: number
    }
    export: {
      formats: ('json' | 'csv' | 'graphml' | 'svg' | 'png')[]
      includeMetadata: boolean
      includeRelationships: boolean
    }
  }
  status: 'active' | 'inactive' | 'processing'
  stats: {
    totalEntities: number
    totalRelationships: number
    lastUpdated: string
    processingStatus: 'idle' | 'processing' | 'completed' | 'error'
  }
  createdAt: string
  updatedAt: string
}

export interface Entity {
  id: string
  name: string
  type: string
  properties: Record<string, any>
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  color?: string
  createdAt: string
  updatedAt: string
}

export interface Relationship {
  id: string
  sourceId: string
  targetId: string
  type: string
  properties: Record<string, any>
  directed: boolean
  weight?: number
  createdAt: string
  updatedAt: string
}

export interface MCPInfo {
  id: string
  name: string
  description: string
  version: string
  status: 'healthy' | 'warning' | 'unhealthy' | 'unknown'
  type: 'lightweight' | 'heavy'
  provider: string
  capabilities: string[]
  lastHealthCheck: string
  uptime: number
  responseTime: number
  error?: string
}

export interface FileNode {
  id: string
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  mimeType?: string
  content?: string
  children?: FileNode[]
  createdAt: string
  updatedAt: string
  lastModified: string
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: string
  language: string
  framework: string
  files: Array<{
    path: string
    content: string
    type: 'template' | 'config' | 'script' | 'readme'
    variables?: Array<{
      name: string
      type: 'string' | 'number' | 'boolean' | 'array' | 'object'
      description: string
      required: boolean
      default?: any
      enum?: any[]
      validation?: {
        pattern?: string
        min?: number
        max?: number
      }
    }>
  }>
  config: {
    build: {
      command: string
      outputDir: string
      installCommand: string
    }
    dependencies: {
      npm?: string[]
      yarn?: string[]
      pip?: string[]
      go?: string[]
    }
    scripts: {
      start: string
      build: string
      test: string
      deploy?: string
    }
    environment: {
      node?: string
      python?: string
      go?: string
      java?: string
    }
    settings: {
      eslint?: boolean
      prettier?: boolean
      husky?: boolean
      lintStaged?: boolean
    }
  }
  tags: string[]
  visibility: 'public' | 'private' | 'unlisted'
  stats: {
    downloads: number
    installations: number
    rating: number
    reviews: number
  }
  reviews: Array<{
    id: string
    rating: number
    comment: string
    user: {
      id: string
      name: string
      email: string
      avatar?: string
    }
    createdAt: string
    helpful: number
  }>
  createdAt: string
  updatedAt: string
}

// Base component props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  id?: string
  'data-testid'?: string
}

// Type aliases for backward compatibility
export type TaskType = Task['type']
export type TaskStatus = Task['status']
export type TaskPriority = Task['priority']
export type AgentType = Agent['type']

// Re-export types from api.ts to avoid circular dependencies
export type * from './api'