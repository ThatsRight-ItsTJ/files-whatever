'use client'

import { useState } from 'react'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  GitBranch, 
  GitCommit, 
  User,
  FileText,
  Code,
  Settings,
  Wifi,
  WifiOff,
  Battery,
  BatteryFull,
  Clock,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface StatusBarProps {
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
  gitStatus: {
    branch: string
    status: 'clean' | 'dirty' | 'conflicted'
    ahead?: number
    behind?: number
    lastCommit?: string
  }
}

export function StatusBar({
  project,
  activeFile,
  gitStatus
}: StatusBarProps) {
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [showWhitespace, setShowWhitespace] = useState(false)
  const [encoding, setEncoding] = useState('UTF-8')
  const [lineEnding, setLineEnding] = useState('LF')

  const getGitStatusColor = (status: string) => {
    switch (status) {
      case 'clean': return 'bg-green-100 text-green-800'
      case 'dirty': return 'bg-yellow-100 text-yellow-800'
      case 'conflicted': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getGitStatusIcon = (status: string) => {
    switch (status) {
      case 'clean': return <CheckCircle className="h-3 w-3" />
      case 'dirty': return <AlertCircle className="h-3 w-3" />
      case 'conflicted': return <XCircle className="h-3 w-3" />
      default: return <GitBranch className="h-3 w-3" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-1 flex items-center justify-between text-xs text-gray-400">
      {/* Left Section - File and Project Info */}
      <div className="flex items-center space-x-4">
        {/* File Info */}
        {activeFile && (
          <>
            <div className="flex items-center space-x-2">
              <FileText className="h-3 w-3" />
              <span>{activeFile.name}</span>
              {activeFile.language && (
                <Badge variant="outline" className="text-xs">
                  {activeFile.language}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <span>{formatFileSize(activeFile.size)}</span>
              {activeFile.lastModified && (
                <span>{new Date(activeFile.lastModified).toLocaleDateString()}</span>
              )}
            </div>
          </>
        )}

        <div className="w-px h-4 bg-gray-600" />

        {/* Project Info */}
        <div className="flex items-center space-x-2">
          <span>{project.name}</span>
          <Badge variant="outline" className="text-xs">
            {project.language}
          </Badge>
        </div>
      </div>

      {/* Center Section - Git Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {getGitStatusIcon(gitStatus.status)}
          <Badge className={getGitStatusColor(gitStatus.status)} className="text-xs">
            {gitStatus.branch}
          </Badge>
          {gitStatus.ahead && gitStatus.ahead > 0 && (
            <span className="text-green-400">+{gitStatus.ahead}</span>
          )}
          {gitStatus.behind && gitStatus.behind > 0 && (
            <span className="text-red-400">-{gitStatus.behind}</span>
          )}
        </div>
        {gitStatus.lastCommit && (
          <span className="text-gray-500 max-w-xs truncate">
            {gitStatus.lastCommit}
          </span>
        )}
      </div>

      {/* Right Section - Editor Settings and Status */}
      <div className="flex items-center space-x-4">
        {/* Editor Settings */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`text-xs ${showLineNumbers ? 'text-blue-400' : 'text-gray-500'}`}
          >
            Ln {showLineNumbers ? 'On' : 'Off'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWhitespace(!showWhitespace)}
            className={`text-xs ${showWhitespace ? 'text-blue-400' : 'text-gray-500'}`}
          >
            {showWhitespace ? 'WS: On' : 'WS: Off'}
          </Button>
          <div className="flex items-center space-x-1">
            <span>Enc:</span>
            <select
              value={encoding}
              onChange={(e) => setEncoding(e.target.value)}
              className="bg-gray-700 text-white text-xs border border-gray-600 rounded px-1 py-0.5"
            >
              <option value="UTF-8">UTF-8</option>
              <option value="UTF-16">UTF-16</option>
              <option value="ISO-8859-1">ISO-8859-1</option>
            </select>
          </div>
          <div className="flex items-center space-x-1">
            <span>LE:</span>
            <select
              value={lineEnding}
              onChange={(e) => setLineEnding(e.target.value)}
              className="bg-gray-700 text-white text-xs border border-gray-600 rounded px-1 py-0.5"
            >
              <option value="LF">LF</option>
              <option value="CRLF">CRLF</option>
            </select>
          </div>
        </div>

        <div className="w-px h-4 bg-gray-600" />

        {/* System Status */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Wifi className="h-3 w-3 text-green-400" />
            <span>Online</span>
          </div>
          <div className="flex items-center space-x-1">
            <BatteryFull className="h-3 w-3 text-green-400" />
            <span>100%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>12:34 PM</span>
          </div>
        </div>

        <div className="w-px h-4 bg-gray-600" />

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}