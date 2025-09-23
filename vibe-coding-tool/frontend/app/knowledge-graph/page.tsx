
'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Network, 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Download,
  Settings,
  Info,
  Tag,
  User,
  FileText,
  Code,
  Database,
  GitBranch,
  Link,
  Eye,
  EyeOff,
  Layers,
  Maximize,
  Minimize,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface GraphNode {
  id: string
  label: string
  type: 'file' | 'function' | 'class' | 'variable' | 'dependency' | 'repository' | 'user' | 'project'
  x: number
  y: number
  size: number
  color: string
  data: any
  connections: string[]
  metadata?: {
    language?: string
    lines?: number
    lastModified?: Date
    author?: string
    description?: string
    version?: string
    size?: string
    method?: string
    path?: string
    type?: string
  }
}

interface GraphEdge {
  id: string
  source: string
  target: string
  type: 'imports' | 'calls' | 'extends' | 'contains' | 'references' | 'depends'
  weight: number
  label?: string
  color: string
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

interface KnowledgeGraphProps {
  className?: string
}

export default function KnowledgeGraphPage({ className }: KnowledgeGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showLabels, setShowLabels] = useState(true)
  const [showMetadata, setShowMetadata] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'force' | 'hierarchical' | 'circular'>('force')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [filterVisible, setFilterVisible] = useState(true)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Mock graph data
  useEffect(() => {
    const mockData: GraphData = {
      nodes: [
        {
          id: '1',
          label: 'App Component',
          type: 'class',
          x: 400,
          y: 300,
          size: 30,
          color: '#3B82F6',
          data: { 
            language: 'TypeScript',
            lines: 156,
            lastModified: new Date('2024-01-15T10:30:00Z'),
            author: 'developer1',
            description: 'Main application component'
          },
          connections: ['2', '3', '4'],
          metadata: {
            language: 'TypeScript',
            lines: 156,
            lastModified: new Date('2024-01-15T10:30:00Z'),
            author: 'developer1',
            description: 'Main application component'
          }
        },
        {
          id: '2',
          label: 'User Service',
          type: 'class',
          x: 200,
          y: 200,
          size: 25,
          color: '#10B981',
          data: { 
            language: 'TypeScript',
            lines: 89,
            lastModified: new Date('2024-01-14T14:30:00Z'),
            author: 'developer2',
            description: 'User management service'
          },
          connections: ['1', '5'],
          metadata: {
            language: 'TypeScript',
            lines: 89,
            lastModified: new Date('2024-01-14T14:30:00Z'),
            author: 'developer2',
            description: 'User management service'
          }
        },
        {
          id: '3',
          label: 'Auth Module',
          type: 'class',
          x: 600,
          y: 200,
          size: 25,
          color: '#F59E0B',
          data: { 
            language: 'TypeScript',
            lines: 134,
            lastModified: new Date('2024-01-13T09:15:00Z'),
            author: 'developer1',
            description: 'Authentication and authorization'
          },
          connections: ['1', '6'],
          metadata: {
            language: 'TypeScript',
            lines: 134,
            lastModified: new Date('2024-01-13T09:15:00Z'),
            author: 'developer1',
            description: 'Authentication and authorization'
          }
        },
        {
          id: '4',
          label: 'API Client',
          type: 'class',
          x: 400,
          y: 450,
          size: 20,
          color: '#8B5CF6',
          data: { 
            language: 'TypeScript',
            lines: 67,
            lastModified: new Date('2024-01-12T16:45:00Z'),
            author: 'developer3',
            description: 'HTTP client for API calls'
          },
          connections: ['1', '7'],
          metadata: {
            language: 'TypeScript',
            lines: 67,
            lastModified: new Date('2024-01-12T16:45:00Z'),
            author: 'developer3',
            description: 'HTTP client for API calls'
          }
        },
        {
          id: '5',
          label: 'Database',
          type: 'dependency',
          x: 100,
          y: 350,
          size: 35,
          color: '#EF4444',
          data: { 
            type: 'PostgreSQL',
            version: '14.7',
            size: '2.3GB'
          },
          connections: ['2'],
          metadata: {
            language: 'database',
            version: '14.7',
            size: '2.3GB',
            description: 'PostgreSQL database instance'
          }
        },
        {
          id: '6',
          label: 'JWT Utils',
          type: 'function',
          x: 700,
          y: 350,
          size: 15,
          color: '#06B6D4',
          data: { 
            language: 'TypeScript',
            lines: 23,
            lastModified: new Date('2024-01-11T11:20:00Z'),
            author: 'developer1'
          },
          connections: ['3'],
          metadata: {
            language: 'TypeScript',
            lines: 23,
            lastModified: new Date('2024-01-11T11:20:00Z'),
            author: 'developer1'
          }
        },
        {
          id: '7',
          label: 'API Endpoint',
          type: 'function',
          x: 500,
          y: 550,
          size: 15,
          color: '#06B6D4',
          data: { 
            language: 'TypeScript',
            method: 'GET',
            path: '/api/users'
          },
          connections: ['4'],
          metadata: {
            language: 'api',
            method: 'GET',
            path: '/api/users',
            description: 'REST API endpoint for user management'
          }
        }
      ],
      edges: [
        {
          id: 'e1',
          source: '1',
          target: '2',
          type: 'calls',
          weight: 0.8,
          label: 'uses',
          color: '#6B7280'
        },
        {
          id: 'e2',
          source: '1',
          target: '3',
          type: 'imports',
          weight: 0.9,
          label: 'imports',
          color: '#6B7280'
        },
        {
          id: 'e3',
          source: '1',
          target: '4',
          type: 'contains',
          weight: 0.7,
          label: 'contains',
          color: '#6B7280'
        },
        {
          id: 'e4',
          source: '2',
          target: '5',
          type: 'depends',
          weight: 1.0,
          label: 'connects to',
          color: '#6B7280'
        },
        {
          id: 'e5',
          source: '3',
          target: '6',
          type: 'calls',
          weight: 0.6,
          label: 'calls',
          color: '#6B7280'
        },
        {
          id: 'e6',
          source: '4',
          target: '7',
          type: 'references',
          weight: 0.5,
          label: 'references',
          color: '#6B7280'
        }
      ]
    }
    
    setGraphData(mockData)
  }, [])

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'file': return <FileText className="h-4 w-4" />
      case 'function': return <Code className="h-4 w-4" />
      case 'class': return <Code className="h-4 w-4" />
      case 'variable': return <Database className="h-4 w-4" />
      case 'dependency': return <Link className="h-4 w-4" />
      case 'repository': return <GitBranch className="h-4 w-4" />
      case 'user': return <User className="h-4 w-4" />
      case 'project': return <Layers className="h-4 w-4" />
      default: return <Network className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'file': return 'bg-blue-100 text-blue-800'
      case 'function': return 'bg-green-100 text-green-800'
      case 'class': return 'bg-purple-100 text-purple-800'
      case 'variable': return 'bg-yellow-100 text-yellow-800'
      case 'dependency': return 'bg-red-100 text-red-800'
      case 'repository': return 'bg-indigo-100 text-indigo-800'
      case 'user': return 'bg-pink-100 text-pink-800'
      case 'project': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredNodes = graphData.nodes.filter((node: GraphNode) => {
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (node.metadata?.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === 'all' || node.type === selectedType
    return matchesSearch && matchesType
  })

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node)
  }

  const handleZoomIn = () => {
    setZoomLevel((prev: number) => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev: number) => Math.max(prev - 0.2, 0.5))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
  }

  const handleExportGraph = () => {
    // Implement graph export functionality
    console.log('Exporting graph data...')
  }

  const handleLayoutChange = (layout: 'force' | 'hierarchical' | 'circular') => {
    setLayoutMode(layout)
    // Implement layout algorithm
    console.log('Changing layout to:', layout)
  }

  const renderGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Apply zoom
    ctx.save()
    ctx.scale(zoomLevel, zoomLevel)

    // Draw edges
    graphData.edges.forEach((edge: GraphEdge) => {
      const sourceNode = graphData.nodes.find((n: GraphNode) => n.id === edge.source)
      const targetNode = graphData.nodes.find((n: GraphNode) => n.id === edge.target)
      
      if (sourceNode && targetNode) {
        ctx.beginPath()
        ctx.moveTo(sourceNode.x, sourceNode.y)
        ctx.lineTo(targetNode.x, targetNode.y)
        ctx.strokeStyle = edge.color
        ctx.lineWidth = edge.weight * 3
        ctx.stroke()
        
        // Draw arrow
        const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x)
        const arrowLength = 10
        const arrowAngle = Math.PI / 6
        
        ctx.beginPath()
        ctx.moveTo(targetNode.x, targetNode.y)
        ctx.lineTo(
          targetNode.x - arrowLength * Math.cos(angle - arrowAngle),
          targetNode.y - arrowLength * Math.sin(angle - arrowAngle)
        )
        ctx.moveTo(targetNode.x, targetNode.y)
        ctx.lineTo(
          targetNode.x - arrowLength * Math.cos(angle + arrowAngle),
          targetNode.y - arrowLength * Math.sin(angle + arrowAngle)
        )
        ctx.strokeStyle = edge.color
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Draw labels if enabled
        if (showLabels && edge.label) {
          ctx.fillStyle = '#374151'
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(edge.label, (sourceNode.x + targetNode.x) / 2, (sourceNode.y + targetNode.y) / 2 - 5)
        }
      }
    })
    
    // Draw nodes
    graphData.nodes.forEach((node: GraphNode) => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI)
      ctx.fillStyle = node.color
      ctx.fill()
      ctx.strokeStyle = '#1F2937'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Draw node labels if enabled
      if (showLabels) {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.label, node.x, node.y)
      }
    })
    
    // Draw selected node highlight
    if (selectedNode) {
      ctx.beginPath()
      ctx.arc(selectedNode.x, selectedNode.y, selectedNode.size + 5, 0, 2 * Math.PI)
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 3
      ctx.stroke()
    }
    
    ctx.restore()
  }

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (canvas && container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
        renderGraph()
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [graphData, selectedNode, showLabels, zoomLevel])

  // Handle canvas click for node selection
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) / zoomLevel
    const y = (event.clientY - rect.top) / zoomLevel

    // Check if any node was clicked
    const clickedNode = graphData.nodes.find(node => {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2))
      return distance <= node.size
    })

    setSelectedNode(clickedNode || null)
  }

  // Render the component
  return (
    <div className={`flex flex-col h-screen bg-gray-900 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Network className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-semibold text-white">Knowledge Graph</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportGraph}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Filter by Type</h3>
            <div className="space-y-2">
              {['all', 'file', 'function', 'class', 'variable', 'dependency', 'repository', 'user', 'project'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Options */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Layout</h3>
            <div className="space-y-2">
              {['force', 'hierarchical', 'circular'].map((layout) => (
                <button
                  key={layout}
                  onClick={() => handleLayoutChange(layout as 'force' | 'hierarchical' | 'circular')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    layoutMode === layout
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {layout.charAt(0).toUpperCase() + layout.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Display Options</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span>Show Labels</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showMetadata}
                  onChange={(e) => setShowMetadata(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span>Show Metadata</span>
              </label>
            </div>
          </div>

          {/* Node List */}
          <div className="flex-1 overflow-hidden">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Nodes ({filteredNodes.length})</h3>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredNodes.map((node) => (
                    <div
                      key={node.id}
                      onClick={() => handleNodeClick(node)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedNode?.id === node.id
                          ? 'bg-blue-600 border border-blue-500'
                          : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getTypeColor(node.type)}`}
                        />
                        <span className="text-sm font-medium text-white">{node.label}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Type: {node.type}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Main Graph Area */}
        <div className="flex-1 relative" ref={containerRef}>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-pointer"
          />
          
          {/* Zoom Level Indicator */}
          <div className="absolute top-4 right-4 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-300">Zoom: {Math.round(zoomLevel * 100)}%</span>
          </div>
        </div>

        {/* Entity Details Panel */}
        {selectedNode && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Entity Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Basic Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Name:</span>
                      <p className="text-sm text-white">{selectedNode.label}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Type:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div
                          className={`w-3 h-3 rounded-full ${getTypeColor(selectedNode.type)}`}
                        />
                        <span className="text-sm text-white">{selectedNode.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                {selectedNode.metadata && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Metadata</h3>
                    <div className="bg-gray-700 rounded-lg p-3 space-y-2">
                      {Object.entries(selectedNode.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-xs text-gray-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-xs text-white">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connections */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Connections</h3>
                  <div className="space-y-2">
                    {selectedNode.connections.length > 0 ? (
                      selectedNode.connections.map((connectionId) => {
                        const connectedNode = graphData.nodes.find(n => n.id === connectionId)
                        return connectedNode ? (
                          <div
                            key={connectionId}
                            onClick={() => handleNodeClick(connectedNode)}
                            className="flex items-center space-x-2 p-2 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${getTypeColor(connectedNode.type)}`}
                            />
                            <span className="text-sm text-white">{connectedNode.label}</span>
                            <Badge variant="secondary" className="text-xs">
                              {connectedNode.type}
                            </Badge>
                          </div>
                        ) : null
                      })
                    ) : (
                      <p className="text-sm text-gray-400">No connections</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}