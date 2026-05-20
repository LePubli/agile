import { workflowsApi } from '@/lib/api-services';
import { useEffect, useState } from 'react';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  triggerType: string;
  stepsCount: number;
  executionsCount: number;
  lastExecutedAt?: string;
  createdAt: string;
}

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true);
      const data = await workflowsApi.getAll();
      setWorkflows(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkflow = async (data: Partial<Workflow>) => {
    const workflow = await workflowsApi.create(data);
    setWorkflows(prev => [...prev, workflow]);
    return workflow;
  };

  const toggleWorkflow = async (id: string) => {
    const workflow = await workflowsApi.toggle(id);
    setWorkflows(prev => prev.map(w => w.id === id ? workflow : w));
    return workflow;
  };

  const deleteWorkflow = async (id: string) => {
    await workflowsApi.delete(id);
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return {
    workflows,
    isLoading,
    error,
    refresh: fetchWorkflows,
    createWorkflow,
    toggleWorkflow,
    deleteWorkflow,
  };
}
