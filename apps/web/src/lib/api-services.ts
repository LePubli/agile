import api from './api';

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  triggerType: string;
  stepsCount: number;
  executionsCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const workflowsApi = {
  getAll: async () => {
    const response = await api.get<Workflow[]>('/workflows');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Workflow>(`/workflows/${id}`);
    return response.data;
  },

  create: async (data: Partial<Workflow>) => {
    const response = await api.post<Workflow>('/workflows', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Workflow>) => {
    const response = await api.patch<Workflow>(`/workflows/${id}`, data);
    return response.data;
  },

  toggle: async (id: string) => {
    const response = await api.post<Workflow>(`/workflows/${id}/toggle`);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/workflows/${id}`);
  },
};

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  rating: number;
  downloads: number;
  isInstalled: boolean;
  isActive: boolean;
  category: string;
  price: number;
  imageUrl?: string;
}

export const pluginsApi = {
  getAll: async (filters?: { category?: string; search?: string }) => {
    const response = await api.get<Plugin[]>('/plugins', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Plugin>(`/plugins/${id}`);
    return response.data;
  },

  install: async (id: string) => {
    const response = await api.post<Plugin>(`/plugins/${id}/install`);
    return response.data;
  },

  uninstall: async (id: string) => {
    await api.post(`/plugins/${id}/uninstall`);
  },

  activate: async (id: string) => {
    const response = await api.post<Plugin>(`/plugins/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: string) => {
    const response = await api.post<Plugin>(`/plugins/${id}/deactivate`);
    return response.data;
  },
};

export interface AITask {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  provider: string;
  model: string;
  input: string;
  output?: string;
  tokensUsed: number;
  cost: number;
  progress: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export const aiTasksApi = {
  getAll: async (filters?: { status?: string; type?: string }) => {
    const response = await api.get<AITask[]>('/ai-tasks', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<AITask>(`/ai-tasks/${id}`);
    return response.data;
  },

  create: async (data: { type: string; input: string; provider?: string; model?: string }) => {
    const response = await api.post<AITask>('/ai-tasks', data);
    return response.data;
  },

  cancel: async (id: string) => {
    await api.post(`/ai-tasks/${id}/cancel`);
  },

  retry: async (id: string) => {
    const response = await api.post<AITask>(`/ai-tasks/${id}/retry`);
    return response.data;
  },
};

export interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  createdAt: string;
}

export const filesApi = {
  upload: async (file: File, tenantId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (tenantId) formData.append('tenantId', tenantId);

    const response = await api.post<FileItem>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAll: async (filters?: { limit?: number; offset?: number }) => {
    const response = await api.get<FileItem[]>('/files', { params: filters });
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/files/${id}`);
  },

  getSignedUrl: async (id: string) => {
    const response = await api.get<{ url: string }>(`/files/${id}/signed-url`);
    return response.data;
  },
};
