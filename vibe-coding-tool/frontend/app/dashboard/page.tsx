'use client'

import { useState, useEffect } from 'react'
import { 
  Home, 
  Code, 
  Bot, 
  Network, 
  Folder, 
  Activity, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Star,
  Zap,
  ArrowRight,
  Plus,
  Settings,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'archived' | 'draft'
  type: 'web' | 'mobile' | 'api' | 'cli'
  language: string
  lastActivity: string
  progress: number
  repositoryUrl?: string
}

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high'
  type: 'code_generation' | 'bug_fix' | 'refactor' | 'test' | 'documentation'
  project: string
  assignedTo?: string
  dueDate?: string
  createdAt: string
}

interface Agent {
  id: string
  name: string
  category: string
  status: 'available' | 'busy' | 'offline'
  usageCount: number
  rating: number
  responseTime: number
}

interface SystemStats {
  totalProjects: number
  activeTasks: number
  completedTasks: number
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
  uptime: string
  responseTime: number
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState<SystemStats>({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    systemHealth: 'excellent',
    uptime: '99.9%',
    responseTime: 1.2
  })
  const [selectedTab, setSelectedTab] = useState('overview')

  // Mock data - in real app this would come from API
  useEffect(() => {
    // Mock projects
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'vibe-coding-tool',
        description: 'AI-powered coding assistant with MCP integration',
        status: 'active',
        type: 'web',
        language: 'TypeScript',
        lastActivity: '2 hours ago',
        progress: 75,
        repositoryUrl: 'https://github.com/user/vibe-coding-tool'
      },
      {
        id: '2',
        name: 'metamcp-orchestrator',
        description: 'Core MetaMCP orchestration service',
        status: 'active',
        type: 'api',
        language: 'Python',
        lastActivity: '5 hours ago',
        progress: 90
      },
      {
        id: '3',
        name: 'frontend-nextjs',
        description: 'Next.js frontend application',
        status: 'draft',
        type: 'web',
        language: 'TypeScript',
        lastActivity: '1 day ago',
        progress: 30
      }
    ]

    // Mock tasks
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Implement GitHub OAuth integration',
        description: 'Add GitHub authentication flow to the application',
        status: 'in_progress',
        priority: 'high',
        type: 'code_generation',
        project: 'vibe-coding-tool',
        assignedTo: 'developer1',
        dueDate: '2024-01-20',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Fix authentication bug',
        description: 'Resolve issue with token refresh mechanism',
        status: 'pending',
        priority: 'medium',
        type: 'bug_fix',
        project: 'vibe-coding-tool',
        dueDate: '2024-01-18',
        createdAt: '2024-01-14T14:30:00Z'
      },
      {
        id: '3',
        title: 'Update documentation',
        description: 'Add API documentation for new endpoints',
        status: 'completed',
        priority: 'low',
        type: 'documentation',
        project: 'metamcp-orchestrator',
        createdAt: '2024-01-13T09:15:00Z'
      }
    ]

    // Mock agents
    const mockAgents: Agent[] = [
      {
        id: '1',
        name: 'Code Assistant',
        category: 'Development',
        status: 'available',
        usageCount: 15420,
        rating: 4.8,
        responseTime: 1.2
      },
      {
        id: '2',
        name: 'Security Analyzer',
        category: 'Security',
        status: 'busy',
        usageCount: 3450,
        rating: 4.6,
        responseTime: 2.1
      },
      {
        id: '3',
        name: 'Documentation Generator',
        category: 'Documentation',
        status: 'available',
        usageCount: 8900,
        rating: 4.7,
        responseTime: 1.8
      }
    ]

    // Mock stats
    const mockStats: SystemStats = {
      totalProjects: mockProjects.length,
      activeTasks: mockTasks.filter(t => t.status === 'in_progress' || t.status === 'pending').length,
      completedTasks: mockTasks.filter(t => t.status === 'completed').length,
      systemHealth: 'excellent',
      uptime: '99.9%',
      responseTime: 1.2
    }

    setProjects(mockProjects)
    setTasks(mockTasks)
    setAgents(mockAgents)
    setStats(mockStats)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
      case 'busy':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
      case 'offline':
        return 'bg-red-100 text-red-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      case 'draft':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return `${diffDays}d ago`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <Badge className={getHealthColor(stats.systemHealth)}>
              {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <Folder className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.completedTasks} completed this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <CheckCircle className={`h-4 w-4 ${getHealthColor(stats.systemHealth)}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.uptime}</div>
                  <p className="text-xs text-muted-foreground">
                    Uptime this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.responseTime}s</div>
                  <p className="text-xs text-muted-foreground">
                    Average response time
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your latest coding projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {projects.slice(0, 3).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Code className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{project.name}</h4>
                              <p className="text-xs text-gray-500">{project.language}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">{project.lastActivity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Button className="w-full mt-4" variant="outline">
                    View All Projects
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Tasks</CardTitle>
                  <CardDescription>Your latest coding tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {tasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{task.title}</h4>
                              <p className="text-xs text-gray-500">{task.project}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)} className="mt-1">
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Button className="w-full mt-4" variant="outline">
                    View All Tasks
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started quickly with these common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col space-y-2">
                    <Plus className="h-6 w-6" />
                    <span>New Project</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Code className="h-6 w-6" />
                    <span>Open Editor</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Bot className="h-6 w-6" />
                    <span>Ask AI Agent</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Projects</h2>
                <p className="text-gray-600">Manage your coding projects</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Language:</span>
                        <span className="font-medium">{project.language}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium">{project.type}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Last Activity:</span>
                        <span className="font-medium">{project.lastActivity}</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Open
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Tasks</h2>
                <p className="text-gray-600">Track your coding tasks and progress</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in_progress' ? 'bg-blue-500' :
                          task.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {task.project}
                            </span>
                            {task.assignedTo && (
                              <span className="text-sm text-gray-500">
                                Assigned to: {task.assignedTo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {task.dueDate && (
                          <p className="text-sm text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {formatRelativeTime(task.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">AI Agents</h2>
                <p className="text-gray-600">Manage your AI coding assistants</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                    <CardDescription>{agent.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Usage:</span>
                        <span className="font-medium">{agent.usageCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{agent.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Response Time:</span>
                        <span className="font-medium">{agent.responseTime}s</span>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Chat
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}