'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Save, 
  GitBranch, 
  GitCommit, 
  GitPull, 
  GitPush,
  Settings,
  Terminal,
  FileText,
  Code,
  GitCompare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RotateCw,
  Search,
  FilePlus,
  FolderPlus,
  Trash2,
  Copy,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react'

interface EditorToolbarProps {
  project: {
    id: string
    name: string
    description?: string
    status: string
    type: string
    language: string
    repositoryUrl?: string
    isPrivate: boolean
  }
  activeFile: {
    name: string
    path: string
    language?: string
    size?: number
    lastModified?: string
  } | null
  onSave: () => void
  onRun: () => void
  onGitCommit: () => void
  onToggleSidebar: () => void
  onToggleAI: () => void
  onToggleGitDiff: () => void
  onToggleTerminal: () => void
}

export function EditorToolbar({
  project,
  activeFile,
  onSave,
  onRun,
  onGitCommit,
  onToggleSidebar,
  onToggleAI,
  onToggleGitDiff,
  onToggleTerminal
}: EditorToolbarProps) {
  const [isRunning, setIsRunning] = useState(false)

  const handleRun = async () => {
    setIsRunning(true)
    try {
      await onRun()
    } finally {
      setIsRunning(false)
    }
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-100 text-yellow-800',
      typescript: 'bg-blue-100 text-blue-800',
      python: 'bg-green-100 text-green-800',
      java: 'bg-red-100 text-red-800',
      go: 'bg-cyan-100 text-cyan-800',
      rust: 'bg-orange-100 text-orange-800',
    }
    return colors[language] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
      {/* Left Section - Project and File Info */}
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="text-gray-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Project Info */}
        <div className="flex items-center space-x-2">
          <div>
            <h2 className="text-white font-medium text-sm">{project.name}</h2>
            <p className="text-gray-400 text-xs">{project.description}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {project.language}
          </Badge>
        </div>

        {/* Active File Info */}
        {activeFile && (
          <div className="flex items-center space-x-2 border-l border-gray-600 pl-4">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300 text-sm truncate max-w-xs">
              {activeFile.name}
            </span>
            {activeFile.language && (
              <Badge className={getLanguageColor(activeFile.language)} className="text-xs">
                {activeFile.language}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Center Section - Editor Actions */}
      <div className="flex items-center space-x-1">
        {/* File Operations */}
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <FilePlus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <FolderPlus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Search className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Editor Actions */}
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Upload className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Save */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className="text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <Save className="h-4 w-4" />
        </Button>

        {/* Run */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRun}
          disabled={isRunning}
          className="text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {isRunning ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Git Operations */}
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <GitPull className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <GitPush className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onGitCommit} className="text-gray-400 hover:text-white">
          <GitCommit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <GitCompare className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Section - View and Tool Panels */}
      <div className="flex items-center space-x-1">
        {/* View Options */}
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <EyeOff className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Tool Panels */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleAI}
          className="text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleGitDiff}
          className="text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <GitBranch className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleTerminal}
          className="text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <Terminal className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Settings */}
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}