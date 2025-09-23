'use client'

import { ReactNode } from 'react'
import { 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  User,
  Bell,
  Search,
  Code,
  Folder,
  GitBranch,
  Sparkles,
  Terminal,
  FileText,
  BarChart3,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EditorLayoutProps {
  children: ReactNode
  sidebarOpen?: boolean
  onSidebarToggle?: () => void
  activePanel?: 'explorer' | 'search' | 'git' | 'ai' | 'terminal' | 'settings'
  onPanelChange?: (panel: string) => void
}

export function EditorLayout({
  children,
  sidebarOpen = true,
  onSidebarToggle,
  activePanel = 'explorer',
  onPanelChange
}: EditorLayoutProps) {
  const sidebarPanels = [
    { id: 'explorer', name: 'Explorer', icon: Folder, shortcut: 'Ctrl+Shift+E' },
    { id: 'search', name: 'Search', icon: Search, shortcut: 'Ctrl+Shift+F' },
    { id: 'git', name: 'Git', icon: GitBranch, shortcut: 'Ctrl+Shift+G' },
    { id: 'ai', name: 'AI', icon: Sparkles, shortcut: 'Ctrl+Shift+I' },
    { id: 'terminal', name: 'Terminal', icon: Terminal, shortcut: 'Ctrl+`' },
    { id: 'settings', name: 'Settings', icon: Settings, shortcut: 'Ctrl+,' }
  ]

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Top Menu Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-blue-400" />
            <span className="font-medium">Vibe Coding Tool</span>
            <Badge variant="outline" className="text-xs">v1.0.0</Badge>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white font-semibold mb-2">Activity Bar</h2>
            <div className="space-y-1">
              {sidebarPanels.map((panel) => (
                <Button
                  key={panel.id}
                  variant={activePanel === panel.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onPanelChange?.(panel.id)}
                  className="w-full justify-start text-left"
                >
                  <panel.icon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{panel.name}</span>
                  <span className="ml-auto text-xs text-gray-400 opacity-70">
                    {panel.shortcut}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-gray-400 text-xs font-medium mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start text-left text-gray-300 hover:text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm">New File</span>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-left text-gray-300 hover:text-white">
                  <Folder className="h-4 w-4 mr-2" />
                  <span className="text-sm">New Folder</span>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-left text-gray-300 hover:text-white">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span className="text-sm">Open to Side</span>
                </Button>
              </div>
            </div>

            {/* Recent Files */}
            <div className="p-4">
              <h3 className="text-gray-400 text-xs font-medium mb-2">Recent Files</h3>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                  <FileText className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-300 truncate">src/components/editor/monaco-editor.tsx</span>
                </div>
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                  <FileText className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-300 truncate">src/app/editor/page.tsx</span>
                </div>
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                  <FileText className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-300 truncate">src/hooks/api/use-projects-api.ts</span>
                </div>
              </div>
            </div>

            {/* Extensions */}
            <div className="p-4 border-t border-gray-700">
              <h3 className="text-gray-400 text-xs font-medium mb-2">Extensions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                      <Code className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-white">TypeScript</div>
                      <div className="text-xs text-gray-400">v5.0.0</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">installed</Badge>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                      <GitBranch className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-white">GitLens</div>
                      <div className="text-xs text-gray-400">v13.0.0</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Install
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-1 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>JavaScript</span>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  )
}