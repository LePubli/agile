import { aiTasksApi, AITask } from '@/lib/api-services';
import { useEffect, useState } from 'react';

export function useAITasks() {
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const filters = selectedStatus !== 'all' ? { status: selectedStatus } : undefined;
      const data = await aiTasksApi.getAll(filters);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (data: { type: string; input: string; provider?: string; model?: string }) => {
    const task = await aiTasksApi.create(data);
    setTasks(prev => [task, ...prev]);
    return task;
  };

  const cancelTask = async (id: string) => {
    await aiTasksApi.cancel(id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'failed' as const, error: 'Cancelled by user' } : t));
  };

  const retryTask = async (id: string) => {
    const task = await aiTasksApi.retry(id);
    setTasks(prev => prev.map(t => t.id === id ? task : t));
    return task;
  };

  useEffect(() => {
    fetchTasks();
    
    // Polling pour les tâches en cours d'exécution
    const interval = setInterval(() => {
      const hasRunningTasks = tasks.some(t => t.status === 'running' || t.status === 'pending');
      if (hasRunningTasks) {
        fetchTasks();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedStatus]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    running: tasks.filter(t => t.status === 'running').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    totalCost: tasks.reduce((sum, t) => sum + t.cost, 0),
    totalTokens: tasks.reduce((sum, t) => sum + t.tokensUsed, 0),
  };

  return {
    tasks,
    isLoading,
    error,
    refresh: fetchTasks,
    createTask,
    cancelTask,
    retryTask,
    selectedStatus,
    setSelectedStatus,
    stats,
  };
}
