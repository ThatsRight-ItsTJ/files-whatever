'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Code, Lightbulb, AlertCircle, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  code?: string
  suggestions?: string[]
}

interface AIAssistantPanelProps {
  filePath?: string
  language?: string
}

export function AIAssistantPanel({ filePath, language }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your AI coding assistant. I can help you with ${language || 'your code'} development. What would you like to work on today?`,
      timestamp: new Date(),
      suggestions: [
        'Explain this code',
        'Find bugs',
        'Optimize performance',
        'Add documentation',
        'Generate tests'
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I understand you want to "${inputValue}". Let me help you with that.`,
        timestamp: new Date(),
        code: `// Example solution for ${inputValue}\nfunction example() {\n  // Your code here\n  return result;\n}`,
        suggestions: [
          'Try this approach',
          'Alternative solution',
          'More efficient method',
          'Add error handling'
        ]
      }

      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <h3 className="text-white font-medium">AI Assistant</h3>
            <Badge variant="outline" className="text-xs">
              {language || 'Code'}
            </Badge>
            {filePath && (
              <Badge variant="secondary" className="text-xs">
                {filePath.split('/').pop()}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'assistant' && (
                  <Bot className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                )}
                {message.type === 'user' && (
                  <User className="h-4 w-4 text-blue-200 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.code && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1">
                          <Code className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">Code</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.code!)}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          Copy
                        </Button>
                      </div>
                      <pre className="bg-gray-900 rounded p-2 text-xs overflow-x-auto">
                        <code>{message.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs opacity-70">
                  {formatTime(message.timestamp)}
                </span>
                {message.suggestions && (
                  <div className="flex flex-wrap gap-1">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs bg-gray-600 hover:bg-gray-500 text-gray-200"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-400">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your code..."
            className="bg-gray-700 text-white border-gray-600 placeholder-gray-400"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSendMessage()}
            className="text-xs text-gray-400 hover:text-white"
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            Explain Code
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSendMessage()}
            className="text-xs text-gray-400 hover:text-white"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Find Bugs
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSendMessage()}
            className="text-xs text-gray-400 hover:text-white"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Optimize
          </Button>
        </div>
      </div>
    </div>
  )
}