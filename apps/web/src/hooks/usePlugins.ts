import { pluginsApi, Plugin } from '@/lib/api-services';
import { useEffect, useState } from 'react';

export function usePlugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchPlugins = async () => {
    try {
      setIsLoading(true);
      const filters: { search?: string; category?: string } = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      
      const data = await pluginsApi.getAll(filters);
      setPlugins(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plugins');
    } finally {
      setIsLoading(false);
    }
  };

  const installPlugin = async (id: string) => {
    const plugin = await pluginsApi.install(id);
    setPlugins(prev => prev.map(p => p.id === id ? plugin : p));
    return plugin;
  };

  const uninstallPlugin = async (id: string) => {
    await pluginsApi.uninstall(id);
    setPlugins(prev => prev.map(p => p.id === id ? { ...p, isInstalled: false, isActive: false } : p));
  };

  const activatePlugin = async (id: string) => {
    const plugin = await pluginsApi.activate(id);
    setPlugins(prev => prev.map(p => p.id === id ? plugin : p));
    return plugin;
  };

  const deactivatePlugin = async (id: string) => {
    const plugin = await pluginsApi.deactivate(id);
    setPlugins(prev => prev.map(p => p.id === id ? plugin : p));
    return plugin;
  };

  useEffect(() => {
    fetchPlugins();
  }, [searchTerm, selectedCategory]);

  const categories = ['all', ...Array.from(new Set(plugins.map(p => p.category)))];

  return {
    plugins,
    isLoading,
    error,
    refresh: fetchPlugins,
    installPlugin,
    uninstallPlugin,
    activatePlugin,
    deactivatePlugin,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
  };
}
