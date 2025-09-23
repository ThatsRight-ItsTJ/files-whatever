'use client'

import { useEffect, useRef, useState } from 'react'
import * as monaco from 'monaco-editor'
import { Editor } from '@monaco-editor/react'

interface MonacoEditorProps {
  fileContent: string
  filePath: string
  language: string
  onSave?: () => void
  theme?: 'vs-dark' | 'light'
  height?: string
  options?: monaco.editor.IStandaloneEditorConstructionOptions
}

export function MonacoEditor({
  fileContent,
  filePath,
  language,
  onSave,
  theme = 'vs-dark',
  height = '100%',
  options = {}
}: MonacoEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor

    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto'
      },
      automaticLayout: true,
      ...options
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      editor.getAction('actions.find')?.run()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
      editor.getAction('editor.action.replace')?.run()
    })

    // Listen for changes
    editor.onDidChangeModelContent(() => {
      setIsDirty(true)
    })
  }

  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave()
      setIsDirty(false)
    } catch (error) {
      console.error('Failed to save file:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    // This is called when the editor content changes
    // We can use this to update the file content if needed
  }

  return (
    <div className="relative h-full">
      <Editor
        height={height}
        language={language}
        theme={theme}
        value={fileContent}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        path={filePath}
        options={{
          readOnly: false,
          domReadOnly: false,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8
          },
          ...options
        }}
      />

      {/* Save Status Indicator */}
      <div className="absolute top-2 right-2 flex items-center space-x-2">
        {isDirty && (
          <div className="flex items-center space-x-1 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Unsaved</span>
          </div>
        )}
        {isSaving && (
          <div className="flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded text-xs">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            <span>Saving...</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="absolute bottom-2 right-2 flex items-center space-x-1">
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save (Ctrl+S)'}
        </button>
      </div>
    </div>
  )
}