'use client'

import { useState } from 'react'
import { 
  GitCommit, 
  GitBranch, 
  GitPull, 
  GitPush, 
  FileText, 
  Plus, 
  Minus, 
  ArrowRight,
  Check,
  X,
  RotateCcw,
  RotateCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DiffFile {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  additions: number
  deletions: number
  changes: number
  oldPath?: string
  hunks: DiffHunk[]
}

interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: DiffLine[]
}

interface DiffLine {
  type: 'context' | 'added' | 'deleted' | 'modified'
  content: string
  lineNumber?: number
}

export function GitDiffViewer() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [showWhitespace, setShowWhitespace] = useState(false)

  // Mock diff data
  const diffFiles: DiffFile[] = [
    {
      path: 'src/components/editor/monaco-editor.tsx',
      status: 'modified',
      additions: 15,
      deletions: 8,
      changes: 23,
      hunks: [
        {
          oldStart: 45,
          oldLines: 3,
          newStart: 45,
          newLines: 5,
          lines: [
            { type: 'context', content: '  const handleSave = async () => {' },
            { type: 'deleted', content: '    if (!onSave) return' },
            { type: 'added', content: '    if (!onSave) {' },
            { type: 'added', content: '      console.warn("No save handler provided")' },
            { type: 'added', content: '      return' },
            { type: 'added', content: '    }' },
            { type: 'context', content: '      setIsSaving(true)' }
          ]
        }
      ]
    },
    {
      path: 'src/components/editor/file-explorer.tsx',
      status: 'modified',
      additions: 12,
      deletions: 5,
      changes: 17,
      hunks: []
    },
    {
      path: 'src/hooks/api/use-projects-api.ts',
      status: 'added',
      additions: 25,
      deletions: 0,
      changes: 25,
      hunks: []
    },
    {
      path: 'src/utils/helpers.ts',
      status: 'deleted',
      additions: 0,
      deletions: 18,
      changes: 18,
      hunks: []
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added': return 'bg-green-100 text-green-800'
      case 'modified': return 'bg-blue-100 text-blue-800'
      case 'deleted': return 'bg-red-100 text-red-800'
      case 'renamed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added': return <Plus className="h-3 w-3" />
      case 'modified': return <FileText className="h-3 w-3" />
      case 'deleted': return <Minus className="h-3 w-3" />
      case 'renamed': return <ArrowRight className="h-3 w-3" />
      default: return <FileText className="h-3 w-3" />
    }
  }

  const renderDiffLine = (line: DiffLine) => {
    const baseClasses = 'font-mono text-sm whitespace-pre'
    
    switch (line.type) {
      case 'added':
        return (
          <div className={`${baseClasses} bg-green-900/20 border-l-4 border-green-500 pl-4`}>
            <span className="text-green-400">+{line.content}</span>
          </div>
        )
      case 'deleted':
        return (
          <div className={`${baseClasses} bg-red-900/20 border-l-4 border-red-500 pl-4`}>
            <span className="text-red-400">-{line.content}</span>
          </div>
        )
      case 'modified':
        return (
          <div className={`${baseClasses} bg-yellow-900/20 border-l-4 border-yellow-500 pl-4`}>
            <span className="text-yellow-400">~{line.content}</span>
          </div>
        )
      default:
        return (
          <div className={`${baseClasses} pl-4`}>
            {line.content}
          </div>
        )
    }
  }

  const selectedFileData = diffFiles.find(f => f.path === selectedFile)

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitCommit className="h-5 w-5 text-blue-400" />
            <h3 className="text-white font-medium">Git Diff</h3>
            <Badge variant="outline" className="text-xs">
              4 files changed
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWhitespace(!showWhitespace)}
              className="text-gray-400 hover:text-white"
            >
              {showWhitespace ? 'Hide' : 'Show'} Whitespace
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File List */}
        <div className="w-64 border-r border-gray-700 overflow-y-auto">
          <div className="p-2 space-y-1">
            {diffFiles.map((file) => (
              <div
                key={file.path}
                className={`p-2 rounded cursor-pointer hover:bg-gray-700 transition-colors ${
                  selectedFile === file.path ? 'bg-blue-600' : ''
                }`}
                onClick={() => setSelectedFile(file.path)}
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status)}
                  <span className="text-sm text-gray-300 truncate flex-1">
                    {file.path}
                  </span>
                  <Badge className={getStatusColor(file.status)} className="text-xs">
                    {file.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>+{file.additions}</span>
                  <span>-{file.deletions}</span>
                  <span className="text-gray-400">{file.changes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diff Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedFileData ? (
            <div className="p-4">
              {/* File Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-white font-medium">{selectedFileData.path}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                    <span className="flex items-center space-x-1">
                      <Plus className="h-3 w-3 text-green-400" />
                      <span>+{selectedFileData.additions}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Minus className="h-3 w-3 text-red-400" />
                      <span>-{selectedFileData.deletions}</span>
                    </span>
                    <span>{selectedFileData.changes} changes</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Check className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button variant="outline" size="sm">
                    <X className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>

              {/* Diff Content */}
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                {selectedFileData.hunks.map((hunk, hunkIndex) => (
                  <div key={hunkIndex} className="border-b border-gray-700 last:border-b-0">
                    {/* Hunk Header */}
                    <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
                      <span className="text-blue-400">@@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@</span>
                    </div>

                    {/* Hunk Lines */}
                    <div className="divide-y divide-gray-800">
                      {hunk.lines.map((line, lineIndex) => (
                        <div key={lineIndex} className="hover:bg-gray-800/50">
                          {line.lineNumber && (
                            <div className="inline-block w-12 text-right text-xs text-gray-500 pr-2 select-none">
                              {line.lineNumber}
                            </div>
                          )}
                          {renderDiffLine(line)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p>Select a file to view diff</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <GitPull className="h-4 w-4 mr-2" />
              Pull Changes
            </Button>
            <Button variant="outline" size="sm">
              <GitPush className="h-4 w-4 mr-2" />
              Push Changes
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
            <Button size="sm">
              Commit Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}