'use client';

import { useState } from 'react';
import { Brain, Cpu, Clock, CheckCircle, AlertCircle, Play, Trash2, RefreshCw, BarChart3 } from 'lucide-react';

interface AITask {
  id: string;
  name: string;
  type: 'generation' | 'analysis' | 'summarization' | 'translation' | 'classification';
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  model: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  input: string;
  output?: string;
  tokensUsed?: number;
  cost?: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

const mockTasks: AITask[] = [
  {
    id: '1',
    name: 'Generate Blog Post',
    type: 'generation',
    provider: 'openai',
    model: 'gpt-4',
    status: 'completed',
    progress: 100,
    input: 'Write a blog post about AI trends in 2024',
    output: 'Artificial Intelligence continues to evolve rapidly...',
    tokensUsed: 2450,
    cost: 0.0735,
    createdAt: '2024-01-15T09:00:00Z',
    completedAt: '2024-01-15T09:02:30Z',
  },
  {
    id: '2',
    name: 'Analyze Customer Feedback',
    type: 'analysis',
    provider: 'anthropic',
    model: 'claude-3-opus',
    status: 'running',
    progress: 67,
    input: 'Analyze sentiment and extract key themes from 500 customer reviews',
    createdAt: '2024-01-15T10:15:00Z',
  },
  {
    id: '3',
    name: 'Summarize Research Paper',
    type: 'summarization',
    provider: 'openai',
    model: 'gpt-4-turbo',
    status: 'pending',
    progress: 0,
    input: 'Summarize this 50-page research paper on quantum computing',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '4',
    name: 'Translate Documentation',
    type: 'translation',
    provider: 'google',
    model: 'gemini-pro',
    status: 'completed',
    progress: 100,
    input: 'Translate API documentation from English to Spanish',
    output: 'Documentación de la API...',
    tokensUsed: 8920,
    cost: 0.0267,
    createdAt: '2024-01-15T08:00:00Z',
    completedAt: '2024-01-15T08:05:12Z',
  },
  {
    id: '5',
    name: 'Classify Support Tickets',
    type: 'classification',
    provider: 'local',
    model: 'llama-2-7b',
    status: 'failed',
    progress: 45,
    input: 'Classify 1000 support tickets by category and priority',
    error: 'Model loading failed: Out of memory',
    createdAt: '2024-01-15T07:30:00Z',
  },
];

const taskTypes = ['All', 'generation', 'analysis', 'summarization', 'translation', 'classification'];
const providers = ['All', 'openai', 'anthropic', 'google', 'local'];

export default function AITasksPage() {
  const [tasks, setTasks] = useState<AITask[]>(mockTasks);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedProvider, setSelectedProvider] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTasks = tasks.filter(task => {
    const matchesType = selectedType === 'All' || task.type === selectedType;
    const matchesProvider = selectedProvider === 'All' || task.provider === selectedProvider;
    return matchesType && matchesProvider;
  });

  const retryTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, status: 'pending' as const, progress: 0, error: undefined } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    running: tasks.filter(t => t.status === 'running').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    totalTokens: tasks.reduce((sum, t) => sum + (t.tokensUsed || 0), 0),
    totalCost: tasks.reduce((sum, t) => sum + (t.cost || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI Tasks Management
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Monitor and manage your AI-powered tasks and agents
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Brain className="h-5 w-5 mr-2" />
              New AI Task
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Tasks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Completed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.completed}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Running
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.running}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Failed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.failed}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <Cpu className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Tokens Used
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {(stats.totalTokens / 1000).toFixed(1)}K
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Cost
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      ${stats.totalCost.toFixed(4)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
            >
              {taskTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Provider
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
            >
              {providers.map(provider => (
                <option key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Recent Tasks
            </h3>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.map((task) => (
              <li key={task.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 h-2.5 w-2.5 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'running' ? 'bg-blue-500 animate-pulse' :
                        task.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {task.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {task.type} · {task.provider} · {task.model}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.status === 'failed' && (
                        <button
                          onClick={() => retryTask(task.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Retry"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                      {task.status === 'running' && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {task.progress}%
                        </span>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {task.status === 'running' && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Input/Output */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Input:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {task.input}
                      </p>
                    </div>
                    {task.output && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Output:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {task.output}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Created: {new Date(task.createdAt).toLocaleString()}
                    </div>
                    {task.completedAt && (
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed: {new Date(task.completedAt).toLocaleString()}
                      </div>
                    )}
                    {task.tokensUsed && (
                      <div className="flex items-center">
                        <Cpu className="h-3 w-3 mr-1" />
                        {task.tokensUsed} tokens
                      </div>
                    )}
                    {task.cost !== undefined && (
                      <div className="flex items-center">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        ${task.cost.toFixed(4)}
                      </div>
                    )}
                    {task.error && (
                      <div className="flex items-center text-red-600 dark:text-red-400">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {task.error}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Brain className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters or create a new AI task.
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" />
            </div>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 sm:mx-0 sm:h-10 sm:w-10">
                    <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Create New AI Task
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Task Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                          placeholder="My AI Task"
                        />
                      </div>
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Task Type
                        </label>
                        <select
                          id="type"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                          <option value="generation">Generation</option>
                          <option value="analysis">Analysis</option>
                          <option value="summarization">Summarization</option>
                          <option value="translation">Translation</option>
                          <option value="classification">Classification</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="provider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Provider
                        </label>
                        <select
                          id="provider"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                          <option value="openai">OpenAI</option>
                          <option value="anthropic">Anthropic</option>
                          <option value="google">Google</option>
                          <option value="local">Local Model</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Input/Prompt
                        </label>
                        <textarea
                          id="input"
                          rows={4}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                          placeholder="Describe what you want the AI to do..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Create Task
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
