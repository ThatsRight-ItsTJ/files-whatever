import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAgentStore } from '@/lib/stores/agent-store'

// API response types
interface AgentResponse {
  agents: Array<{
    id: string
    name: string
    description: string
    category: 'code' | 'analysis' | 'documentation' | 'testing' | 'deployment'
    capabilities: string[]
    model: string
    provider: 'openai' | 'anthropic' | 'local' | 'huggingface'
    parameters: Array<{
      name: string
      type: 'string' | 'number' | 'boolean' | 'array' | 'object'
      description: string
      required: boolean
      defaultValue?: any
      options?: any[]
      validation?: {
        min?: number
        max?: number
        pattern?: string
        custom?: string
      }
    }>
    status: 'available' | 'busy' | 'offline'
    responseTime: number
    successRate: number
    usage: {
      totalRequests: number
      successfulRequests: number
      lastUsedAt: string | null
    }
    pricing?: {
      inputTokenPrice: number
      outputTokenPrice: number
      currency: string
    }
    tags: string[]
    createdAt: string
    updatedAt: string
  }>
}

interface AgentTaskResponse {
  task: {
    id: string
    agentId: string
    projectId?: string
    input: any
    parameters: Record<string, any>
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
    result?: any
    error?: string
    startTime: string
    endTime?: string
    duration?: number
    tokensUsed?: {
      input: number
      output: number
    }
    cost?: number
  }
}

interface AgentTaskRequest {
  agentId: string
  projectId?: string
  input: any
  parameters: Record<string, any>
}

interface MarketplaceAgent {
  id: string
  name: string
  description: string
  category: 'code' | 'analysis' | 'documentation' | 'testing' | 'deployment'
  capabilities: string[]
  model: string
  provider: 'openai' | 'anthropic' | 'local' | 'huggingface'
  pricing?: {
    inputTokenPrice: number
    outputTokenPrice: number
    currency: string
  }
  tags: string[]
  author: {
    name: string
    avatar?: string
    verified: boolean
  }
  rating: number
  downloadCount: number
  isInstalled: boolean
  createdAt: string
  updatedAt: string
}

// Mock API functions - replace with actual API calls
const agentsApi = {
  // Get all agents
  getAgents: async (): Promise<AgentResponse> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      agents: [
        {
          id: 'agent-1',
          name: 'Code Assistant',
          description: 'Helps with code generation and debugging',
          category: 'code',
          capabilities: ['code_generation', 'debugging', 'refactoring'],
          model: 'gpt-4',
          provider: 'openai',
          parameters: [
            {
              name: 'temperature',
              type: 'number',
              description: 'Controls randomness in responses',
              required: false,
              defaultValue: 0.7,
              validation: { min: 0, max: 2 }
            }
          ],
          status: 'available',
          responseTime: 1500,
          successRate: 95,
          usage: {
            totalRequests: 1000,
            successfulRequests: 950,
            lastUsedAt: new Date().toISOString()
          },
          pricing: {
            inputTokenPrice: 0.03,
            outputTokenPrice: 0.06,
            currency: 'USD'
          },
          tags: ['code', 'ai', 'assistant'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'agent-2',
          name: 'Documentation Generator',
          description: 'Generates documentation from code',
          category: 'documentation',
          capabilities: ['doc_generation', 'code_analysis'],
          model: 'claude-3',
          provider: 'anthropic',
          parameters: [
            {
              name: 'format',
              type: 'string',
              description: 'Output format for documentation',
              required: false,
              defaultValue: 'markdown',
              options: ['markdown', 'html', 'json']
            }
          ],
          status: 'available',
          responseTime: 2000,
          successRate: 90,
          usage: {
            totalRequests: 500,
            successfulRequests: 450,
            lastUsedAt: new Date(Date.now() - 3600000).toISOString()
          },
          pricing: {
            inputTokenPrice: 0.015,
            outputTokenPrice: 0.075,
            currency: 'USD'
          },
          tags: ['documentation', 'ai', 'generator'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }
  },

  // Get agent by ID
  getAgent: async (agentId: string): Promise<AgentResponse['agents'][0]> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      id: agentId,
      name: 'Agent Details',
      description: 'Detailed agent information',
      category: 'code',
      capabilities: ['capability1', 'capability2'],
      model: 'gpt-4',
      provider: 'openai',
      parameters: [],
      status: 'available',
      responseTime: 1500,
      successRate: 95,
      usage: {
        totalRequests: 100,
        successfulRequests: 95,
        lastUsedAt: new Date().toISOString()
      },
      tags: ['agent', 'ai'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  // Execute agent task
  executeTask: async (task: AgentTaskRequest): Promise<AgentTaskResponse> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const isSuccess = Math.random() > 0.1 // 90% success rate
    
    return {
      task: {
        id: `task-${Date.now()}`,
        agentId: task.agentId,
        projectId: task.projectId,
        input: task.input,
        parameters: task.parameters,
        status: isSuccess ? 'completed' : 'failed',
        result: isSuccess ? {
          output: `Task completed successfully at ${new Date().toISOString()}`,
          data: { processed: true, timestamp: new Date().toISOString() }
        } : undefined,
        error: isSuccess ? undefined : 'Task execution failed',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 2000,
        tokensUsed: { input: 100, output: 50 },
        cost: 0.0015
      }
    }
  },

  // Get agent tasks
  getAgentTasks: async (agentId?: string, projectId?: string): Promise<AgentTaskResponse[]> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        task: {
          id: 'task-1',
          agentId: agentId || 'agent-1',
          projectId,
          input: { code: 'console.log("Hello World")' },
          parameters: {},
          status: 'completed',
          result: {
            output: 'Code executed successfully',
            data: { output: 'Hello World' }
          },
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() - 3598000).toISOString(),
          duration: 2000,
          tokensUsed: { input: 50, output: 25 },
          cost: 0.00075
        }
      }
    ]
  },

  // Cancel agent task
  cancelTask: async (taskId: string): Promise<void> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
  },

  // Get marketplace agents
  getMarketplaceAgents: async (category?: string, search?: string): Promise<MarketplaceAgent[]> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return [
      {
        id: 'marketplace-1',
        name: 'React Component Generator',
        description: 'Generates React components from natural language descriptions',
        category: 'code',
        capabilities: ['react', 'component_generation', 'typescript'],
        model: 'gpt-4',
        provider: 'openai',
        pricing: {
          inputTokenPrice: 0.03,
          outputTokenPrice: 0.06,
          currency: 'USD'
        },
        tags: ['react', 'components', 'typescript'],
        author: {
          name: 'AI Tools Inc.',
          verified: true
        },
        rating: 4.8,
        downloadCount: 1000,
        isInstalled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'marketplace-2',
        name: 'API Documentation Writer',
        description: 'Automatically generates API documentation from code',
        category: 'documentation',
        capabilities: ['api_docs', 'openapi', 'swagger'],
        model: 'claude-3',
        provider: 'anthropic',
        pricing: {
          inputTokenPrice: 0.015,
          outputTokenPrice: 0.075,
          currency: 'USD'
        },
        tags: ['api', 'documentation', 'openapi'],
        author: {
          name: 'Doc Masters',
          verified: true
        },
        rating: 4.6,
        downloadCount: 500,
        isInstalled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  },

  // Install marketplace agent
  installMarketplaceAgent: async (agentId: string): Promise<void> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  },

  // Uninstall agent
  uninstallAgent: async (agentId: string): Promise<void> => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

// Query hooks
export const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: agentsApi.getAgents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAgent = (agentId: string) => {
  return useQuery({
    queryKey: ['agents', agentId],
    queryFn: () => agentsApi.getAgent(agentId),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAgentTasks = (agentId?: string, projectId?: string) => {
  return useQuery({
    queryKey: ['agents', 'tasks', agentId, projectId],
    queryFn: () => agentsApi.getAgentTasks(agentId, projectId),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useMarketplaceAgents = (category?: string, search?: string) => {
  return useQuery({
    queryKey: ['agents', 'marketplace', category, search],
    queryFn: () => agentsApi.getMarketplaceAgents(category, search),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Mutation hooks
export const useExecuteTask = () => {
  const queryClient = useQueryClient()
  const { addTask, updateTask } = useAgentStore()
  
  return useMutation({
    mutationFn: agentsApi.executeTask,
    onMutate: (variables) => {
      // Optimistically add task to store
      const newTask = {
        id: `task-${Date.now()}`,
        agentId: variables.agentId,
        projectId: variables.projectId,
        input: variables.input,
        parameters: variables.parameters,
        status: 'pending' as const,
        startTime: new Date()
      }
      
      addTask(newTask)
      return { newTask }
    },
    onSuccess: (response, variables, context) => {
      // Update task in store with result
      updateTask(response.task.id, {
        status: response.task.status,
        result: response.task.result,
        error: response.task.error,
        endTime: response.task.endTime ? new Date(response.task.endTime) : undefined,
        duration: response.task.duration,
        tokensUsed: response.task.tokensUsed,
        cost: response.task.cost
      })
      
      // Update agent cache if needed
      queryClient.invalidateQueries({ queryKey: ['agents', 'tasks'] })
    },
    onError: (error, variables, context) => {
      if (context?.newTask) {
        updateTask(context.newTask.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          endTime: new Date()
        })
      }
    },
  })
}

export const useCancelTask = () => {
  const queryClient = useQueryClient()
  const { updateTask } = useAgentStore()
  
  return useMutation({
    mutationFn: agentsApi.cancelTask,
    onSuccess: (_, taskId) => {
      // Update task in store
      updateTask(taskId, {
        status: 'cancelled',
        endTime: new Date()
      })
      
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['agents', 'tasks'] })
    },
    onError: (error) => {
      console.error('Task cancellation failed:', error)
    },
  })
}

export const useInstallMarketplaceAgent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: agentsApi.installMarketplaceAgent,
    onSuccess: (_, agentId) => {
      // Invalidate marketplace agents query
      queryClient.invalidateQueries({ queryKey: ['agents', 'marketplace'] })
      
      // Update agent status if it's already in the agents list
      queryClient.setQueryData(['agents'], (oldData: any) => {
        if (!oldData) return oldData
        
        return {
          ...oldData,
          agents: oldData.agents.map((agent: any) =>
            agent.id === agentId ? { ...agent, status: 'available' } : agent
          )
        }
      })
    },
    onError: (error) => {
      console.error('Agent installation failed:', error)
    },
  })
}

export const useUninstallAgent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: agentsApi.uninstallAgent,
    onSuccess: (_, agentId) => {
      // Invalidate marketplace agents query
      queryClient.invalidateQueries({ queryKey: ['agents', 'marketplace'] })
      
      // Remove agent from cache
      queryClient.setQueryData(['agents'], (oldData: any) => {
        if (!oldData) return oldData
        
        return {
          ...oldData,
          agents: oldData.agents.filter((agent: any) => agent.id !== agentId)
        }
      })
      
      // Remove agent tasks
      queryClient.removeQueries({ queryKey: ['agents', 'tasks', agentId] })
    },
    onError: (error) => {
      console.error('Agent uninstallation failed:', error)
    },
  })
}

// Utility hooks
export const useAvailableAgents = () => {
  const { data: agents } = useAgents()
  
  return {
    data: agents?.agents.filter(agent => agent.status === 'available') || [],
    isLoading: agents === undefined
  }
}

export const useAgentCategories = () => {
  const { data: agents } = useAgents()
  
  const categories = agents?.agents.reduce((acc, agent) => {
    if (!acc.includes(agent.category)) {
      acc.push(agent.category)
    }
    return acc
  }, [] as string[]) || []
  
  return categories
}

export const useAgentStats = () => {
  const { data: agents } = useAgents()
  
  if (!agents) return null
  
  const totalAgents = agents.agents.length
  const availableAgents = agents.agents.filter(agent => agent.status === 'available').length
  const busyAgents = agents.agents.filter(agent => agent.status === 'busy').length
  const offlineAgents = agents.agents.filter(agent => agent.status === 'offline').length
  
  const totalRequests = agents.agents.reduce((sum, agent) => sum + agent.usage.totalRequests, 0)
  const totalSuccessRate = agents.agents.length > 0
    ? agents.agents.reduce((sum, agent) => sum + agent.successRate, 0) / agents.agents.length
    : 0
  
  return {
    totalAgents,
    availableAgents,
    busyAgents,
    offlineAgents,
    totalRequests,
    averageSuccessRate: totalSuccessRate
  }
}