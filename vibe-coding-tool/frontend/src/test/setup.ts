
/**
 * Test setup for Vitest
 */

import '@testing-library/jest-dom'

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

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}))

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue('mock-text'),
  },
})

// Mock console.error to avoid noise in tests
const originalError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return
  }
  originalError.call(console, ...args)
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test-path',
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

// Mock socket.io
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
}))

// Mock Monaco Editor
jest.mock('react-monaco-editor', () => ({
  default: ({ value, onChange, language, theme, options }: any) => {
    return {
      $$typeof: Symbol.for('react.element'),
      type: 'div',
      props: {
        'data-testid': 'monaco-editor',
        'data-language': language,
        'data-theme': theme,
        'data-value': value,
        contentEditable: true,
        onInput: (e: any) => onChange?.(e.currentTarget.textContent || ''),
        children: value,
      },
    }
  },
}))

// Mock react-flow
jest.mock('reactflow', () => ({
  ReactFlow: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'react-flow',
      children,
    },
  }),
  Background: () => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'react-flow-background',
    },
  }),
  Controls: () => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'react-flow-controls',
    },
  }),
  MiniMap: () => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'react-flow-minimap',
    },
  }),
  addEdge: jest.fn(),
  applyEdgeChanges: jest.fn(),
  applyNodeChanges: jest.fn(),
  useEdgesState: jest.fn(() => [[], jest.fn()]),
  useNodesState: jest.fn(() => [[], jest.fn()]),
  useReactFlow: jest.fn(() => ({
    fitView: jest.fn(),
    project: jest.fn(),
  })),
}))

// Mock cytoscape
jest.mock('cytoscape', () => ({
  default: jest.fn(() => ({
    nodes: jest.fn(),
    edges: jest.fn(),
    layout: jest.fn().mockReturnThis(),
    run: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    destroy: jest.fn(),
  })),
}))

// Mock d3
jest.mock('d3', () => ({
  select: jest.fn(() => ({
    attr: jest.fn(),
    style: jest.fn(),
    text: jest.fn(),
    append: jest.fn(() => ({
      attr: jest.fn(),
      style: jest.fn(),
      text: jest.fn(),
    })),
  })),
  scaleLinear: jest.fn(() => ({
    domain: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    nice: jest.fn().mockReturnThis(),
  })),
  axisBottom: jest.fn(() => ({
    tickSize: jest.fn().mockReturnThis(),
    tickFormat: jest.fn().mockReturnThis(),
  })),
}))

// Mock zustand
jest.mock('zustand', () => ({
  create: jest.fn((initializer) => {
    const store = initializer(() => ({}))
    return store
  }),
}))

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn().mockImplementation(() => ({
    queryCache: {
      find: jest.fn(),
      getAll: jest.fn(),
    },
    mutationCache: {
      getAll: jest.fn(),
    },
    getDefaultOptions: jest.fn(() => ({
      queries: {
        retry: false,
        staleTime: 0,
      },
    })),
  })),
  useQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    resetQueries: jest.fn(),
    removeQueries: jest.fn(),
  })),
}))

// Mock headlessui
jest.mock('@headlessui/react', () => ({
  Dialog: ({ children, open, onClose }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'dialog',
      open,
      onClose,
      children,
    },
  }),
  Menu: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'menu',
      children,
    },
  }),
  Transition: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'transition',
      children,
    },
  }),
}))

// Mock radix-ui
jest.mock('@radix-ui/react-dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'radix-dialog',
      open,
      onOpenChange,
      children,
    },
  }),
  DialogTrigger: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'dialog-trigger',
      children,
    },
  }),
  DialogContent: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'dialog-content',
      children,
    },
  }),
  DialogHeader: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'dialog-header',
      children,
    },
  }),
  DialogTitle: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'dialog-title',
      children,
    },
  }),
  DialogDescription: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'dialog-description',
      children,
    },
  }),
}))

jest.mock('@radix-ui/react-dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'dropdown-menu',
      children,
    },
  }),
  DropdownMenuTrigger: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'dropdown-menu-trigger',
      children,
    },
  }),
  DropdownMenuContent: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'dropdown-menu-content',
      children,
    },
  }),
  DropdownMenuItem: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'dropdown-menu-item',
      children,
    },
  }),
}))

jest.mock('@radix-ui/react-toast', () => ({
  ToastProvider: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'toast-provider',
      children,
    },
  }),
  Toast: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'toast',
      children,
    },
  }),
  ToastTitle: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'toast-title',
      children,
    },
  }),
  ToastDescription: ({ children }: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    props: {
      'data-testid': 'toast-description',
      children,
    },
  }),
}))

// Mock tailwindcss
jest.mock('tailwindcss', () => ({
  default: jest.fn(),
}))

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  JWT: jest.fn(),
}))

// Mock next-auth/core
jest.mock('next-auth/core', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/providers
jest.mock('next-auth/providers', () => ({
  GitHub: jest.fn(),
  Credentials: jest.fn(),
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/next
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
jest.mock('next-auth/server', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/types
jest.mock('next-auth/types', () => ({
  Session: jest.fn(),
  User: jest.fn(),
  Account: jest.fn(),
  Profile: jest.fn(),
  DefaultSession: jest.fn(),
  DefaultUser: jest.fn(),
}))

// Mock next-auth/config
jest.mock('next-auth/config', () => ({
  AuthConfig: jest.fn(),
}))

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/api
jest.mock('next-auth/api', () => ({
  auth: jest.fn(),
}))

// Mock next-auth/utils
jest.mock('next-auth/utils', () => ({
  isUrl: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
}))

// Mock next-auth/adapter
jest.mock('next-auth/adapter', () => ({
  Adapter: jest.fn(),
}))

// Mock next-auth/database
jest.mock('next-auth/database', () => ({
  DatabaseAdapter: jest.fn(),
}))

// Mock next-auth/cookies
jest.mock('next-auth/cookies', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Mock next-auth/signin
jest.mock('next-auth/signin', () => ({
  signIn: jest.fn(),
}))

// Mock next-auth/signout
jest.mock('next-auth/signout', () => ({
  signOut: jest.fn(),
}))

// Mock next-auth/callbacks
jest.mock('next-auth/callbacks', () => ({
  jwt: jest.fn(),
  session: jest.fn(),
}))

// Mock next-auth/pages
jest.mock('next-auth/pages', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/app
jest.mock('next-auth/app', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/client
jest.mock('next-auth/client', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
}))

// Mock next-auth/server
