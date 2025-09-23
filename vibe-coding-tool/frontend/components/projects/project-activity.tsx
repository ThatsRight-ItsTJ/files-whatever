'use client'

import { useState } from 'react'
import { useProjectActivity } from '@/hooks/api/use-projects-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  GitCommit, 
  GitPullRequest, 
  GitBranch, 
  Star,
  Users,
  Calendar,
  Clock,
  FileCode,
  MessageSquare,
  Plus,
  Filter
} from 'lucide-react'

interface ProjectActivityProps {
  projectId: string
}

interface ActivityItem {
  id: string
  type: 'commit' | 'pr' | 'issue' | 'file' | 'collaborator' | 'deployment'
  title: string
  description: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  metadata?: {
    branch?: string
    file?: string
    status?: 'success' | 'failed' | 'pending'
    repository?: string
  }
}

export function ProjectActivity({ projectId }: ProjectActivityProps) {
  const { data: activity, isLoading } = useProjectActivity(projectId)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('7d')

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'commit':
        return <GitCommit className="h-5 w-5 text-blue-500" />
      case 'pr':
        return <GitPullRequest className="h-5 w-5 text-green-500" />
      case 'issue':
        return <MessageSquare className="h-5 w-5 text-red-500" />
      case 'file':
        return <FileCode className="h-5 w-5 text-purple-500" />
      case 'collaborator':
        return <Users className="h-5 w-5 text-orange-500" />
      case 'deployment':
        return <Star className="h-5 w-5 text-indigo-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const filteredActivity = activity?.filter(item => {
    if (selectedFilter !== 'all' && item.type !== selectedFilter) return false
    return true
  }) || []

  const activityByType = {
    commit: filteredActivity.filter(item => item.type === 'commit'),
    pr: filteredActivity.filter(item => item.type === 'pr'),
    issue: filteredActivity.filter(item => item.type === 'issue'),
    file: filteredActivity.filter(item => item.type === 'file'),
    collaborator: filteredActivity.filter(item => item.type === 'collaborator'),
    deployment: filteredActivity.filter(item => item.type === 'deployment')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Activity</h2>
            <p className="text-gray-600">
              Recent project activity and updates
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            {dateRange === '7d' ? 'Last 7 days' : 
             dateRange === '30d' ? 'Last 30 days' : 'All time'}
          </Button>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <GitCommit className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{activityByType.commit.length}</p>
                <p className="text-sm text-gray-600">Commits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <GitPullRequest className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{activityByType.pr.length}</p>
                <p className="text-sm text-gray-600">Pull Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{activityByType.issue.length}</p>
                <p className="text-sm text-gray-600">Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <FileCode className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{activityByType.file.length}</p>
                <p className="text-sm text-gray-600">Files Changed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{activityByType.collaborator.length}</p>
                <p className="text-sm text-gray-600">Collaborators</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-indigo-500" />
              <div>
                <p className="text-2xl font-bold">{activityByType.deployment.length}</p>
                <p className="text-sm text-gray-600">Deployments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            All ({filteredActivity.length})
          </TabsTrigger>
          <TabsTrigger value="commit" className="flex items-center gap-2">
            <GitCommit className="h-4 w-4" />
            Commits ({activityByType.commit.length})
          </TabsTrigger>
          <TabsTrigger value="pr" className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4" />
            PRs ({activityByType.pr.length})
          </TabsTrigger>
          <TabsTrigger value="issue" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Issues ({activityByType.issue.length})
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Files ({activityByType.file.length})
          </TabsTrigger>
          <TabsTrigger value="collaborator" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team ({activityByType.collaborator.length})
          </TabsTrigger>
          <TabsTrigger value="deployment" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Deploy ({activityByType.deployment.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredActivity.length > 0 ? (
            <div className="space-y-3">
              {filteredActivity.map((item: ActivityItem) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getActivityIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {item.metadata?.status && (
                              <Badge className={getStatusColor(item.metadata.status)}>
                                {item.metadata.status}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(item.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeTime(item.timestamp)}</span>
                          </div>
                          {item.metadata?.branch && (
                            <div className="flex items-center space-x-1">
                              <GitBranch className="h-3 w-3" />
                              <span>{item.metadata.branch}</span>
                            </div>
                          )}
                          {item.metadata?.file && (
                            <div className="flex items-center space-x-1">
                              <FileCode className="h-3 w-3" />
                              <span>{item.metadata.file}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                            <span className="text-sm text-gray-600">{item.user.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No recent activity</h3>
                  <p className="mt-2 text-gray-600">
                    Activity will appear here when team members start working on the project.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="commit" className="space-y-4">
          {activityByType.commit.length > 0 ? (
            <div className="space-y-3">
              {activityByType.commit.map((item: ActivityItem) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <GitCommit className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">{item.title}</h3>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        {item.metadata?.branch && (
                          <div className="flex items-center space-x-2 mt-2">
                            <GitBranch className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600">{item.metadata.branch}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <GitCommit className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No recent commits</h3>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Similar tabs for other activity types */}
        <TabsContent value="pr" className="space-y-4">
          {activityByType.pr.length > 0 ? (
            <div className="space-y-3">
              {activityByType.pr.map((item: ActivityItem) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <GitPullRequest className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">{item.title}</h3>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <GitPullRequest className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No recent pull requests</h3>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="issue" className="space-y-4">
          {activityByType.issue.length > 0 ? (
            <div className="space-y-3">
              {activityByType.issue.map((item: ActivityItem) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <MessageSquare className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">{item.title}</h3>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No recent issues</h3>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="file" className="space-y-4">
          {activityByType.file.length > 0 ? (
            <div className="space-y-3">
              {activityByType.file.map((item: ActivityItem) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <FileCode className="h-5 w-5 text-purple-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">{item.title}</h3>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        {item.metadata?.file && (
                          <div className="flex items-center space-x-2 mt-2">
                            <FileCode className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600">{item.metadata.file}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileCode className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No recent file changes</h3>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="collaborator" className="space-y-4">
          {activityByType.collaborator.length > 0 ? (
            <div className="space-y-3">
              {activityByType.collaborator.map((item: ActivityItem) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Users className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">{item.title}</h3>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No recent collaborator activity</h3>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          {activityByType.deployment.length > 0 ? (
            <div className="space-y-3">
              {activityByType.deployment.map((item: ActivityItem) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Star className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">{item.title}</h3>
                          <div className="flex items-center space-x-2">
                            {item.metadata?.status && (
                              <Badge className={getStatusColor(item.metadata.status)}>
                                {item.metadata.status}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(item.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Star className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No recent deployments</h3>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}