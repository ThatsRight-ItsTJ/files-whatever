'use client'

import { useState } from 'react'
import { 
  Plus, 
  X, 
  Upload, 
  FileText, 
  Code, 
  Database, 
  GitBranch,
  Settings,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Copy,
  Download,
  Filter,
  Search,
  Tag,
  Calendar,
  User,
  Folder,
  Link
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ContextItem {
  id: string
  type: 'file' | 'directory' | 'repository' | 'snippet' | 'variable'
  name: string
  path: string
  content?: string
  size?: number
  language?: string
  lastModified?: Date
  tags: string[]
  selected: boolean
  importance: 'low' | 'medium' | 'high'
}

interface ContextBuilderProps {
  initialContext?: ContextItem[]
  onContextChange?: (context: ContextItem[]) => void
  onSaveContext?: (context: ContextItem[]) => void
  className?: string
}

export function ContextBuilder({ 
  initialContext = [], 
  onContextChange, 
  onSaveContext,
  className 
}: ContextBuilderProps) {
  const [contextItems, setContextItems] = useState<ContextItem[]>(initialContext)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [newTag, setNewTag] = useState('')

  // Mock available files and directories
  const availableItems: ContextItem[] = [
    {
      id: '1',
      type: 'file',
      name: 'src/components/editor/monaco-editor.tsx',
      path: 'src/components/editor/monaco-editor.tsx',
      language: 'typescript',
      size: 15420,
      lastModified: new Date('2024-01-15T10:30:00Z'),
      tags: ['editor', 'monaco', 'typescript'],
      selected: false,
      importance: 'high'
    },
    {
      id: '2',
      type: 'file',
      name: 'src/app/editor/page.tsx',
      path: 'src/app/editor/page.tsx',
      language: 'typescript',
      size: 3456,
      lastModified: new Date('2024-01-15T11:00:00Z'),
      tags: ['editor', 'page', 'typescript'],
      selected: false,
      importance: 'medium'
    },
    {
      id: '3',
      type: 'directory',
      name: 'src/lib',
      path: 'src/lib',
      tags: ['library', 'utils'],
      selected: false,
      importance: 'medium'
    },
    {
      id: '4',
      type: 'file',
      name: 'package.json',
      path: 'package.json',
      language: 'json',
      size: 1234,
      lastModified: new Date('2024-01-10T14:30:00Z'),
      tags: ['config', 'dependencies'],
      selected: false,
      importance: 'low'
    },
    {
      id: '5',
      type: 'repository',
      name: 'vibe-coding-tool',
      path: 'https://github.com/user/vibe-coding-tool',
      tags: ['repository', 'github'],
      selected: false,
      importance: 'high'
    },
    {
      id: '6',
      type: 'snippet',
      name: 'React Hook - useState',
      path: 'snippets/react-usestate.ts',
      content: 'const [state, setState] = useState(initialValue)',
      language: 'typescript',
      tags: ['react', 'hook', 'state'],
      selected: false,
      importance: 'medium'
    }
  ]

  const types = [
    { id: 'all', name: 'All', icon: FileText },
    { id: 'file', name: 'Files', icon: FileText },
    { id: 'directory', name: 'Directories', icon: Folder },
    { id: 'repository', name: 'Repositories', icon: GitBranch },
    { id: 'snippet', name: 'Snippets', icon: Code },
    { id: 'variable', name: 'Variables', icon: Database }
  ]

  const importanceColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }

  const filteredItems = availableItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = selectedType === 'all' || item.type === selectedType

    return matchesSearch && matchesType
  })

  const handleToggleItem = (itemId: string) => {
    const updatedItems = contextItems.map(item =>
      item.id === itemId ? { ...item, selected: !item.selected } : item
    )
    setContextItems(updatedItems)
    onContextChange?.(updatedItems)
  }

  const handleAddItem = (item: ContextItem) => {
    const updatedItems = [...contextItems, { ...item, selected: true }]
    setContextItems(updatedItems)
    onContextChange?.(updatedItems)
  }

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = contextItems.filter(item => item.id !== itemId)
    setContextItems(updatedItems)
    onContextChange?.(updatedItems)
  }

  const handleImportanceChange = (itemId: string, importance: 'low' | 'medium' | 'high') => {
    const updatedItems = contextItems.map(item =>
      item.id === itemId ? { ...item, importance } : item
    )
    setContextItems(updatedItems)
    onContextChange?.(updatedItems)
  }

  const handleAddTag = (itemId: string, tag: string) => {
    if (!tag.trim()) return
    
    const updatedItems = contextItems.map(item =>
      item.id === itemId
        ? { ...item, tags: [...item.tags, tag.trim()] }
        : item
    )
    setContextItems(updatedItems)
    onContextChange?.(updatedItems)
    setNewTag('')
  }

  const handleRemoveTag = (itemId: string, tagToRemove: string) => {
    const updatedItems = contextItems.map(item =>
      item.id === itemId
        ? { ...item, tags: item.tags.filter(tag => tag !== tagToRemove) }
        : item
    )
    setContextItems(updatedItems)
    onContextChange?.(updatedItems)
  }

  const handleSaveContext = () => {
    onSaveContext?.(contextItems)
  }

  const handleClearContext = () => {
    setContextItems([])
    onContextChange?.([])
  }

  const handleCopyContext = () => {
    const contextData = contextItems.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type,
      importance: item.importance,
      tags: item.tags
    }))
    
    navigator.clipboard.writeText(JSON.stringify(contextData, null, 2))
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date?: Date) => {
    if (!date) return ''
    return date.toLocaleDateString()
  }

  return (
    <div className={`flex flex-col h-full bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-400" />
            <h3 className="text-white font-medium">Context Builder</h3>
            <Badge variant="outline" className="text-xs">
              {contextItems.length} items
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-gray-400 hover:text-white"
            >
              {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyContext}
              className="text-gray-400 hover:text-white"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearContext}
              className="text-gray-400 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSaveContext}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files, directories, and snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 pl-10"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm"
          >
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Tabs defaultValue="selected" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 bg-gray-700 border-b border-gray-600">
          <TabsTrigger value="selected" className="text-xs">
            Selected Context ({contextItems.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="text-xs">
            Available Items ({filteredItems.length})
          </TabsTrigger>
        </TabsList>

        {/* Selected Context */}
        <TabsContent value="selected" className="flex-1 overflow-y-auto p-4">
          {contextItems.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No context items selected</p>
                <p className="text-sm">Add files, directories, or snippets to build your context</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {contextItems.map((item) => (
                <Card key={item.id} className="bg-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Item Icon */}
                        <div className="p-2 bg-gray-600 rounded-lg">
                          {item.type === 'file' && <FileText className="h-4 w-4 text-white" />}
                          {item.type === 'directory' && <Folder className="h-4 w-4 text-white" />}
                          {item.type === 'repository' && <GitBranch className="h-4 w-4 text-white" />}
                          {item.type === 'snippet' && <Code className="h-4 w-4 text-white" />}
                          {item.type === 'variable' && <Database className="h-4 w-4 text-white" />}
                        </div>

                        {/* Item Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-medium">{item.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                            <Badge className={importanceColors[item.importance]} className="text-xs">
                              {item.importance}
                            </Badge>
                          </div>

                          <p className="text-gray-400 text-sm mb-2">{item.path}</p>

                          {item.language && (
                            <Badge variant="secondary" className="text-xs mb-2">
                              {item.language}
                            </Badge>
                          )}

                          {item.size && (
                            <p className="text-xs text-gray-500 mb-2">
                              Size: {formatFileSize(item.size)}
                            </p>
                          )}

                          {item.lastModified && (
                            <p className="text-xs text-gray-500 mb-2">
                              Modified: {formatDate(item.lastModified)}
                            </p>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.tags.map((tag) => (
                              <div key={tag} className="flex items-center space-x-1 bg-gray-600 rounded px-2 py-1">
                                <Tag className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-300">{tag}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 text-gray-400 hover:text-white"
                                  onClick={() => handleRemoveTag(item.id, tag)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            
                            {showAdvanced && (
                              <div className="flex items-center space-x-1">
                                <Input
                                  placeholder="Add tag..."
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddTag(item.id, newTag)
                                    }
                                  }}
                                  className="h-6 text-xs bg-gray-600 border-gray-500"
                                />
                                <Button
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleAddTag(item.id, newTag)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {showAdvanced && (
                          <select
                            value={item.importance}
                            onChange={(e) => handleImportanceChange(item.id, e.target.value as any)}
                            className="bg-gray-600 text-white text-xs border border-gray-500 rounded px-2 py-1"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Available Items */}
        <TabsContent value="available" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all hover:scale-[1.02] ${
                  contextItems.find(c => c.id === item.id)?.selected 
                    ? 'ring-2 ring-blue-500 bg-gray-700' 
                    : 'bg-gray-700/50 hover:bg-gray-700'
                }`}
                onClick={() => handleAddItem(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Item Icon */}
                      <div className="p-2 bg-gray-600 rounded-lg">
                        {item.type === 'file' && <FileText className="h-4 w-4 text-white" />}
                        {item.type === 'directory' && <Folder className="h-4 w-4 text-white" />}
                        {item.type === 'repository' && <GitBranch className="h-4 w-4 text-white" />}
                        {item.type === 'snippet' && <Code className="h-4 w-4 text-white" />}
                        {item.type === 'variable' && <Database className="h-4 w-4 text-white" />}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-white font-medium">{item.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>

                        <p className="text-gray-400 text-sm mb-2">{item.path}</p>

                        {item.language && (
                          <Badge variant="secondary" className="text-xs mb-2">
                            {item.language}
                          </Badge>
                        )}

                        {item.size && (
                          <p className="text-xs text-gray-500 mb-2">
                            Size: {formatFileSize(item.size)}
                          </p>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add Button */}
                    <Button
                      size="sm"
                      className="ml-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddItem(item)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No items found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}