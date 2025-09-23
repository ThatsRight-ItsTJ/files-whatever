import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock next/font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'font-inter',
    style: {},
  }),
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
    id: null,
    rooms: new Set(),
    joinRoom: jest.fn(),
    leaveRoom: jest.fn(),
    removeAuthToken: jest.fn(),
    setAuthToken: jest.fn(),
    getSocket: jest.fn(() => ({
      id: null,
      rooms: new Set(),
    })),
    emitWithAck: jest.fn(),
  })),
}))

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange, language, theme, options }) => (
    <div data-testid="monaco-editor">
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        data-language={language}
        data-theme={theme}
      />
    </div>
  ),
}))

// Mock D3.js
jest.mock('d3', () => ({
  select: jest.fn(() => ({
    select: jest.fn(() => ({
      attr: jest.fn(),
      style: jest.fn(),
      classed: jest.fn(),
      text: jest.fn(),
      append: jest.fn(() => ({
        attr: jest.fn(),
        style: jest.fn(),
        classed: jest.fn(),
        text: jest.fn(),
      })),
    })),
    data: jest.fn(() => ({
      enter: jest.fn(() => ({
        append: jest.fn(() => ({
          attr: jest.fn(),
          style: jest.fn(),
          classed: jest.fn(),
          text: jest.fn(),
        })),
      })),
      exit: jest.fn(() => ({
        remove: jest.fn(),
      })),
    })),
    on: jest.fn(),
    call: jest.fn(),
  })),
  forceSimulation: jest.fn(() => ({
    nodes: jest.fn(() => ({
      force: jest.fn(),
    })),
    force: jest.fn(() => ({
      x: jest.fn(),
      y: jest.fn(),
      strength: jest.fn(),
    })),
    alpha: jest.fn(() => ({
      target: jest.fn(),
    })),
    tick: jest.fn(),
    stop: jest.fn(),
  })),
  forceManyBody: jest.fn(() => ({
    strength: jest.fn(),
  })),
  forceLink: jest.fn(() => ({
    id: jest.fn(),
    distance: jest.fn(),
    strength: jest.fn(),
  })),
  forceCenter: jest.fn(() => ({
    x: jest.fn(),
    y: jest.fn(),
  })),
  zoom: jest.fn(() => ({
    scaleBy: jest.fn(),
    scaleTo: jest.fn(),
    translateBy: jest.fn(),
    transform: jest.fn(),
  })),
  event: {
    transform: jest.fn(),
  },
}))

// Mock Cytoscape.js
jest.mock('cytoscape', () => ({
  default: jest.fn(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    elements: jest.fn(),
    layout: jest.fn(() => ({
      run: jest.fn(),
    })),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    ready: jest.fn(),
    pan: jest.fn(),
    zoom: jest.fn(),
    fit: jest.fn(),
    center: jest.fn(),
    reset: jest.fn(),
    resize: jest.fn(),
    destroy: jest.fn(),
    style: jest.fn(),
    stylesheet: jest.fn(),
    png: jest.fn(),
    jpg: jest.fn(),
    pdf: jest.fn(),
  })),
}))

// Mock zustand
jest.mock('zustand', () => ({
  create: (initializer) => {
    const store = initializer(() => ({}))
    return store
  },
  devtools: (fn) => fn,
}))

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  })),
  useInfiniteQuery: jest.fn(() => ({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    fetchNextPage: jest.fn(),
    fetchPreviousPage: jest.fn(),
    hasNextPage: false,
    hasPreviousPage: false,
    refetch: jest.fn(),
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    refetchQueries: jest.fn(),
    removeQueries: jest.fn(),
    resetQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    cancelQueries: jest.fn(),
    prefetchQuery: jest.fn(),
  })),
}))

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: jest.fn(),
    formState: {
      errors: {},
      touchedFields: {},
      dirtyFields: {},
      isSubmitting: false,
      isSubmitted: false,
      isValid: true,
    },
    reset: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn(),
    trigger: jest.fn(),
    watch: jest.fn(),
    control: {
      register: jest.fn(),
      unregister: jest.fn(),
      getValues: jest.fn(),
      setValue: jest.fn(),
      trigger: jest.fn(),
    },
  }),
  Controller: ({ render }) => render({ field: { onChange: jest.fn(), onBlur: jest.fn(), value: '' } }),
}))

// Mock react-beautiful-dnd
jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }) => children,
  Droppable: ({ children }) => children({ isDraggingOver: false, innerRef: jest.fn(), droppableProps: {} }),
  Draggable: ({ children }) => children({ draggableProps: {}, dragHandleProps: {}, innerRef: jest.fn() }),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: jest.fn((props) => <div {...props} />),
    button: jest.fn((props) => <button {...props} />),
    span: jest.fn((props) => <span {...props} />),
    input: jest.fn((props) => <input {...props} />),
    textarea: jest.fn((props) => <textarea {...props} />),
    select: jest.fn((props) => <select {...props} />),
    option: jest.fn((props) => <option {...props} />),
    img: jest.fn((props) => <img {...props} />),
    svg: jest.fn((props) => <svg {...props} />),
    path: jest.fn((props) => <path {...props} />),
    circle: jest.fn((props) => <circle {...props} />),
    rect: jest.fn((props) => <rect {...props} />),
    line: jest.fn((props) => <line {...props} />),
    text: jest.fn((props) => <text {...props} />),
    g: jest.fn((props) => <g {...props} />),
    animate: jest.fn((props) => <div {...props} />),
    variants: jest.fn(() => ({})),
  },
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Home: () => <div data-testid="home-icon" />,
  User: () => <div data-testid="user-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Trash: () => <div data-testid="trash-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
  Save: () => <div data-testid="save-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
  CheckCircle: () => <div data-testid="check-icon" />,
  XCircle: () => <div data-testid="x-icon" />,
  Info: () => <div data-testid="info-icon" />,
  AlertTriangle: () => <div data-testid="warning-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Menu: () => <div data-testid="menu-icon" />,
  X: () => <div data-testid="x-icon" />,
  Minus: () => <div data-testid="minus-icon" />,
  Maximize: () => <div data-testid="maximize-icon" />,
  Minimize: () => <div data-testid="minimize-icon" />,
  ExternalLink: () => <div data-testid="external-link-icon" />,
  Github: () => <div data-testid="github-icon" />,
  Gitlab: () => <div data-testid="gitlab-icon" />,
  Code: () => <div data-testid="code-icon" />,
  File: () => <div data-testid="file-icon" />,
  Folder: () => <div data-testid="folder-icon" />,
  FolderOpen: () => <div data-testid="folder-open-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  Image: () => <div data-testid="image-icon" />,
  Video: () => <div data-testid="video-icon" />,
  Music: () => <div data-testid="music-icon" />,
  FileCode: () => <div data-testid="file-code-icon" />,
  FileArchive: () => <div data-testid="file-archive-icon" />,
  FileSpreadsheet: () => <div data-testid="file-spreadsheet-icon" />,
  FilePresentation: () => <div data-testid="file-presentation-icon" />,
  FilePdf: () => <div data-testid="file-pdf-icon" />,
  FileImage: () => <div data-testid="file-image-icon" />,
  FileVideo: () => <div data-testid="file-video-icon" />,
  FileAudio: () => <div data-testid="file-audio-icon" />,
  FileUnknown: () => <div data-testid="file-unknown-icon" />,
}))

// Mock @radix-ui components
jest.mock('@radix-ui/react-dialog', () => ({
  Dialog: ({ children, open }) => open && <div data-testid="dialog">{children}</div>,
  DialogTrigger: ({ children }) => children,
  DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }) => <div data-testid="dialog-footer">{children}</div>,
  DialogClose: ({ children }) => <div data-testid="dialog-close">{children}</div>,
}))

jest.mock('@radix-ui/react-dropdown-menu', () => ({
  DropdownMenu: ({ children }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }) => children,
  DropdownMenuContent: ({ children }) => <div data-testid="dropdown-menu-content">{children}</div>,
  DropdownMenuItem: ({ children }) => <div data-testid="dropdown-menu-item">{children}</div>,
  DropdownMenuSeparator: () => <div data-testid="dropdown-menu-separator" />,
  DropdownMenuCheckboxItem: ({ children }) => <div data-testid="dropdown-menu-checkbox-item">{children}</div>,
  DropdownMenuRadioGroup: ({ children }) => <div data-testid="dropdown-menu-radio-group">{children}</div>,
  DropdownMenuRadioItem: ({ children }) => <div data-testid="dropdown-menu-radio-item">{children}</div>,
}))

jest.mock('@radix-ui/react-toast', () => ({
  ToastProvider: ({ children }) => children,
  ToastViewport: () => <div data-testid="toast-viewport" />,
  Toast: ({ children }) => <div data-testid="toast">{children}</div>,
  ToastAction: ({ children }) => <div data-testid="toast-action">{children}</div>,
  ToastClose: ({ children }) => <div data-testid="toast-close">{children}</div>,
  ToastTitle: ({ children }) => <div data-testid="toast-title">{children}</div>,
  ToastDescription: ({ children }) => <div data-testid="toast-description">{children}</div>,
}))

jest.mock('@radix-ui/react-tooltip', () => ({
  TooltipProvider: ({ children }) => children,
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }) => children,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
}))

jest.mock('@radix-ui/react-select', () => ({
  Select: ({ children }) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ children }) => <div data-testid="select-value">{children}</div>,
  SelectContent: ({ children }) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children }) => <div data-testid="select-item">{children}</div>,
  SelectScrollUpButton: () => <div data-testid="select-scroll-up-button" />,
  SelectScrollDownButton: () => <div data-testid="select-scroll-down-button" />,
}))

jest.mock('@radix-ui/react-tabs', () => ({
  Tabs: ({ children }) => <div data-testid="tabs">{children}</div>,
  TabsList: ({ children }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children }) => <div data-testid="tabs-trigger">{children}</div>,
  TabsContent: ({ children }) => <div data-testid="tabs-content">{children}</div>,
}))

jest.mock('@radix-ui/react-progress', () => ({
  Progress: ({ value }) => <div data-testid="progress" data-value={value} />,
}))

jest.mock('@radix-ui/react-scroll-area', () => ({
  ScrollArea: ({ children }) => <div data-testid="scroll-area">{children}</div>,
}))

jest.mock('@radix-ui/react-separator', () => ({
  Separator: () => <div data-testid="separator" />,
}))

jest.mock('@radix-ui/react-label', () => ({
  Label: ({ children }) => <label data-testid="label">{children}</label>,
}))

jest.mock('@radix-ui/react-switch', () => ({
  Switch: ({ checked, onCheckedChange }) => (
    <div data-testid="switch" data-checked={checked} onClick={() => onCheckedChange?.(!checked)} />
  ),
}))

jest.mock('@radix-ui/react-slider', () => ({
  Slider: ({ value, onValueChange }) => (
    <div data-testid="slider" data-value={value} onChange={(e) => onValueChange?.([e.target.value])} />
  ),
}))

jest.mock('@radix-ui/react-checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange }) => (
    <div data-testid="checkbox" data-checked={checked} onClick={() => onCheckedChange?.(!checked)} />
  ),
}))

jest.mock('@radix-ui/react-radio-group', () => ({
  RadioGroup: ({ children }) => <div data-testid="radio-group">{children}</div>,
  RadioGroupItem: ({ children }) => <div data-testid="radio-group-item">{children}</div>,
}))

jest.mock('@radix-ui/react-popover', () => ({
  Popover: ({ children }) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children }) => children,
  PopoverContent: ({ children }) => <div data-testid="popover-content">{children}</div>,
}))

jest.mock('@radix-ui/react-avatar', () => ({
  Avatar: ({ children }) => <div data-testid="avatar">{children}</div>,
  AvatarImage: () => <div data-testid="avatar-image" />,
  AvatarFallback: ({ children }) => <div data-testid="avatar-fallback">{children}</div>,
}))

jest.mock('@radix-ui/react-badge', () => ({
  Badge: ({ children }) => <div data-testid="badge">{children}</div>,
}))

jest.mock('@radix-ui/react-alert-dialog', () => ({
  AlertDialog: ({ children }) => <div data-testid="alert-dialog">{children}</div>,
  AlertDialogTrigger: ({ children }) => children,
  AlertDialogContent: ({ children }) => <div data-testid="alert-dialog-content">{children}</div>,
  AlertDialogHeader: ({ children }) => <div data-testid="alert-dialog-header">{children}</div>,
  AlertDialogTitle: ({ children }) => <div data-testid="alert-dialog-title">{children}</div>,
  AlertDialogDescription: ({ children }) => <div data-testid="alert-dialog-description">{children}</div>,
  AlertDialogFooter: ({ children }) => <div data-testid="alert-dialog-footer">{children}</div>,
  AlertDialogCancel: ({ children }) => <div data-testid="alert-dialog-cancel">{children}</div>,
  AlertDialogAction: ({ children }) => <div data-testid="alert-dialog-action">{children}</div>,
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop) => {
      return ''
    }
  })
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock fetch
global.fetch = jest.fn()

// Mock WebSocket
global.WebSocket = jest.fn()

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock performance
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(),
  getEntriesByType: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  clearResourceTimings: jest.fn(),
  timing: {},
  navigation: {},
  memory: {},
}

// Mock console methods for cleaner test output
const originalConsole = { ...console }
console.log = jest.fn()
console.warn = jest.fn()
console.error = jest.fn()
console.info = jest.fn()
console.debug = jest.fn()

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
})

// Reset console methods
afterAll(() => {
  console.log = originalConsole.log
  console.warn = originalConsole.warn
  console.error = originalConsole.error
  console.info = originalConsole.info
  console.debug = originalConsole.debug
})