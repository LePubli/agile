import { useEffect, useState } from 'react'

interface ApiClientConfig {
  baseUrl: string
  token?: string | null
}

interface LoginDto {
  email: string
  password: string
}

interface RegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
}

interface AuthResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    avatarUrl?: string
  }
  accessToken: string
  refreshToken: string
}

interface Tenant {
  id: string
  name: string
  slug: string
  logoUrl?: string
  status: string
  createdAt: string
}

interface Plugin {
  id: string
  name: string
  description: string
  version: string
  author: string
  status: 'INSTALLED' | 'ACTIVE' | 'INACTIVE'
  installedAt?: string
}

interface Workflow {
  id: string
  name: string
  description: string
  triggers: any[]
  actions: any[]
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
}

interface AiTask {
  id: string
  type: string
  input: any
  output?: any
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  completedAt?: string
}

interface FileData {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedAt: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl
    this.token = config.token || null
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || this.token
    }
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: HeadersInit = {
      ...(options.headers || {}),
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const currentToken = this.getToken()
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async logout() {
    return this.request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    })
  }

  async getProfile() {
    return this.request<{ user: AuthResponse['user'] }>('/api/auth/me')
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  async getTenants(): Promise<Tenant[]> {
    return this.request<Tenant[]>('/api/tenants')
  }

  async getTenantById(id: string): Promise<Tenant> {
    return this.request<Tenant>(`/api/tenants/${id}`)
  }

  async createTenant(data: { name: string; slug: string; description?: string }): Promise<Tenant> {
    return this.request<Tenant>('/api/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPlugins(): Promise<Plugin[]> {
    return this.request<Plugin[]>('/api/plugins')
  }

  async installPlugin(pluginId: string): Promise<Plugin> {
    return this.request<Plugin>(`/api/plugins/${pluginId}/install`, {
      method: 'POST',
    })
  }

  async activatePlugin(pluginId: string): Promise<Plugin> {
    return this.request<Plugin>(`/api/plugins/${pluginId}/activate`, {
      method: 'POST',
    })
  }

  async getWorkflows(): Promise<Workflow[]> {
    return this.request<Workflow[]>('/api/workflows')
  }

  async createWorkflow(data: { name: string; description?: string; triggers: any[]; actions: any[] }): Promise<Workflow> {
    return this.request<Workflow>('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async executeWorkflow(workflowId: string): Promise<{ executionId: string; status: string }> {
    return this.request<{ executionId: string; status: string }>(`/api/workflows/${workflowId}/execute`, {
      method: 'POST',
    })
  }

  async createAiTask(data: { type: string; input: any; provider?: string }): Promise<AiTask> {
    return this.request<AiTask>('/api/ai/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getAiTasks(): Promise<AiTask[]> {
    return this.request<AiTask[]>('/api/ai/tasks')
  }

  async uploadFile(file: File): Promise<FileData> {
    const formData = new FormData()
    formData.append('file', file)
    return this.request<FileData>('/api/files/upload', {
      method: 'POST',
      body: formData,
    })
  }

  async getFiles(): Promise<FileData[]> {
    return this.request<FileData[]>('/api/files')
  }

  async deleteFile(id: string): Promise<void> {
    return this.request<void>(`/api/files/${id}`, {
      method: 'DELETE',
    })
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = new ApiClient({
  baseUrl: API_URL,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
})

export default api

export function useAuth() {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.getProfile()
        setUser(response.user)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password })
      api.setToken(response.accessToken)
      setUser(response.user)
      setError(null)
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    }
  }

  const register = async (data: RegisterDto) => {
    try {
      const response = await api.register(data)
      api.setToken(response.accessToken)
      setUser(response.user)
      setError(null)
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      throw err
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      api.setToken(null)
      setUser(null)
    }
  }

  return { user, loading, error, login, register, logout }
}

export function useApi<T>(fetcher: () => Promise<T>, dependencies: any[] = []): { data: T | null; loading: boolean; error: string | null; refresh: () => void } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await fetcher()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  return { data, loading, error, refresh: fetchData }
}
