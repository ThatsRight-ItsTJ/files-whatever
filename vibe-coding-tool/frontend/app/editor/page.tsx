'use client'

import { useState, useEffect } from 'react'
import { EditorLayout } from '@/components/editor/editor-layout'
import { EditorToolbar } from '@/components/editor/editor-toolbar'
import { MonacoEditor } from '@/components/editor/monaco-editor'
import { FileExplorer } from '@/components/editor/file-explorer'
import { AIAssistantPanel } from '@/components/editor/ai-assistant-panel'
import { GitDiffViewer } from '@/components/editor/git-diff-viewer'
import { StatusBar } from '@/components/editor/status-bar'

// Mock data for demonstration
const mockProject = {
  id: '1',
  name: 'vibe-coding-tool',
  description: 'AI-powered coding assistant with MCP integration',
  status: 'active',
  type: 'web',
  language: 'TypeScript',
  repositoryUrl: 'https://github.com/user/vibe-coding-tool',
  isPrivate: false
}

const mockFiles = [
  {
    name: 'src',
    path: 'src',
    type: 'directory',
    children: [
      {
        name: 'components',
        path: 'src/components',
        type: 'directory',
        children: [
          {
            name: 'editor',
            path: 'src/components/editor',
            type: 'directory',
            children: [
              {
                name: 'monaco-editor.tsx',
                path: 'src/components/editor/monaco-editor.tsx',
                type: 'file',
                language: 'typescript',
                size: 15420,
                lastModified: '2024-01-15T10:30:00Z'
              },
              {
                name: 'file-explorer.tsx',
                path: 'src/components/editor/file-explorer.tsx',
                type: 'file',
                language: 'typescript',
                size: 8765,
                lastModified: '2024-01-15T09:45:00Z'
              }
            ]
          }
        ]
      },
      {
        name: 'app',
        path: 'src/app',
        type: 'directory',
        children: [
          {
            name: 'editor',
            path: 'src/app/editor',
            type: 'directory',
            children: [
              {
                name: 'page.tsx',
                path: 'src/app/editor/page.tsx',
                type: 'file',
                language: 'typescript',
                size: 3456,
                lastModified: '2024-01-15T11:00:00Z'
              }
            ]
          }
        ]
      },
      {
        name: 'lib',
        path: 'src/lib',
        type: 'directory',
        children: [
          {
            name: 'stores',
            path: 'src/lib/stores',
            type: 'directory',
            children: [
              {
                name: 'project-store.ts',
                path: 'src/lib/stores/project-store.ts',
                type: 'file',
                language: 'typescript',
                size: 5678,
                lastModified: '2024-01-14T16:20:00Z'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'package.json',
    path: 'package.json',
    type: 'file',
    language: 'json',
    size: 1234,
    lastModified: '2024-01-10T14:30:00Z'
  },
  {
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    language: 'markdown',
    size: 2345,
    lastModified: '2024-01-08T09:15:00Z'
  }
]

const mockFileContent = `import { useState, useRef, useEffect } from 'react'
import * as monaco from 'monaco-editor'
import { Editor } from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MonacoEditorProps {
  value?: string
  language?: string
  theme?: 'vs-dark' | 'light'
  onChange?: (value: string | undefined) => void
  onSave?: () => void
  className?: string
}

export function MonacoEditor({
  value = '// Start coding here...',
  language = 'typescript',
  theme = 'vs-dark',
  onChange,
  onSave,
  className
}: MonacoEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      selectOnLineNumbers: true,
      matchBrackets: 'always',
      autoIndent: 'advanced',
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      }
    })

    // Set up model
    const model = editor.getModel()
    if (model) {
      model.onDidChangeContent(() => {
        setIsDirty(true)
        onChange?.(model.getValue())
      })
    }
  }

  const handleSave = async () => {
    if (!onSave) return
    
    setIsSaving(true)
    try {
      await onSave()
      setIsDirty(false)
    } finally {
      setIsSaving(false)
    }
  }

  const formatCode = () => {
    const editor = editorRef.current
    if (!editor) return
    
    const model = editor.getModel()
    if (!model) return
    
    const action = editor.getAction('editor.action.formatDocument')
    action?.run()
  }

  const toggleTheme = () => {
    const editor = editorRef.current
    if (!editor) return
    
    const currentTheme = editor.getOption(monaco.editor.EditorOption.theme)
    const newTheme = currentTheme === 'vs-dark' ? 'light' : 'vs-dark'
    editor.updateOptions({ theme: newTheme })
  }

  return (
    <div className={className}>
      {/* Editor Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant="outline">{language}</Badge>
          {isDirty && (
            <Badge variant="secondary" className="bg-yellow-500 text-white">
              Unsaved
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={formatCode}
            className="text-gray-400 hover:text-white"
          >
            Format
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-gray-400 hover:text-white"
          >
            Theme
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="h-full">
        <Editor
          height="100%"
          language={language}
          theme={theme}
          value={value}
          onMount={handleEditorDidMount}
          options={{
            readOnly: false,
            domReadOnly: false,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8
            }
          }}
        />
      </div>
    </div>
  )
}`

export default function EditorPage() {
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePanel, setActivePanel] = useState<'explorer' | 'search' | 'git' | 'ai' | 'terminal' | 'settings'>('explorer')
  const [showAI, setShowAI] = useState(false)
  const [showGitDiff, setShowGitDiff] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)

  const handleFileSelect = (filePath: string) => {
    setActiveFile(filePath)
  }

  const handleSave = () => {
    console.log('Saving file...')
    // Implement save logic
  }

  const handleRun = () => {
    console.log('Running code...')
    // Implement run logic
  }

  const handleGitCommit = () => {
    console.log('Committing changes...')
    // Implement git commit logic
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleToggleAI = () => {
    setShowAI(!showAI)
    setActivePanel('ai')
  }

  const handleToggleGitDiff = () => {
    setShowGitDiff(!showGitDiff)
    setActivePanel('git')
  }

  const handleToggleTerminal = () => {
    setShowTerminal(!showTerminal)
    setActivePanel('terminal')
  }

  const gitStatus = {
    branch: 'main',
    status: 'dirty' as const,
    ahead: 2,
    behind: 1,
    lastCommit: 'feat: Add Monaco Editor integration'
  }

  const activeFileData = activeFile 
    ? mockFiles.find(f => f.path === activeFile) || null
    : null

  return (
    <EditorLayout
      sidebarOpen={sidebarOpen}
      onSidebarToggle={handleToggleSidebar}
      activePanel={activePanel}
      onPanelChange={setActivePanel}
    >
      {/* Editor Toolbar */}
      <EditorToolbar
        project={mockProject}
        activeFile={activeFileData}
        onSave={handleSave}
        onRun={handleRun}
        onGitCommit={handleGitCommit}
        onToggleSidebar={handleToggleSidebar}
        onToggleAI={handleToggleAI}
        onToggleGitDiff={handleToggleGitDiff}
        onToggleTerminal={handleToggleTerminal}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        {sidebarOpen && activePanel === 'explorer' && (
          <div className="w-64 bg-gray-800 border-r border-gray-700">
            <FileExplorer
              files={mockFiles}
              activeFile={activeFile}
              onFileSelect={handleFileSelect}
              className="h-full"
            />
          </div>
        )}

        {/* Center - Editor */}
        <div className="flex-1 flex flex-col">
          <MonacoEditor
            value={mockFileContent}
            language="typescript"
            onChange={(value) => console.log('Content changed:', value)}
            onSave={handleSave}
            className="flex-1"
          />
        </div>

        {/* Right Sidebar - AI Assistant */}
        {showAI && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <AIAssistantPanel
              filePath={activeFile}
              language={activeFileData?.language}
            />
          </div>
        )}

        {/* Right Sidebar - Git Diff */}
        {showGitDiff && (
          <div className="w-96 bg-gray-800 border-l border-gray-700">
            <GitDiffViewer />
          </div>
        )}

        {/* Right Sidebar - Terminal */}
        {showTerminal && (
          <div className="w-96 bg-gray-800 border-l border-gray-700">
            <div className="h-full bg-black text-green-400 p-4 font-mono text-sm">
              <div className="mb-2">$ npm run dev</div>
              <div className="mb-2">vibe-coding-tool@1.0.0 dev</div>
              <div className="mb-2">next dev</div>
              <div className="mb-2">ready started server on 0.0.0.0:3000, url: http://localhost:3000</div>
              <div className="mb-2">event compiled successfully</div>
              <div className="mb-2">wait  - compiling...</div>
              <div className="mb-2">event compiled successfully in 1.2s (123 modules)</div>
              <div className="mb-2">wait  - compiling...</div>
              <div className="mb-2">event compiled successfully in 0.8s (456 modules)</div>
              <div className="mb-2">[1] waiting for file changes...</div>
              <div className="animate-pulse">_</div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar
        project={mockProject}
        activeFile={activeFileData}
        gitStatus={gitStatus}
      />
    </EditorLayout>
  )
}