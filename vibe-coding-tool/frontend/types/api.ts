
// API Response Types
import type {
  User,
  Project,
  Task,
  TaskType,
  TaskStatus,
  TaskPriority,
  Agent,
  AgentType,
  KnowledgeGraph,
  Entity,
  Relationship,
  MCPInfo,
  FileNode,
  ProjectTemplate
} from './index'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    stack?: string
  }
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}

// Authentication API Types
export interface LoginRequest {
  provider: 'github' | 'huggingface'
  code: string
  state?: string
}

export interface LoginResponse {
  user: User
  tokens: {
    accessToken: string
    refreshToken: string
    expiresAt: string
  }
  session: {
    id: string
    expiresAt: string
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface LogoutRequest {
  sessionId?: string
}

export interface LogoutResponse {
  success: boolean
  message: string
}

export interface ValidateTokenRequest {
  token: string
}

export interface ValidateTokenResponse {
  valid: boolean
  user?: User
  expiresAt?: string
}

// User API Types
export interface UpdateUserRequest {
  name?: string
  email?: string
  avatar?: string
  preferences?: UserPreferences
}

export interface UpdateUserResponse {
  user: User
  message: string
}

export interface GetUserProfileResponse {
  user: User
  stats: {
    totalProjects: number
    totalTasks: number
    totalAgents: number
    joinedAt: string
  }
}

export interface UserPreferences {
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

// Project API Types
export interface CreateProjectRequest {
  name: string
  description?: string
  templateId?: string
  repository?: {
    url: string
    provider: 'github' | 'gitlab' | 'bitbucket'
    branch?: string
  }
  settings?: ProjectSettings
  collaborators?: Collaborator[]
}

export interface CreateProjectResponse {
  project: Project
  message: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  settings?: Partial<ProjectSettings>
  collaborators?: Collaborator[]
  status?: 'active' | 'archived'
}

export interface UpdateProjectResponse {
  project: Project
  message: string
}

export interface DeleteProjectRequest {
  projectId: string
  confirm: boolean
}

export interface DeleteProjectResponse {
  success: boolean
  message: string
}

export interface GetProjectsRequest {
  page?: number
  pageSize?: number
  status?: 'active' | 'archived'
  search?: string
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface GetProjectsResponse {
  projects: Project[]
  pagination: {
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface GetProjectRequest {
  projectId: string
}

export interface GetProjectResponse {
  project: Project
  stats: {
    totalFiles: number
    totalCommits: number
    lastActivity: string
    contributors: number
  }
}

export interface ProjectSettings {
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

export interface Collaborator {
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
}

// Task API Types
export interface CreateTaskRequest {
  title: string
  description?: string
  type: TaskType
  priority: TaskPriority
  input: any
  requiredCapabilities?: string[]
  isHeavy?: boolean
  projectId?: string
  assigneeId?: string
  dueDate?: string
  tags?: string[]
}

export interface CreateTaskResponse {
  task: Task
  message: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  input?: any
  output?: any
  assigneeId?: string
  dueDate?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateTaskResponse {
  task: Task
  message: string
}

export interface DeleteTaskRequest {
  taskId: string
  confirm: boolean
}

export interface DeleteTaskResponse {
  success: boolean
  message: string
}

export interface GetTasksRequest {
  projectId?: string
  assigneeId?: string
  status?: TaskStatus
  type?: TaskType
  priority?: TaskPriority
  page?: number
  pageSize?: number
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'dueDate'
  sortOrder?: 'asc' | 'desc'
  dateRange?: {
    from: string
    to: string
  }
}

export interface GetTasksResponse {
  tasks: Task[]
  pagination: {
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface GetTaskRequest {
  taskId: string
}

export interface GetTaskResponse {
  task: Task
  history: TaskHistory[]
  attachments?: TaskAttachment[]
}

export interface TaskHistory {
  id: string
  action: string
  description: string
  user: User
  timestamp: string
  metadata?: Record<string, any>
}

export interface TaskAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
  uploadedBy: User
}

// Agent API Types
export interface CreateAgentRequest {
  name: string
  description?: string
  type: AgentType
  model: string
  config: AgentConfig
  capabilities: string[]
  pricing?: AgentPricing
  visibility: 'public' | 'private' | 'unlisted'
  tags?: string[]
}

export interface CreateAgentResponse {
  agent: Agent
  message: string
}

export interface UpdateAgentRequest {
  name?: string
  description?: string
  type?: AgentType
  model?: string
  config?: Partial<AgentConfig>
  capabilities?: string[]
  pricing?: Partial<AgentPricing>
  visibility?: 'public' | 'private' | 'unlisted'
  tags?: string[]
  status?: 'active' | 'inactive' | 'draft'
}

export interface UpdateAgentResponse {
  agent: Agent
  message: string
}

export interface DeleteAgentRequest {
  agentId: string
  confirm: boolean
}

export interface DeleteAgentResponse {
  success: boolean
  message: string
}

export interface GetAgentsRequest {
  type?: AgentType
  model?: string
  visibility?: 'public' | 'private' | 'unlisted'
  page?: number
  pageSize?: number
  search?: string
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'rating'
  sortOrder?: 'asc' | 'desc'
  tags?: string[]
}

export interface GetAgentsResponse {
  agents: Agent[]
  pagination: {
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface GetAgentRequest {
  agentId: string
}

export interface GetAgentResponse {
  agent: Agent
  stats: {
    totalTasks: number
    successRate: number
    averageResponseTime: number
    rating: number
    reviews: number
  }
  reviews: AgentReview[]
}

export interface AgentReview {
  id: string
  rating: number
  comment: string
  user: User
  createdAt: string
  helpful: number
}

export interface AgentConfig {
  temperature: number
  maxTokens: number
  topP: number
  topK: number
  frequencyPenalty: number
  presencePenalty: number
  systemPrompt?: string
  contextWindow?: number
  stopSequences?: string[]
  tools?: AgentTool[]
}

export interface AgentTool {
  name: string
  description: string
  parameters: AgentToolParameter[]
  enabled: boolean
}

export interface AgentToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description: string
  required: boolean
  default?: any
  enum?: any[]
  schema?: any
}

export interface AgentPricing {
  inputTokenPrice: number
  outputTokenPrice: number
  currency: string
  unit: 'per_1k_tokens'
}

// Knowledge Graph API Types
export interface CreateKnowledgeGraphRequest {
  name: string
  description?: string
  type: 'code' | 'documentation' | 'requirements' | 'architecture' | 'custom'
  source: {
    type: 'repository' | 'files' | 'api' | 'manual'
    config: Record<string, any>
  }
  settings: KnowledgeGraphSettings
}

export interface CreateKnowledgeGraphResponse {
  knowledgeGraph: KnowledgeGraph
  message: string
}

export interface UpdateKnowledgeGraphRequest {
  name?: string
  description?: string
  settings?: Partial<KnowledgeGraphSettings>
  status?: 'active' | 'inactive' | 'processing'
}

export interface UpdateKnowledgeGraphResponse {
  knowledgeGraph: KnowledgeGraph
  message: string
}

export interface DeleteKnowledgeGraphRequest {
  knowledgeGraphId: string
  confirm: boolean
}

export interface DeleteKnowledgeGraphResponse {
  success: boolean
  message: string
}

export interface GetKnowledgeGraphsRequest {
  type?: string
  status?: 'active' | 'inactive' | 'processing'
  page?: number
  pageSize?: number
  search?: string
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface GetKnowledgeGraphsResponse {
  knowledgeGraphs: KnowledgeGraph[]
  pagination: {
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface GetKnowledgeGraphRequest {
  knowledgeGraphId: string
}

export interface GetKnowledgeGraphResponse {
  knowledgeGraph: KnowledgeGraph
  stats: {
    totalEntities: number
    totalRelationships: number
    lastUpdated: string
    processingStatus: 'idle' | 'processing' | 'completed' | 'error'
  }
}

export interface KnowledgeGraphSettings {
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

export interface SearchKnowledgeGraphRequest {
  knowledgeGraphId: string
  query: string
  type?: 'entities' | 'relationships' | 'both'
  filters?: {
    types?: string[]
    properties?: Record<string, any>
    relationships?: string[]
  }
  limit?: number
  offset?: number
}

export interface SearchKnowledgeGraphResponse {
  entities: Entity[]
  relationships: Relationship[]
  total: number
  query: string
  executionTime: number
}

export interface ExportKnowledgeGraphRequest {
  knowledgeGraphId: string
  format: 'json' | 'csv' | 'graphml' | 'svg' | 'png'
  options?: {
    includeMetadata?: boolean
    includeRelationships?: boolean
    layout?: string
    filters?: Record<string, any>
  }
}

export interface ExportKnowledgeGraphResponse {
  url: string
  expiresAt: string
  format: string
  size: number
}

// MCP API Types
export interface GetMCPsRequest {
  status?: 'healthy' | 'warning' | 'unhealthy' | 'unknown'
  type?: 'lightweight' | 'heavy'
  provider?: string
  page?: number
  pageSize?: number
  search?: string
  sortBy?: 'name' | 'status' | 'lastHealthCheck' | 'uptime'
  sortOrder?: 'asc' | 'desc'
}

export interface GetMCPsResponse {
  mcpServers: MCPInfo[]
  pagination: {
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface GetMCPRequest {
  mcpId: string
}

export interface GetMCPResponse {
  mcpServer: MCPInfo
  health: {
    status: 'healthy' | 'warning' | 'unhealthy' | 'unknown'
    lastCheck: string
    responseTime: number
    uptime: number
    error?: string
  }
  capabilities: {
    total: number
    available: number
    types: string[]
  }
}

export interface TestMCPRequest {
  mcpId: string
  testCases: MCPTestCase[]
}

export interface TestMCPResponse {
  results: MCPTestResult[]
  summary: {
    total: number
    passed: number
    failed: number
    skipped: number
  }
  executionTime: number
}

export interface MCPTestCase {
  name: string
  tool: string
  parameters: Record<string, any>
  expected: {
    status: number
    body?: any
  }
}

export interface MCPTestResult {
  name: string
  status: 'passed' | 'failed' | 'skipped'
  responseTime: number
  error?: string
  actual?: {
    status: number
    body?: any
  }
}

// File API Types
export interface UploadFileRequest {
  file: File
  projectId?: string
  path?: string
  overwrite?: boolean
  metadata?: Record<string, any>
}

export interface UploadFileResponse {
  file: FileNode
  url: string
  message: string
}

export interface DownloadFileRequest {
  fileId: string
  projectId?: string
}

export interface DownloadFileResponse {
  url: string
  filename: string
  size: number
  mimeType: string
  expiresAt: string
}

export interface DeleteFileRequest {
  fileId: string
  projectId?: string
  confirm: boolean
}

export interface DeleteFileResponse {
  success: boolean
  message: string
}

export interface GetFilesRequest {
  projectId?: string
  path?: string
  type?: 'file' | 'directory'
  search?: string
  sortBy?: 'name' | 'size' | 'modified' | 'created'
  sortOrder?: 'asc' | 'desc'
}

export interface GetFilesResponse {
  files: FileNode[]
  total: number
  path: string
}

export interface CreateDirectoryRequest {
  name: string
  path?: string
  projectId?: string
}

export interface CreateDirectoryResponse {
  directory: FileNode
  message: string
}

export interface MoveFileRequest {
  fileId: string
  newPath: string
  projectId?: string
}

export interface MoveFileResponse {
  success: boolean
  message: string
}

export interface CopyFileRequest {
  fileId: string
  newPath: string
  projectId?: string
  newName?: string
}

export interface CopyFileResponse {
  success: boolean
  message: string
}

// Template API Types
export interface GetTemplatesRequest {
  category?: string
  language?: string
  framework?: string
  page?: number
  pageSize?: number
  search?: string
  sortBy?: 'name' | 'downloads' | 'rating' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface GetTemplatesResponse {
  templates: ProjectTemplate[]
  pagination: {
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface GetTemplateRequest {
  templateId: string
}

export interface GetTemplateResponse {
  template: ProjectTemplate
  stats: {
    downloads: number
    installations: number
    rating: number
    reviews: number
  }
  reviews: TemplateReview[]
}

export interface TemplateReview {
  id: string
  rating: number
  comment: string
  user: User
  createdAt: string
  helpful: number
}

export interface CreateTemplateRequest {
  name: string
  description: string
  category: string
  language: string
  framework: string
  files: TemplateFile[]
  config: TemplateConfig
  tags: string[]
  visibility: 'public' | 'private' | 'unlisted'
}

export interface CreateTemplateResponse {
  template: ProjectTemplate
  message: string
}

export interface UpdateTemplateRequest {
  name?: string
  description?: string
  category?: string
  language?: string
  framework?: string
  files?: TemplateFile[]
  config?: Partial<TemplateConfig>
  tags?: string[]
  visibility?: 'public' | 'private' | 'unlisted'
  status?: 'active' | 'inactive' | 'draft'
}

export interface UpdateTemplateResponse {
  template: ProjectTemplate
  message: string
}

export interface DeleteTemplateRequest {
  templateId: string
  confirm: boolean
}

export interface DeleteTemplateResponse {
  success: boolean
  message: string
}

export interface TemplateFile {
  path: string
  content: string
  type: 'template' | 'config' | 'script' | 'readme'
  variables?: TemplateVariable[]
}

export interface TemplateVariable {
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
}

export interface TemplateConfig {
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

// Analytics API Types
export interface GetAnalyticsRequest {
  type: 'projects' | 'tasks' | 'agents' | 'users' | 'performance'
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  projectId?: string
  userId?: string
  filters?: Record<string, any>
}

export interface GetAnalyticsResponse {
  data: any[]
  summary: {
    total: number
    average: number
    min: number
    max: number
    trend: 'up' | 'down' | 'stable'
  }
  metadata: {
    period: string
    generatedAt: string
    dataSource: string
  }
}

// WebSocket/Real-time API Types
export interface WebSocketMessage {
  type: 'task_update' | 'project_update' | 'agent_status' | 'system_notification'
  payload: any
  timestamp: string
  userId?: string
  projectId?: string
}

export interface SubscriptionRequest {
  type: 'tasks' | 'projects' | 'agents' | 'system'
  filters?: Record<string, any>
}

export interface SubscriptionResponse {
  subscriptionId: string
  channels: string[]
  expiresAt: string
}

// Search API Types
export interface SearchRequest {
  query: string
  type?: 'all' | 'projects' | 'tasks' | 'agents' | 'files' | 'knowledge'
  filters?: {
    project?: string
    status?: string[]
    tags?: string[]
    dateRange?: {
      from: string
      to: string
    }
  }
  page?: number
  pageSize?: number
  sortBy?: 'relevance' | 'date' | 'name' | 'rating'
  sortOrder?: 'desc' | 'asc'
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  executionTime: number
  suggestions?: string[]
}

export interface SearchResult {
  id: string
  type: 'project' | 'task' | 'agent' | 'file' | 'knowledge'
  title: string
  description?: string
  url: string
  score: number
  highlights?: string[]
  metadata?: Record<string, any>
}

// Export/Import API Types
export interface ExportRequest {
  format: 'json' | 'csv' | 'xml' | 'yaml' | 'zip'
  type: 'project' | 'task' | 'agent' | 'knowledge' | 'all'
  ids?: string[]
  options?: {
    includeMetadata?: boolean
    includeRelations?: boolean
    compression?: boolean
  }
}

export interface ExportResponse {
  url: string
  filename: string
  size: number
  expiresAt: string
  format: string
}

export interface ImportRequest {
  file: File
  type: 'project' | 'task' | 'agent' | 'knowledge'
  mapping?: Record<string, string>
  options?: {
    merge?: boolean
    validateOnly?: boolean
    skipExisting?: boolean
  }
}

export interface ImportResponse {
  results: ImportResult[]
  summary: {
    total: number
    success: number
    failed: number
    skipped: number
  }
  errors?: ImportError[]
}

export interface ImportResult {
  id: string
  status: 'success' | 'failed' | 'skipped'
  message?: string
  data?: any
}

export interface ImportError {
  row: number
  field: string
  message: string
  value?: any
}

// Notification API Types
export interface NotificationRequest {
  type: 'email' | 'push' | 'inapp'
  template: string
  data: Record<string, any>
  recipients: string[]
  scheduledAt?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

export interface NotificationResponse {
  notificationId: string
  status: 'queued' | 'sent' | 'failed' | 'cancelled'
  scheduledAt: string
  sentAt?: string
  error?: string
}

export interface GetNotificationsRequest {
  userId?: string
  type?: 'email' | 'push' | 'inapp'
  status?: 'unread' | 'read' | 'archived'
  page?: number
  pageSize?: number
  sortBy?: 'createdAt' | 'priority' | 'status'
  sortOrder?: 'desc' | 'asc'
}

export interface GetNotificationsResponse {
  notifications: Notification[]
  pagination: {
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface Notification {
  id: string
  type: 'email' | 'push' | 'inapp'
  title: string
  message: string
  data: Record<string, any>
  status: 'unread' | 'read' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  createdAt: string
  readAt?: string
  action?: {
    type: 'url' | 'button' | 'dismiss'
    label?: string
    url?: string
  }
}

// Audit Log API Types
export interface GetAuditLogsRequest {
  userId?: string
  action?: string
  resourceType?: string
  resourceId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
  sortBy?: 'timestamp' | 'user' | 'action'
  sortOrder?: 'desc' | 'asc'
}

export interface GetAuditLogsResponse {
  logs: AuditLog[]
  pagination: {
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: string
  resourceType: string
  resourceId: string
  details: Record<string, any>
  timestamp: string
  ipAddress: string
  userAgent: string
  sessionId?: string
}

// System Health API Types
export interface GetSystemHealthRequest {
  component?: string
  detailed?: boolean
}

export interface GetSystemHealthResponse {
  status: 'healthy' | 'warning' | 'critical'
  timestamp: string
  components: SystemComponentHealth[]
  metrics: SystemMetrics
  alerts: SystemAlert[]
}

export interface SystemComponentHealth {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  responseTime?: number
  errorRate?: number
  lastCheck: string
  details?: Record<string, any>
}

export interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    loadAverage: number[]
  }
  memory: {
    total: number
    used: number
    available: number
    usage: number
  }
  disk: {
    total: number
    used: number
    available: number
    usage: number
  }
  network: {
    incoming: number
    outgoing: number
    packetsIn: number
    packetsOut: number
  }
}

export interface SystemAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  message: string
  component: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  resolved: boolean
  resolvedAt?: string
  metadata?: Record<string, any>
}

// Rate Limit API Types
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: string
  used: number
}

export interface CheckRateLimitRequest {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
}

export interface CheckRateLimitResponse {
  allowed: boolean
  limit: number
  remaining: number
  reset: string
  retryAfter?: number
}

// Webhook API Types
export interface CreateWebhookRequest {
  name: string
  url: string
  events: string[]
  secret?: string
  active: boolean
  retries?: number
  timeout?: number
}

export interface CreateWebhookResponse {
  webhook: Webhook
  message: string
}

export interface UpdateWebhookRequest {
  name?: string
  url?: string
  events?: string[]
  secret?: string
  active?: boolean
  retries?: number
  timeout?: number
}

export interface UpdateWebhookResponse {
  webhook: Webhook
  message: string
}

export interface DeleteWebhookRequest {
  webhookId: string
  confirm: boolean
}

export interface DeleteWebhookResponse {
  success: boolean
  message: string
}

export interface GetWebhooksRequest {
  active?: boolean
  event?: string
  page?: number
  pageSize?: number
  search?: string
}

export interface GetWebhooksResponse {
  webhooks: Webhook[]
  pagination: {
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  secret?: string
  active: boolean
  retries: number
  timeout: number
  lastTriggered?: string
  triggerCount: number
  createdAt: string
  updatedAt: string
}

export interface WebhookPayload {
  event: string
  data: any
  timestamp: string
  signature?: string
}

// Integration API Types
export interface CreateIntegrationRequest {
  name: string
  type: 'github' | 'gitlab' | 'bitbucket' | 'slack' | 'discord' | 'jira' | 'trello'
  config: Record<string, any>
  active: boolean
  scopes?: string[]
}

export interface CreateIntegrationResponse {
  integration: Integration
  message: string
}

export interface UpdateIntegrationRequest {
  name?: string
  config?: Record<string, any>
  active?: boolean
  scopes?: string[]
}

export interface UpdateIntegrationResponse {
  integration: Integration
  message: string
}

export interface DeleteIntegrationRequest {
  integrationId: string
  confirm: boolean
}

export interface DeleteIntegrationResponse {
  success: boolean
  message: string
}

export interface GetIntegrationsRequest {
  type?: string
  active?: boolean
  page?: number
  pageSize?: number
  search?: string
}

export interface GetIntegrationsResponse {
  integrations: Integration[]
  pagination: {
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface Integration {
  id: string
  name: string
  type: string
  config: Record<string, any>
  active: boolean
  scopes: string[]
  lastSync?: string
  syncCount: number
  createdAt: string
  updatedAt: string
}

// Plugin API Types
export interface GetPluginsRequest {
  category?: string
  active?: boolean
  installed?: boolean
  page?: number
  pageSize?: number
  search?: string
  sortBy?: 'name' | 'downloads' | 'rating' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface GetPluginsResponse {
  plugins: Plugin[]
  pagination: {
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface GetPluginRequest {
  pluginId: string
}

export interface GetPluginResponse {
  plugin: Plugin
  stats: {
    downloads: number
    installations: number
    rating: number
    reviews: number
  }
  reviews: PluginReview[]
}

export interface PluginReview {
  id: string
  rating: number
  comment: string
  user: User
  createdAt: string
  helpful: number
}

export interface InstallPluginRequest {
  pluginId: string
  version?: string
  config?: Record<string, any>
}

export interface InstallPluginResponse {
  plugin: InstalledPlugin
  message: string
}

export interface UninstallPluginRequest {
  pluginId: string
  confirm: boolean
}

export interface UninstallPluginResponse {
  success: boolean
  message: string
}

export interface Plugin {
  id: string
  name: string
  description: string
  version: string
  author: User
  category: string
  tags: string[]
  config: PluginConfig
  permissions: string[]
  dependencies?: string[]
  screenshots?: string[]
  documentation?: string
  changelog?: string
  pricing?: PluginPricing
  rating: number
  downloads: number
  reviews: number
  createdAt: string
  updatedAt: string
}

export interface PluginConfig {
  settings: PluginSetting[]
  defaults: Record<string, any>
}

export interface PluginSetting {
  key: string
  name: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea'
  required: boolean
  default?: any
  options?: { label: string; value: any }[]
  validation?: {
    pattern?: string
    min?: number
    max?: number
  }
}

export interface PluginPricing {
  type: 'free' | 'paid' | 'freemium'
  price?: number
  currency?: string
  trialPeriod?: number
}

export interface InstalledPlugin {
  id: string
  pluginId: string
  version: string
  config: Record<string, any>
  status: 'active' | 'inactive' | 'error'
  installedAt: string
  lastUsed?: string
  usageCount: number
}

// Theme API Types
export interface GetThemesRequest {
  category?: string
  premium?: boolean
  page?: number
  pageSize?: number
  search?: string
  sortBy?: 'name' | 'downloads' | 'rating' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface GetThemesResponse {
  themes: Theme[]
  pagination: {
    total: number
    page: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface GetThemeRequest {
  themeId: string
}

export interface GetThemeResponse {
  theme: Theme
  stats: {
    downloads: number
    installations: number
    rating: number
    reviews: number
  }
  reviews: ThemeReview[]
}

export interface ApplyThemeRequest {
  themeId: string
  customizations?: Record<string, any>
}

export interface ApplyThemeResponse {
  success: boolean
  message: string
  preview?: string
}

export interface ThemeReview {
  id: string
  rating: number
  comment: string
  user: User
  createdAt: string
  helpful: number
}

export interface Theme {
  id: string
  name: string
  description: string
  version: string
  author: User
  category: string
  tags: string[]
  config: ThemeConfig
  preview: string[]
  premium: boolean
  price?: number
  currency?: string
  rating: number
  downloads: number
  reviews: number
  createdAt: string
  updatedAt: string
  compatibleWith: string[]
}

export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: {
      primary: string
      secondary: string
      muted: string
      inverse: string
    }
  }
  typography: {
    fontFamily: {
      sans: string[]
      serif: string[]
      mono: string[]
    }
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
    }
    fontWeight: {
      light: number
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// Layout Types
export type LayoutDirection = 'horizontal' | 'vertical'

export type LayoutPosition = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'

export type LayoutDisplay = 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none'

export type LayoutOverflow = 'visible' | 'hidden' | 'scroll' | 'auto'

