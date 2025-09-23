'use client'

import { useState } from 'react'
import { useProjectFiles, useUploadFile } from '@/hooks/api/use-projects-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  File, 
  Folder, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  Eye,
  Code,
  Image,
  FileText,
  Music,
  Film,
  Archive,
  FileCode,
  Plus
} from 'lucide-react'

interface ProjectFilesProps {
  projectId: string
}

interface FileItem {
  id: string
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  lastModified: string
  language?: string
  content?: string
}

interface FileNode {
  id: string
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  lastModified: string
  language?: string
  children?: FileNode[]
}

export function ProjectFiles({ projectId }: ProjectFilesProps) {
  const { data: files, isLoading, refetch } = useProjectFiles(projectId)
  const uploadFile = useUploadFile()
  const [currentPath, setCurrentPath] = useState('')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadFileInput, setUploadFileInput] = useState<File | null>(null)

  const getFileIcon = (fileName: string, type: string) => {
    if (type === 'directory') return <Folder className="h-5 w-5 text-blue-500" />
    
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return <Code className="h-5 w-5 text-yellow-500" />
      case 'py':
        return <FileCode className="h-5 w-5 text-blue-500" />
      case 'md':
      case 'txt':
        return <FileText className="h-5 w-5 text-gray-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-5 w-5 text-purple-500" />
      case 'mp3':
      case 'wav':
        return <Music className="h-5 w-5 text-green-500" />
      case 'mp4':
      case 'avi':
        return <Film className="h-5 w-5 text-red-500" />
      case 'zip':
      case 'tar':
      case 'gz':
        return <Archive className="h-5 w-5 text-orange-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFileUpload = async () => {
    if (!uploadFileInput) return

    try {
      await uploadFile.mutateAsync({
        projectId,
        file: uploadFileInput,
        path: currentPath
      })
      setUploadFileInput(null)
      setShowUploadDialog(false)
      refetch()
    } catch (err) {
      console.error('Failed to upload file:', err)
    }
  }

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file)
  }

  const buildFileTree = (files: FileItem[]): FileNode[] => {
    const tree: FileNode[] = []
    const pathMap: Record<string, FileNode> = {}

    // Create root nodes
    files.forEach(file => {
      const pathParts = file.path.split('/').filter(Boolean)
      const fileName = pathParts[pathParts.length - 1]
      
      if (!pathMap[file.path]) {
        pathMap[file.path] = {
          id: file.id,
          name: fileName,
          path: file.path,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          language: file.language,
          children: []
        }
      }
    })

    // Build hierarchy
    Object.values(pathMap).forEach(node => {
      const pathParts = node.path.split('/').filter(Boolean)
      const parentPath = pathParts.slice(0, -1).join('/')
      
      if (parentPath && pathMap[parentPath]) {
        if (!pathMap[parentPath].children) {
          pathMap[parentPath].children = []
        }
        pathMap[parentPath].children!.push(node)
      } else {
        tree.push(node)
      }
    })

    return tree
  }

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.id} className="space-y-1">
        <div 
          className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer ${
            selectedFile?.id === node.id ? 'bg-blue-50' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => handleFileClick({
            id: node.id,
            name: node.name,
            path: node.path,
            type: node.type,
            size: node.size,
            lastModified: node.lastModified,
            language: node.language
          })}
        >
          {getFileIcon(node.name, node.type)}
          <span className="flex-1 text-sm">{node.name}</span>
          {node.size && (
            <span className="text-xs text-gray-500">{formatFileSize(node.size)}</span>
          )}
          <Badge variant="outline" className="text-xs">
            {node.language || node.type}
          </Badge>
        </div>
        {node.children && renderFileTree(node.children, level + 1)}
      </div>
    ))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const fileTree = files ? buildFileTree(files) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <File className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Project Files</h2>
            <p className="text-gray-600">
              Browse and manage your project files
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <Download className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Upload a new file to {currentPath || 'project root'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="file"
                    onChange={(e) => setUploadFileInput(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleFileUpload} disabled={!uploadFileInput || uploadFile.isPending}>
                    {uploadFile.isPending ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Project Root</span>
        {currentPath.split('/').filter(Boolean).map((part, index) => (
          <React.Fragment key={index}>
            <span>/</span>
            <span className="text-blue-600">{part}</span>
          </React.Fragment>
        ))}
      </div>

      {/* File Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Browser */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">File Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                {fileTree.length > 0 ? (
                  renderFileTree(fileTree)
                ) : (
                  <div className="text-center py-8">
                    <File className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No files found</h3>
                    <p className="mt-2 text-gray-600">
                      Upload files or create directories to get started.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File Details */}
        <div className="space-y-4">
          {selectedFile ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">File Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon(selectedFile.name, selectedFile.type)}
                  <div>
                    <h3 className="font-medium">{selectedFile.name}</h3>
                    <p className="text-sm text-gray-600">{selectedFile.type}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Path:</span>
                    <span className="font-mono text-xs">{selectedFile.path}</span>
                  </div>
                  {selectedFile.size && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span>{formatFileSize(selectedFile.size)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modified:</span>
                    <span>{new Date(selectedFile.lastModified).toLocaleDateString()}</span>
                  </div>
                  {selectedFile.language && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <Badge variant="outline">{selectedFile.language}</Badge>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <File className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Select a file</h3>
                  <p className="mt-2 text-gray-600">
                    Click on a file in the tree to view its details.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                New File
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Folder className="mr-2 h-4 w-4" />
                New Directory
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Add React import at the top
import React from 'react'