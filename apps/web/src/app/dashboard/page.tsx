'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: string
}

interface QuickActionCardProps {
  icon: string
  title: string
  description: string
  href: string
}

interface ActivityItemProps {
  event: string
  timestamp: string
  icon: string
}

interface GettingStartedStepProps {
  step: number
  title: string
  description: string
  icon: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, logout } = useAuth()
  const [tenant, setTenant] = useState<any>(null)
  const [workflows, setWorkflows] = useState<any[]>([])
  const [plugins, setPlugins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      const [tenantsRes, workflowsRes, pluginsRes] = await Promise.all([
        api.get('/tenants').catch(() => ({ data: [] })),
        api.get('/workflows').catch(() => ({ data: [] })),
        api.get('/plugins').catch(() => ({ data: [] }))
      ])
      
      if (tenantsRes.data && tenantsRes.data.length > 0) {
        setTenant(tenantsRes.data[0])
      }
      setWorkflows(workflowsRes.data || [])
      setPlugins(pluginsRes.data || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const workflowCount = workflows?.length || 0
  const pluginCount = plugins?.filter((p: any) => p.status === 'ACTIVE').length || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold">NexusOS</span>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-foreground">
              Dashboard
            </Link>
            <Link href="/dashboard/workflows" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Workflows
            </Link>
            <Link href="/dashboard/plugins" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Plugins
            </Link>
            <Link href="/dashboard/ai" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              AI
            </Link>
            <Link href="/dashboard/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Settings
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {tenant?.name || 'My Workspace'}
            </div>
            <div className="text-sm font-medium">
              {user.name || user.email}
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.name || user.email}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your workspace
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Workflows"
            value={workflowCount}
            description="Automations running"
            icon="⚡"
          />
          <StatCard
            title="Installed Plugins"
            value={pluginCount}
            description="Extensions active"
            icon="🔌"
          />
          <StatCard
            title="AI Tasks"
            value="0"
            description="Tasks processed today"
            icon="🤖"
          />
          <StatCard
            title="Events Today"
            value="0"
            description="Events tracked"
            icon="📊"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionCard
                icon="➕"
                title="New Workflow"
                description="Create automation"
                href="/dashboard/workflows/new"
              />
              <QuickActionCard
                icon="🔌"
                title="Browse Plugins"
                description="Extend functionality"
                href="/dashboard/plugins"
              />
              <QuickActionCard
                icon="🤖"
                title="AI Task"
                description="Run AI processing"
                href="/dashboard/ai/new"
              />
              <QuickActionCard
                icon="👥"
                title="Invite Team"
                description="Add members"
                href="/dashboard/settings/team"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <ActivityItem
                event="Account created"
                timestamp="Just now"
                icon="✅"
              />
              <ActivityItem
                event="Welcome to NexusOS!"
                timestamp="Just now"
                icon="🎉"
              />
              {workflows.length > 0 && (
                <ActivityItem
                  event={`${workflows.length} workflow(s) available`}
                  timestamp="Recently"
                  icon="⚡"
                />
              )}
              {pluginCount > 0 && (
                <ActivityItem
                  event={`${pluginCount} plugin(s) active`}
                  timestamp="Recently"
                  icon="🔌"
                />
              )}
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GettingStartedStep
              step={1}
              title="Configure your workspace"
              description="Customize settings, add team members, and set up your organization."
              icon="⚙️"
            />
            <GettingStartedStep
              step={2}
              title="Install plugins"
              description="Browse our plugin marketplace and install extensions you need."
              icon="🔌"
            />
            <GettingStartedStep
              step={3}
              title="Create workflows"
              description="Build automations to streamline your processes and save time."
              icon="⚡"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function QuickActionCard({ icon, title, description, href }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="rounded-lg border bg-background p-4 hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="font-semibold text-sm">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Link>
  )
}

function ActivityItem({ event, timestamp, icon }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-xl">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{event}</p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </div>
  )
}

function GettingStartedStep({ step, title, description, icon }: GettingStartedStepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-primary">STEP {step}</span>
        </div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
