import { useEffect, useState } from 'react'

interface ApiClientConfig {
  baseUrl: string
  token?: string | null
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
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
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

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ access_token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(name: string, email: string, password: string) {
    return this.request<{ access_token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
  }

  async getProfile() {
    return this.request<any>('/api/auth/me')
  }

  // Tenant endpoints
  async getTenants() {
    return this.request<any[]>('/api/tenants')
  }

  async createTenant(name: string, slug: string) {
    return this.request<any>('/api/tenants', {
      method: 'POST',
      body: JSON.stringify({ name, slug }),
    })
  }

  // Plugin endpoints
  async getPlugins() {
    return this.request<any[]>('/api/plugins')
  }

  async installPlugin(pluginId: string) {
    return this.request<any>(`/api/plugins/${pluginId}/install`, {
      method: 'POST',
    })
  }

  async activatePlugin(pluginId: string) {
    return this.request<any>(`/api/plugins/${pluginId}/activate`, {
      method: 'POST',
    })
  }

  // Workflow endpoints
  async getWorkflows() {
    return this.request<any[]>('/api/workflows')
  }

  async createWorkflow(data: any) {
    return this.request<any>('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async executeWorkflow(workflowId: string) {
    return this.request<any>(`/api/workflows/${workflowId}/execute`, {
      method: 'POST',
    })
  }

  // AI endpoints
  async createAiTask(data: any) {
    return this.request<any>('/api/ai/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getAiTasks() {
    return this.request<any[]>('/api/ai/tasks')
  }

  // File endpoints
  async uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/api/files/upload`, {
      method: 'POST',
      headers: {
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async getFiles() {
    return this.request<any[]>('/api/files')
  }

  async deleteFile(fileId: string) {
    return this.request<any>(`/api/files/${fileId}`, {
      method: 'DELETE',
    })
  }
}

// Create singleton instance
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = new ApiClient({
  baseUrl: API_URL,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
})

export default api
