'use client'

import { useState } from 'react'
import { Folder, FolderOpen, File, FileText, Code, Image, FileIcon } from 'lucide-react'

interface FileItem {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileItem[]
  language?: string
  size?: number
  lastModified?: string
}

interface FileExplorerProps {
  files: FileItem[]
  activeFile: string | null
  onFileSelect: (filePath: string) => void
  className?: string
}

const getFileIcon = (fileName: string, language?: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  if (language === 'javascript' || extension === 'js') {
    return <Code className="h-4 w-4 text-yellow-500" />
  }
  if (language === 'typescript' || extension === 'ts') {
    return <Code className="h-4 w-4 text-blue-500" />
  }
  if (language === 'python' || extension === 'py') {
    return <Code className="h-4 w-4 text-green-500" />
  }
  if (language === 'json' || extension === 'json') {
    return <FileText className="h-4 w-4 text-orange-500" />
  }
  if (extension === 'md' || extension === 'markdown') {
    return <FileText className="h-4 w-4 text-gray-500" />
  }
  if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'gif') {
    return <Image className="h-4 w-4 text-purple-500" />
  }
  if (extension === 'svg') {
    return <Image className="h-4 w-4 text-pink-500" />
  }
  
  return <FileIcon className="h-4 w-4 text-gray-400" />
}

const FileTreeItem = ({ 
  file, 
  activeFile, 
  onFileSelect, 
  level = 0 
}: { 
  file: FileItem
  activeFile: string | null
  onFileSelect: (filePath: string) => void
  level?: number
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isActive = activeFile === file.path
  const hasChildren = file.type === 'directory' && file.children && file.children.length > 0

  const handleClick = () => {
    if (file.type === 'directory') {
      setIsExpanded(!isExpanded)
    } else {
      onFileSelect(file.path)
    }
  }

  return (
    <div className="select-none">
      <div
        className={`flex items-center space-x-1 py-1 px-2 rounded cursor-pointer hover:bg-gray-700 transition-colors ${
          isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {file.type === 'directory' ? (
          hasChildren ? (
            <FolderOpen className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )
        ) : (
          getFileIcon(file.name, file.language)
        )}
        <span className="text-sm truncate flex-1">{file.name}</span>
        {file.type === 'file' && file.size && (
          <span className="text-xs text-gray-500">
            {(file.size / 1024).toFixed(1)}KB
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-2">
          {file.children?.map((child) => (
            <FileTreeItem
              key={child.path}
              file={child}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileExplorer({ files, activeFile, onFileSelect, className }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const handleFileSelect = (filePath: string) => {
    onFileSelect(filePath)
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300">Explorer</h3>
      </div>

      {/* File Tree */}
      <div className="p-2 space-y-1">
        {files.map((file) => (
          <FileTreeItem
            key={file.path}
            file={file}
            activeFile={activeFile}
            onFileSelect={handleFileSelect}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700">
        <div className="flex space-x-2">
          <button className="text-xs text-gray-400 hover:text-gray-300">
            New File
          </button>
          <button className="text-xs text-gray-400 hover:text-gray-300">
            New Folder
          </button>
          <button className="text-xs text-gray-400 hover:text-gray-300">
            Search
          </button>
        </div>
      </div>
    </div>
  )
}