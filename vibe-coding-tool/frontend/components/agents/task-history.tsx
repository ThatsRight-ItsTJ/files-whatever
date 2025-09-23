
'use client'

import { useState } from 'react'
import { 
  History, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  User,
  Bot,
  FileText,
  Code,
  Database,
  GitBranch,
  Download,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  type: 'code-generation' | 'analysis' | 'documentation' | 'testing' | 'deployment'
  agent: {
    id: string
    name: string
    avatar?: string
  }
  project: {
    id: string
    name: string
  }
  startTime: Date
  endTime?: Date
  duration?: number
  input: string
  output?: string
  attachments?: string[]
  tags: string[]
  confidence?: number
  tokenCount?: number
  error?: string
}

interface TaskHistoryProps {
  onTaskSelect?: (task: Task) => void
  onTaskRetry?: (task: Task) => void
  onTaskDelete?: (taskId: string) => void
  className?: string
}

export function TaskHistory({ 
  onTaskSelect, 
  onTaskRetry, 
  onTaskDelete,
  className 
}: TaskHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedAgent, setSelectedAgent] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'confidence'>('date')
  const [showFilters, setShowFilters] = useState(false)

  // Mock task data
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Generate React component for user profile',
      description: 'Create a responsive user profile component with avatar, name, and stats',
      status: 'completed',
      type: 'code-generation',
      agent: {
        id: '1',
        name: 'Code Assistant'
      },
      project: {
        id: '1',
        name: 'vibe-coding-tool'
      },
      startTime: new Date('2024-01-15T10:30:00Z'),
      endTime: new Date('2024-01-15T10:32:15Z'),
      duration: 135,
      input: 'Create a React component for user profile with avatar, name, and stats',
      output: 'Generated UserProfile component with TypeScript types and responsive design',
      tags: ['react', 'component', 'typescript', 'profile'],
      confidence: 0.95,
      tokenCount: 1250
    },
    {
      id: '2',
      title: 'Analyze code performance issues',
      description: 'Identify performance bottlenecks in the main application file',
      status: 'completed',
      type: 'analysis',
      agent: {
        id: '2',
        name: 'Code Analyzer'
      },
      project: {
        id: '1',
        name: 'vibe-coding-tool'
      },
      startTime: new Date('2024-01-15T09:45:00Z'),
      endTime: new Date('2024-01-15T09:48:30Z'),
      duration: 210,
      input: 'Analyze src/app/page.tsx for performance issues',
      output: 'Found 3 performance bottlenecks: unnecessary re-renders, large bundle size, and inefficient state management',
      tags: ['performance', 'analysis', 'optimization'],
      confidence: 0.88,
      tokenCount: 890
    },
    {
      id: '3',
      title: 'Generate API documentation',
      description: 'Create comprehensive API documentation for the user endpoints',
      status: 'failed',
      type: 'documentation',
      agent: {
        id: '3',
        name: 'Documentation Generator'
      },
      project: {
        id: '1',
        name: 'vibe-coding-tool'
      },
      startTime: new Date('2024-01-15T08:15:00Z'),
      endTime: new Date('2024-01-15T08:20:00Z'),
      duration: 300,
      input: 'Generate API documentation for /api/users endpoints',
      output: undefined,
      error: 'Failed to parse OpenAPI schema',
      tags: ['api', 'documentation', 'openapi'],
      confidence: 0.0,
      tokenCount: 0
    },
    {
      id: '4',
      title: 'Write unit tests for authentication module',
      description: 'Create comprehensive unit tests for the authentication service',
      status: 'running',
      type: 'testing',
      agent: {
        id: '4',
        name: 'Test Generator'
      },
      project: {
        id: '1',
        name: 'vibe-coding-tool'
      },
      startTime: new Date('2024-01-15T11:00:00Z'),
      duration: 45,
      input: 'Write unit tests for src/lib/auth.ts',
      tags: ['testing', 'unit', 'authentication', 'jest'],
      confidence: 0.0,
      tokenCount: 0
    },
    {
      id: '5',
      title: 'Deploy to production environment',
      description: 'Deploy the application to production with proper CI/CD pipeline',
      status: 'pending',
      type: 'deployment',
      agent: {
        id: '5',
        name: 'Deployment Assistant'
      },
      project: {
        id: '1',
        name: 'vibe-coding-tool'
      },
      startTime: new Date('2024-01-15T14:00:00Z'),
      input: 'Deploy to production environment with latest changes',
      tags: ['deployment', 'ci-cd', 'production'],
      confidence: 0.0,
      tokenCount: 0
    }
  ]

  const statusOptions = [
    { id: 'all', name: 'All Status', count: tasks.length },
    { id: 'pending', name: 'Pending', count: tasks.filter(t => t.status === 'pending').length },
    { id: 'running', name: 'Running', count: tasks.filter(t => t.status === 'running').length },
    { id: 'completed', name: 'Completed', count: tasks.filter(t => t.status === 'completed').length },
    { id: 'failed', name: 'Failed', count: tasks.filter(t => t.status === 'failed').length },
    { id: 'cancelled', name: 'Cancelled', count: tasks.filter(t => t.status === 'cancelled').length }
  ]

  const typeOptions = [
    { id: 'all', name: 'All Types', count: tasks.length },
    { id: 'code-generation', name: 'Code Generation', count: tasks.filter(t => t.type === 'code-generation').length },
    { id: 'analysis', name: 'Analysis', count: tasks.filter(t => t.type === 'analysis').length },
    { id: 'documentation', name: 'Documentation', count: tasks.filter(t => t.type === 'documentation').length },
    { id: 'testing', name: 'Testing', count: tasks.filter(t => t.type === 'testing').length },
    { id: 'deployment', name: 'Deployment', count: tasks.filter(t => t.type === 'deployment').length }
  ]

  const agentOptions = [
    { id: 'all', name: 'All Agents', count: tasks.length },
    { id: '1', name: 'Code Assistant', count: tasks.filter(t => t.agent.id === '1').length },
    { id: '2', name: 'Code Analyzer', count: tasks.filter(t => t.agent.id === '2').length },
    { id: '3', name: 'Documentation Generator', count: tasks.filter(t => t.agent.id === '3').length },
    { id: '4', name: 'Test Generator', count: tasks.filter(t => t.agent.id === '4').length },
    { id: '5', name: 'Deployment Assistant', count: tasks.filter(t => t.agent.id === '5').length }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />
      case 'running': return <RefreshCw className="h-3 w-3 animate-spin" />
      case 'completed': return <CheckCircle className="h-3 w-3" />
      case 'failed': return <XCircle className="h-3 w-3" />
      case 'cancelled': return <AlertCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'code-generation': return <Code className="h-4 w-4" />
      case 'analysis': return <Database className="h-4 w-4" />
      case 'documentation': return <FileText className="h-4 w-4" />
      case 'testing': return <CheckCircle className="h-4 w-4" />
      case 'deployment': return <GitBranch className="h-4 w-4" />
      default: return <Bot className="h-4 w-4" />
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0s'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus
    const matchesType = selectedType === 'all' || task.type === selectedType
    const matchesAgent = selectedAgent === 'all' || task.agent.id === selectedAgent

    return matchesSearch && matchesStatus && matchesType && matchesAgent
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.startTime.getTime() - a.startTime.getTime()
      case 'duration':
        return (b.duration || 0) - (a.duration || 0)
      case 'confidence':
        return (b.confidence || 0) - (a.confidence || 0)
      default:
        return 0
    }
  })

  const handleTaskSelect = (task: Task) => {
    onTaskSelect?.(task)
  }

  const handleTaskRetry = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation()
    onTaskRetry?.(task)
  }

  const handleTaskDelete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onTaskDelete?.(taskId)
  }

  return (
    <div className={`flex flex-col h-full bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-blue-400" />
            <h3 className="text-white font-medium">Task History</h3>
            <Badge variant="outline" className="text-xs">
              {tasks.length} tasks
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-400 hover:text-white"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 pl-10"
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.count})
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
              >
                {typeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.count})
                  </option>
                ))}
              </select>

              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
              >
                {agentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.count})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="cursor-pointer transition-all hover:scale-[1.02] bg-gray-700/50 hover:bg-gray-700"
              onClick={() => handleTaskSelect(task)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Status Icon */}
                    <div className={`p-2 rounded-lg ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)}
                    </div>

                    {/* Task Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1