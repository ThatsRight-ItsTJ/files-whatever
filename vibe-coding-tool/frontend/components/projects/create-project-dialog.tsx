'use client'

import { useState } from 'react'
import { useCreateProject } from '@/hooks/api/use-projects-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Code, GitBranch, Database, Rocket, Sparkles, FileCode, Globe } from 'lucide-react'

interface CreateProjectDialogProps {
  onProjectCreated: (project: any) => void
  onCancel: () => void
}

interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  language: string
  features: string[]
}

const projectTemplates: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with an empty project',
    icon: <Code className="h-6 w-6" />,
    category: 'basic',
    language: 'javascript',
    features: ['Empty workspace', 'Custom setup']
  },
  {
    id: 'react-app',
    name: 'React Application',
    description: 'Modern React application with TypeScript',
    icon: <FileCode className="h-6 w-6" />,
    category: 'web',
    language: 'typescript',
    features: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS']
  },
  {
    id: 'node-api',
    name: 'Node.js API',
    description: 'RESTful API with Express and TypeScript',
    icon: <Database className="h-6 w-6" />,
    category: 'backend',
    language: 'typescript',
    features: ['Express.js', 'TypeScript', 'Jest', 'ESLint']
  },
  {
    id: 'python-ml',
    name: 'Python ML Project',
    description: 'Machine learning project with Jupyter notebooks',
    icon: <Sparkles className="h-6 w-6" />,
    category: 'ml',
    language: 'python',
    features: ['Jupyter', 'Pandas', 'Scikit-learn', 'TensorFlow']
  },
  {
    id: 'nextjs-app',
    name: 'Next.js Application',
    description: 'Full-stack React application with Next.js',
    icon: <Rocket className="h-6 w-6" />,
    category: 'web',
    language: 'typescript',
    features: ['Next.js 14', 'App Router', 'Tailwind CSS', 'TypeScript']
  },
  {
    id: 'static-site',
    name: 'Static Site',
    description: 'Static website generator with modern tools',
    icon: <Globe className="h-6 w-6" />,
    category: 'web',
    language: 'javascript',
    features: ['Vite', 'React', 'Tailwind CSS', 'Deployment ready']
  }
]

export function CreateProjectDialog({ onProjectCreated, onCancel }: CreateProjectDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate>(projectTemplates[0])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    repositoryUrl: '',
    isPrivate: false,
    language: selectedTemplate.language,
    template: selectedTemplate.id
  })
  const [error, setError] = useState('')
  const createProject = useCreateProject()

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      language: template.language,
      template: template.id
    }))
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const project = await createProject.mutateAsync(formData)
      onProjectCreated(project)
    } catch (err) {
      setError('Failed to create project')
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate.id === template.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-600">
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.language}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Project Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Project Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repositoryUrl">Repository URL (Optional)</Label>
            <Input
              id="repositoryUrl"
              value={formData.repositoryUrl}
              onChange={(e) => handleInputChange('repositoryUrl', e.target.value)}
              placeholder="https://github.com/username/repo"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isPrivate" className="text-sm">
              Make this project private
            </Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GitBranch className="mr-2 h-4 w-4" />
              )}
              Create Project
            </Button>
          </div>
        </form>
      </div>

      {/* Selected Template Features */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Template Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.features.map((feature) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}