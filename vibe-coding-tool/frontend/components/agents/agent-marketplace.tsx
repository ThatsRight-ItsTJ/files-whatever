'use client'

import { useState } from 'react'
import { 
  Store, 
  Search, 
  Star, 
  Filter, 
  Download, 
  ExternalLink,
  Zap,
  Code,
  Database,
  GitBranch,
  Brain,
  Sparkles,
  Settings,
  Play,
  Heart,
  Share2,
  TrendingUp,
  Users,
  Shield,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Agent {
  id: string
  name: string
  description: string
  category: 'code' | 'analysis' | 'documentation' | 'testing' | 'deployment' | 'utility'
  capabilities: string[]
  status: 'available' | 'beta' | 'deprecated'
  rating: number
  reviews: number
  downloads: number
  usageCount: number
  responseTime: number
  icon: string
  tags: string[]
  isPremium: boolean
  isFeatured: boolean
  author: {
    name: string
    avatar?: string
    verified: boolean
  }
  pricing: {
    type: 'free' | 'freemium' | 'paid'
    price?: number
    currency?: string
  }
  requirements: {
    memory: string
    cpu: string
    storage: string
  }
  lastUpdated: Date
  documentation?: string
  support?: string
  examples?: string[]
}

interface AgentMarketplaceProps {
  onInstallAgent?: (agent: Agent) => void
  onPreviewAgent?: (agent: Agent) => void
  className?: string
}

export function AgentMarketplace({ 
  onInstallAgent, 
  onPreviewAgent,
  className 
}: AgentMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'recent' | 'downloads'>('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPricing, setSelectedPricing] = useState<string>('all')

  // Mock marketplace agents
  const agents: Agent[] = [
    {
      id: '1',
      name: 'React Component Generator',
      description: 'Generate React components with TypeScript, Tailwind CSS, and best practices',
      category: 'code',
      capabilities: ['component-generation', 'typescript', 'tailwind', 'hooks'],
      status: 'available',
      rating: 4.8,
      reviews: 234,
      downloads: 15420,
      usageCount: 45670,
      responseTime: 1.2,
      icon: 'Code',
      tags: ['react', 'typescript', 'tailwind', 'components'],
      isPremium: false,
      isFeatured: true,
      author: {
        name: 'React Masters',
        verified: true
      },
      pricing: {
        type: 'free'
      },
      requirements: {
        memory: '512MB',
        cpu: '1 core',
        storage: '100MB'
      },
      lastUpdated: new Date('2024-01-15T10:30:00Z'),
      documentation: 'https://docs.react-masters.com/component-generator',
      support: 'support@react-masters.com',
      examples: ['Button', 'Card', 'Modal', 'Form']
    },
    {
      id: '2',
      name: 'Security Analyzer Pro',
      description: 'Advanced security analysis with vulnerability detection and remediation suggestions',
      category: 'analysis',
      capabilities: ['security-analysis', 'vulnerability-detection', 'code-review', 'remediation'],
      status: 'beta',
      rating: 4.6,
      reviews: 89,
      downloads: 3450,
      usageCount: 12340,
      responseTime: 2.1,
      icon: 'Shield',
      tags: ['security', 'vulnerability', 'analysis', 'code-review'],
      isPremium: true,
      isFeatured: false,
      author: {
        name: 'SecureCode Inc',
        verified: true
      },
      pricing: {
        type: 'paid',
        price: 29,
        currency: 'USD'
      },
      requirements: {
        memory: '1GB',
        cpu: '2 cores',
        storage: '500MB'
      },
      lastUpdated: new Date('2024-01-10T14:30:00Z'),
      documentation: 'https://docs.securecode.com/security-analyzer',
      support: 'support@securecode.com',
      examples: ['OWASP Top 10', 'SAST Analysis', 'Dependency Check']
    },
    {
      id: '3',
      name: 'API Documentation Generator',
      description: 'Generate comprehensive API documentation from code comments and OpenAPI specs',
      category: 'documentation',
      capabilities: ['api-docs', 'openapi', 'swagger', 'markdown'],
      status: 'available',
      rating: 4.7,
      reviews: 156,
      downloads: 8900,
      usageCount: 23450,
      responseTime: 1.8,
      icon: 'FileText',
      tags: ['api', 'documentation', 'openapi', 'swagger'],
      isPremium: false,
      isFeatured: true,
      author: {
        name: 'Doc Masters',
        verified: false
      },
      pricing: {
        type: 'freemium'
      },
      requirements: {
        memory: '256MB',
        cpu: '1 core',
        storage: '50MB'
      },
      lastUpdated: new Date('2024-01-12T09:15:00Z'),
      documentation: 'https://docs.docmasters.com/api-docs',
      support: 'support@docmasters.com',
      examples: ['REST API', 'GraphQL', 'gRPC']
    },
    {
      id: '4',
      name: 'Test Suite Creator',
      description: 'Automated test generation for unit, integration, and E2E testing',
      category: 'testing',
      capabilities: ['unit-tests', 'integration-tests', 'e2e-tests', 'coverage'],
      status: 'available',
      rating: 4.5,
      reviews: 178,
      downloads: 6720,
      usageCount: 18930,
      responseTime: 1.5,
      icon: 'CheckCircle',
      tags: ['testing', 'unit', 'integration', 'e2e'],
      isPremium: false,
      isFeatured: false,
      author: {
        name: 'Test Masters',
        verified: true
      },
      pricing: {
        type: 'free'
      },
      requirements: {
        memory: '512MB',
        cpu: '1 core',
        storage: '200MB'
      },
      lastUpdated: new Date('2024-01-08T11:20:00Z'),
      documentation: 'https://docs.testmasters.com/test-suite',
      support: 'support@testmasters.com',
      examples: ['Jest', 'Cypress', 'Playwright', 'Vitest']
    },
    {
      id: '5',
      name: 'Kubernetes Deployer',
      description: 'Intelligent Kubernetes deployment with auto-scaling and monitoring',
      category: 'deployment',
      capabilities: ['kubernetes', 'deployment', 'auto-scaling', 'monitoring'],
      status: 'beta',
      rating: 4.4,
      reviews: 67,
      downloads: 2340,
      usageCount: 8900,
      responseTime: 3.2,
      icon: 'GitBranch',
      tags: ['kubernetes', 'deployment', 'devops', 'monitoring'],
      isPremium: true,
      isFeatured: false,
      author: {
        name: 'K8s Masters',
        verified: true
      },
      pricing: {
        type: 'paid',
        price: 49,
        currency: 'USD'
      },
      requirements: {
        memory: '2GB',
        cpu: '4 cores',
        storage: '1GB'
      },
      lastUpdated: new Date('2024-01-05T16:45:00Z'),
      documentation: 'https://docs.k8smasters.com/deployer',
      support: 'support@k8smasters.com',
      examples: ['Production Deploy', 'Auto-scaling', 'Health Checks']
    },
    {
      id: '6',
      name: 'Code Optimizer',
      description: 'Performance optimization and code quality improvement suggestions',
      category: 'utility',
      capabilities: ['performance', 'optimization', 'code-quality', 'best-practices'],
      status: 'available',
      rating: 4.9,
      reviews: 312,
      downloads: 12340,
      usageCount: 45670,
      responseTime: 0.8,
      icon: 'TrendingUp',
      tags: ['performance', 'optimization', 'quality', 'best-practices'],
      isPremium: false,
      isFeatured: true,
      author: {
        name: 'OptiCode Labs',
        verified: true
      },
      pricing: {
        type: 'free'
      },
      requirements: {
        memory: '256MB',
        cpu: '1 core',
        storage: '100MB'
      },
      lastUpdated: new Date('2024-01-14T13:30:00Z'),
      documentation: 'https://docs.opticode.com/optimizer',
      support: 'support@opticode.com',
      examples: ['Bundle Analysis', 'Performance Metrics', 'Code Review']
    }
  ]

  const categories = [
    { id: 'all', name: 'All Categories', count: agents.length },
    { id: 'code', name: 'Code', count: agents.filter(a => a.category === 'code').length },
    { id: 'analysis', name: 'Analysis', count: agents.filter(a => a.category === 'analysis').length },
    { id: 'documentation', name: 'Documentation', count: agents.filter(a => a.category === 'documentation').length },
    { id: 'testing', name: 'Testing', count: agents.filter(a => a.category === 'testing').length },
    { id: 'deployment', name: 'Deployment', count: agents.filter(a => a.category === 'deployment').length },
    { id: 'utility', name: 'Utility', count: agents.filter(a => a.category === 'utility').length }
  ]

  const pricingOptions = [
    { id: 'all', name: 'All Pricing', count: agents.length },
    { id: 'free', name: 'Free', count: agents.filter(a => a.pricing.type === 'free').length },
    { id: 'freemium', name: 'Freemium', count: agents.filter(a => a.pricing.type === 'freemium').length },
    { id: 'paid', name: 'Paid', count: agents.filter(a => a.pricing.type === 'paid').length }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'beta': return 'bg-yellow-100 text-yellow-800'
      case 'deprecated': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'code': return <Code className="h-4 w-4" />
      case 'analysis': return <Brain className="h-4 w-4" />
      case 'documentation': return <FileText className="h-4 w-4" />
      case 'testing': return <CheckCircle className="h-4 w-4" />
      case 'deployment': return <GitBranch className="h-4 w-4" />
      case 'utility': return <Zap className="h-4 w-4" />
      default: return <Store className="h-4 w-4" />
    }
  }

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory
    const matchesPricing = selectedPricing === 'all' || agent.pricing.type === selectedPricing

    return matchesSearch && matchesCategory && matchesPricing
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.usageCount - a.usageCount
      case 'rating':
        return b.rating - a.rating
      case 'recent':
        return b.lastUpdated.getTime() - a.lastUpdated.getTime()
      case 'downloads':
        return b.downloads - a.downloads
      default:
        return 0
    }
  })

  const handleInstallAgent = (agent: Agent) => {
    onInstallAgent?.(agent)
  }

  const handlePreviewAgent = (agent: Agent) => {
    onPreviewAgent?.(agent)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className={`flex flex-col h-full bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Store className="h-5 w-5 text-blue-400" />
            <h3 className="text-white font-medium">Agent Marketplace</h3>
            <Badge variant="outline" className="text-xs">
              {agents.length} agents
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
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 pl-10"
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>

              <select
                value={selectedPricing}
                onChange={(e) => setSelectedPricing(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
              >
                {pricingOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.count})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="p-3 border-b border-gray-700">
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
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="recent">Most Recent</option>
              <option value="downloads">Most Downloads</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="bg-gray-700/50 hover:bg-gray-700 transition-all">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${
                      agent.isFeatured ? 'bg-yellow-500/20' : 'bg-gray-600'
                    }`}>
                      {getCategoryIcon(agent.category)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{agent.name}</h4>
                      <div className="flex items-center space-x-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {agent.category}
                        </Badge>
                        <Badge className={getStatusColor(agent.status)} className="text-xs">
                          {agent.status}
                        </Badge>
                        {agent.isPremium && (
                          <Badge className="bg-purple-500 text-white text-xs">
                            Premium
                          </Badge>
                        )}
                        {agent.isFeatured && (
                          <Badge className="bg-yellow-500 text-white text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {agent.author.verified && (
                    <Award className="h-4 w-4 text-blue-400" />
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                  {agent.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Star className="h-3 w-3 text-yellow-400" />
                    <span>{agent.rating}</span>
                    <span>({agent.reviews})</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Download className="h-3 w-3" />
                    <span>{formatNumber(agent.downloads)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    <span>{formatNumber(agent.usageCount)} uses</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{agent.responseTime}s</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {agent.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {agent.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{agent.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Pricing */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Pricing:</span>
                    <span className="text-sm font-medium">
                      {agent.pricing.type === 'free' ? 'Free' :
                       agent.pricing.type === 'freemium' ? 'Freemium' :
                       `$${agent.pricing.price}/${agent.pricing.currency}`}
                    </span>
                  </div>
                </div>

                {/* Requirements */}
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">Requirements:</div>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="bg-gray-600 rounded px-2 py-1 text-center">
                      {agent.requirements.memory}
                    </div>
                    <div className="bg-gray-600 rounded px-2 py-1 text-center">
                      {agent.requirements.cpu}
                    </div>
                    <div className="bg-gray-600 rounded px-2 py-1 text-center">
                      {agent.requirements.storage}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePreviewAgent(agent)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleInstallAgent(agent)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Install
                  </Button>
                </div>

                {/* Author */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">
                        {agent.author.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {agent.author.name}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <Store className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No agents found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}