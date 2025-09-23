import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useKnowledgeGraphStore } from '@/lib/stores/knowledge-graph-store'

// API response types
interface GraphResponse {
  graphs: Array<{
    id: string
    name: string
    description?: string
    nodes: Array<{
      id: string
      label: string
      type: 'file' | 'function' | 'class' | 'variable' | 'import' | 'export' | 'dependency' | 'test' | 'documentation'
      properties: Record<string, any>
      position?: { x: number; y: number }
      size?: { width: number; height: number }
      color?: string
      icon?: string
      metadata?: {
        language?: string
        lineCount?: number
        complexity?: number
        lastModified?: string
        author?: string
      }
    }>
    edges: Array<{
      id: string
      source: string
      target: string
      type: 'calls' | 'imports' | 'exports' | 'extends' | 'implements' | 'references' | 'depends' | 'contains'
      label?: string
      properties: Record<string, any>
      weight?: number
      color?: string
      style?: 'solid' | 'dashed' | 'dotted'
    }>
    layout: {
      algorithm: 'force' | 'hierarchical' | 'circular' | 'grid'
      options: Record<string, any>
    }
    filters: {
      nodeTypes: string[]
      edgeTypes: string[]
      searchTerm: string
    }
    viewport: {
      x: number
      y: number
      zoom: number
    }
    createdAt: string
    updatedAt: string
  }>
}

interface GraphCreateRequest {
  name: string
  description?: string
  nodes?: Array<{
    id: string
    label: string
    type: 'file' | 'function' | 'class' | 'variable' | 'import' | 'export' | 'dependency' | 'test' | 'documentation'
    properties: Record<string, any>
    position?: { x: number; y: number }
    size?: { width: number; height: number }
    color?: string
    icon?: string
    metadata?: {
      language?: string
      lineCount?: number
      complexity?: number
      lastModified?: string
      author?: string
    }
  }>
  edges?: Array<{
    id: string
    source: string
    target: string
    type: 'calls' | 'imports' | 'exports' | 'extends' | 'implements' | 'references' | 'depends' | 'contains'
    label?: string
    properties: Record<string, any>
    weight?: number
    color?: string
    style?: 'solid' | 'dashed' | 'dotted'
  }>
  layout?: {
    algorithm: 'force' | 'hierarchical' | 'circular' | 'grid'
    options: Record<string, any>
  }
  filters?: {
    nodeTypes: string[]
    edgeTypes: string[]
    searchTerm: string
  }
  viewport?: {
    x: number
    y: number
    zoom: number
  }
}

interface GraphUpdateRequest {
  name?: string
  description?: string
  nodes?: Array<{
    id: string
    label: string
    type: 'file' | 'function' | 'class' | 'variable' | 'import' | 'export' | 'dependency' | 'test' | 'documentation'
    properties: Record<string, any>
    position?: { x: number; y: number }
    size?: { width: number; height: number }
    color?: string
    icon?: string
    metadata?: {
      language?: string
      lineCount?: number
      complexity?: number
      lastModified?: string
      author?: string
    }
  }>
  edges?: Array<{
    id: string
    source: string
    target: string
    type: 'calls' | 'imports' | 'exports' | 'extends' | 'implements' | 'references' | 'depends' | 'contains'
    label?: string
    properties: Record<string, any>
    weight?: number
    color?: string
    style?: 'solid' | 'dashed' | 'dotted'
  }>
  layout?: {
    algorithm: 'force' | 'hierarchical' | 'circular' | 'grid'
    options: Record<string, any>
  }
  filters?: {
    nodeTypes: string[]
    edgeTypes: string[]
    searchTerm: string
  }
  viewport?: {
    x: number
    y: number
    zoom: number
  }
}

interface GraphSearchRequest {
  searchTerm: string
  nodeTypes?: string[]
  edgeTypes?: string[]
  maxResults?: number
}

interface GraphFilterRequest {
  nodeTypes?: string[]
  edgeTypes?: string[]
  searchTerm?: string
}

interface GraphPathRequest {
  sourceId: string
  targetId: string
  maxDepth?: number
  edgeTypes?: string[]
}

// Mock API functions - replace with actual API calls
const knowledgeGraphApi = {
  // Get all graphs
  getGraphs: async (): Promise<GraphResponse> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      graphs: [
        {
          id: 'graph-1',
          name: 'Project Structure',
          description: 'Code structure and dependencies',
          nodes: [
            {
              id: 'node-1',
              label: 'main.js',
              type: 'file',
              properties: { path: '/src/main.js', size: 1024 },
              position: { x: 100, y: 100 },
              metadata: { language: 'JavaScript', lineCount: 50 }
            },
            {
              id: 'node-2',
              label: 'utils.js',
              type: 'file',
              properties: { path: '/src/utils.js', size: 2048 },
              position: { x: 300, y: 200 },
              metadata: { language: 'JavaScript', lineCount: 100 }
            }
          ],
          edges: [
            {
              id: 'edge-1',
              source: 'node-1',
              target: 'node-2',
              type: 'imports',
              label: 'import utils from "./utils"'
            }
          ],
          layout: { algorithm: 'force', options: {} },
          filters: { nodeTypes: [], edgeTypes: [], searchTerm: '' },
          viewport: { x: 0, y: 0, zoom: 1 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }
  },

  // Get graph by ID
  getGraph: async (graphId: string): Promise<GraphResponse['graphs'][0]> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      id: graphId,
      name: 'Graph Details',
      description: 'Detailed graph information',
      nodes: [],
      edges: [],
      layout: { algorithm: 'force', options: {} },
      filters: { nodeTypes: [], edgeTypes: [], searchTerm: '' },
      viewport: { x: 0, y: 0, zoom: 1 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  // Create graph
  createGraph: async (graph: GraphCreateRequest): Promise<GraphResponse['graphs'][0]> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return {
      id: `graph-${Date.now()}`,
      name: graph.name,
      description: graph.description,
      nodes: graph.nodes || [],
      edges: graph.edges || [],
      layout: graph.layout || { algorithm: 'force', options: {} },
      filters: graph.filters || { nodeTypes: [], edgeTypes: [], searchTerm: '' },
      viewport: graph.viewport || { x: 0, y: 0, zoom: 1 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  // Update graph
  updateGraph: async (graphId: string, updates: GraphUpdateRequest): Promise<GraphResponse['graphs'][0]> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: graphId,
      name: updates.name || 'Updated Graph',
      description: updates.description,
      nodes: updates.nodes || [],
      edges: updates.edges || [],
      layout: updates.layout || { algorithm: 'force', options: {} },
      filters: updates.filters || { nodeTypes: [], edgeTypes: [], searchTerm: '' },
      viewport: updates.viewport || { x: 0, y: 0, zoom: 1 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  // Delete graph
  deleteGraph: async (graphId: string): Promise<void> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
  },

  // Search graph
  searchGraph: async (graphId: string, search: GraphSearchRequest): Promise<{
    nodes: any[]
    edges: any[]
    paths: any[][]
  }> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      nodes: [],
      edges: [],
      paths: []
    }
  },

  // Filter graph
  filterGraph: async (graphId: string, filters: GraphFilterRequest): Promise<{
    nodes: any[]
    edges: any[]
  }> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      nodes: [],
      edges: []
    }
  },

  // Find paths
  findPaths: async (graphId: string, path: GraphPathRequest): Promise<any[][]> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return []
  },

  // Generate layout
  generateLayout: async (graphId: string, algorithm: 'force' | 'hierarchical' | 'circular' | 'grid', options?: Record<string, any>): Promise<void> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000))
  },

  // Export graph
  exportGraph: async (graphId: string, format: 'json' | 'svg' | 'png' | 'graphml'): Promise<string> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return `Exported graph data in ${format} format`
  },

  // Import graph
  importGraph: async (data: string): Promise<void> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

// Query hooks
export const useGraphs = () => {
  return useQuery({
    queryKey: ['knowledge-graph', 'graphs'],
    queryFn: knowledgeGraphApi.getGraphs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useGraph = (graphId: string) => {
  return useQuery({
    queryKey: ['knowledge-graph', 'graphs', graphId],
    queryFn: () => knowledgeGraphApi.getGraph(graphId),
    enabled: !!graphId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useGraphSearch = (graphId: string, search: GraphSearchRequest) => {
  return useQuery({
    queryKey: ['knowledge-graph', 'graphs', graphId, 'search', search],
    queryFn: () => knowledgeGraphApi.searchGraph(graphId, search),
    enabled: !!graphId && !!search.searchTerm,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useGraphFilter = (graphId: string, filters: GraphFilterRequest) => {
  return useQuery({
    queryKey: ['knowledge-graph', 'graphs', graphId, 'filter', filters],
    queryFn: () => knowledgeGraphApi.filterGraph(graphId, filters),
    enabled: !!graphId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useGraphPaths = (graphId: string, path: GraphPathRequest) => {
  return useQuery({
    queryKey: ['knowledge-graph', 'graphs', graphId, 'paths', path],
    queryFn: () => knowledgeGraphApi.findPaths(graphId, path),
    enabled: !!graphId && !!path.sourceId && !!path.targetId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Mutation hooks
export const useCreateGraph = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: knowledgeGraphApi.createGraph,
    onSuccess: (newGraph) => {
      // Add to cache
      queryClient.setQueryData(['knowledge-graph', 'graphs'], (oldData: any) => ({
        graphs: [...(oldData?.graphs || []), newGraph]
      }))
      
      // Invalidate graphs query
      queryClient.invalidateQueries({ queryKey: ['knowledge-graph', 'graphs'] })
    },
    onError: (error) => {
      console.error('Graph creation failed:', error)
    },
  })
}

export const useUpdateGraph = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ graphId, updates }: { graphId: string; updates: GraphUpdateRequest }) =>
      knowledgeGraphApi.updateGraph(graphId, updates),
    onSuccess: (updatedGraph) => {
      // Update cache
      queryClient.setQueryData(['knowledge-graph', 'graphs', updatedGraph.id], updatedGraph)
      queryClient.setQueryData(['knowledge-graph', 'graphs'], (oldData: any) => ({
        graphs: oldData?.graphs.map((graph: any) =>
          graph.id === updatedGraph.id ? updatedGraph : graph
        )
      }))
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['knowledge-graph', 'graphs'] })
    },
    onError: (error) => {
      console.error('Graph update failed:', error)
    },
  })
}

export const useDeleteGraph = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: knowledgeGraphApi.deleteGraph,
    onSuccess: (_, graphId) => {
      // Remove from cache
      queryClient.setQueryData(['knowledge-graph', 'graphs'], (oldData: any) => ({
        graphs: oldData?.graphs.filter((graph: any) => graph.id !== graphId)
      }))
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['knowledge-graph', 'graphs'] })
      queryClient.removeQueries({ queryKey: ['knowledge-graph', 'graphs', graphId] })
    },
    onError: (error) => {
      console.error('Graph deletion failed:', error)
    },
  })
}

export const useGenerateLayout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ graphId, algorithm, options }: { graphId: string; algorithm: 'force' | 'hierarchical' | 'circular' | 'grid'; options?: Record<string, any> }) =>
      knowledgeGraphApi.generateLayout(graphId, algorithm, options),
    onSuccess: (_, { graphId }) => {
      // Invalidate graph query to trigger re-render
      queryClient.invalidateQueries({ queryKey: ['knowledge-graph', 'graphs', graphId] })
    },
    onError: (error) => {
      console.error('Layout generation failed:', error)
    },
  })
}

export const useExportGraph = () => {
  return useMutation({
    mutationFn: ({ graphId, format }: { graphId: string; format: 'json' | 'svg' | 'png' | 'graphml' }) =>
      knowledgeGraphApi.exportGraph(graphId, format),
    onSuccess: (data, { format }) => {
      // Create download link
      const blob = new Blob([data], { type: `application/${format}` })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `graph.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
    onError: (error) => {
      console.error('Graph export failed:', error)
    },
  })
}

export const useImportGraph = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: knowledgeGraphApi.importGraph,
    onSuccess: () => {
      // Invalidate graphs query
      queryClient.invalidateQueries({ queryKey: ['knowledge-graph', 'graphs'] })
    },
    onError: (error) => {
      console.error('Graph import failed:', error)
    },
  })
}

// Utility hooks
export const useGraphStats = (graphId: string) => {
  const { data: graph } = useGraph(graphId)
  
  if (!graph) return null
  
  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    nodeTypes: [...new Set(graph.nodes.map((n: any) => n.type))],
    edgeTypes: [...new Set(graph.edges.map((e: any) => e.type))],
    averageDegree: graph.nodes.length > 0 ? (graph.edges.length * 2) / graph.nodes.length : 0
  }
}

export const useGraphSearchResults = (graphId: string, searchTerm: string, options?: {
  nodeTypes?: string[]
  edgeTypes?: string[]
  maxResults?: number
}) => {
  const searchRequest: GraphSearchRequest = {
    searchTerm,
    ...options
  }
  
  const { data: searchResults } = useGraphSearch(graphId, searchRequest)
  
  return {
    results: searchResults,
    isLoading: searchResults === undefined
  }
}

export const useGraphFilteredData = (graphId: string, filters: GraphFilterRequest) => {
  const { data: filteredData } = useGraphFilter(graphId, filters)
  
  return {
    nodes: filteredData?.nodes || [],
    edges: filteredData?.edges || [],
    isLoading: filteredData === undefined
  }
}

export const useGraphPathsBetween = (graphId: string, sourceId: string, targetId: string, options?: {
  maxDepth?: number
  edgeTypes?: string[]
}) => {
  const pathRequest: GraphPathRequest = {
    sourceId,
    targetId,
    ...options
  }
  
  const { data: paths } = useGraphPaths(graphId, pathRequest)
  
  return {
    paths: paths || [],
    isLoading: paths === undefined
  }
}