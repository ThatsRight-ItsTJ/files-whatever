// Authentication API hooks
export {
  useCurrentUser,
  useAuthStatus,
  useLogin,
  useLoginWithGithub,
  useLoginWithHuggingFace,
  useLogout,
  useRefreshToken,
  useUpdateProfile,
  useTokenRefresh
} from './use-auth-api'

// Projects API hooks
export {
  useProjects,
  useProject,
  useActiveProjects,
  useArchivedProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useAddCollaborator,
  useRemoveCollaborator,
  useUpdateCollaborator
} from './use-projects-api'

// Agents API hooks
export {
  useAgents,
  useAgent,
  useAgentTasks,
  useMarketplaceAgents,
  useExecuteTask,
  useCancelTask,
  useInstallMarketplaceAgent,
  useUninstallAgent,
  useAvailableAgents,
  useAgentCategories,
  useAgentStats
} from './use-agents-api'

// Knowledge Graph API hooks
export {
  useGraphs,
  useGraph,
  useGraphSearch,
  useGraphFilter,
  useGraphPaths,
  useCreateGraph,
  useUpdateGraph,
  useDeleteGraph,
  useGenerateLayout,
  useExportGraph,
  useImportGraph,
  useGraphStats,
  useGraphSearchResults,
  useGraphFilteredData,
  useGraphPathsBetween
} from './use-knowledge-graph-api'

// Combined API hooks for convenience
export const useApi = () => {
  const auth = {
    currentUser: useCurrentUser(),
    authStatus: useAuthStatus(),
    login: useLogin(),
    loginWithGithub: useLoginWithGithub(),
    loginWithHuggingFace: useLoginWithHuggingFace(),
    logout: useLogout(),
    refreshToken: useRefreshToken(),
    updateProfile: useUpdateProfile(),
    tokenRefresh: useTokenRefresh()
  }

  const projects = {
    projects: useProjects(),
    project: useProject,
    activeProjects: useActiveProjects(),
    archivedProjects: useArchivedProjects(),
    createProject: useCreateProject(),
    updateProject: useUpdateProject(),
    deleteProject: useDeleteProject(),
    addCollaborator: useAddCollaborator(),
    removeCollaborator: useRemoveCollaborator(),
    updateCollaborator: useUpdateCollaborator()
  }

  const agents = {
    agents: useAgents(),
    agent: useAgent,
    agentTasks: useAgentTasks,
    marketplaceAgents: useMarketplaceAgents,
    executeTask: useExecuteTask(),
    cancelTask: useCancelTask(),
    installMarketplaceAgent: useInstallMarketplaceAgent(),
    uninstallAgent: useUninstallAgent(),
    availableAgents: useAvailableAgents(),
    agentCategories: useAgentCategories(),
    agentStats: useAgentStats()
  }

  const knowledgeGraph = {
    graphs: useGraphs(),
    graph: useGraph,
    graphSearch: useGraphSearch,
    graphFilter: useGraphFilter,
    graphPaths: useGraphPaths,
    createGraph: useCreateGraph(),
    updateGraph: useUpdateGraph(),
    deleteGraph: useDeleteGraph(),
    generateLayout: useGenerateLayout(),
    exportGraph: useExportGraph(),
    importGraph: useImportGraph(),
    graphStats: useGraphStats,
    graphSearchResults: useGraphSearchResults,
    graphFilteredData: useGraphFilteredData,
    graphPathsBetween: useGraphPathsBetween
  }

  return { auth, projects, agents, knowledgeGraph }
}

// Selectors for API data
export const selectApiData = (state: any) => {
  return {
    auth: {
      user: state.auth.currentUser?.data,
      isAuthenticated: state.auth.authStatus?.data
    },
    projects: {
      projects: state.projects.projects?.data?.projects || [],
      activeProjects: state.projects.activeProjects?.data?.projects || [],
      archivedProjects: state.projects.archivedProjects?.data?.projects || []
    },
    agents: {
      agents: state.agents.agents?.data?.agents || [],
      availableAgents: state.agents.availableAgents?.data || [],
      agentStats: state.agents.agentStats
    },
    knowledgeGraph: {
      graphs: state.knowledgeGraph.graphs?.data?.graphs || [],
      currentGraph: state.knowledgeGraph.currentGraph
    }
  }
}

// Error handling utilities
export const getApiErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (error?.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export const isApiError = (error: any): boolean => {
  return error && typeof error === 'object' && (error.message || error.response)
}

export const getApiErrorStatus = (error: any): number | null => {
  return error?.response?.status || null
}

export const isApiLoading = (queryKey: string[], queries: any[]): boolean => {
  return queries.some(query => 
    query.queryKey.some((key: string) => queryKey.includes(key)) && 
    query.isLoading
  )
}

export const hasApiError = (queryKey: string[], queries: any[]): boolean => {
  return queries.some(query => 
    query.queryKey.some((key: string) => queryKey.includes(key)) && 
    query.isError
  )
}