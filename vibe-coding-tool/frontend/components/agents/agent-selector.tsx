'use client'

import { useState } from 'react'
import { 
  Bot, 
  Search, 
  Star, 
  Filter, 
  Zap, 
  Code, 
  Database, 
  GitBranch,
  Brain,
  Sparkles,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Agent {
  id: string
  name: string
  description: string
  category: 'code' | 'analysis' | 'documentation' | 'testing' | 'deployment'
  capabilities: string[]
  status: 'available' | 'busy' | 'offline'
  rating: number
  usageCount: number
  responseTime: number
  icon: string
  tags: string[]
  isFavorite: boolean
  isPremium: boolean
}

interface AgentSelectorProps {
  onSelectAgent?: (agent: Agent) => void
  selectedAgent?: Agent | null
}

export function AgentSelector({ onSelectAgent, selectedAgent }: AgentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'rating' | 'usage' | 'response'>('rating')
  const [showFavorites, setShowFavorites] = useState(false)

  // Mock agent data
  const agents: Agent[] = [
    {
      id: '1',
      name: 'Code Assistant',
      description: 'Advanced code generation and completion with context awareness',
      category: 'code',
      capabilities: ['code-generation', 'completion', 'refactoring', 'explanation'],
      status: 'available',
      rating: 4.8,
      usageCount: 1250,
      responseTime: 1.2,
      icon: 'Code',
      tags: ['typescript', 'javascript', 'python', 'react'],
      isFavorite: true,
      isPremium: false
    },
    {
      id: '2',
      name: 'Code Analyzer',
      description: 'Deep code analysis and optimization suggestions',
      category: 'analysis',
      capabilities: ['static-analysis', 'performance', 'security', 'best-practices'],
      status: 'available',
      rating: 4.6,
      usageCount: 890,
      responseTime: 2.1,
      icon: 'Brain',
      tags: ['linting', 'optimization', 'security'],
      isFavorite: false,
      isPremium: true
    },
    {
      id: '3',
      name: 'Documentation Generator',
      description: 'Generate comprehensive documentation from code',
      category: 'documentation',
      capabilities: ['doc-generation', 'api-docs', 'readme', 'comments'],
      status: 'busy',
      rating: 4.4,
      usageCount: 567,
      responseTime: 3.5,
      icon: 'FileText',
      tags: ['documentation', 'api', 'readme'],
      isFavorite: true,
      isPremium: false
    },
    {
      id: '4',
      name: 'Test Generator',
      description: 'Automated test case generation and validation',
      category: 'testing',
      capabilities: ['unit-tests', 'integration-tests', 'e2e-tests', 'coverage'],
      status: 'available',
      rating: 4.7,
      usageCount: 723,
      responseTime: 1.8,
      icon: 'CheckCircle',
      tags: ['testing', 'unit', 'integration', 'coverage'],
      isFavorite: false,
      isPremium: false
    },
    {
      id: '5',
      name: 'Deployment Assistant',
      description: 'CI/CD pipeline optimization and deployment automation',
      category: 'deployment',
      capabilities: ['ci-cd', 'docker', 'kubernetes', 'deployment'],
      status: 'offline',
      rating: 4.5,
      usageCount: 445,
      responseTime: 2.8,
      icon: 'GitBranch',
      tags: ['deployment', 'ci-cd', 'docker', 'k8s'],
      isFavorite: false,
      isPremium: true
    },
    {
      id: '6',
      name: 'AI Code Reviewer',
      description: 'Intelligent code review with AI-powered suggestions',
      category: 'analysis',
      capabilities: ['code-review', 'quality', 'standards', 'best-practices'],
      status: 'available',
      rating: 4.9,
      usageCount: 934,
      responseTime: 1.5,
      icon: 'Eye',
      tags: ['review', 'quality', 'standards'],
      isFavorite: true,
      isPremium: false
    }
  ]

  const categories = [
    { id: 'all', name: 'All Agents', count: agents.length },
    { id: 'code', name: 'Code', count: agents.filter(a => a.category === 'code').length },
    { id: 'analysis', name: 'Analysis', count: agents.filter(a => a.category === 'analysis').length },
    { id: 'documentation', name: 'Documentation', count: agents.filter(a => a.category === 'documentation').length },
    { id: 'testing', name: 'Testing', count: agents.filter(a => a.category === 'testing').length },
    { id: 'deployment', name: 'Deployment', count: agents.filter(a => a.category === 'deployment').length }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-3 w-3" />
      case 'busy': return <Clock className="h-3 w-3" />
      case 'offline': return <AlertCircle className="h-3 w-3" />
      default: return <AlertCircle className="h-3 w-3" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'code': return <Code className="h-4 w-4" />
      case 'analysis': return <Brain className="h-4 w-4" />
      case 'documentation': return <FileText className="h-4 w-4" />
      case 'testing': return <CheckCircle className="h-4 w-4" />
      case 'deployment': return <GitBranch className="h-4 w-4" />
      default: return <Bot className="h-4 w-4" />
    }
  }

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory
    const matchesFavorite = !showFavorites || agent.isFavorite

    return matchesSearch && matchesCategory && matchesFavorite
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating
      case 'usage':
        return b.usageCount - a.usageCount
      case 'response':
        return a.responseTime - b.responseTime
      default:
        return 0
    }
  })

  const handleAgentSelect = (agent: Agent) => {
    onSelectAgent?.(agent)
  }

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <h3 className="text-white font-medium">AI Agents</h3>
            <Badge variant="outline" className="text-xs">
              {agents.length} agents
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFavorites(!showFavorites)}
              className={`text-xs ${showFavorites ? 'text-yellow-400' : 'text-gray-400'}`}
            >
              <Star className="h-3 w-3 mr-1" />
              {showFavorites ? 'All' : 'Favorites'}
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-6 bg-gray-700 border-b border-gray-600">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="text-xs data-[state=active]:bg-gray-600"
            >
              <span className="hidden sm:inline">{category.name}</span>
              <span className="sm:hidden">{category.name.charAt(0)}</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Agent List */}
        <TabsContent value={selectedCategory} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                className={`cursor-pointer transition-all hover:scale-[1.02] ${
                  selectedAgent?.id === agent.id ? 'ring-2 ring-blue-500 bg-gray-700' : 'bg-gray-700/50'
                }`}
                onClick={() => handleAgentSelect(agent)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Agent Icon */}
                      <div className={`p-2 rounded-lg ${
                        agent.status === 'available' ? 'bg-green-500/20' :
                        agent.status === 'busy' ? 'bg-yellow-500/20' :
                        'bg-gray-500/20'
                      }`}>
                        {getCategoryIcon(agent.category)}
                      </div>

                      {/* Agent Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-white font-medium">{agent.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {agent.category}
                          </Badge>
                          {agent.isPremium && (
                            <Badge className="bg-purple-500 text-white text-xs">
                              Premium
                            </Badge>
                          )}
                          {agent.isFavorite && (
                            <Star className="h-3 w-3 text-yellow-400" />
                          )}
                        </div>

                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                          {agent.description}
                        </p>

                        {/* Capabilities */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {agent.capabilities.slice(0, 3).map((capability) => (
                            <Badge key={capability} variant="secondary" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{agent.capabilities.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span>{agent.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RefreshCw className="h-3 w-3" />
                            <span>{agent.usageCount} uses</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{agent.responseTime}s</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(agent.status)}
                        <Badge className={getStatusColor(agent.status)} className="text-xs">
                          {agent.status}
                        </Badge>
                      </div>
                      {selectedAgent?.id === agent.id && (
                        <Button size="sm" className="text-xs">
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No agents found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Sort Controls */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {filteredAgents.length} agents found
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-700 text-white text-xs border border-gray-600 rounded px-2 py-1"
            >
              <option value="rating">Rating</option>
              <option value="usage">Usage</option>
              <option value="response">Response Time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}