'use client';

import { useState } from 'react';
import { Package, Download, Check, Star, Zap, Shield, Layers, Search } from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  category: string;
  installed: boolean;
  active: boolean;
  price?: number;
  icon: string;
}

const mockPlugins: Plugin[] = [
  {
    id: '1',
    name: 'Email Templates Pro',
    description: 'Advanced email templates with drag-and-drop builder and A/B testing',
    version: '2.1.0',
    author: 'NexusTeam',
    downloads: 15420,
    rating: 4.8,
    category: 'Communication',
    installed: true,
    active: true,
    icon: '📧',
  },
  {
    id: '2',
    name: 'AI Content Generator',
    description: 'Generate high-quality content using advanced AI models (GPT-4, Claude)',
    version: '1.5.2',
    author: 'AI Labs',
    downloads: 23890,
    rating: 4.9,
    category: 'AI & ML',
    installed: true,
    active: true,
    price: 29.99,
    icon: '🤖',
  },
  {
    id: '3',
    name: 'Stripe Integration',
    description: 'Seamless payment processing with Stripe, supports subscriptions and one-time payments',
    version: '3.0.1',
    author: 'PaymentPro',
    downloads: 8765,
    rating: 4.7,
    category: 'Payments',
    installed: false,
    active: false,
    price: 0,
    icon: '💳',
  },
  {
    id: '4',
    name: 'Analytics Dashboard',
    description: 'Comprehensive analytics with real-time tracking and custom reports',
    version: '2.3.0',
    author: 'DataViz Inc',
    downloads: 12340,
    rating: 4.6,
    category: 'Analytics',
    installed: false,
    active: false,
    price: 19.99,
    icon: '📊',
  },
  {
    id: '5',
    name: 'Social Media Auto-Poster',
    description: 'Automatically post to Twitter, LinkedIn, Facebook, and Instagram',
    version: '1.2.0',
    author: 'SocialBoost',
    downloads: 9870,
    rating: 4.5,
    category: 'Marketing',
    installed: false,
    active: false,
    icon: '📱',
  },
  {
    id: '6',
    name: 'Advanced Security',
    description: 'Enhanced security features including 2FA, IP whitelisting, and audit logs',
    version: '4.0.0',
    author: 'SecureNet',
    downloads: 18920,
    rating: 4.9,
    category: 'Security',
    installed: true,
    active: false,
    price: 49.99,
    icon: '🔒',
  },
];

const categories = ['All', 'Communication', 'AI & ML', 'Payments', 'Analytics', 'Marketing', 'Security'];

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>(mockPlugins);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlugins = plugins.filter(plugin => {
    const matchesCategory = selectedCategory === 'All' || plugin.category === selectedCategory;
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const togglePlugin = (id: string, action: 'install' | 'activate' | 'deactivate') => {
    setPlugins(plugins.map(p => {
      if (p.id !== id) return p;
      
      switch (action) {
        case 'install':
          return { ...p, installed: true, active: true };
        case 'activate':
          return { ...p, active: true };
        case 'deactivate':
          return { ...p, active: false };
        default:
          return p;
      }
    }));
  };

  const installedCount = plugins.filter(p => p.installed).length;
  const activeCount = plugins.filter(p => p.active).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Plugins Marketplace
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Extend NexusOS with powerful plugins and integrations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">{installedCount}</span> installed · 
                <span className="font-medium text-gray-900 dark:text-white">{activeCount}</span> active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search plugins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center">
              <Package className="h-8 w-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">Total Plugins</p>
                <p className="text-2xl font-bold">{plugins.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center">
              <Check className="h-8 w-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">Installed</p>
                <p className="text-2xl font-bold">{installedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center">
              <Zap className="h-8 w-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">Active</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plugins Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlugins.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="text-4xl mr-4">{plugin.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {plugin.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        v{plugin.version} · by {plugin.author}
                      </p>
                    </div>
                  </div>
                  {plugin.installed && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plugin.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {plugin.active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {plugin.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span>{plugin.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      <span>{plugin.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {plugin.price ? `$${plugin.price}` : 'Free'}
                  </span>
                </div>

                <div className="mt-6">
                  {!plugin.installed ? (
                    <button
                      onClick={() => togglePlugin(plugin.id, 'install')}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Install Plugin
                    </button>
                  ) : plugin.active ? (
                    <button
                      onClick={() => togglePlugin(plugin.id, 'deactivate')}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => togglePlugin(plugin.id, 'activate')}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Activate Plugin
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPlugins.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No plugins found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
