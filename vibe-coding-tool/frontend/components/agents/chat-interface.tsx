'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Bot, 
  User, 
  Code, 
  FileText, 
  Image, 
  Paperclip,
  MoreVertical,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  StopCircle,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: string
  type: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'failed' | 'processing'
  attachments?: Attachment[]
  metadata?: {
    agentId?: string
    agentName?: string
    responseTime?: number
    tokenCount?: number
    confidence?: number
  }
}

interface Attachment {
  id: string
  name: string
  type: 'file' | 'image' | 'code'
  size: number
  url?: string
  content?: string
}

interface ChatInterfaceProps {
  agent?: {
    id: string
    name: string
    avatar?: string
    status: 'available' | 'busy' | 'offline'
  }
  onSendMessage?: (message: string, attachments?: Attachment[]) => Promise<void>
  onClearChat?: () => void
  className?: string
}

export function ChatInterface({ 
  agent, 
  onSendMessage, 
  onClearChat,
  className 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to the AI Agent chat! I\'m here to help you with your coding tasks.',
      timestamp: new Date(),
      metadata: {
        agentId: '1',
        agentName: 'Code Assistant',
        responseTime: 0.5
      }
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      status: 'sending',
      attachments: attachments.length > 0 ? attachments : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setAttachments([])
    setIsTyping(true)
    setIsProcessing(true)

    try {
      await onSendMessage?.(inputValue, attachments.length > 0 ? attachments : undefined)
      
      // Update message status to sent
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'sent' as const }
          : msg
      ))
    } catch (error) {
      // Update message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'failed' as const }
          : msg
      ))
    } finally {
      setIsTyping(false)
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAddAttachment = (file: File) => {
    const attachment: Attachment = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      size: file.size,
      url: URL.createObjectURL(file)
    }
    setAttachments(prev => [...prev, attachment])
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user'
    const isAgent = message.type === 'agent'
    const isSystem = message.type === 'system'

    return (
      <div
        key={message.id}
        className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              {isAgent ? <Bot className="h-4 w-4 text-white" /> : <AlertCircle className="h-4 w-4 text-white" />}
            </div>
          </div>
        )}

        <div className={`max-w-[70%] ${isUser ? 'order-1' : ''}`}>
          <div
            className={`rounded-lg px-4 py-3 ${
              isUser
                ? 'bg-blue-600 text-white'
                : isSystem
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-700 text-gray-100'
            }`}
          >
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-2 space-y-1">
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 bg-gray-600 rounded px-2 py-1 text-xs"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span className="truncate">{attachment.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(attachment.size / 1024).toFixed(1)}KB
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="text-sm">
              {message.content.split('\n').map((line, i) => (
                <p key={i} className="mb-1 last:mb-0">
                  {line}
                </p>
              ))}
            </div>

            {message.metadata?.responseTime && (
              <div className="mt-2 text-xs opacity-70">
                Response time: {message.metadata.responseTime}s
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              {formatTimestamp(message.timestamp)}
            </span>
            
            {message.status === 'failed' && (
              <Badge variant="destructive" className="text-xs">
                Failed
              </Badge>
            )}

            {message.status === 'processing' && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3 animate-spin" />
                Processing...
              </div>
            )}

            {isAgent && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  onClick={() => handleCopyMessage(message.content)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {isUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium">
                {agent?.name || 'AI Agent'}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {agent?.status || 'available'}
                </Badge>
                {isProcessing && (
                  <div className="flex items-center space-x-1 text-xs text-green-400">
                    <Zap className="h-3 w-3 animate-pulse" />
                    <span>Processing</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
            {onClearChat && (
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <StopCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(renderMessage)}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        {attachments.length > 0 && (
          <div className="mb-3 space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between bg-gray-700 rounded px-3 py-2"
              >
                <div className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{attachment.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {(attachment.size / 1024).toFixed(1)}KB
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  onClick={() => handleRemoveAttachment(attachment.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isProcessing}
              className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 resize-none"
              multiline
              rows={1}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              disabled={isProcessing}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() && attachments.length === 0 || isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}