'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter } from 'lucide-react'

interface ProjectFiltersProps {
  selectedFilters: {
    status: string
    type: string
    language: string
  }
  onFilterChange: (key: string, value: string) => void
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
  { value: 'draft', label: 'Draft' }
]

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'web', label: 'Web App' },
  { value: 'backend', label: 'Backend' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'ml', label: 'ML/AI' },
  { value: 'library', label: 'Library' },
  { value: 'tool', label: 'Tool' }
]

const languageOptions = [
  { value: 'all', label: 'All Languages' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'c++', label: 'C++' },
  { value: 'c#', label: 'C#' }
]

export function ProjectFilters({ selectedFilters, onFilterChange }: ProjectFiltersProps) {
  const hasActiveFilters = 
    selectedFilters.status !== 'all' ||
    selectedFilters.type !== 'all' ||
    selectedFilters.language !== 'all'

  const clearAllFilters = () => {
    onFilterChange('status', 'all')
    onFilterChange('type', 'all')
    onFilterChange('language', 'all')
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Filters:</span>
      </div>

      <Select
        value={selectedFilters.status}
        onValueChange={(value) => onFilterChange('status', value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedFilters.type}
        onValueChange={(value) => onFilterChange('type', value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {typeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedFilters.language}
        onValueChange={(value) => onFilterChange('language', value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="h-8 px-2 text-xs"
        >
          Clear All
        </Button>
      )}

      {hasActiveFilters && (
        <div className="flex items-center gap-1">
          {selectedFilters.status !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Status: {statusOptions.find(s => s.value === selectedFilters.status)?.label}
            </Badge>
          )}
          {selectedFilters.type !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Type: {typeOptions.find(t => t.value === selectedFilters.type)?.label}
            </Badge>
          )}
          {selectedFilters.language !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Language: {languageOptions.find(l => l.value === selectedFilters.language)?.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}