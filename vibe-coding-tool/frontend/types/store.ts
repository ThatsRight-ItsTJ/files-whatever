import type { User, Project, Task, Agent, KnowledgeGraph, ProjectTemplate, Entity, Relationship, FileNode } from './index'

// Base Store Types
export interface BaseStore {
  user: User | null
  projects: Project[]
  currentProject: Project | null
  tasks: Task[]
  agents: Agent[]
  knowledgeGraphs: KnowledgeGraph[]
  isLoading: boolean
  error: string | null
}

// Auth Store Types
export interface AuthStore extends BaseStore {
  // State
  isAuthenticated: boolean
  isInitializing: boolean
  
  // Actions
  login: (user: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  setError: (error: string | null) => void
  clearError: () => void
  setIsLoading: (loading: boolean) => void
}

// Projects Store Types
export interface ProjectsStore extends BaseStore {
  // State
  activeProjects: Project[]
  archivedProjects: Project[]
  templates: ProjectTemplate[]
  
  // Actions
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  deleteProject: (projectId: string) => void
  setCurrentProject: (project: Project | null) => void
  setTemplates: (templates: ProjectTemplate[]) => void
  addTemplate: (template: ProjectTemplate) => void
  updateTemplate: (templateId: string, updates: Partial<ProjectTemplate>) => void
  deleteTemplate: (templateId: string) => void
}

// Tasks Store Types
export interface TasksStore extends BaseStore {
  // State
  activeTasks: Task[]
  completedTasks: Task[]
  taskHistory: Task[]
  selectedTask: Task | null
  
  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  setSelectedTask: (task: Task | null) => void
  addTaskToHistory: (task: Task) => void
  clearTaskHistory: () => void
}

// Agents Store Types
export interface AgentsStore extends BaseStore {
  // State
  activeAgents: Agent[]
  availableAgents: Agent[]
  selectedAgent: Agent | null
  agentCategories: string[]
  
  // Actions
  setAgents: (agents: Agent[]) => void
  addAgent: (agent: Agent) => void
  updateAgent: (agentId: string, updates: Partial<Agent>) => void
  deleteAgent: (agentId: string) => void
  setSelectedAgent: (agent: Agent | null) => void
  setAgentCategories: (categories: string[]) => void
  testAgent: (agentId: string, input: any) => Promise<boolean>
}

// Knowledge Graph Store Types
export interface KnowledgeGraphStore extends BaseStore {
  // State
  activeGraphs: KnowledgeGraph[]
  selectedGraph: KnowledgeGraph | null
  graphEntities: Map<string, Entity>
  graphRelationships: Map<string, Relationship>
  
  // Actions
  setKnowledgeGraphs: (graphs: KnowledgeGraph[]) => void
  addKnowledgeGraph: (graph: KnowledgeGraph) => void
  updateKnowledgeGraph: (graphId: string, updates: Partial<KnowledgeGraph>) => void
  deleteKnowledgeGraph: (graphId: string) => void
  setSelectedGraph: (graph: KnowledgeGraph | null) => void
  setGraphEntities: (entities: Entity[]) => void
  setGraphRelationships: (relationships: Relationship[]) => void
  addEntity: (entity: Entity) => void
  updateEntity: (entityId: string, updates: Partial<Entity>) => void
  deleteEntity: (entityId: string) => void
  addRelationship: (relationship: Relationship) => void
  updateRelationship: (relationshipId: string, updates: Partial<Relationship>) => void
  deleteRelationship: (relationshipId: string) => void
}

// UI Store Types
export interface UIStore {
  // State
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  notifications: Notification[]
  modals: ModalState[]
  toast: ToastState | null
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  openModal: (modal: Omit<ModalState, 'id'>) => string
  closeModal: (id: string) => void
  setToast: (toast: ToastState | null) => void
}

// Notification Types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: NotificationAction[]
  timestamp: Date
  read: boolean
}

export interface NotificationAction {
  label: string
  action: () => void
  variant?: 'primary' | 'secondary' | 'destructive'
}

// Modal Types
export interface ModalState {
  id: string
  type: string
  title: string
  content: any
  isOpen: boolean
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable: boolean
  actions: ModalAction[]
  props?: Record<string, any>
}

export interface ModalAction {
  label: string
  action: () => void
  variant?: 'primary' | 'secondary' | 'destructive'
  disabled?: boolean
}

// Toast Types
export interface ToastState {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
  action?: ToastAction
  timestamp: Date
}

export interface ToastAction {
  label: string
  action: () => void
}

// Editor Store Types
export interface EditorStore {
  // State
  files: FileNode[]
  activeFile: FileNode | null
  unsavedChanges: Map<string, boolean>
  editorSettings: EditorSettings
  gitStatus: GitStatus
  
  // Actions
  setFiles: (files: FileNode[]) => void
  addFile: (file: FileNode) => void
  updateFile: (fileId: string, updates: Partial<FileNode>) => void
  deleteFile: (fileId: string) => void
  setActiveFile: (file: FileNode | null) => void
  setUnsavedChanges: (fileId: string, hasChanges: boolean) => void
  setEditorSettings: (settings: EditorSettings) => void
  setGitStatus: (status: GitStatus) => void
  saveFile: (fileId: string) => Promise<void>
  discardChanges: (fileId: string) => void
}

export interface EditorSettings {
  theme: string
  fontSize: number
  fontFamily: string
  tabSize: number
  showLineNumbers: boolean
  wordWrap: boolean
  minimap: boolean
  autoSave: boolean
  autoSaveInterval: number
}

export interface GitStatus {
  branch: string
  ahead: number
  behind: number
  clean: boolean
  stagedFiles: string[]
  modifiedFiles: string[]
  untrackedFiles: string[]
}

// WebSocket Store Types
export interface WebSocketStore {
  // State
  connected: boolean
  reconnectAttempts: number
  subscriptions: Map<string, (data: any) => void>
  pendingMessages: Array<{ type: string; data: any; timestamp: Date }>
  
  // Actions
  connect: () => void
  disconnect: () => void
  subscribe: (event: string, callback: (data: any) => void) => void
  unsubscribe: (event: string) => void
  send: (type: string, data: any) => void
  setConnected: (connected: boolean) => void
  incrementReconnectAttempts: () => void
  resetReconnectAttempts: () => void
  addPendingMessage: (type: string, data: any) => void
  processPendingMessages: () => void
}

// Combined Store Types
export interface Store extends AuthStore, ProjectsStore, TasksStore, AgentsStore, KnowledgeGraphStore, UIStore, EditorStore, WebSocketStore {}

// Store Creators
export type StoreCreator<T> = StateCreator<Store, [], [], T>

// Hook Types
export type UseStore<T> = UseBoundStore<StoreApi<Store>, (state: Store) => T>

// Selectors
export type Selector<T> = (state: Store) => T

// Middleware Types
export interface PersistConfig {
  name: string
  storage?: any
  partialize?: (state: Store) => any
  version?: number
  onRehydrateStorage?: (state: Store | undefined) => ((state: Store | undefined) => void) | void
}

export interface DevtoolsConfig {
  enabled: boolean
  name?: string
  anonymousActionType?: string
}

// Async Actions
export interface AsyncAction<T = any> {
  pending?: () => void
  success?: (data: T) => void
  error?: (error: Error) => void
  finally?: () => void
}

// Loading States
export interface LoadingState {
  isLoading: boolean
  error: string | null
  data: any
}

export interface AsyncState<T> {
  isLoading: boolean
  error: string | null
  data?: T
  refetch: () => Promise<void>
}

// Form Store Types
export interface FormStore {
  // State
  forms: Map<string, FormState>
  validationErrors: Map<string, string[]>
  
  // Actions
  setFormState: (formId: string, state: FormState) => void
  updateFormValue: (formId: string, field: string, value: any) => void
  setFormError: (formId: string, field: string, error: string) => void
  clearFormError: (formId: string, field: string) => void
  clearFormErrors: (formId: string) => void
  setFormTouched: (formId: string, field: string, touched: boolean) => void
  validateForm: (formId: string, rules: FormRule[]) => boolean
  resetForm: (formId: string) => void
}

export interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
  submitCount: number
}

export interface FormRule {
  field: string
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
  validator?: (value: any) => boolean
}

// Search Store Types
export interface SearchStore {
  // State
  query: string
  results: SearchResult[]
  filters: SearchFilters
  isLoading: boolean
  
  // Actions
  setQuery: (query: string) => void
  setResults: (results: SearchResult[]) => void
  setFilters: (filters: SearchFilters) => void
  addFilter: (key: string, value: any) => void
  removeFilter: (key: string) => void
  clearFilters: () => void
  setIsLoading: (loading: boolean) => void
  search: (query: string, filters?: SearchFilters) => Promise<void>
}

export interface SearchResult {
  id: string
  type: 'file' | 'project' | 'task' | 'agent' | 'entity'
  title: string
  description?: string
  url?: string
  relevance: number
  metadata?: Record<string, any>
}

export interface SearchFilters {
  type?: string[]
  project?: string
  date?: {
    from?: Date
    to?: Date
  }
  status?: string[]
  priority?: string[]
  tags?: string[]
}