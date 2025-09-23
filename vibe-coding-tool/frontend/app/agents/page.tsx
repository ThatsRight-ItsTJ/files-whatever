'use client'

import { useState } from 'react'
import { 
  Bot, 
  MessageSquare, 
  Settings, 
  History, 
  Store,
  Plus,
  ArrowLeft,
  Search,
  Filter,
  Grid,
  List,
  Star,
  TrendingUp,
  Clock,
  Users,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Import our components
import { AgentSelector } from '@/components/agents/agent-selector'
import { ChatInterface } from '@/components/agents/chat-interface'
import { ContextBuilder } from '@/components/agents/context-builder'
import { TaskHistory } from '@/components/agents/task-history'
import { AgentMarketplace } from '@/components/agents/agent-marketplace'

interface Agent {
  id: string
  name: string
  description: string
  category: string
  status: 'available' | 'busy' | 'offline'
  rating: number
  usageCount: number
  responseTime: number
  capabilities: string[]
  icon: string
}

interface ViewMode {
  id: 'chat' | 'context' | 'history' | 'marketplace'
  name: string
  icon: any
}

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [viewMode, setViewMode] = useState<'chat' | 'context' | 'history' | 'marketplace'>('chat')
  const [layoutMode, setLayoutMode] = useState<'split' | 'full'>('split')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Mock agents data
  const agents: Agent[] = [
    {
      id: '1',
      name: 'Code Assistant',
      description: 'Generate code, fix bugs, and improve your programming skills',
      category: 'Development',
      status: 'available',
      rating: 4.8,
      usageCount: 15420,
      responseTime: 1.2,
      capabilities: ['code-generation', 'bug-fixing', 'code-review', 'documentation'],
      icon: 'Code'
    },
    {
      id: '2',
      name: 'Security Analyzer',
      description: 'Analyze code for security vulnerabilities and best practices',
      category: 'Security',
      status: 'available',
      rating: 4.6,
      usageCount: 3450,
      responseTime: 2.1,
      capabilities: ['vulnerability-detection', 'security-analysis', 'code-review'],
      icon: 'Shield'
    },
    {
      id: '3',
      name: 'Documentation Generator',
      description: 'Generate comprehensive documentation from your code',
      category: 'Documentation',
      status: 'busy',
      rating: 4.7,
      usageCount: 8900,
      responseTime: 1.8,
      capabilities: ['api-docs', 'markdown', 'code-comments'],
      icon: 'FileText'
    },
    {
      id: '4',
      name: 'Test Generator',
      description: 'Create unit tests and integration tests for your code',
      category: 'Testing',
      status: 'available',
      rating: 4.5,
      usageCount: 6720,
      responseTime: 1.5,
      capabilities: ['unit-tests', 'integration-tests', 'e2e-tests'],
      icon: 'CheckCircle'
    }
  ]

  const viewModes: ViewMode[] = [
    { id: 'chat', name: 'Chat', icon: MessageSquare },
    { id: 'context', name: 'Context', icon: Settings },
    { id: 'history', name: 'History', icon: History },
    { id: 'marketplace', name: 'Marketplace', icon: Store }
  ]

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent)
    setViewMode('chat')
  }

  const handleSendMessage = async (message: string, attachments?: any[]) => {
    // Simulate sending message to agent
    console.log('Sending message to agent:', message, attachments)
    
    // Simulate response after delay
    setTimeout(() => {
      console.log('Agent response received')
    }, 1000)
  }

  const handleContextChange = (context: any[]) => {
    console.log('Context updated:', context)
  }

  const handleSaveContext = (context: any[]) => {
    console.log('Context saved:', context)
  }

  const handleTaskSelect = (task: any) => {
    console.log('Task selected:', task)
  }

  const handleTaskRetry = (task: any) => {
    console.log('Task retry:', task)
  }

  const handleTaskDelete = (taskId: string) => {
    console.log('Task deleted:', taskId)
  }

  const handleInstallAgent = (agent: any) => {
    console.log('Installing agent:', agent)
  }

  const handlePreviewAgent = (agent: any) => {
    console.log('Previewing agent:', agent)
  }

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-blue-400" />
            <h1 className="text-xl font-semibold text-white">AI Agents</h1>
          </div>
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
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 text-white border-gray-700 placeholder-gray-500 pl-10"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-gray-700 border-b border-gray-600">
              {viewModes.map((mode) => (
                <TabsTrigger
                  key={mode.id}
                  value={mode.id}
                  className="text-xs data-[state=active]:bg-gray-600"
                >
                  <mode.icon className="h-4 w-4 mr-1" />
                  {mode.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Agent Selector */}
            <TabsContent value="chat" className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Select an Agent</h3>
                <div className="space-y-2">
                  {filteredAgents.map((agent) => (
                    <Card
                      key={agent.id}
                      className={`cursor-pointer transition-all hover:scale-[1.02] ${
                        selectedAgent?.id === agent.id ? 'ring-2 ring-blue-500 bg-gray-700' : 'bg-gray-700/50 hover:bg-gray-700'
                      }`}
                      onClick={() => handleAgentSelect(agent)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-white font-medium text-sm">{agent.name}</h4>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-400" />
                                <span className="text-xs text-gray-400">{agent.rating}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{agent.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">
                                {agent.category}
                              </Badge>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{agent.responseTime}s</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Context Builder */}
            <TabsContent value="context" className="flex-1 overflow-y-auto">
              <ContextBuilder
                onContextChange={handleContextChange}
                onSaveContext={handleSaveContext}
              />
            </TabsContent>

            {/* Task History */}
            <TabsContent value="history" className="flex-1 overflow-y-auto">
              <TaskHistory
                onTaskSelect={handleTaskSelect}
                onTaskRetry={handleTaskRetry}
                onTaskDelete={handleTaskDelete}
              />
            </TabsContent>

            {/* Agent Marketplace */}
            <TabsContent value="marketplace" className="flex-1 overflow-y-auto">
              <AgentMarketplace
                onInstallAgent={handleInstallAgent}
                onPreviewAgent={handlePreviewAgent}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col">
          {selectedAgent ? (
            <>
              {/* Agent Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{selectedAgent.name}</h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {selectedAgent.category}
                        </Badge>
                        <Badge className="text-xs">
                          {selectedAgent.status}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span>{selectedAgent.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{selectedAgent.usageCount.toLocaleString()} uses</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{selectedAgent.responseTime}s avg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Interface */}
              <ChatInterface
                agent={selectedAgent}
                onSendMessage={handleSendMessage}
              />
            </>
          ) : (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <Bot className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">Welcome to AI Agents</h2>
                <p className="text-gray-400 mb-6">
                  Select an agent from the sidebar to start chatting, or browse the marketplace to discover new AI assistants.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => setViewMode('marketplace')}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Browse Marketplace
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => setViewMode('context')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Build Context
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}