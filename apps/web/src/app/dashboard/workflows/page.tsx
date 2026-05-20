'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import WorkflowsPage from '../../workflows/page'

export default function DashboardWorkflows() {
  return (
    <DashboardLayout>
      <WorkflowsPage />
    </DashboardLayout>
  )
}
